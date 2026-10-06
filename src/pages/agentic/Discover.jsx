// Lighter, exploratory — discovery methodology
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { Search, Analytics, ListChecked, Rule, ChartLineData } from '@carbon/icons-react'
import content from '../../content/agentic-ai/details/discover.json'
import { toRelated } from '../../lib/content'
import '../../App.css'

const stepIcons = [Search, Analytics, ListChecked, Rule, ChartLineData]

export default function Discover() {
  const { hero, why, methodology, analysis, related, cta } = content
  return (
    <Layout>
      <section className="split-hero split-hero--light hero-image-bg" style={{ '--hero-image': `url(${hero.image})` }}>
        <Grid>
          <Column lg={9} md={6} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="split-hero__sub">{hero.description}</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label">{why.eyebrow}</p>
            <h2>{why.title}</h2>
            <p className="section-body">{why.body}</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{methodology.eyebrow}</p>
            <h2>{methodology.title}</h2>
            <div className="journey-flow">
              {methodology.steps.map((label, i) => {
                const Icon = stepIcons[i % stepIcons.length]
                return (
                  <span key={label} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <div className="journey-node">
                      <div className="journey-node-circle" style={{ background: '#fff' }}><Icon size={22} /></div>
                      <span data-heading-visual className="diagram-label">{label}</span>
                    </div>
                    {i < methodology.steps.length - 1 && <div className="journey-connector" />}
                  </span>
                )
              })}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">{analysis.eyebrow}</p>
            <h2>{analysis.title}</h2>
            <div className="flow-list">
              {analysis.items.map(a => (
                <div key={a.title} className="flow-item">
                  <div><h3>{a.title}</h3><p>{a.description}</p></div>
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
