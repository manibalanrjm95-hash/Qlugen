// Governance framework — dark, 2x3 grid + editorial list
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { Password, Security, View, User, Rule, CheckmarkOutline } from '@carbon/icons-react'
import '../../App.css'

const dimensions = [
  { icon: Password, title: 'Permissions', desc: 'Least-privilege access, explicit and auditable.' },
  { icon: Security, title: 'Security', desc: 'Protection across the agent lifecycle.' },
  { icon: View, title: 'Traceability', desc: 'Every action logged and explainable.' },
  { icon: User, title: 'Human Oversight', desc: 'People in the loop where judgement matters.' },
  { icon: Rule, title: 'AI Governance', desc: 'Policies that define what agents may do.' },
  { icon: CheckmarkOutline, title: 'Responsible Deployment', desc: 'Safe, staged rollout with clear boundaries.' },
]

const principles = [
  'Governance is designed in, not bolted on afterwards.',
  'Agents receive the minimum access required for their task.',
  'Every action is traceable, logged and explainable.',
  'Humans stay in the loop for decisions that carry risk.',
  'Expanding autonomy is a deliberate decision, never a default.',
]

export default function Govern() {
  return (
    <Layout>
      <section className="split-hero split-hero--darkest">
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Agentic Enterprise · 04</p>
            <h1>Govern intelligence by design.</h1>
            <p className="split-hero__sub">Build AI systems that operate within trusted boundaries with human oversight at every level.</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="diagram-wrap">
                <svg viewBox="0 0 320 260" aria-hidden="true">
                  <rect x="60" y="20" width="200" height="220" rx="8" fill="none" stroke="rgba(11,242,118,.4)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x="160" y="12" textAnchor="middle" fill="rgba(11,242,118,.8)" fontSize="10" fontWeight="700">GOVERNANCE BOUNDARY</text>
                  {[[110, 90], [210, 90], [110, 170], [210, 170]].map(([x, y], i) => (
                    <g key={i}>
                      <circle cx={x} cy={y} r="26" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.25)" />
                      <text x={x} y={y + 4} textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize="9">Agent</text>
                    </g>
                  ))}
                  <line x1="110" y1="90" x2="210" y2="90" stroke="rgba(255,255,255,.15)" />
                  <line x1="110" y1="170" x2="210" y2="170" stroke="rgba(255,255,255,.15)" />
                  <line x1="110" y1="90" x2="110" y2="170" stroke="rgba(255,255,255,.15)" />
                  <line x1="210" y1="90" x2="210" y2="170" stroke="rgba(255,255,255,.15)" />
                </svg>
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label">Why it matters</p>
            <h2>Governance is infrastructure, not an afterthought</h2>
            <p className="section-body">As agents take on more responsibility, governance becomes foundational. Permissions, security, traceability and human oversight established early create the conditions for safe scaling. Governance built retrospectively tends to slow adoption at exactly the moment momentum is needed.</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Governance dimensions</p>
            <h2>Six dimensions of trusted AI</h2>
            <div className="tile-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {dimensions.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="tile-card" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)' }}>
                  <Icon size={24} style={{ color: 'var(--q-accent)', marginBottom: '.875rem' }} />
                  <h3 style={{ color: '#fff' }}>{title}</h3>
                  <p style={{ color: 'rgba(255,255,255,.6)' }}>{desc}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={9} md={6} sm={4}>
            <p className="section-label">Responsible AI principles</p>
            <h2>The commitments that keep AI trustworthy</h2>
            <div style={{ marginTop: '2rem' }}>
              {principles.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.5rem', padding: '1.25rem 0', borderBottom: '1px solid var(--q-teal-20)' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'rgba(2,33,96,.25)', minWidth: '2rem' }}>{String(i + 1).padStart(2, '0')}</span>
                  <p style={{ fontSize: '1.0625rem', color: 'var(--q-primary)', margin: 0, lineHeight: 1.5 }}>{p}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading="Explore the agentic stages" items={[
        { eyebrow: 'Stage 01', title: 'Orchestrate', desc: 'Coordinate agents and human approvals.', to: '/agentic-ai/orchestrate' },
        { eyebrow: 'Stage 05', title: 'Scale', desc: 'Extend governed capabilities enterprise-wide.', to: '/agentic-ai/scale' },
      ]} />

      <CTABanner heading="Ready to govern AI by design?" sub="Talk to Qlugen about building trusted, well-governed agent systems." btnTo="/contact" />
    </Layout>
  )
}
