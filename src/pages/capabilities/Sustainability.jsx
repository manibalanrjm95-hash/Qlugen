// Open, light, human-scale
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { DataShare, Earth, Growth, Report, ChartLineData } from '@carbon/icons-react'
import content from '../../content/capabilities/details/sustainability.json'
import { stepNumber, toRelated } from '../../lib/content'
import '../../App.css'

const serviceIcons = [DataShare, Earth, Growth, Report, ChartLineData]

export default function Sustainability() {
  const { hero, challenge, impact, services, outcomes, related, cta } = content
  return (
    <Layout>
      <section className="split-hero split-hero--light hero-image-bg" style={{ '--hero-image': `url(${hero.image})` }}>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="split-hero__sub">{hero.description}</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <img src={hero.visualImage} alt={hero.visualImageAlt || ''} style={{ width: '100%', height: '20rem', objectFit: 'cover', borderRadius: '.75rem' }} loading="lazy" decoding="async" />
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={10} md={8} sm={4}>
            <p className="section-label">{challenge.eyebrow}</p>
            <h2>{challenge.title}</h2>
            <p className="section-body" style={{ maxWidth: '54rem' }}>{challenge.body}</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">{impact.eyebrow}</p>
            <h2>{impact.title}</h2>
            <div style={{ marginTop: '2.5rem' }}>
              {impact.items.map((item, i) => (
                <div key={item.title} className="impact-bar">
                  <span className="impact-bar-num">{stepNumber(i)}</span>
                  <div className="impact-bar-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={14} md={8} sm={4}>
            <p className="section-label">{services.eyebrow}</p>
            <h2>{services.title}</h2>
            <div className="flow-list">
              {services.items.map(({ title, description }, i) => {
                const Icon = serviceIcons[i % serviceIcons.length]
                return (
                  <div key={title} className="flow-item">
                    <Icon size={22} />
                    <div><h3>{title}</h3><p>{description}</p></div>
                  </div>
                )
              })}
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
              {outcomes.items.map(m => (
                <div key={m.title} className="metric-block">
                  <div className="metric-block-num" style={{ fontSize: 'clamp(1.5rem,3vw,2rem)' }}>{m.value}</div>
                  <p className="metric-block-title">{m.title}</p>
                  <p className="metric-block-desc">{m.description}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading={related.heading} items={toRelated(related.items)} />

      <CTABanner heading={cta.heading} sub={cta.sub} btnText={cta.label} btnTo={cta.url} light />
    </Layout>
  )
}
