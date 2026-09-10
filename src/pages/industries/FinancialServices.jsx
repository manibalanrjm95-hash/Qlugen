// Structured, precise, data-heavy
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { Analytics, Bot, DevicesApps, Cloud, Security, Rule, SettingsAdjust } from '@carbon/icons-react'
import '../../App.css'

const helps = [
  { icon: Analytics, label: 'Data & Analytics' },
  { icon: Bot, label: 'AI-Assisted Operations' },
  { icon: Cloud, label: 'Cloud Modernisation' },
  { icon: Security, label: 'Cybersecurity' },
  { icon: Rule, label: 'Compliance-Oriented Technology' },
  { icon: SettingsAdjust, label: 'Automation' },
]

const priorities = [
  { icon: Analytics, title: 'Intelligent Operations', desc: 'AI-enabled processes across the front and back office.' },
  { icon: Cloud, title: 'Resilient Infrastructure', desc: 'Cloud foundations built for availability and control.' },
  { icon: Analytics, title: 'Trusted Data', desc: 'Governed data for confident, compliant decisions.' },
  { icon: DevicesApps, title: 'Modern Digital Channels', desc: 'Experiences that meet rising customer expectation.' },
]

const outcomes = [
  { num: '01', title: 'Intelligent Operations' },
  { num: '02', title: 'Resilient Infrastructure' },
  { num: '03', title: 'Trusted Data' },
  { num: '04', title: 'Modern Digital Channels' },
]

export default function FinancialServices() {
  return (
    <Layout>
      <section className="split-hero">
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Industry · Financial Services</p>
            <h1>Technology for a more intelligent financial enterprise.</h1>
            <p className="split-hero__sub">From core system modernisation to AI-enabled operations, Qlugen helps financial organisations build foundations that support performance, compliance and customer expectation.</p>
          </Column>
          <Column lg={7} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="priority-matrix">
                <div className="priority-cell priority-cell--highlight"><span data-heading-visual className="diagram-label">Speed to Market</span></div>
                <div className="priority-cell"><span data-heading-visual className="diagram-label">Risk Control</span></div>
                <div className="priority-cell"><span data-heading-visual className="diagram-label">Customer Experience</span></div>
                <div className="priority-cell"><span data-heading-visual className="diagram-label">Operational Efficiency</span></div>
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label">The challenge</p>
            <h2>Competing on technology in financial services</h2>
            <p className="section-body">Financial services organisations face pressure on multiple fronts — legacy infrastructure, growing regulatory complexity, digital-first competition and increasingly sophisticated customer expectations. The technology decisions made now will determine competitive position for years ahead.</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Where we help</p>
            <h2>Focused on what moves the business</h2>
            <div className="highlight-grid">
              {helps.map(({ icon: Icon, label }) => (
                <div key={label} className="highlight-cell">
                  <Icon size={24} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">Technology priorities</p>
            <h2>What financial services leaders focus on</h2>
            <div className="band-list band-list--light">
              {priorities.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="band-row">
                  <Icon size={26} className="band-icon" />
                  <div><h3>{title}</h3><p>{desc}</p></div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Business priorities</p>
            <h2>Outcomes that matter</h2>
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
        { eyebrow: 'Capability', title: 'Data & Analytics', desc: 'Trusted data foundations for confident decisions.', to: '/capabilities/data-analytics' },
        { eyebrow: 'Capability', title: 'AI & Agent Development', desc: 'Intelligent systems that act across operations.', to: '/capabilities/ai-agent-development' },
        { eyebrow: 'Capability', title: 'Cybersecurity', desc: 'Intelligence-led security across every layer.', to: '/capabilities/cybersecurity' },
      ]} />

      <CTABanner heading="Transform what comes next." sub="Tell us about your industry challenge." btnTo="/contact" />
    </Layout>
  )
}
