// Diagram-led orchestration
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import '../../App.css'

const steps = [
  { num: '01', label: 'Model the process', desc: 'Map the end-to-end workflow, decisions and approvals involved.' },
  { num: '02', label: 'Assign agents & tools', desc: 'Determine which agents and systems handle each step.' },
  { num: '03', label: 'Coordinate execution', desc: 'Run steps in sequence with hand-offs and human checkpoints.' },
  { num: '04', label: 'Monitor & adapt', desc: 'Observe outcomes and refine the orchestration over time.' },
]

const deliver = [
  { title: 'Agent Orchestration', desc: 'Coordinate multiple agents into coherent, end-to-end processes.' },
  { title: 'Tool Integration', desc: 'Give agents controlled access to the systems they need to act.' },
  { title: 'Workflow Coordination', desc: 'Sequence steps, hand-offs and dependencies reliably.' },
  { title: 'Human-in-the-Loop Design', desc: 'Insert approvals and oversight where judgement matters.' },
  { title: 'Enterprise Connectivity', desc: 'Connect orchestration to the systems where work happens.' },
]

function OrchestrationDiagram() {
  const agents = [
    { label: 'Data', x: 200, y: 30 },
    { label: 'Process', x: 350, y: 130 },
    { label: 'Decision', x: 290, y: 280 },
    { label: 'Comms', x: 110, y: 280 },
    { label: 'Integration', x: 50, y: 130 },
  ]
  return (
    <div className="diagram-wrap">
      <svg viewBox="0 0 400 320" aria-hidden="true">
        {agents.map((a, i) => <line key={i} x1={200} y1={160} x2={a.x} y2={a.y} stroke="rgba(255,255,255,.2)" strokeWidth="1.5" />)}
        {agents.map((a, i) => (
          <g key={i}>
            <circle cx={a.x} cy={a.y} r="34" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.25)" />
            <text x={a.x} y={a.y + 4} textAnchor="middle" fill="rgba(255,255,255,.85)" fontSize="10" fontWeight="600">{a.label}</text>
          </g>
        ))}
        <circle cx={200} cy={160} r="48" fill="rgba(7,136,214,.15)" stroke="var(--q-accent)" strokeWidth="1.5" />
        <text x={200} y={158} textAnchor="middle" fill="#0788D6" fontSize="11" fontWeight="700">Orchestrator</text>
        <text x={200} y={172} textAnchor="middle" fill="rgba(7,136,214,.7)" fontSize="8">central</text>
      </svg>
    </div>
  )
}

export default function Orchestrate() {
  return (
    <Layout>
      <section className="split-hero split-hero--darkest">
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Agentic Enterprise · 01</p>
            <h1>Orchestrate your agent ecosystem.</h1>
            <p className="split-hero__sub">Connect agents, systems, tools, workflows and human approvals into coordinated enterprise processes.</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap"><OrchestrationDiagram /></div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label">Why it matters</p>
            <h2>Value comes from coordination, not isolation</h2>
            <p className="section-body">Individual agents deliver point solutions. The enterprise value of AI emerges when agents, tools, data and human decisions are coordinated into end-to-end processes. Orchestration is what turns a collection of capabilities into a working system.</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">How orchestration works</p>
            <h2>Four steps to coordinated processes</h2>
            <div className="timeline-row">
              {steps.map(s => (
                <div key={s.num} className="timeline-phase">
                  <span className="timeline-phase-num">Step {s.num}</span>
                  <h3>{s.label}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">What Qlugen delivers</p>
            <h2>Coordinating the whole</h2>
            <div className="band-list">
              {deliver.map(({ title, desc }, i) => (
                <div key={title} className="band-row">
                  <span className="band-num">{String(i + 1).padStart(2, '0')}</span>
                  <div><h3>{title}</h3><p>{desc}</p></div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading="Explore the agentic stages" items={[
        { eyebrow: 'Stage 02', title: 'Build & Run', desc: 'Engineer agents that perform reliably.', to: '/agentic-ai/build-run' },
        { eyebrow: 'Stage 04', title: 'Govern', desc: 'Keep intelligence within trusted boundaries.', to: '/agentic-ai/govern' },
      ]} />

      <CTABanner heading="Ready to orchestrate your agent ecosystem?" sub="Talk to Qlugen about connecting agents into coordinated processes." btnTo="/contact" />
    </Layout>
  )
}
