import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import '../../App.css'

const deliverItems = [
  { title: 'Enterprise AI Strategy', desc: 'Define where AI creates measurable value and build a roadmap that connects use cases to business outcomes.' },
  { title: 'AI Agents', desc: 'Engineer purpose-built agents that carry out multi-step tasks across your systems with reliability and control.' },
  { title: 'Copilots', desc: 'Embed assistive AI into the tools your teams already use to accelerate everyday work.' },
  { title: 'Generative AI Applications', desc: 'Build production-grade generative applications grounded in your enterprise knowledge and data.' },
  { title: 'AI Integration', desc: 'Connect AI capabilities to the data sources, applications and workflows where decisions are made.' },
  { title: 'Model Evaluation & Observability', desc: 'Continuously measure quality, cost and behaviour so AI systems stay trustworthy in production.' },
  { title: 'Responsible AI Foundations', desc: 'Establish the guardrails, oversight and policies that keep AI safe, explainable and compliant.' },
]

const outcomes = [
  { num: '01', title: 'Faster Workflows', desc: 'Work moves through the enterprise with less delay.' },
  { num: '02', title: 'Less Repetitive Work', desc: 'Teams spend less time on manual tasks.' },
  { num: '03', title: 'Higher Productivity', desc: 'People focus on higher-value work.' },
  { num: '04', title: 'Scalable Intelligence', desc: 'AI capability that compounds over time.' },
]

function AgentNetwork() {
  const nodes = [
    { label: 'Orchestrate', x: 200, y: 30 },
    { label: 'Build', x: 350, y: 130 },
    { label: 'Discover', x: 290, y: 280 },
    { label: 'Govern', x: 110, y: 280 },
    { label: 'Scale', x: 50, y: 130 },
  ]

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
        <text x={200} y={164} textAnchor="middle" fill="#0788D6" fontSize="12" fontWeight="700">Enterprise</text>
      </svg>
    </div>
  )
}

export default function AIAgentDev() {
  return (
    <Layout>
      <section className="split-hero split-hero--darkest">
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Capability · AI &amp; Agent Development</p>
            <h1>Intelligent systems that act.</h1>
            <p className="split-hero__sub">Move beyond AI experimentation with practical copilots, agents and intelligent workflows designed around enterprise operations.</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap"><AgentNetwork /></div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={6} md={4} sm={4}>
            <p className="section-label">The challenge</p>
            <h2>Stuck in pilot mode</h2>
            <p className="section-body">AI experiments rarely survive contact with enterprise complexity. Integration gaps, governance concerns, and unclear ROI keep most organisations in pilot mode, delivering demos but not outcomes.</p>
          </Column>
          <Column lg={10} md={4} sm={4}>
            <div className="capability-scene capability-scene--dark">
              <img
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80"
                alt=""
                className="capability-scene__img"
                loading="lazy"
                decoding="async"
              />
              <div className="capability-scene__overlay" />
              <div className="capability-scene__caption">
                <span>Governed AI</span>
                <p>From prototype to production-grade enterprise execution.</p>
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="statement-band statement-band--dark">
        <Grid>
          <Column lg={14} md={8} sm={4}>
            <p>AI creates value when it is connected to systems, workflows and governance rather than isolated as a demo.</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section" style={{ background: '#001c1e', color: '#fff' }}>
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label" style={{ color: 'var(--q-accent)' }}>What we deliver</p>
            <h2 style={{ color: '#fff' }}>Our AI &amp; agent development services</h2>
            <div className="band-list">
              {deliverItems.map(({ title, desc }, i) => (
                <div key={title} className="band-row">
                  <span className="band-num">{String(i + 1).padStart(2, '0')}</span>
                  <div><h3>{title}</h3><p>{desc}</p></div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={10} md={6} sm={4}>
            <p className="section-label">Go further</p>
            <h2>The agentic enterprise</h2>
            <p className="section-body" style={{ marginBottom: '2rem' }}>Individual agents create value. Connected, governed agent ecosystems change how the enterprise operates.</p>
            <Link to="/agentic-ai" className="cta-btn cta-btn--outline-dark">
              Explore Qlugen&apos;s Agentic Enterprise approach <ArrowRight size={18} />
            </Link>
          </Column>
          <Column lg={6} md={2} sm={4}>
            <div className="quote-panel">
              <p>Enterprise AI becomes durable when strategy, orchestration, governance and delivery move together.</p>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Outcomes</p>
            <h2>What strong AI development enables</h2>
            <div className="outcome-grid">
              {outcomes.map(({ num, title, desc }) => (
                <div key={num} className="outcome-card">
                  <span className="outcome-num">{num}</span>
                  <p className="outcome-title">{title}</p>
                  <p className="outcome-desc">{desc}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading="Related capabilities" items={[
        { eyebrow: 'Capability', title: 'Data & Analytics', desc: 'Build the decision-ready data foundations AI depends on.', to: '/capabilities/data-analytics' },
        { eyebrow: 'Agentic AI', title: 'Agentic Enterprise', desc: 'Design, build and scale governed agent ecosystems.', to: '/agentic-ai' },
      ]} />

      <CTABanner heading="Turn AI development into business impact." sub="Talk to Qlugen about your priorities." btnTo="/contact" />
    </Layout>
  )
}
