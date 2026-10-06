import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { ArrowRight, Close, Checkmark } from '@carbon/icons-react'
import content from '../../content/capabilities/details/automation.json'
import { stepNumber, toRelated } from '../../lib/content'
import '../../App.css'

export default function Automation() {
  const { hero, beforeAfter, band, services, outcomes, related, cta } = content
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
              <div className="workflow-map">
                <img
                  src={hero.visualImage}
                  alt={hero.visualImageAlt || ''}
                  className="workflow-map__img"
                  loading="lazy"
                  decoding="async"
                />
                <div className="workflow-map__overlay" />
                <div className="proc-flow workflow-map__nodes">
                  {hero.flow.map((node, i) => (
                    <span key={node} style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <span className={`proc-node${i === hero.flow.length - 1 ? ' proc-node--last' : ''}`}>{node}</span>
                      {i < hero.flow.length - 1 && <ArrowRight size={16} className="proc-arrow" />}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{beforeAfter.eyebrow}</p>
            <h2>{beforeAfter.title}</h2>
            <div className="before-after">
              <div className="before-col">
                <p className="ba-heading">{beforeAfter.beforeHeading}</p>
                {beforeAfter.before.map(item => (
                  <div key={item} className="pain-item pain-item--before"><Close size={18} style={{ color: '#a2191f', flexShrink: 0 }} /> {item}</div>
                ))}
              </div>
              <div className="divider-vert" />
              <div className="after-col">
                <p className="ba-heading">{beforeAfter.afterHeading}</p>
                {beforeAfter.after.map(item => (
                  <div key={item} className="pain-item pain-item--after"><Checkmark size={18} style={{ color: 'var(--q-primary)', flexShrink: 0 }} /> {item}</div>
                ))}
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="wide-image-band">
        <img src={band.image} alt={band.imageAlt || ''} loading="lazy" decoding="async" />
        <div className="wide-image-band__overlay" />
        <Grid className="wide-image-band__content">
          <Column lg={10} md={6} sm={4}>
            <p className="section-label">{band.eyebrow}</p>
            <h2>{band.title}</h2>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{services.eyebrow}</p>
            <h2>{services.title}</h2>
            <div className="deliver-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {services.items.map(({ title, description }) => (
                <div key={title} className="deliver-card">
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{outcomes.eyebrow}</p>
            <h2>{outcomes.title}</h2>
            <div className="metric-row">
              {outcomes.items.map((metric, i) => (
                <div key={metric.title} className="metric-block">
                  <div className="metric-block-num">{stepNumber(i)}</div>
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
