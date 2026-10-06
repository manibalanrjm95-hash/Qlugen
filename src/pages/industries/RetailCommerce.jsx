// Commerce journey, dynamic, channel-connected
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import content from '../../content/industries/details/retail-commerce.json'
import { stepNumber, toRelated } from '../../lib/content'
import '../../App.css'

export default function RetailCommerce() {
  const { hero, challenge, help, connected, outcomes, related, cta } = content
  return (
    <Layout>
      <section className="split-hero hero-image-bg" style={{ '--hero-image': `url(${hero.image})` }}>
        <Grid>
          <Column lg={6} md={4} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="split-hero__sub">{hero.description}</p>
          </Column>
          <Column lg={10} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="proc-flow" style={{ justifyContent: 'center' }}>
                {hero.journey.map((n, i) => (
                  <span key={n} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span className="proc-node" style={{ background: 'rgba(255,255,255,.08)', color: '#fff' }}>{n}</span>
                    {i < hero.journey.length - 1 && <ArrowRight size={16} className="proc-arrow" style={{ color: 'rgba(255,255,255,.35)' }} />}
                  </span>
                ))}
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section" style={{ paddingBottom: 0 }}>
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">{challenge.eyebrow}</p>
            <h2 style={{ marginBottom: '2.5rem' }}>{challenge.title}</h2>
          </Column>
        </Grid>
        <div>
          {challenge.items.map(p => (
            <div key={p.title} className="alt-row">
              <div className="alt-img"><img src={p.image} alt={p.imageAlt || ''} loading="lazy" decoding="async" /></div>
              <div className="alt-text"><h3>{p.title}</h3><p>{p.description}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{help.eyebrow}</p>
            <h2>{help.title}</h2>
            <div className="tile-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {help.areas.map((h, i) => (
                <div key={h} className="tile-card" style={{ borderTop: '3px solid var(--q-accent)' }}>
                  <span className="tile-card-num">{stepNumber(i)}</span>
                  <span data-heading-visual className="tile-label">{h}</span>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{connected.eyebrow}</p>
            <h2>{connected.title}</h2>
            <div className="bubble-row">
              {connected.steps.map((b, i) => (
                <span key={b} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <div className="bubble">{b}</div>
                  {i < connected.steps.length - 1 && <div className="bubble-link" />}
                </span>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{outcomes.eyebrow}</p>
            <h2>{outcomes.title}</h2>
            <div className="outcome-grid">
              {outcomes.items.map(({ title }, i) => (
                <div key={title} className="outcome-card">
                  <span className="outcome-num">{stepNumber(i)}</span>
                  <p className="outcome-title">{title}</p>
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
