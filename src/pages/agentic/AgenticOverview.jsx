// Interactive agentic overview — expanding accordion gallery
import { useState } from 'react'
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import content from '../../content/agentic-ai/overview.json'
import { stepNumber } from '../../lib/content'
import '../../App.css'

export default function AgenticOverview() {
  const { hero, stages, why, relatedCapability, cta } = content
  const [activeStage, setActiveStage] = useState(0)

  return (
    <Layout>
      <section className="hero-image-bg" style={{ '--hero-image': `url(${hero.image})`, backgroundColor: '#001c1e', color: '#fff', minHeight: 'calc(70vh - var(--header-height))', display: 'flex', alignItems: 'center', padding: '6rem 0' }}>
        <Grid>
          <Column lg={12} md={7} sm={4}>
            <p className="section-label" style={{ color: 'var(--q-accent)' }}>{hero.eyebrow}</p>
            <h1 style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', fontWeight: 700, color: '#fff', lineHeight: 1.05, letterSpacing: '-.02em', margin: '1rem 0 1.5rem' }}>
              {hero.title}
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,.7)', maxWidth: '42rem', lineHeight: 1.7, margin: 0 }}>
              {hero.description}
            </p>
          </Column>
        </Grid>
      </section>

      <section style={{ background: '#001c1e', padding: '0 0 5rem' }}>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <div className="agentic-gallery">
              {stages.items.map((s, i) => (
                <div
                  key={s.url}
                  className={`agentic-card${i === activeStage ? ' agentic-card--active' : ''}`}
                  onMouseEnter={() => setActiveStage(i)}
                  onClick={() => setActiveStage(i)}
                >
                  <img src={s.image} alt={s.imageAlt || ''} className="agentic-card-img" loading="lazy" decoding="async" />
                  <div className="agentic-card-overlay" />
                  <div className="agentic-card-content">
                    <span className="agentic-card-num">{stages.stageLabel} {stepNumber(i)}</span>
                    <div className="agentic-card-foot">
                      <h2 className="agentic-card-title">{s.title}</h2>
                      <p className="agentic-card-desc">{s.description}</p>
                      <Link to={s.url} className="agentic-card-link">{stages.linkLabel} <ArrowRight size={16} /></Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{why.eyebrow}</p>
            <h2>{why.title}</h2>
            <Grid style={{ marginTop: '2.5rem' }}>
              {why.items.map(w => (
                <Column key={w.title} lg={5} md={4} sm={4} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1.75rem', background: 'var(--q-teal-10)', height: '100%' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--q-primary)', margin: '0 0 .75rem' }}>{w.title}</h3>
                    <p style={{ fontSize: '.9375rem', color: '#475467', margin: 0, lineHeight: 1.65 }}>{w.description}</p>
                  </div>
                </Column>
              ))}
            </Grid>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={10} md={6} sm={4}>
            <p className="section-label">{relatedCapability.eyebrow}</p>
            <h2>{relatedCapability.title}</h2>
            <p className="section-body">{relatedCapability.body}</p>
            <Link to={relatedCapability.linkUrl} className="cta-btn cta-btn--outline-dark" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              {relatedCapability.linkLabel} <ArrowRight size={18} />
            </Link>
          </Column>
        </Grid>
      </section>

      <CTABanner heading={cta.heading} sub={cta.sub} btnText={cta.label} btnTo={cta.url} />
    </Layout>
  )
}
