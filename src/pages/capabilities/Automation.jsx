import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { ArrowRight, Close, Checkmark } from '@carbon/icons-react'
import '../../App.css'

const flow = ['Manual', 'Connected', 'Automated', 'Optimised', 'Scaled']

const before = ['Repetitive manual data entry', 'Disconnected systems and handoffs', 'Slow, error-prone processes', 'Teams stuck on low-value tasks', 'No visibility across operations']
const after = ['Automated, rules-based workflows', 'Systems integrated end to end', 'Fast, consistent, auditable processes', 'People freed for strategic work', 'Real-time operational visibility']

const deliver = [
  { title: 'Workflow Automation', desc: 'Automate repetitive, rules-based tasks to remove manual effort and reduce error.' },
  { title: 'Process Orchestration', desc: 'Coordinate end-to-end processes across systems, teams and approvals.' },
  { title: 'System Integration', desc: 'Connect applications and data so information flows without manual handoffs.' },
  { title: 'Intelligent Automation', desc: 'Combine automation with AI to handle judgement-based and unstructured work.' },
  { title: 'AI-Enabled Operations', desc: 'Embed intelligence into operational workflows to improve speed and consistency.' },
  { title: 'Process Optimisation', desc: 'Redesign processes for efficiency before and alongside automating them.' },
]

const outcomes = [
  { num: '01', title: 'Reduced Manual Work', desc: 'Less time spent on repetitive tasks.' },
  { num: '02', title: 'Faster Operations', desc: 'Work completes in less time.' },
  { num: '03', title: 'Improved Consistency', desc: 'Fewer errors and exceptions.' },
  { num: '04', title: 'Increased Capacity', desc: 'People freed for higher-value work.' },
]

export default function Automation() {
  return (
    <Layout>
      <section className="split-hero">
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Capability · Automation</p>
            <h1>Eliminate friction at scale.</h1>
            <p className="split-hero__sub">Connect systems, automate repetitive processes, and free your workforce to focus on higher-value strategic work.</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="workflow-map">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="workflow-map__img"
                  loading="lazy"
                  decoding="async"
                />
                <div className="workflow-map__overlay" />
                <div className="proc-flow workflow-map__nodes">
                  {flow.map((node, i) => (
                    <span key={node} style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <span className={`proc-node${i === flow.length - 1 ? ' proc-node--last' : ''}`}>{node}</span>
                      {i < flow.length - 1 && <ArrowRight size={16} className="proc-arrow" />}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Before &amp; after</p>
            <h2>What changes with AI automation</h2>
            <div className="before-after">
              <div className="before-col">
                <p className="ba-heading">Before automation</p>
                {before.map(item => (
                  <div key={item} className="pain-item pain-item--before"><Close size={18} style={{ color: '#a2191f', flexShrink: 0 }} /> {item}</div>
                ))}
              </div>
              <div className="divider-vert" />
              <div className="after-col">
                <p className="ba-heading">After Qlugen</p>
                {after.map(item => (
                  <div key={item} className="pain-item pain-item--after"><Checkmark size={18} style={{ color: 'var(--q-primary)', flexShrink: 0 }} /> {item}</div>
                ))}
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="wide-image-band">
        <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80" alt="" loading="lazy" decoding="async" />
        <div className="wide-image-band__overlay" />
        <Grid className="wide-image-band__content">
          <Column lg={10} md={6} sm={4}>
            <p className="section-label">Workflow journey</p>
            <h2>Connected processes create speed, control and visibility across the enterprise.</h2>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">What we deliver</p>
            <h2>Our automation services</h2>
            <div className="deliver-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {deliver.map(({ title, desc }) => (
                <div key={title} className="deliver-card">
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Outcomes</p>
            <h2>What strong automation enables</h2>
            <div className="metric-row">
              {outcomes.map(metric => (
                <div key={metric.title} className="metric-block">
                  <div className="metric-block-num">{metric.num}</div>
                  <p className="metric-block-title">{metric.title}</p>
                  <p className="metric-block-desc">{metric.desc}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading="Related capabilities" items={[
        { eyebrow: 'Capability', title: 'AI & Agent Development', desc: 'Extend automation with agents that handle complex work.', to: '/capabilities/ai-agent-development' },
        { eyebrow: 'Capability', title: 'Digital Transformation', desc: 'Modernise the operating model automation runs on.', to: '/capabilities/digital-transformation' },
      ]} />

      <CTABanner heading="Turn automation into business impact." sub="Talk to Qlugen about your priorities." btnTo="/contact" />
    </Layout>
  )
}
