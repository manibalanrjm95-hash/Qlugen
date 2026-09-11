// Open, light, human-scale
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { DataShare, Earth, Growth, Report, ChartLineData } from '@carbon/icons-react'
import '../../App.css'

const impacts = [
  { num: '01', title: 'Measurement Foundations', desc: 'The data infrastructure to measure environmental and social performance accurately.' },
  { num: '02', title: 'Operational Efficiency', desc: 'Reducing waste and resource consumption through technology and process change.' },
  { num: '03', title: 'Reporting Integrity', desc: 'Accurate, consistent, auditable sustainability reporting stakeholders can trust.' },
  { num: '04', title: 'Sustainable Technology', desc: 'Factoring sustainability into architecture and investment decisions.' },
  { num: '05', title: 'Stakeholder Confidence', desc: 'Trust built on reliable data and demonstrable progress over time.' },
]

const deliver = [
  { icon: DataShare, title: 'Sustainability Data Strategy', desc: 'Establish the data foundations needed to measure performance accurately.' },
  { icon: Earth, title: 'ESG Technology Enablement', desc: 'Implement the tools and platforms that support ESG data and reporting.' },
  { icon: Growth, title: 'Operational Efficiency', desc: 'Identify where technology and process change reduce waste.' },
  { icon: Report, title: 'Reporting Visibility', desc: 'Improve the accuracy, consistency and auditability of reporting.' },
  { icon: ChartLineData, title: 'Sustainable Planning', desc: 'Factor sustainability into technology strategy and investment.' },
]

const outcomes = [
  { num: 'Measurable', title: 'Progress', desc: 'Clear, trackable indicators over time.' },
  { num: 'Accurate', title: 'Reporting', desc: 'Reporting teams can stand behind.' },
  { num: 'Efficient', title: 'Operations', desc: 'Less waste across operations.' },
  { num: 'Trusted', title: 'Confidence', desc: 'Stakeholder trust built on reliable data.' },
]

export default function Sustainability() {
  return (
    <Layout>
      <section className="split-hero split-hero--light">
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Capability · Sustainability</p>
            <h1>Build a responsible future.</h1>
            <p className="split-hero__sub">Integrate sustainability into enterprise technology strategy with measurement, visibility and operational progress.</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <img src="https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&q=80" alt="" style={{ width: '100%', height: '20rem', objectFit: 'cover', borderRadius: '.75rem' }} loading="lazy" decoding="async" />
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={10} md={8} sm={4}>
            <p className="section-label">The challenge</p>
            <h2>Pressure to measure and act</h2>
            <p className="section-body" style={{ maxWidth: '54rem' }}>Organisations face growing pressure to measure and demonstrate environmental and social responsibility. Most lack the data foundations needed to report accurately and act meaningfully. Sustainability progress starts with trustworthy measurement — and the technology to sustain it.</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">Impact framework</p>
            <h2>Five areas where technology creates impact</h2>
            <div style={{ marginTop: '2.5rem' }}>
              {impacts.map(i => (
                <div key={i.num} className="impact-bar">
                  <span className="impact-bar-num">{i.num}</span>
                  <div className="impact-bar-content">
                    <h3>{i.title}</h3>
                    <p>{i.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={14} md={8} sm={4}>
            <p className="section-label">What we deliver</p>
            <h2>Our sustainability services</h2>
            <div className="flow-list">
              {deliver.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flow-item">
                  <Icon size={22} />
                  <div><h3>{title}</h3><p>{desc}</p></div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Outcomes</p>
            <h2>What strong sustainability enablement supports</h2>
            <div className="metric-row">
              {outcomes.map(m => (
                <div key={m.title} className="metric-block">
                  <div className="metric-block-num" style={{ fontSize: 'clamp(1.5rem,3vw,2rem)' }}>{m.num}</div>
                  <p className="metric-block-title">{m.title}</p>
                  <p className="metric-block-desc">{m.desc}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading="Related capabilities" items={[
        { eyebrow: 'Capability', title: 'Data & Analytics', desc: 'Build the trusted data foundations reporting relies on.', to: '/capabilities/data-analytics' },
        { eyebrow: 'Capability', title: 'Cloud & Infrastructure', desc: 'Run efficient, well-managed infrastructure.', to: '/capabilities/cloud-infrastructure' },
      ]} />

      <CTABanner heading="Turn sustainability enablement into measurable progress." sub="Talk to Qlugen about your priorities." btnTo="/contact" light />
    </Layout>
  )
}
