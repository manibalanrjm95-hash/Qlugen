// Interactive agentic overview — expanding accordion gallery
import { useState } from 'react'
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import '../../App.css'

const stages = [
  { num: '01', label: 'Orchestrate', desc: 'Connect agents, systems, tools, workflows and human approvals into coordinated enterprise processes.', to: '/agentic-ai/orchestrate', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80' },
  { num: '02', label: 'Build & Run', desc: 'Engineer AI agents and systems that operate reliably inside your enterprise environment.', to: '/agentic-ai/build-run', img: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&w=1400&q=80' },
  { num: '03', label: 'Discover', desc: 'Identify high-value AI opportunities mapped to real business workflows and measurable outcomes.', to: '/agentic-ai/discover', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80' },
  { num: '04', label: 'Govern', desc: 'Build AI systems that operate within trusted boundaries with human oversight at every level.', to: '/agentic-ai/govern', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80' },
  { num: '05', label: 'Scale', desc: 'Extend proven AI capabilities across your enterprise with platform thinking and reusable foundations.', to: '/agentic-ai/scale', img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80' },
]

const why = [
  { title: 'From answers to action', desc: 'Assistants respond. Agents act — carrying out multi-step tasks within defined boundaries.' },
  { title: 'Connected, not isolated', desc: 'Value emerges when agents, tools, data and people are coordinated into end-to-end processes.' },
  { title: 'Governed by design', desc: 'Permissions, oversight and traceability built in from the start make safe scaling possible.' },
]

export default function AgenticOverview() {
  const [activeStage, setActiveStage] = useState(0)

  return (
    <Layout>
      <section style={{ background: '#001c1e', color: '#fff', minHeight: 'calc(70vh - var(--header-height))', display: 'flex', alignItems: 'center', padding: '6rem 0' }}>
        <Grid>
          <Column lg={12} md={7} sm={4}>
            <p className="section-label" style={{ color: 'var(--q-accent)' }}>Agentic Enterprise</p>
            <h1 style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', fontWeight: 700, color: '#fff', lineHeight: 1.05, letterSpacing: '-.02em', margin: '1rem 0 1.5rem' }}>
              From isolated AI to connected enterprise intelligence.
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,.7)', maxWidth: '42rem', lineHeight: 1.7, margin: 0 }}>
              Qlugen helps organisations design, build and scale governed AI agent ecosystems that operate across data, applications, workflows and human decisions.
            </p>
          </Column>
        </Grid>
      </section>

      <section style={{ background: '#001c1e', padding: '0 0 5rem' }}>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <div className="agentic-gallery">
              {stages.map((s, i) => (
                <div
                  key={s.to}
                  className={`agentic-card${i === activeStage ? ' agentic-card--active' : ''}`}
                  onMouseEnter={() => setActiveStage(i)}
                  onClick={() => setActiveStage(i)}
                >
                  <img src={s.img} alt="" className="agentic-card-img" loading="lazy" decoding="async" />
                  <div className="agentic-card-overlay" />
                  <div className="agentic-card-content">
                    <span className="agentic-card-num">Stage {s.num}</span>
                    <div className="agentic-card-foot">
                      <h2 className="agentic-card-title">{s.label}</h2>
                      <p className="agentic-card-desc">{s.desc}</p>
                      <Link to={s.to} className="agentic-card-link">Explore stage <ArrowRight size={16} /></Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Why agentic?</p>
            <h2>Three shifts that change how the enterprise operates</h2>
            <Grid style={{ marginTop: '2.5rem' }}>
              {why.map(w => (
                <Column key={w.title} lg={5} md={4} sm={4} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1.75rem', background: 'var(--q-teal-10)', height: '100%' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--q-primary)', margin: '0 0 .75rem' }}>{w.title}</h3>
                    <p style={{ fontSize: '.9375rem', color: '#475467', margin: 0, lineHeight: 1.65 }}>{w.desc}</p>
                  </div>
                </Column>
              ))}
            </Grid>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={10} md={6} sm={4}>
            <p className="section-label">Related capability</p>
            <h2>AI & Agent Development</h2>
            <p className="section-body">Qlugen&apos;s AI & Agent Development capability covers the full journey from model selection and agent engineering to integration, evaluation and production operations.</p>
            <Link to="/capabilities/ai-agent-development" className="cta-btn cta-btn--outline-dark" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              Explore AI & Agent Development <ArrowRight size={18} />
            </Link>
          </Column>
        </Grid>
      </section>

      <CTABanner
        heading="Ready to build your agentic enterprise?"
        sub="Talk to Qlugen about designing and scaling governed agent ecosystems."
        btnTo="/contact"
      />
    </Layout>
  )
}
