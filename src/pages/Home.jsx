import { Fragment, useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Analytics, ArrowRight, Building, Chip, Cloud, Code, Dashboard, Earth,
  Education, Finance, Flash, LogoLinkedin, Network_1, Rocket, Search, Security,
  SettingsAdjust, Store, User, UserMultiple,
} from '@carbon/icons-react';
import { Button, Column, Grid } from '@carbon/react';
import Layout from '../components/Layout';
import homeContent from '../content/home.json';
import '../App.css';

const iconMap = {
  Analytics, Building, Chip, Cloud, Code, Dashboard, Earth, Education, Finance, Flash,
  Network_1, Rocket, Search, Security, SettingsAdjust, Store, User, UserMultiple,
};
const accents = ['rgba(8, 189, 186, 0.16)', 'rgba(11, 242, 118, 0.14)', 'rgba(69, 137, 255, 0.16)', 'rgba(238, 83, 150, 0.14)', 'rgba(255, 131, 43, 0.16)', 'rgba(61, 219, 217, 0.14)', 'rgba(111, 220, 140, 0.16)'];
const surfaces = ['var(--q-teal-10)', 'var(--ibm-blue-10)', 'var(--ibm-yellow-10)', 'var(--ibm-purple-10)', 'var(--ibm-green-10)'];
const capabilities = homeContent.capabilities.items.map((item, index) => ({ ...item, icon: iconMap[item.icon] || Analytics, artImage: item.image, artPosition: 'center', artSize: 'cover', accent: accents[index % accents.length], to: item.url }));
const aiFeatures = homeContent.agenticAi.slides.map((item, index) => ({ ...item, icon: iconMap[item.icon] || Chip, desc: item.description, mediaPoster: item.image, surface: surfaces[index % surfaces.length], to: item.url }));
const industries = homeContent.industries.items.map(item => ({ ...item, icon: iconMap[item.icon] || Building, desc: item.description, to: item.url }));
const principles = homeContent.approach.cards.map(item => ({ ...item, num: item.number, icon: iconMap[item.icon] || Analytics, desc: item.description, img: item.image }));
const blogs = homeContent.blogs.items.map(item => ({ ...item, img: item.image, to: item.url }));
const partners = homeContent.partners.items.map(item => item.name);
export default function Home() {
  const [activeApproach, setActiveApproach] = useState(0);
  const [activeCapability, setActiveCapability] = useState(0);
  const [activeAif, setActiveAif] = useState(0);
  const [aifScrollProgress, setAifScrollProgress] = useState(0);
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [email, setEmail] = useState('');
  const [isAifDesktop, setIsAifDesktop] = useState(false);
  const aifSectionRef = useRef(null);
  const aifViewportRef = useRef(null);
  const aifTrackRef = useRef(null);
  const aifStickyShellRef = useRef(null);
  const aifRafRef = useRef(null);
  const aifGoToProgressRef = useRef(null);
  const activeIndustryItem = industries[activeIndustry];
  const aifSlideCount = aiFeatures.length;
  const aifMaxIndex = Math.max(aifSlideCount - 1, 1);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 66rem)');
    const updateViewportMode = () => setIsAifDesktop(mediaQuery.matches);
    updateViewportMode();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateViewportMode);
      return () => mediaQuery.removeEventListener('change', updateViewportMode);
    }

    mediaQuery.addListener(updateViewportMode);
    return () => mediaQuery.removeListener(updateViewportMode);
  }, []);

  useEffect(() => {
    if (!isAifDesktop) return undefined;
    const section = aifSectionRef.current;
    const stickyShell = aifStickyShellRef.current;
    const viewport = aifViewportRef.current;
    const track = aifTrackRef.current;
    if (!section || !stickyShell || !viewport || !track) return undefined;

    const getHeaderHeight = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const headerHeightRaw = rootStyles.getPropertyValue('--header-height').trim();
      return (
        Number.parseFloat(headerHeightRaw)
        * (headerHeightRaw.endsWith('rem') ? rootFontSize : 1)
      ) || 64;
    };

    const applyDesktopMetrics = () => {
      const headerHeight = getHeaderHeight();
      const stickyHeight = Math.max(
        stickyShell.getBoundingClientRect().height,
        stickyShell.scrollHeight,
        1,
      );
      const trackTravel = Math.max(track.scrollWidth - viewport.clientWidth, 1);
      const sectionHeight = Math.ceil(window.innerHeight - headerHeight);
      section.style.height = `${sectionHeight}px`;
      section.style.minHeight = `${sectionHeight}px`;
      section.style.setProperty('--aif-track-shift', `${trackTravel}px`);
      section.dataset.aifHeaderHeight = `${headerHeight}`;
      section.dataset.aifScrollRange = `${Math.max(sectionHeight - stickyHeight, 1)}`;
      section.dataset.aifTrackTravel = `${trackTravel}`;
    };

    let currentX = 0;
    let targetX = 0;
    let horizontalRaf = null;
    let boundaryDirection = 0;
    let boundaryReachedAt = 0;
    let boundarySettledAt = 0;
    let gateActive = false;
    let enteredFrom = 0;
    let lockedScrollY = 0;
    let previousDocumentOverflow = '';
    let previousBodyOverflow = '';
    let previousBodyPaddingRight = '';
    let gateState = 'idle';
    let completed = false;
    let released = false;

    const setShellPosition = () => {
      const headerHeight = Number.parseFloat(section.dataset.aifHeaderHeight || '') || getHeaderHeight();
      stickyShell.style.position = 'sticky';
      stickyShell.style.top = `${headerHeight}px`;
      stickyShell.style.left = '0';
      stickyShell.style.right = '0';
    };

    const renderHorizontalPosition = () => {
      horizontalRaf = null;
      const maxTravel = Number.parseFloat(section.dataset.aifTrackTravel || '') || 1;
      const distance = targetX - currentX;
      currentX += distance * 0.12;
      if (Math.abs(distance) < 0.35) currentX = targetX;

      currentX = Math.min(Math.max(currentX, -maxTravel), 0);
      const settled = Math.abs(targetX - currentX) < 0.5;
      if (
        settled
        && boundaryDirection !== 0
        && boundaryReachedAt > 0
        && boundarySettledAt === 0
      ) {
        boundarySettledAt = performance.now();
        if (boundaryDirection === enteredFrom) {
          completed = true;
          gateState = 'completed';
        }
      }
      const progress = Math.min(Math.max(-currentX / maxTravel, 0), 1);
      const currentIndex = Math.min(
        aifSlideCount - 1,
        Math.max(0, Math.round(progress * aifMaxIndex)),
      );
      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
      section.style.setProperty('--aif-track-progress', progress.toFixed(4));
      setAifScrollProgress(progress);
      setActiveAif(prev => (prev === currentIndex ? prev : currentIndex));

      if (currentX !== targetX) {
        horizontalRaf = window.requestAnimationFrame(renderHorizontalPosition);
      }
    };

    const requestHorizontalRender = () => {
      if (horizontalRaf !== null) return;
      horizontalRaf = window.requestAnimationFrame(renderHorizontalPosition);
    };

    const setTargetProgress = progress => {
      const maxTravel = Number.parseFloat(section.dataset.aifTrackTravel || '') || 1;
      const clampedProgress = Math.min(Math.max(progress, 0), 1);
      targetX = -(clampedProgress * maxTravel);
      boundaryDirection = 0;
      boundaryReachedAt = 0;
      boundarySettledAt = 0;
      completed = false;
      requestHorizontalRender();
    };

    const lockSection = direction => {
      gateActive = true;
      enteredFrom = direction;
      gateState = 'locked';
      completed = false;
      released = false;
      lockedScrollY = window.scrollY;
      previousDocumentOverflow = document.documentElement.style.overflow;
      previousBodyOverflow = document.body.style.overflow;
      previousBodyPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      section.style.position = 'fixed';
      section.style.top = `${getHeaderHeight()}px`;
      section.style.left = '0';
      section.style.right = '0';
      section.style.width = '100%';
      section.style.zIndex = '10';
    };

    const unlockSection = direction => {
      gateActive = false;
      gateState = 'released';
      completed = true;
      released = true;
      enteredFrom = 0;
      section.style.position = '';
      section.style.top = '';
      section.style.left = '';
      section.style.right = '';
      section.style.width = '';
      section.style.zIndex = '';
      document.documentElement.style.overflow = previousDocumentOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
      window.scrollTo(0, lockedScrollY);
      const destination = direction > 0 ? section.nextElementSibling : section.previousElementSibling;
      destination?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const onWheel = event => {
      if (event.deltaY === 0) return;
      const headerHeight = Number.parseFloat(section.dataset.aifHeaderHeight || '') || getHeaderHeight();
      const sectionTop = window.scrollY + section.getBoundingClientRect().top;
      const stickyStart = sectionTop - headerHeight;
      const direction = Math.sign(event.deltaY);
      const cappedDelta = Math.min(Math.abs(event.deltaY), 80);
      const pageDelta = direction * cappedDelta;
      const maxTravel = Number.parseFloat(section.dataset.aifTrackTravel || '') || 1;

      const enterFromTop = direction > 0
        && window.scrollY <= stickyStart
        && window.scrollY + pageDelta >= stickyStart;
      const enterFromBottom = direction < 0
        && window.scrollY >= sectionTop
        && window.scrollY + pageDelta <= sectionTop;

      if (gateState === 'released') return;

      if (gateState === 'idle' && (enterFromTop || enterFromBottom)) {
        lockSection(enterFromTop ? 1 : -1);
        boundaryDirection = 0;
        boundaryReachedAt = 0;
        boundarySettledAt = 0;
        if (enteredFrom === 1) {
          currentX = 0;
          targetX = 0;
        } else {
          currentX = -maxTravel;
          targetX = -maxTravel;
        }
        event.preventDefault();
        event.stopPropagation();
        window.scrollTo(0, stickyStart);
        requestHorizontalRender();
        return;
      }

      if (!gateActive) return;
      const progress = Math.min(Math.max(-targetX / maxTravel, 0), 1);
      const atStart = progress <= 0;
      const atEnd = progress >= 1;
      const movingOutward = (direction < 0 && atStart) || (direction > 0 && atEnd);
      const now = performance.now();

      if (movingOutward) {
        const canRelease = gateState === 'completed'
          && completed
          && enteredFrom === direction
          && boundaryDirection === direction
          && boundarySettledAt > 0
          && now - boundarySettledAt >= 200;
        if (canRelease) {
          event.preventDefault();
          event.stopPropagation();
          unlockSection(direction);
          return;
        }

        // Consume boundary and residual momentum before allowing page scroll.
        event.preventDefault();
        event.stopPropagation();
        if (boundaryDirection !== direction || boundaryReachedAt === 0) {
          boundaryDirection = direction;
          boundaryReachedAt = now;
          boundarySettledAt = 0;
          if (direction !== enteredFrom) {
            gateState = 'locked';
            completed = false;
          }
        }
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const delta = direction * Math.min(cappedDelta * 0.45, 36);
      targetX = Math.min(Math.max(targetX - delta, -maxTravel), 0);
      const nextProgress = Math.min(Math.max(-targetX / maxTravel, 0), 1);
      if (nextProgress <= 0 || nextProgress >= 1) {
        boundaryDirection = direction;
        boundaryReachedAt = now;
        boundarySettledAt = 0;
      } else {
        boundaryDirection = 0;
        boundaryReachedAt = 0;
        boundarySettledAt = 0;
        if (gateState === 'completed') {
          gateState = 'locked';
          completed = false;
        }
      }
      requestHorizontalRender();
    };

    const onTouchMove = event => {
      if (!gateActive) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const onKeyDown = event => {
      if (!gateActive) return;
      const blockedKeys = new Set(['PageUp', 'PageDown', ' ', 'ArrowUp', 'ArrowDown', 'Home', 'End']);
      if (!blockedKeys.has(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const updateDesktopTrack = () => {
      aifRafRef.current = null;
      setShellPosition();
      if (gateState === 'released') {
        const sectionBounds = section.getBoundingClientRect();
        if (sectionBounds.bottom <= 0 || sectionBounds.top >= window.innerHeight) {
          gateState = 'idle';
          completed = false;
          released = false;
        }
      }
    };

    const syncDesktopMetrics = () => {
      applyDesktopMetrics();
      updateDesktopTrack();
    };

    const requestDesktopTrackUpdate = () => {
      if (aifRafRef.current !== null) return;
      aifRafRef.current = window.requestAnimationFrame(updateDesktopTrack);
    };

    let resizeObserver;
    let resizeRaf = null;
    const requestDesktopMetricsSync = () => {
      if (resizeRaf !== null) return;
      resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = null;
        syncDesktopMetrics();
      });
    };

    syncDesktopMetrics();
    window.addEventListener('scroll', requestDesktopTrackUpdate, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
    window.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('resize', requestDesktopMetricsSync);
    aifGoToProgressRef.current = setTargetProgress;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        requestDesktopMetricsSync();
      });
      resizeObserver.observe(stickyShell);
    }

    return () => {
      if (aifRafRef.current !== null) {
        window.cancelAnimationFrame(aifRafRef.current);
        aifRafRef.current = null;
      }
      if (resizeRaf !== null) {
        window.cancelAnimationFrame(resizeRaf);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      section.style.setProperty('--aif-track-progress', '0');
      section.style.setProperty('--aif-track-shift', '0px');
      section.style.height = '';
      section.style.minHeight = '';
      section.style.position = '';
      section.style.top = '';
      section.style.left = '';
      section.style.right = '';
      section.style.width = '';
      section.style.zIndex = '';
      track.style.transform = '';
      delete section.dataset.aifHeaderHeight;
      delete section.dataset.aifScrollRange;
      delete section.dataset.aifTrackTravel;
      aifGoToProgressRef.current = null;
      if (horizontalRaf !== null) window.cancelAnimationFrame(horizontalRaf);
      stickyShell.style.position = '';
      stickyShell.style.top = '';
      stickyShell.style.left = '';
      stickyShell.style.right = '';
      document.documentElement.style.overflow = previousDocumentOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
      window.removeEventListener('scroll', requestDesktopTrackUpdate);
      window.removeEventListener('wheel', onWheel, { capture: true });
      window.removeEventListener('touchmove', onTouchMove, { capture: true });
      window.removeEventListener('keydown', onKeyDown, { capture: true });
      window.removeEventListener('resize', requestDesktopMetricsSync);
    };
  }, [aifMaxIndex, aifSlideCount, isAifDesktop]);

  useEffect(() => {
    if (isAifDesktop) return undefined;
    const viewport = aifViewportRef.current;
    const section = aifSectionRef.current;
    const stickyShell = aifStickyShellRef.current;
    if (!viewport) return undefined;

    let ticking = false;

    const updateFromHorizontalScroll = () => {
      ticking = false;
      const maxScrollLeft = Math.max(viewport.scrollWidth - viewport.clientWidth, 1);
      const progress = viewport.scrollLeft / maxScrollLeft;
      const slideProgress = progress * aifMaxIndex;
      const currentIndex = Math.min(aifSlideCount - 1, Math.max(0, Math.round(slideProgress)));

      setAifScrollProgress(progress);
      setActiveAif(prev => (prev === currentIndex ? prev : currentIndex));
    };

    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateFromHorizontalScroll);
    };

    updateFromHorizontalScroll();
    viewport.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      if (section) section.style.setProperty('--aif-track-progress', '0');
      if (section) section.style.setProperty('--aif-track-shift', '0px');
      if (section) section.style.height = '';
      if (section) section.style.minHeight = '';
      if (stickyShell) {
        stickyShell.style.position = 'static';
        stickyShell.style.top = 'auto';
        stickyShell.style.left = 'auto';
        stickyShell.style.right = 'auto';
      }
      viewport.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [aifMaxIndex, aifSlideCount, isAifDesktop]);

  const handleAifTabClick = index => {
    setActiveAif(index);
    if (isAifDesktop && aifSectionRef.current) {
      aifGoToProgressRef.current?.(index / aifMaxIndex);
      return;
    }

    const viewport = aifViewportRef.current;
    if (!viewport) return;

    if (window.matchMedia('(max-width: 47.9375rem)').matches) {
      const slide = aifTrackRef.current?.children[index];
      slide?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      return;
    }

    viewport.scrollTo({ left: viewport.clientWidth * index, behavior: 'smooth' });
  };

  return (
    <Layout>
      {/* ── HERO ── */}
      <section className="hero-section" id="hero">
        <img
          className="hero-video"
          src={homeContent.hero.image}
          alt={homeContent.hero.imageAlt}
          aria-hidden={homeContent.hero.imageAlt ? undefined : 'true'}
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-overlay" aria-hidden="true" />

        <div className="hero-top">
          <Grid>
            <Column lg={9} md={7} sm={4}>
              <h1>
                {homeContent.hero.titleLines.map((line, index) => (
                  <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>
                ))}
              </h1>
              <p className="hero-sub">
                {homeContent.hero.descriptionBeforeLink}{' '}
                <RouterLink to={homeContent.hero.descriptionLinkUrl} className="hero-sub-link">{homeContent.hero.descriptionLinkLabel}</RouterLink>
                {' '}{homeContent.hero.descriptionAfterLink}
              </p>
            </Column>
          </Grid>
        </div>

        <div className="hero-bottom-strip">
          <Grid>
            <Column lg={9} md={4} sm={4} className="hero-bottom-left">
              <p className="hero-bottom-desc">
                {homeContent.hero.bottomTextBeforeAccent} <span className="hero-accent">{homeContent.hero.bottomTextAccent}</span>
              </p>
            </Column>
            <Column lg={7} md={4} sm={4} className="hero-bottom-right">
              <form className="hero-email-form" onSubmit={e => e.preventDefault()} aria-label={homeContent.hero.formAriaLabel}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={homeContent.hero.emailPlaceholder}
                  className="hero-email-input"
                  aria-label={homeContent.hero.emailAriaLabel}
                />
                <RouterLink to={homeContent.hero.ctaUrl} className="hero-cta-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>{homeContent.hero.ctaLabel}</RouterLink>
              </form>
            </Column>
          </Grid>
        </div>
      </section>


      {/* ── Capabilities grid ── */}
      <section className="capabilities-section" id="capabilities">
        <Grid>
          <Column lg={11} md={5} sm={4}>
            <p className="section-label">{homeContent.capabilities.eyebrow}</p>
            <h2>{homeContent.capabilities.title}</h2>
            <p className="section-lede">{homeContent.capabilities.description}</p>
          </Column>
        </Grid>
        <Grid className="capability-grid">
          {capabilities.map(({ icon: Icon, eyebrow, title, body, artImage, artPosition, artSize, accent, to }, index) => (
            <Column key={title} lg={16} md={8} sm={4} className={`capability-grid-item capability-grid-item--${index + 1}`}>
              <article
                className={`capability-card${activeCapability === index ? ' is-active' : ''}`}
                onClick={() => setActiveCapability(index)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setActiveCapability(index);
                  }
                }}
                tabIndex={0}
                style={{
                  '--capability-image': `url(${artImage})`,
                  '--capability-position': artPosition,
                  '--capability-size': artSize,
                  '--capability-accent': accent,
                }}
              >
                <div className="capability-card__image" aria-hidden="true" />
                <div className="capability-card__scrim capability-card__scrim--base" aria-hidden="true" />
                <div className="capability-card__scrim capability-card__scrim--hover" aria-hidden="true" />

                <div className="capability-card__summary">
                  <div className="capability-card__eyebrow-row">
                    <p className="capability-card__eyebrow">{eyebrow}</p>
                    <Icon size={20} className="capability-card__icon" aria-hidden="true" />
                  </div>
                  <h3>{title}</h3>
                </div>

                <div className="capability-card__details">
                  <p className="capability-card__detail-eyebrow">{eyebrow}</p>
                  <span data-heading-visual className="capability-card__title">{title}</span>
                  <p>{body}</p>
                  <RouterLink to={to} className="capability-card__link">{homeContent.capabilities.linkLabel} <ArrowRight size={16} /></RouterLink>
                </div>
              </article>
            </Column>
          ))}
        </Grid>
      </section>

      {/* ── AI Features ── */}
      <section
        ref={aifSectionRef}
        className="hiw-section aif-section aif-scroll-section"
        id="ai-features"
        style={{
          '--aif-step-count': aifSlideCount,
          '--aif-scroll-progress': aifScrollProgress.toFixed(4),
        }}
      >
        <div ref={aifStickyShellRef} className="aif-sticky-shell">
            <Grid>
              <Column lg={16} md={8} sm={4}>
                <p className="hiw-label">{homeContent.agenticAi.eyebrow}</p>
              </Column>
            </Grid>

            <div className="hiw-tabs-wrap">
              <Grid>
                <Column lg={16} md={8} sm={4} className="hiw-tabs-col">
                  <div className="hiw-tabs" role="tablist" aria-label={homeContent.agenticAi.tabAriaLabel}>
                    {aiFeatures.map((item, i) => (
                      <button
                        key={item.label}
                        className={`hiw-tab${activeAif === i ? ' hiw-tab--active' : ''}${activeAif > i ? ' hiw-tab--complete' : ''}`}
                        onClick={() => handleAifTabClick(i)}
                        type="button"
                        role="tab"
                        aria-selected={activeAif === i}
                      >
                        {activeAif === i && <span className="hiw-tab-arrow" aria-hidden="true">→</span>}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </Column>
              </Grid>
            </div>

            <div className="hiw-content">
              <div ref={aifViewportRef} className="aif-slides-viewport">
                <div ref={aifTrackRef} className="aif-slides-track">
                  {aiFeatures.map((item) => (
                    <article
                      key={item.step}
                      className="aif-slide"
                      style={{ '--aif-slide-surface': item.surface }}
                    >
                      <div className="aif-slide-shell">
                        <div className="aif-slide-shell__inner">
                          <div className="aif-slide-visual">
                            <div className="hiw-visual-card">
                              <span className="hiw-step">{item.step}</span>
                              <div className="hiw-inner-card hiw-inner-card--media">
                                <div className="aif-media-layer" aria-hidden="true">
                                  <div className="aif-media-frame">
                                    <img className="aif-media-image" src={item.mediaPoster} alt="" loading="lazy" decoding="async" />
                                    <div className="aif-media-scrim" />
                                  </div>
                                </div>
                                <span className="hiw-sparkle hiw-sparkle--tl" aria-hidden="true">✦</span>
                                <span className="hiw-sparkle hiw-sparkle--tr" aria-hidden="true">✦</span>
                                <span className="hiw-sparkle hiw-sparkle--br" aria-hidden="true">✦</span>
                              </div>
                            </div>
                          </div>

                          <div className="hiw-text-col aif-slide-copy">
                            <div className="aif-stage aif-stage--copy">
                              <h2>{item.heading}</h2>
                              <p className="hiw-desc">{item.desc}</p>
                              <RouterLink to={item.to} className="hiw-learn-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>{homeContent.agenticAi.linkLabel}</RouterLink>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* ── Industries ── */}
      <section className="industries-section" id="industries">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <div className="industries-showcase">
              <div className="industries-copy">
                <p className="section-label">{homeContent.industries.eyebrow}</p>
                <h2>{homeContent.industries.title}</h2>

                <div className="industries-list" role="tablist" aria-label={homeContent.industries.ariaLabel}>
                  {industries.map(({ label, to }, index) => {
                    const isActive = index === activeIndustry;
                    return (
                      <RouterLink
                        key={label}
                        to={to}
                        className={`industry-option${isActive ? ' industry-option--active' : ''}`}
                        onMouseEnter={() => setActiveIndustry(index)}
                        onFocus={() => setActiveIndustry(index)}
                      >
                        <span>{label}</span>
                        <ArrowRight
                          size={18}
                          className={`industry-option-arrow${isActive ? ' industry-option-arrow--active' : ''}`}
                          aria-hidden="true"
                        />
                      </RouterLink>
                    );
                  })}
                </div>
              </div>

              <div className="industry-visual-panel">
                <img src={activeIndustryItem.image} alt={activeIndustryItem.imageAlt} className="industry-visual-image" />
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      {/* ── Approach ── */}
      <section className="approach-section" id="approach">
        <Grid>
          <Column lg={11} md={6} sm={4}>
            <Network_1 size={22} className="approach-icon" aria-hidden="true" />
            <p className="section-label">{homeContent.approach.eyebrow}</p>
            <h2>{homeContent.approach.title}</h2>
            <p className="approach-copy">{homeContent.approach.description}</p>
          </Column>
        </Grid>

        <div className="approach-gallery" onMouseLeave={() => setActiveApproach(0)}>
          {principles.map(({ num, icon: Icon, title, desc, img }, i) => (
            <div
              key={num}
              className={`approach-card${activeApproach === i ? ' approach-card--active' : ''}`}
              onMouseEnter={() => setActiveApproach(i)}
              onClick={() => setActiveApproach(i)}
              role="button"
              tabIndex={0}
              aria-label={title}
              onKeyDown={(e) => e.key === 'Enter' && setActiveApproach(i)}
            >
              <img src={img} alt="" className="approach-card-img" loading="lazy" decoding="async" />
              <div className="approach-card-overlay" />
              <div className="approach-card-content">
                <span className="approach-card-num">{num}</span>
                <div className="approach-card-foot">
                  <div className="approach-card-icon-wrap" aria-hidden="true">
                    <Icon size={18} />
                  </div>
                  <h3 className="approach-card-title">{title}</h3>
                  <p className="approach-card-desc">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Partners ── */}
      <section className="partners-section" id="partners">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{homeContent.partners.eyebrow}</p>
            <h2>{homeContent.partners.title}</h2>
            <p className="section-lede">{homeContent.partners.description}</p>
          </Column>
        </Grid>
        <Grid className="partners-grid">
          {partners.map(name => (
            <Column key={name} lg={4} md={2} sm={2}>
              <div className="partner-badge">{name}</div>
            </Column>
          ))}
        </Grid>
      </section>

      {/* ── Tech Blogs ── */}
      <section className="blogs-section" id="blogs">
        <Grid>
          <Column lg={12} md={6} sm={4}>
            <p className="section-label">{homeContent.blogs.eyebrow}</p>
            <h2>{homeContent.blogs.title}</h2>
          </Column>
          <Column lg={4} md={2} sm={4} className="blogs-cta-col">
            <RouterLink to={homeContent.blogs.allArticlesUrl} className="capability-card__link">{homeContent.blogs.allArticlesLabel} <ArrowRight size={16} /></RouterLink>
          </Column>
        </Grid>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <div className="blogs-grid">
              {blogs.map(({ tag, title, img, to }) => (
                <RouterLink key={title} to={to} className="blog-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="blog-thumb">
                    <img src={img} alt={title} className="blog-thumb-img" loading="lazy" decoding="async" />
                    <span className="blog-thumb-tag">{tag}</span>
                  </div>
                  <div className="blog-body">
                    <h3 className="blog-title">{title}</h3>
                    <div className="blog-hover-arrow">
                      <ArrowRight size={18} aria-hidden="true" />
                      <span>{homeContent.blogs.readArticleLabel}</span>
                    </div>
                  </div>
                </RouterLink>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      {/* ── Executive Team ── */}
      <section className="exec-section" id="executive-team">
        <Grid>
          <Column lg={11} md={5} sm={4}>
            <p className="section-label">{homeContent.leadership.eyebrow}</p>
            <h2>{homeContent.leadership.title}</h2>
            <p className="section-lede">{homeContent.leadership.description}</p>
          </Column>
        </Grid>
        <div className="exec-spotlight">
          <img src={homeContent.leadership.portrait} alt={homeContent.leadership.portraitAlt} className="exec-spotlight__image" loading="lazy" decoding="async" />
          <div className="exec-spotlight__overlay" aria-hidden="true" />
          <div className="exec-spotlight__content">
            <p className="exec-spotlight__eyebrow">{homeContent.leadership.spotlightEyebrow}</p>
            <h3>{homeContent.leadership.name}</h3>
            <p className="exec-spotlight__bio">{homeContent.leadership.bio}</p>
            <div className="exec-prev-exp">
              <p className="exec-prev-exp__label">{homeContent.leadership.experienceLabel}</p>
              <div className="exec-prev-exp__row">
                {homeContent.leadership.experience.map(({ name, logo, logoAlt }) => (
                  <span key={name} className="exec-prev-exp__item">
                    <img src={logo} alt={logoAlt} className="exec-prev-exp__logo" />
                  </span>
                ))}
              </div>
            </div>
            <a
              href={homeContent.leadership.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="exec-spotlight__linkedin"
            >
              <LogoLinkedin size={20} />
              <span>{homeContent.leadership.linkedinLabel}</span>
            </a>
          </div>
          <div className="exec-spotlight__stat">
            <strong>{homeContent.leadership.statValue}</strong>
            <span>{homeContent.leadership.statLabel}</span>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="about-section" id="about">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label">{homeContent.about.eyebrow}</p>
            <h2>{homeContent.about.title}</h2>
            <p className="about-copy">{homeContent.about.description}</p>
            <div className="about-actions">
              <Button kind="ghost" renderIcon={ArrowRight} as={RouterLink} to={homeContent.about.ctaUrl}>{homeContent.about.ctaLabel}</Button>
            </div>
          </Column>
        </Grid>
      </section>

      {/* ── Careers ── */}
      <section className="careers-section" id="careers">
        <Grid>
          <Column lg={10} md={6} sm={4}>
            <Education size={32} className="careers-icon" />
            <p className="section-label">{homeContent.careers.eyebrow}</p>
            <h2>{homeContent.careers.title}</h2>
            <p className="careers-copy">{homeContent.careers.description}</p>
          </Column>
          <Column lg={6} md={2} sm={4} className="careers-action">
            <Button kind="secondary" renderIcon={ArrowRight} as={RouterLink} to={homeContent.careers.ctaUrl}>{homeContent.careers.ctaLabel}</Button>
          </Column>
        </Grid>
      </section>

      {/* ── Contact ── */}
      <section className="contact-section" id="contact">
        <Grid>
          <Column lg={11} md={6} sm={4}>
            <p className="section-label">{homeContent.cta.eyebrow}</p>
            <h2>{homeContent.cta.title}</h2>
            <p className="contact-copy">{homeContent.cta.description}</p>
          </Column>
          <Column lg={5} md={2} sm={4} className="contact-action">
            <Button kind="primary" renderIcon={ArrowRight} as={RouterLink} to={homeContent.cta.url}>{homeContent.cta.label}</Button>
          </Column>
        </Grid>
      </section>
    </Layout>
  );
}
