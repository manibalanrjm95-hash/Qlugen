// Data / dashboard-led composition
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { DataShare, Dashboard, MachineLearning } from '@carbon/icons-react'
import content from '../../content/capabilities/details/data-analytics.json'
import { toRelated } from '../../lib/content'
import '../../App.css'

const helpIcons = [DataShare, Dashboard, MachineLearning]
const bars = [42, 58, 35, 71, 49, 64, 80, 55]

export default function DataAnalytics() {
  const { hero, challenge, services, help, outcomes, related, cta } = content
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
              <div className="data-mock">
                <p className="data-mock-head">{hero.dashboard.caption}</p>
                <p className="data-mock-title">{hero.dashboard.title}</p>
                <div className="data-mock-bars">
                  {bars.map((h, i) => <div key={i} className="data-mock-bar" style={{ height: `${h}%` }} />)}
                </div>
                <div className="data-mock-stats">
                  {hero.dashboard.stats.map(stat => (
                    <div key={stat.label} className="data-mock-stat"><span className="data-mock-stat-val">{stat.value}</span><span className="data-mock-stat-lbl">{stat.label}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={7} md={5} sm={4}>
            <p className="section-label">{challenge.eyebrow}</p>
            <h2>{challenge.title}</h2>
            <p className="section-body">{challenge.body}</p>
          </Column>
          <Column lg={7} md={3} sm={4}>
            <div className="big-stat" style={{ marginTop: '2rem' }}>
              <div className="big-stat-num">{challenge.statValue}</div>
              <p className="big-stat-label">{challenge.statLabel}</p>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">{services.eyebrow}</p>
            <h2>{services.title}</h2>
            <div className="svc-rows">
              {services.items.map(s => (
                <div key={s.title} className="svc-row">
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">{help.eyebrow}</p>
            <h2>{help.title}</h2>
            <div className="band-list">
              {help.items.map(({ title, description }, i) => {
                const Icon = helpIcons[i % helpIcons.length]
                return (
                  <div key={title} className="band-row">
                    <Icon size={28} className="band-icon" />
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
                  <div className="metric-block-num">{m.value}</div>
                  <p className="metric-block-title">{m.title}</p>
                  <p className="metric-block-desc">{m.description}</p>
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
