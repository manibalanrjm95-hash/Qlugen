// Diagram-led orchestration
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import content from '../../content/agentic-ai/details/orchestrate.json'
import { stepNumber, toRelated } from '../../lib/content'
import '../../App.css'

const agentPositions = [
  { x: 200, y: 30 },
  { x: 350, y: 130 },
  { x: 290, y: 280 },
  { x: 110, y: 280 },
  { x: 50, y: 130 },
]

function OrchestrationDiagram({ center, caption, labels }) {
  const agents = agentPositions.map((position, i) => ({ ...position, label: labels[i] })).filter(agent => agent.label)

  return (
    <div className="diagram-wrap">
      <svg viewBox="0 0 400 320" aria-hidden="true">
        {agents.map((a, i) => (
          <line key={i} x1={200} y1={160} x2={a.x} y2={a.y} stroke="rgba(255,255,255,.2)" strokeWidth="1.5" />
        ))}
        {agents.map((a, i) => (
          <g key={i}>
            <circle cx={a.x} cy={a.y} r="34" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.25)" />
            <text x={a.x} y={a.y + 4} textAnchor="middle" fill="rgba(255,255,255,.85)" fontSize="10" fontWeight="600">{a.label}</text>
          </g>
        ))}
        <circle cx={200} cy={160} r="48" fill="rgba(7,136,214,.15)" stroke="var(--q-accent)" strokeWidth="1.5" />
        <text x={200} y={158} textAnchor="middle" fill="#0788D6" fontSize="11" fontWeight="700">{center}</text>
        <text x={200} y={172} textAnchor="middle" fill="rgba(7,136,214,.7)" fontSize="8">{caption}</text>
      </svg>
    </div>
  )
}

export default function Orchestrate() {
  const { hero, why, process, deliverables, related, cta } = content
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
            <div className="split-visual-wrap"><OrchestrationDiagram center={hero.diagramCenter} caption={hero.diagramCenterCaption} labels={hero.diagramNodes} /></div>
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

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{process.eyebrow}</p>
            <h2>{process.title}</h2>
            <div className="timeline-row">
              {process.steps.map((s, i) => (
                <div key={s.title} className="timeline-phase">
                  <span className="timeline-phase-num">{process.stepLabel} {stepNumber(i)}</span>
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
            <p className="section-label">{deliverables.eyebrow}</p>
            <h2>{deliverables.title}</h2>
            <div className="band-list">
              {deliverables.items.map(({ title, description }, i) => (
                <div key={title} className="band-row">
                  <span className="band-num">{stepNumber(i)}</span>
                  <div><h3>{title}</h3><p>{description}</p></div>
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
