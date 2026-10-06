import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import content from '../../content/capabilities/details/ai-agent-development.json'
import { stepNumber, toRelated } from '../../lib/content'
import '../../App.css'

const nodePositions = [
  { x: 200, y: 30 },
  { x: 350, y: 130 },
  { x: 290, y: 280 },
  { x: 110, y: 280 },
  { x: 50, y: 130 },
]

function AgentNetwork({ center, labels }) {
  const nodes = nodePositions.map((position, i) => ({ ...position, label: labels[i] })).filter(node => node.label)

  return (
    <div className="diagram-wrap">
      <svg viewBox="0 0 400 320" aria-hidden="true">
        {nodes.map((node, i) => (
          <line key={i} x1={200} y1={160} x2={node.x} y2={node.y} stroke="rgba(255,255,255,.2)" strokeWidth="1.5" />
        ))}
        {nodes.map((node, i) => (
          <g key={i}>
            <circle cx={node.x} cy={node.y} r="34" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.25)" strokeWidth="1" />
            <text x={node.x} y={node.y + 4} textAnchor="middle" fill="rgba(255,255,255,.85)" fontSize="11" fontWeight="600">{node.label}</text>
          </g>
        ))}
        <circle cx={200} cy={160} r="46" fill="rgba(7,136,214,.15)" stroke="var(--q-accent)" strokeWidth="1.5" />
        <text x={200} y={164} textAnchor="middle" fill="#0788D6" fontSize="12" fontWeight="700">{center}</text>
      </svg>
    </div>
  )
}

export default function AIAgentDev() {
  const { hero, challenge, statement, services, agentic, outcomes, related, cta } = content
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
            <div className="split-visual-wrap"><AgentNetwork center={hero.diagramCenter} labels={hero.diagramNodes} /></div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={6} md={4} sm={4}>
            <p className="section-label">{challenge.eyebrow}</p>
            <h2>{challenge.title}</h2>
            <p className="section-body">{challenge.body}</p>
          </Column>
          <Column lg={10} md={4} sm={4}>
            <div className="capability-scene capability-scene--dark">
              <img
                src={challenge.image}
                alt={challenge.imageAlt || ''}
                className="capability-scene__img"
                loading="lazy"
                decoding="async"
              />
              <div className="capability-scene__overlay" />
              <div className="capability-scene__caption">
                <span>{challenge.captionLabel}</span>
                <p>{challenge.caption}</p>
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="statement-band statement-band--dark">
        <Grid>
          <Column lg={14} md={8} sm={4}>
            <p>{statement}</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section" style={{ background: '#001c1e', color: '#fff' }}>
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
          <Column lg={10} md={6} sm={4}>
            <p className="section-label">{agentic.eyebrow}</p>
            <h2>{agentic.title}</h2>
            <p className="section-body" style={{ marginBottom: '2rem' }}>{agentic.body}</p>
            <Link to={agentic.linkUrl} className="cta-btn cta-btn--outline-dark">
              {agentic.linkLabel} <ArrowRight size={18} />
            </Link>
          </Column>
          <Column lg={6} md={2} sm={4}>
            <div className="quote-panel">
              <p>{agentic.quote}</p>
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
              {outcomes.items.map(({ title, description }, i) => (
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
