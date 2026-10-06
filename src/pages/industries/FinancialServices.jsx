// Structured, precise, data-heavy
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { Analytics, Bot, DevicesApps, Cloud, Security, Rule, SettingsAdjust } from '@carbon/icons-react'
import content from '../../content/industries/details/financial-services.json'
import { stepNumber, toRelated } from '../../lib/content'
import '../../App.css'

const helpIcons = [Analytics, Bot, Cloud, Security, Rule, SettingsAdjust]
const priorityIcons = [Analytics, Cloud, Analytics, DevicesApps]

export default function FinancialServices() {
  const { hero, challenge, help, priorities, outcomes, related, cta } = content
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
              <div className="priority-matrix">
                {hero.priorities.map((label, i) => (
                  <div key={label} className={`priority-cell${i === 0 ? ' priority-cell--highlight' : ''}`}><span data-heading-visual className="diagram-label">{label}</span></div>
                ))}
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label">{challenge.eyebrow}</p>
            <h2>{challenge.title}</h2>
            <p className="section-body">{challenge.body}</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{help.eyebrow}</p>
            <h2>{help.title}</h2>
            <div className="highlight-grid">
              {help.areas.map((label, i) => {
                const Icon = helpIcons[i % helpIcons.length]
                return (
                  <div key={label} className="highlight-cell">
                    <Icon size={24} />
                    <span>{label}</span>
                  </div>
                )
              })}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">{priorities.eyebrow}</p>
            <h2>{priorities.title}</h2>
            <div className="band-list band-list--light">
              {priorities.items.map(({ title, description }, i) => {
                const Icon = priorityIcons[i % priorityIcons.length]
                return (
                  <div key={title} className="band-row">
                    <Icon size={26} className="band-icon" />
                    <div><h3>{title}</h3><p>{description}</p></div>
                  </div>
                )
              })}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{outcomes.eyebrow}</p>
            <h2>{outcomes.title}</h2>
            <div className="outcome-grid">
              {outcomes.items.map(({ title }, i) => (
                <div key={title} className="outcome-card outcome-card--dark">
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
