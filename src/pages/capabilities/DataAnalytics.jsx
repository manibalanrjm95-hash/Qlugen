// Data / dashboard-led composition
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { DataShare, Dashboard, MachineLearning } from '@carbon/icons-react'
import '../../App.css'

const services = [
  { title: 'Data Strategy & Architecture', desc: 'Define the target-state data architecture, ownership model and roadmap that align data investment with business goals.' },
  { title: 'Data Platforms', desc: 'Design and build modern, scalable data platforms that consolidate fragmented sources into trusted foundations.' },
  { title: 'Business Intelligence', desc: 'Deliver dashboards and reporting that give teams timely, self-service access to the metrics that matter.' },
  { title: 'Advanced Analytics', desc: 'Apply statistical and predictive techniques to surface patterns, forecast outcomes and inform strategy.' },
  { title: 'Data Governance', desc: 'Establish quality, lineage, cataloguing and access controls that make enterprise data trustworthy and compliant.' },
  { title: 'AI-Ready Data Foundations', desc: 'Prepare clean, well-structured, well-governed data pipelines that make AI and machine learning viable at scale.' },
]

const helps = [
  { icon: DataShare, title: 'Unify fragmented data', desc: 'Consolidate siloed sources into a single, governed foundation teams can trust.' },
  { icon: Dashboard, title: 'Make insight self-service', desc: 'Put timely, reliable metrics in front of the people who make decisions.' },
  { icon: MachineLearning, title: 'Prepare for AI', desc: 'Build the clean, well-structured pipelines that make analytics and AI viable at scale.' },
]

const metrics = [
  { num: '73%', title: 'Data Utilisation', desc: 'Enterprise data is often unused. We change that.' },
  { num: '3x', title: 'Faster Reporting', desc: 'Reduced time from question to answer.' },
  { num: '1', title: 'Source of Truth', desc: 'Consistent, governed data across teams.' },
  { num: '100%', title: 'Traceable Lineage', desc: 'Every metric backed by clear provenance.' },
]

const bars = [42, 58, 35, 71, 49, 64, 80, 55]

export default function DataAnalytics() {
  return (
    <Layout>
      <section className="split-hero">
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Capability · Data &amp; Analytics</p>
            <h1>Turn data into decisions.</h1>
            <p className="split-hero__sub">Create trusted data foundations that give teams faster access to meaningful, reliable intelligence.</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="data-mock">
                <p className="data-mock-head">Users · Last 7 days · Median</p>
                <p className="data-mock-title">Load time vs bounce rate</p>
                <div className="data-mock-bars">
                  {bars.map((h, i) => <div key={i} className="data-mock-bar" style={{ height: `${h}%` }} />)}
                </div>
                <div className="data-mock-stats">
                  <div className="data-mock-stat"><span className="data-mock-stat-val">57.1%</span><span className="data-mock-stat-lbl">Engagement</span></div>
                  <div className="data-mock-stat"><span className="data-mock-stat-val">2.7M</span><span className="data-mock-stat-lbl">Page views</span></div>
                  <div className="data-mock-stat"><span className="data-mock-stat-val">40.6%</span><span className="data-mock-stat-lbl">Bounce rate</span></div>
                </div>
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={7} md={5} sm={4}>
            <p className="section-label">The challenge</p>
            <h2>Data everywhere, intelligence nowhere</h2>
            <p className="section-body">Enterprises sit on vast amounts of data but struggle to turn it into timely, trusted intelligence. Fragmented systems, poor data quality, and siloed ownership slow down decisions and reduce confidence across the organisation.</p>
          </Column>
          <Column lg={7} md={3} sm={4}>
            <div className="big-stat" style={{ marginTop: '2rem' }}>
              <div className="big-stat-num">73%</div>
              <p className="big-stat-label">of enterprise data goes unused for analytics and decision-making.</p>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">What we deliver</p>
            <h2>Our data &amp; analytics services</h2>
            <div className="svc-rows">
              {services.map(s => (
                <div key={s.title} className="svc-row">
                  <h3>{s.title}</h3>
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
            <p className="section-label">How Qlugen helps</p>
            <h2>From raw data to reliable intelligence</h2>
            <div className="band-list">
              {helps.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="band-row">
                  <Icon size={28} className="band-icon" />
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
            <h2>What strong data &amp; analytics enables</h2>
            <div className="metric-row">
              {metrics.map(m => (
                <div key={m.title} className="metric-block">
                  <div className="metric-block-num">{m.num}</div>
                  <p className="metric-block-title">{m.title}</p>
                  <p className="metric-block-desc">{m.desc}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading="Related capabilities" items={[
        { eyebrow: 'Capability', title: 'AI & Agent Development', desc: 'Turn decision-ready data into intelligent systems that act.', to: '/capabilities/ai-agent-development' },
        { eyebrow: 'Capability', title: 'Cloud & Infrastructure', desc: 'Build the scalable foundations modern data platforms depend on.', to: '/capabilities/cloud-infrastructure' },
      ]} />

      <CTABanner heading="Turn data & analytics into business impact." sub="Talk to Qlugen about your priorities." btnTo="/contact" />
    </Layout>
  )
}
