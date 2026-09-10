import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import '../../App.css'

const model = [
  { label: 'Physical', bg: '#010a23', w: '55%' },
  { label: 'Network', bg: '#021550', w: '64%' },
  { label: 'Application', bg: '#022160', w: '73%' },
  { label: 'Data', bg: '#0444C6', w: '82%' },
  { label: 'Identity', bg: '#0788D6', w: '91%' },
  { label: 'Governance', bg: 'rgba(7,136,214,.3)', w: '100%' },
]

const deliver = [
  { title: 'Security Strategy', desc: 'Assess risk, define target-state security architecture and build a prioritised improvement roadmap.' },
  { title: 'Identity & Access', desc: 'Implement modern identity, authentication and access controls across users, services and machines.' },
  { title: 'Application Security', desc: 'Embed security into the software lifecycle with secure design, testing and dependency management.' },
  { title: 'Cloud Security', desc: 'Protect cloud environments with posture management, workload protection and secure configuration.' },
  { title: 'Data Protection', desc: 'Safeguard sensitive data through classification, encryption and access governance.' },
  { title: 'Security Monitoring', desc: 'Detect and respond to threats with monitoring, alerting and incident response capability.' },
  { title: 'Governance & Compliance', desc: 'Align security controls with regulatory requirements and demonstrate ongoing compliance.' },
]

const outcomes = [
  { num: '01', title: 'Reduced Enterprise Risk', desc: 'A smaller, better-managed attack surface.' },
  { num: '02', title: 'Stronger Resilience', desc: 'Faster detection and recovery.' },
  { num: '03', title: 'Secure Transformation', desc: 'Security that enables change rather than blocking it.' },
  { num: '04', title: 'Compliance Visibility', desc: 'Clear evidence of control effectiveness.' },
]

export default function Cybersecurity() {
  return (
    <Layout>
      <section className="split-hero split-hero--darkest">
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Capability · Cybersecurity</p>
            <h1>Protect what matters most.</h1>
            <p className="split-hero__sub">Embed intelligence-led security across every layer of your enterprise from identity and access to real-time threat detection.</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="threat-arc">
                <div className="threat-node threat-node--alert"><span data-heading-visual className="diagram-label">Threat</span></div>
                <ArrowRight size={18} className="threat-arrow" />
                <div className="threat-node"><span data-heading-visual className="diagram-label">Detection</span></div>
                <ArrowRight size={18} className="threat-arrow" />
                <div className="threat-node threat-node--safe"><span data-heading-visual className="diagram-label">Response</span></div>
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="wide-image-band wide-image-band--dark">
        <img src="https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=2200&q=80" alt="" />
        <div className="wide-image-band__overlay wide-image-band__overlay--dark" />
        <Grid className="wide-image-band__content">
          <Column lg={10} md={6} sm={4}>
            <p className="section-label">Security journey</p>
            <h2>Security posture is built across layers, not added at the end.</h2>
          </Column>
        </Grid>
      </section>

      <section className="inner-section" style={{ background: '#0a0a0a', color: '#fff' }}>
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label" style={{ color: 'var(--q-accent)' }}>Security posture model</p>
            <h2 style={{ color: '#fff' }}>Defence, layer by layer</h2>
            <p className="section-body" style={{ color: 'rgba(255,255,255,.6)' }}>Enterprise security is not a single control. It is a posture built across layers, each one reinforcing the next from physical infrastructure to governance.</p>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <div className="security-model" style={{ marginTop: '2rem' }}>
              {model.map(layer => (
                <div key={layer.label} className="security-layer" style={{ background: layer.bg, width: layer.w, color: layer.label === 'Governance' ? 'var(--q-primary)' : '#fff' }}>{layer.label}</div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section" style={{ background: '#111', color: '#fff' }}>
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label" style={{ color: 'var(--q-accent)' }}>What we deliver</p>
            <h2 style={{ color: '#fff' }}>Our cybersecurity services</h2>
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

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label">The challenge</p>
            <h2>An expanding threat landscape</h2>
            <p className="section-body">Growing attack surface, skills gaps, and increasing regulatory requirements challenge existing security programmes. Intelligence-led security keeps pace.</p>
          </Column>
          <Column lg={8} md={2} sm={4}>
            <div className="quote-panel quote-panel--teal">
              <p>Modern security must help the enterprise move confidently, not just add checkpoints.</p>
            </div>
          </Column>
        </Grid>
        <Grid style={{ marginTop: '1rem' }}>
          <Column lg={16} md={8} sm={4}>
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
        { eyebrow: 'Capability', title: 'Cloud & Infrastructure', desc: 'Secure the platforms your workloads run on.', to: '/capabilities/cloud-infrastructure' },
        { eyebrow: 'Capability', title: 'AI & Agent Development', desc: 'Build AI systems with security and governance by design.', to: '/capabilities/ai-agent-development' },
      ]} />

      <CTABanner heading="Turn cybersecurity into business impact." sub="Talk to Qlugen about your priorities." btnTo="/contact" />
    </Layout>
  )
}
