// Build pipeline visual + alternating technical sections
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import '../../App.css'

const pipeline = ['Code', 'Build', 'Test', 'Deploy', 'Monitor']

const sections = [
  { title: 'Engineering for integration', desc: 'Agents that perform in a demo rarely survive the messiness of real enterprise systems. We engineer for the integrations, data contracts and edge cases that production demands.', items: ['Agent Engineering', 'Enterprise Integration'] },
  { title: 'Confidence through evaluation', desc: 'Reliability is measurable. We build evaluation and observability into every agent so behaviour, quality and cost stay understood in production.', items: ['Evaluation', 'Observability'] },
  { title: 'Operating in production', desc: 'Deployment is the beginning, not the end. We run agents with the operational discipline enterprise systems require.', items: ['Deployment', 'Runtime Operations'] },
]

export default function BuildRun() {
  return (
    <Layout>
      <section className="split-hero split-hero--darkest">
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label">Agentic Enterprise · 02</p>
            <h1>Build intelligence that performs.</h1>
            <p className="split-hero__sub">Engineer AI agents and systems that operate reliably inside your enterprise environment.</p>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="proc-flow" style={{ justifyContent: 'center' }}>
                {pipeline.map((n, i) => (
                  <span key={n} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span className="proc-node" style={{ background: 'rgba(11,242,118,.12)', color: 'var(--q-accent)', border: '1px solid rgba(11,242,118,.3)' }}>{n}</span>
                    {i < pipeline.length - 1 && <ArrowRight size={16} className="proc-arrow" style={{ color: 'rgba(255,255,255,.35)' }} />}
                  </span>
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
            <h2>Reliability is the difference between demo and production</h2>
            <p className="section-body">An agent that performs in a controlled test rarely survives the messiness of real enterprise systems. Building agents that run reliably requires engineering discipline — integration, evaluation, observability and operations — not just a capable model.</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Engineering process</p>
            <h2 style={{ marginBottom: '2.5rem' }}>How we build for production</h2>
          </Column>
        </Grid>
        {sections.map((s, i) => (
          <Grid key={s.title} style={{ marginBottom: '1.5rem', flexDirection: i % 2 === 1 ? 'row-reverse' : 'row' }}>
            <Column lg={8} md={4} sm={4}>
              <h3 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--q-primary)', margin: '0 0 1rem' }}>{s.title}</h3>
              <p style={{ fontSize: '1rem', color: '#525252', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
            </Column>
            <Column lg={8} md={4} sm={4}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '.5rem' }}>
                {s.items.map(it => (
                  <div key={it} style={{ padding: '1rem 1.25rem', background: '#fff', border: '1px solid #e0e0e0', fontSize: '.875rem', fontWeight: 600, color: 'var(--q-primary)' }}>{it}</div>
                ))}
              </div>
            </Column>
          </Grid>
        ))}
      </section>

      <RelatedCards heading="Explore the agentic stages" items={[
        { eyebrow: 'Stage 01', title: 'Orchestrate', desc: 'Coordinate agents into end-to-end processes.', to: '/agentic-ai/orchestrate' },
        { eyebrow: 'Stage 05', title: 'Scale', desc: 'Extend proven capabilities across the enterprise.', to: '/agentic-ai/scale' },
      ]} />

      <CTABanner heading="Ready to build agents that perform?" sub="Talk to Qlugen about engineering reliable enterprise AI." btnTo="/contact" />
    </Layout>
  )
}
