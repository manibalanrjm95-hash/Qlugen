// Operational, factory-floor, process-driven
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { Analytics, Enterprise, Industry, ArrowDown } from '@carbon/icons-react'
import '../../App.css'

const bands = [
  { title: 'Cloud Intelligence', desc: 'Analytics, AI and enterprise visibility that turn operational data into decisions.', cls: 'inner-section--dark' },
  { title: 'Enterprise Systems', desc: 'The ERP, MES and business systems that coordinate planning and operations.', cls: 'inner-section--teal' },
  { title: 'Factory Floor', desc: 'The machines, sensors and control systems where production actually happens.', cls: '' },
]

const helps = ['Smart Operations', 'Factory Analytics', 'Industrial Data', 'Supply Chain Visibility', 'Automation', 'AI', 'Cloud Infrastructure', 'Operational Resilience']

const outcomes = [
  { num: '01', title: 'Operational Visibility' },
  { num: '02', title: 'Improved Efficiency' },
  { num: '03', title: 'Better Supply Chain' },
  { num: '04', title: 'Smarter Decisions' },
]

export default function Manufacturing() {
  return (
    <Layout>
      <section className="split-hero" style={{ background: '#001c1e' }}>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Industry · Manufacturing</p>
            <h1>Build smarter, connected operations.</h1>
            <p className="split-hero__sub">Qlugen helps manufacturers connect factory floor to enterprise systems, using data, AI and automation to improve performance, visibility and operational resilience.</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="factory-arch">
                <div className="factory-zone factory-zone--cloud"><span data-heading-visual className="diagram-label" style={{ color: 'var(--q-accent)' }}>Cloud Intelligence</span><Analytics size={20} style={{ color: 'var(--q-accent)' }} /></div>
                <div className="factory-arrow"><ArrowDown size={16} /></div>
                <div className="factory-zone factory-zone--enterprise"><span data-heading-visual className="diagram-label">Enterprise Systems</span><Enterprise size={20} style={{ color: 'rgba(255,255,255,.6)' }} /></div>
                <div className="factory-arrow"><ArrowDown size={16} /></div>
                <div className="factory-zone factory-zone--floor"><span data-heading-visual className="diagram-label">Factory Floor</span><Industry size={20} style={{ color: 'rgba(255,255,255,.5)' }} /></div>
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      {bands.map((b, i) => (
        <section key={b.title} className={`inner-section ${b.cls}`}>
          <Grid>
            <Column lg={2} md={2} sm={4}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: b.cls === 'inner-section--dark' ? 'rgba(255,255,255,.15)' : 'var(--q-teal-20)', lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</span>
            </Column>
            <Column lg={10} md={6} sm={4}>
              <h2 style={{ color: b.cls === 'inner-section--dark' ? '#fff' : 'var(--q-primary)' }}>{b.title}</h2>
              <p className="section-body">{b.desc}</p>
            </Column>
          </Grid>
        </section>
      ))}

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Where we help</p>
            <h2>Focused on connected operations</h2>
            <div className="highlight-grid">
              {helps.map(h => (
                <div key={h} className="highlight-cell"><span>{h}</span></div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Business priorities</p>
            <h2>What manufacturing leaders focus on</h2>
            <div className="outcome-grid">
              {outcomes.map(({ num, title }) => (
                <div key={num} className="outcome-card">
                  <span className="outcome-num">{num}</span>
                  <p className="outcome-title">{title}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading="Related capabilities" items={[
        { eyebrow: 'Capability', title: 'Data & Analytics', desc: 'Turn industrial data into operational insight.', to: '/capabilities/data-analytics' },
        { eyebrow: 'Capability', title: 'Automation', desc: 'Streamline and orchestrate operations.', to: '/capabilities/automation' },
        { eyebrow: 'Capability', title: 'Cloud & Infrastructure', desc: 'Scalable foundations for connected operations.', to: '/capabilities/cloud-infrastructure' },
      ]} />

      <CTABanner heading="Transform what comes next." sub="Tell us about your industry challenge." btnTo="/contact" />
    </Layout>
  )
}
