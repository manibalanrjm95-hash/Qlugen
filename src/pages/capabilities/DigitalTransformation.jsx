// Editorial transformation story, alternating sections
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import content from '../../content/capabilities/details/digital-transformation.json'
import { stepNumber, toRelated } from '../../lib/content'
import '../../App.css'

export default function DigitalTransformation() {
  const { hero, gap, delivers, outcomes, roadmap, related, cta } = content
  return (
    <Layout>
      <section className="bleed-hero">
        <img className="bleed-hero-img" src={hero.image} alt={hero.imageAlt || ''} fetchPriority="high" decoding="async" />
        <div className="bleed-hero-scrim" />
        <div className="bleed-hero-content">
          <p className="section-label">{hero.eyebrow}</p>
          <h1>{hero.title}</h1>
          <p>{hero.description}</p>
        </div>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={7} md={5} sm={4}>
            <p className="section-label">{gap.eyebrow}</p>
            <h2>{gap.title}</h2>
            <p className="section-body">{gap.body}</p>
          </Column>
          <Column lg={7} md={3} sm={4}>
            <blockquote className="pull-quote" style={{ marginTop: '2.5rem' }}>
              <p>{gap.quote}</p>
            </blockquote>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal" style={{ paddingBottom: 0 }}>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{delivers.eyebrow}</p>
            <h2 style={{ marginBottom: '2.5rem' }}>{delivers.title}</h2>
          </Column>
        </Grid>
        <div style={{ marginTop: '1rem' }}>
          {delivers.items.map(p => (
            <div key={p.title} className="alt-row">
              <div className="alt-img"><img src={p.image} alt={p.imageAlt || ''} loading="lazy" decoding="async" /></div>
              <div className="alt-text">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{outcomes.eyebrow}</p>
            <h2>{outcomes.title}</h2>
            <div className="metric-row">
              {outcomes.items.map((m, i) => (
                <div key={m.title} className="metric-block">
                  <div className="metric-block-num">{stepNumber(i)}</div>
                  <p className="metric-block-title">{m.title}</p>
                  <p className="metric-block-desc">{m.description}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{roadmap.eyebrow}</p>
            <h2>{roadmap.title}</h2>
            <div className="timeline-row">
              {roadmap.phases.map((p, i) => (
                <div key={p.title} className="timeline-phase">
                  <span className="timeline-phase-num">{roadmap.phaseLabel} {stepNumber(i)}</span>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading={related.heading} items={toRelated(related.items)} />

      <CTABanner heading={cta.heading} sub={cta.sub} btnText={cta.label} btnTo={cta.url} />
    </Layout>
  )
}
