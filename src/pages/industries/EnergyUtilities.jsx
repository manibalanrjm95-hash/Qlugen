// Infrastructure / asset visual, operational intelligence
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import '../../App.css'

const phases = [
  { label: 'Field', desc: 'Assets, sensors and distributed infrastructure across the network.', bg: 'var(--q-teal-10)', color: 'var(--q-primary)' },
  { label: 'Grid', desc: 'The connected network that moves and balances energy.', bg: 'var(--q-teal-20)', color: 'var(--q-primary)' },
  { label: 'Intelligence', desc: 'Analytics and AI that turn operational data into decisions.', bg: 'var(--q-primary)', color: '#fff' },
]

const helps = ['Asset Intelligence', 'Field Operations', 'Operational Data', 'Operations Visibility', 'Automation', 'AI', 'Sustainability Enablement']

const outcomes = [
  { num: '01', title: 'Operational Reliability' },
  { num: '02', title: 'Asset Intelligence' },
  { num: '03', title: 'Improved Efficiency' },
  { num: '04', title: 'Stronger Resilience' },
]

function GridVisual() {
  const pts = [[40, 40], [140, 40], [240, 40], [90, 130], [190, 130], [40, 220], [140, 220], [240, 220]]
  const links = [[0, 1], [1, 2], [0, 3], [1, 3], [1, 4], [2, 4], [3, 5], [3, 6], [4, 6], [4, 7], [5, 6], [6, 7]]
  return (
    <div className="diagram-wrap">
      <svg viewBox="0 0 280 260" aria-hidden="true">
        {links.map(([a, b], i) => (
          <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="rgba(11,242,118,.35)" strokeWidth="1" />
        ))}
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 7 : 5} fill={i % 3 === 0 ? '#0788D6' : 'rgba(255,255,255,.5)'} />
        ))}
      </svg>
    </div>
  )
}

export default function EnergyUtilities() {
  return (
    <Layout>
      <section className="split-hero" style={{ background: '#012749' }}>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Industry · Energy &amp; Utilities</p>
            <h1>Power more resilient operations.</h1>
            <p className="split-hero__sub">From asset intelligence to operational automation, Qlugen helps energy and utilities organisations build the data and technology foundations that support reliable, efficient operations.</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap"><GridVisual /></div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={10} md={8} sm={4}>
            <p className="section-label">The operational challenge</p>
            <h2>Reliability meets a changing energy system</h2>
            <p className="section-body" style={{ maxWidth: '54rem' }}>Energy and utilities organisations operate critical infrastructure that demands reliability, visibility and increasingly sophisticated operational intelligence. The shift towards more distributed energy systems creates new technology requirements alongside legacy modernisation priorities.</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Field → Grid → Intelligence</p>
            <h2>From asset to insight</h2>
            <div className="phase-flow">
              {phases.map((p, i) => (
                <span key={p.label} style={{ display: 'flex', flex: 1, minWidth: '12rem' }}>
                  <div className="phase-card" style={{ background: p.bg, color: p.color, flex: 1 }}>
                    <span style={{ fontSize: '.625rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .7 }}>Phase {i + 1}</span>
                    <h3 style={{ color: p.color }}>{p.label}</h3>
                    <p style={{ color: p.color, opacity: .8 }}>{p.desc}</p>
                  </div>
                  {i < phases.length - 1 && <div className="phase-arrow2"><ArrowRight size={20} /></div>}
                </span>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Where we help</p>
            <h2>Focused on reliable operations</h2>
            <div className="tile-grid">
              {helps.map(h => (
                <div key={h} className="tile-card"><span data-heading-visual className="tile-label">{h}</span></div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Business priorities</p>
            <h2>What energy &amp; utilities leaders focus on</h2>
            <div className="outcome-grid">
              {outcomes.map(({ num, title }) => (
                <div key={num} className="outcome-card outcome-card--dark">
                  <span className="outcome-num">{num}</span>
                  <p className="outcome-title">{title}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading="Related capabilities" items={[
        { eyebrow: 'Capability', title: 'Data & Analytics', desc: 'Turn operational data into asset intelligence.', to: '/capabilities/data-analytics' },
        { eyebrow: 'Capability', title: 'Automation', desc: 'Automate and orchestrate field operations.', to: '/capabilities/automation' },
        { eyebrow: 'Capability', title: 'Sustainability', desc: 'Measure and improve operational efficiency.', to: '/capabilities/sustainability' },
      ]} />

      <CTABanner heading="Transform what comes next." sub="Tell us about your industry challenge." btnTo="/contact" />
    </Layout>
  )
}
