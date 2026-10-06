// Technology matrix / ecosystem bands
import Layout from '../components/Layout'
import CTABanner from '../components/CTABanner'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { Cloud, Analytics, Security, SettingsAdjust, Chip, ArrowRight } from '@carbon/icons-react'
import content from '../content/technology.json'
import '../App.css'

const categoryIcons = [Cloud, Analytics, Chip, Security, SettingsAdjust]
// Architecture band panels run top (primary) to foundation (base).
const layerTones = ['primary', 'secondary', 'tertiary', 'base']

export default function Technology() {
  const { hero, landscape, cta } = content
  return (
    <Layout>
      <section className="split-hero hero-image-bg" style={{ '--hero-image': `url(${hero.image})` }}>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="split-hero__sub">{hero.description}</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="tech-hero-visual">
                <div className="tech-hero-visual__image">
                  <img src={hero.visualImage} alt={hero.visualImageAlt || ''} loading="lazy" decoding="async" />
                </div>
                <div className="tech-badge-grid">
                  {hero.badges.map(b => <div key={b} className="tech-badge">{b}</div>)}
                </div>
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label">{landscape.eyebrow}</p>
            <h2>{landscape.title}</h2>
            <p className="section-body">{landscape.body}</p>
            <Link to={landscape.linkUrl} className="cta-btn cta-btn--outline-dark" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              {landscape.linkLabel} <ArrowRight size={18} />
            </Link>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <div className="tech-architecture-band">
              {landscape.layers.map((label, i) => (
                <div key={label} className={`tech-architecture-band__panel tech-architecture-band__panel--${layerTones[Math.min(i, layerTones.length - 1)]}`}>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </Column>
          <Column lg={16} md={8} sm={4}>
            <div className="tech-matrix">
              {landscape.categories.map(({ title, tags, description }, i) => {
                const Icon = categoryIcons[i % categoryIcons.length]
                return (
                  <div key={title} className="tech-row">
                    <div className="tech-category">
                      <Icon size={22} style={{ color: 'var(--q-primary)' }} />
                      <h3>{title}</h3>
                    </div>
                    <div className="tech-tags">
                      {tags.map(t => <span key={t} className="tech-tag">{t}</span>)}
                    </div>
                    <div className="tech-desc">{description}</div>
                  </div>
                )
              })}
            </div>
          </Column>
        </Grid>
      </section>

      <CTABanner heading={cta.heading} sub={cta.sub} btnText={cta.label} btnTo={cta.url} />
    </Layout>
  )
}
