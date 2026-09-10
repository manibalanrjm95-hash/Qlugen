// Growth / scaling model — gradient hero + progression
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import '../../App.css'

const model = ['Proof', 'Pilot', 'Programme', 'Platform', 'Enterprise']

const enablers = [
  { title: 'Reusable Agent Capabilities', desc: 'Build once, apply across many use cases and teams.' },
  { title: 'Platform Thinking', desc: 'Shared foundations that make each new step cheaper than the last.' },
  { title: 'Cross-Team Adoption', desc: 'Patterns and enablement that let teams adopt without rebuilding.' },
  { title: 'Enterprise Integration', desc: 'Connectivity to the systems where scaled work happens.' },
  { title: 'Operational Scale', desc: 'The runtime discipline to operate many agents reliably.' },
]

export default function Scale() {
  return (
    <Layout>
      <section className="split-hero" style={{ background: 'linear-gradient(120deg, #010a23 0%, #022160 60%, #0444C6 100%)' }}>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Agentic Enterprise · 05</p>
            <h1>Scale what works.</h1>
            <p className="split-hero__sub">Extend proven AI capabilities across your enterprise with platform thinking and reusable foundations.</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '.5rem', width: '100%', height: '14rem' }}>
                {model.map((m, i) => (
                  <div key={m} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ height: `${30 + i * 17}%`, background: 'rgba(11,242,118,.25)', border: '1px solid rgba(11,242,118,.5)', borderRadius: '4px 4px 0 0', minHeight: '2rem' }} />
                    <span style={{ fontSize: '.6875rem', color: 'rgba(255,255,255,.8)', fontWeight: 600, display: 'block', marginTop: '.5rem' }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label">Why it matters</p>
            <h2>Compounding value instead of repeating experiments</h2>
            <p className="section-body">Once an AI capability proves value in one part of the organisation, the question is how to extend it without rebuilding each time. Platform thinking — shared foundations, reusable capabilities and common governance — separates organisations that compound their investments from those that repeat expensive experimentation indefinitely.</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Scaling model</p>
            <h2>From proof to enterprise platform</h2>
            <div className="phase-flow">
              {model.map((m, i) => (
                <span key={m} style={{ display: 'flex', flex: 1, minWidth: '9rem' }}>
                  <div className="phase-card" style={{ background: i === model.length - 1 ? 'var(--q-primary)' : 'var(--q-teal-10)', color: i === model.length - 1 ? '#fff' : 'var(--q-primary)', flex: 1 }}>
                    <span style={{ fontSize: '.625rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .7 }}>Step {i + 1}</span>
                    <span data-heading-visual className="phase-label" style={{ color: i === model.length - 1 ? '#fff' : 'var(--q-primary)' }}>{m}</span>
                  </div>
                  {i < model.length - 1 && <div className="phase-arrow2"><ArrowRight size={18} /></div>}
                </span>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">What enables scale</p>
            <h2>Five foundations of scalable AI</h2>
            <div className="band-list band-list--light">
              {enablers.map(({ title, desc }, i) => (
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
        { eyebrow: 'Stage 02', title: 'Build & Run', desc: 'Engineer the capabilities you scale.', to: '/agentic-ai/build-run' },
        { eyebrow: 'Stage 04', title: 'Govern', desc: 'Scale within trusted boundaries.', to: '/agentic-ai/govern' },
      ]} />

      <CTABanner heading="Ready to scale what works?" sub="Talk to Qlugen about extending AI across your enterprise." btnTo="/contact" />
    </Layout>
  )
}
