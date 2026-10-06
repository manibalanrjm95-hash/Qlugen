import { Fragment } from 'react'
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import content from '../../content/capabilities/details/cybersecurity.json'
import { stepNumber, toRelated } from '../../lib/content'
import '../../App.css'

// Pyramid layers widen and lighten towards the governance layer at the top.
const layerStyles = [
  { bg: '#010a23', w: '55%' },
  { bg: '#021550', w: '64%' },
  { bg: '#022160', w: '73%' },
  { bg: '#0444C6', w: '82%' },
  { bg: '#0788D6', w: '91%' },
  { bg: 'rgba(7,136,214,.3)', w: '100%' },
]

const threatNodeClass = (i, count) => {
  if (i === 0) return 'threat-node threat-node--alert'
  if (i === count - 1) return 'threat-node threat-node--safe'
  return 'threat-node'
}

export default function Cybersecurity() {
  const { hero, band, model, services, challenge, related, cta } = content
  return (
    <Layout>
      <section className="split-hero split-hero--darkest hero-image-bg" style={{ '--hero-image': `url(${hero.image})` }}>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="split-hero__sub">{hero.description}</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="threat-arc">
                {hero.flow.map((label, i) => (
                  <Fragment key={label}>
                    {i > 0 && <ArrowRight size={18} className="threat-arrow" />}
                    <div className={threatNodeClass(i, hero.flow.length)}><span data-heading-visual className="diagram-label">{label}</span></div>
                  </Fragment>
                ))}
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="wide-image-band wide-image-band--dark">
        <img src={band.image} alt={band.imageAlt || ''} loading="lazy" decoding="async" />
        <div className="wide-image-band__overlay wide-image-band__overlay--dark" />
        <Grid className="wide-image-band__content">
          <Column lg={10} md={6} sm={4}>
            <p className="section-label">{band.eyebrow}</p>
            <h2>{band.title}</h2>
          </Column>
        </Grid>
      </section>

      <section className="inner-section" style={{ background: '#0a0a0a', color: '#fff' }}>
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label" style={{ color: 'var(--q-accent)' }}>{model.eyebrow}</p>
            <h2 style={{ color: '#fff' }}>{model.title}</h2>
            <p className="section-body" style={{ color: 'rgba(255,255,255,.6)' }}>{model.body}</p>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <div className="security-model" style={{ marginTop: '2rem' }}>
              {model.layers.map((label, i) => {
                const isTop = i === model.layers.length - 1
                const layer = isTop ? layerStyles[layerStyles.length - 1] : layerStyles[Math.min(i, layerStyles.length - 2)]
                return <div key={label} className="security-layer" style={{ background: layer.bg, width: layer.w, color: isTop ? 'var(--q-primary)' : '#fff' }}>{label}</div>
              })}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section" style={{ background: '#111', color: '#fff' }}>
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label" style={{ color: 'var(--q-accent)' }}>{services.eyebrow}</p>
            <h2 style={{ color: '#fff' }}>{services.title}</h2>
            <div className="band-list">
              {services.items.map(({ title, description }, i) => (
                <div key={title} className="band-row">
                  <span className="band-num">{stepNumber(i)}</span>
                  <div><h3>{title}</h3><p>{description}</p></div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label">{challenge.eyebrow}</p>
            <h2>{challenge.title}</h2>
            <p className="section-body">{challenge.body}</p>
          </Column>
          <Column lg={8} md={2} sm={4}>
            <div className="quote-panel quote-panel--teal">
              <p>{challenge.quote}</p>
            </div>
          </Column>
        </Grid>
        <Grid style={{ marginTop: '1rem' }}>
          <Column lg={16} md={8} sm={4}>
            <div className="outcome-grid">
              {challenge.outcomes.map(({ title, description }, i) => (
                <div key={title} className="outcome-card">
                  <span className="outcome-num">{stepNumber(i)}</span>
                  <p className="outcome-title">{title}</p>
                  <p className="outcome-desc">{description}</p>
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
