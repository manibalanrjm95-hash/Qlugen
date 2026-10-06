import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import content from '../../content/capabilities/details/cloud-infrastructure.json'
import { stepNumber, toRelated } from '../../lib/content'
import '../../App.css'

// Stack colours run top (lightest) to bottom (darkest).
const layerStyles = [
  { bg: 'var(--q-teal-10)', color: 'var(--q-primary)' },
  { bg: 'var(--q-teal-20)', color: 'var(--q-primary)' },
  { bg: '#0788D6' },
  { bg: '#0444C6' },
  { bg: '#0D3DA8' },
  { bg: '#010a23' },
]

export default function CloudInfra() {
  const { hero, challenge, band, approach, services, outcomes, related, cta } = content
  return (
    <Layout>
      <section className="split-hero hero-image-bg" style={{ '--hero-image': `url(${hero.image})` }}>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="split-hero__sub">{hero.description}</p>
          </Column>
          <Column lg={7} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="cloud-hero-stack">
                <img
                  src={hero.visualImage}
                  alt={hero.visualImageAlt || ''}
                  className="cloud-hero-stack__img"
                  loading="lazy"
                  decoding="async"
                />
                <div className="cloud-hero-stack__overlay" />
                <div className="infra-layer cloud-hero-stack__layers">
                  {hero.layers.map((label, i) => {
                    const layer = layerStyles[Math.min(i, layerStyles.length - 1)]
                    return <div key={label} className="infra-strip" style={{ background: layer.bg, color: layer.color || '#fff' }}>{label}</div>
                  })}
                </div>
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">{challenge.eyebrow}</p>
            <h2>{challenge.title}</h2>
            <p className="section-body">{challenge.body}</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="capability-scene">
              <img
                src={challenge.image}
                alt={challenge.imageAlt || ''}
                className="capability-scene__img"
                loading="lazy"
                decoding="async"
              />
              <div className="capability-scene__overlay capability-scene__overlay--light" />
            </div>
          </Column>
        </Grid>
      </section>

      <section className="wide-image-band">
        <img src={band.image} alt={band.imageAlt || ''} loading="lazy" decoding="async" />
        <div className="wide-image-band__overlay" />
        <Grid className="wide-image-band__content">
          <Column lg={9} md={6} sm={4}>
            <p className="section-label">{band.eyebrow}</p>
            <h2>{band.title}</h2>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{approach.eyebrow}</p>
            <h2>{approach.title}</h2>
          </Column>
        </Grid>
        {approach.items.map((item, i) => (
          <Grid key={item.title} style={{ marginTop: i === 0 ? '2.5rem' : '1px', background: i % 2 === 0 ? '#fff' : 'var(--q-teal-10)', padding: '2rem 0' }}>
            <Column lg={5} md={3} sm={4}><h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--q-primary)', margin: 0 }}>{item.title}</h3></Column>
            <Column lg={9} md={5} sm={4}><p style={{ fontSize: '1rem', color: '#525252', lineHeight: 1.7, margin: 0 }}>{item.description}</p></Column>
          </Grid>
        ))}
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">{services.eyebrow}</p>
            <h2>{services.title}</h2>
            <div className="band-list band-list--light">
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
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{outcomes.eyebrow}</p>
            <h2>{outcomes.title}</h2>
            <div className="metric-row">
              {outcomes.items.map(metric => (
                <div key={metric.title} className="metric-block">
                  <div className="metric-block-num">{metric.value}</div>
                  <p className="metric-block-title">{metric.title}</p>
                  <p className="metric-block-desc">{metric.description}</p>
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
