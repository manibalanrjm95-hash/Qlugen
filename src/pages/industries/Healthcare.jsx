// Human-centred, lighter, journey-based
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { User, Activity, Enterprise, Chip, Awake } from '@carbon/icons-react'
import '../../App.css'

const challenges = [
  { num: '01', title: 'Fragmented information', desc: 'Patient and operational data lives across disconnected systems, slowing clinicians and administrators alike.' },
  { num: '02', title: 'Workforce pressure', desc: 'Constrained teams need technology that removes friction rather than adding administrative burden.' },
  { num: '03', title: 'Security and reliability', desc: 'Critical operations depend on secure, reliable digital infrastructure that cannot afford downtime.' },
]

const tiles = [
  { num: '01', title: 'Connected Information', desc: 'Unify fragmented data into a trusted, accessible foundation.' },
  { num: '02', title: 'Operational Workflows', desc: 'Streamline the administrative processes behind care.' },
  { num: '03', title: 'Digital Experiences', desc: 'Build experiences that serve clinicians and patients.' },
  { num: '04', title: 'Analytics', desc: 'Surface the insight that supports better decisions.' },
  { num: '05', title: 'AI-Enabled Productivity', desc: 'Free skilled people from repetitive administrative work.' },
  { num: '06', title: 'Secure Cloud Platforms', desc: 'Reliable, protected infrastructure for critical operations.' },
]

const pathway = [
  { icon: User, label: 'Patient' },
  { icon: Activity, label: 'Clinical' },
  { icon: Enterprise, label: 'Administrative' },
  { icon: Chip, label: 'Technology' },
  { icon: Awake, label: 'Outcomes' },
]

const outcomes = [
  { num: '01', title: 'Connected Information' },
  { num: '02', title: 'Streamlined Operations' },
  { num: '03', title: 'Better Productivity' },
  { num: '04', title: 'Secure Infrastructure' },
]

export default function Healthcare() {
  return (
    <Layout>
      <section className="split-hero split-hero--light">
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Industry · Healthcare</p>
            <h1>Connected technology for better healthcare operations.</h1>
            <p className="split-hero__sub">Qlugen helps healthcare organisations connect information, streamline operations and build digital foundations that support better outcomes for clinicians, administrators and patients.</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80" alt="Healthcare professionals in a clinical environment" style={{ width: '100%', height: '20rem', objectFit: 'cover', borderRadius: '.75rem' }} loading="lazy" decoding="async" />
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={10} md={8} sm={4}>
            <p className="section-label">The challenge</p>
            <h2>Three connected challenges</h2>
            <div className="num-challenge">
              {challenges.map(c => (
                <div key={c.num} className="num-challenge-item">
                  <span className="num-challenge-num">{c.num}</span>
                  <div><h3>{c.title}</h3><p>{c.desc}</p></div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Where we help</p>
            <h2>Focused on connected, reliable operations</h2>
            <div className="tile-grid">
              {tiles.map(t => (
                <div key={t.num} className="tile-card">
                  <span className="tile-card-num">{t.num}</span>
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Care pathway</p>
            <h2>Technology across the pathway</h2>
            <div className="journey-flow">
              {pathway.map(({ icon: Icon, label }, i) => (
                <span key={label} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <div className="journey-node">
                    <div className="journey-node-circle"><Icon size={22} /></div>
                    <span data-heading-visual className="diagram-label">{label}</span>
                  </div>
                  {i < pathway.length - 1 && <div className="journey-connector" />}
                </span>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Business priorities</p>
            <h2>What healthcare leaders focus on</h2>
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
        { eyebrow: 'Capability', title: 'Data & Analytics', desc: 'Connect and make sense of fragmented information.', to: '/capabilities/data-analytics' },
        { eyebrow: 'Capability', title: 'Cloud & Infrastructure', desc: 'Secure, reliable platforms for critical operations.', to: '/capabilities/cloud-infrastructure' },
        { eyebrow: 'Capability', title: 'Cybersecurity', desc: 'Protect sensitive information and systems.', to: '/capabilities/cybersecurity' },
      ]} />

      <CTABanner heading="Transform what comes next." sub="Tell us about your industry challenge." btnTo="/contact" />
    </Layout>
  )
}
