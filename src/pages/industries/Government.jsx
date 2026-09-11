// Civic / structured, service architecture
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { Checkmark } from '@carbon/icons-react'
import '../../App.css'

const principles = [
  { num: '01', title: 'Accessible by design', desc: 'Services built around citizens, not around organisational structure.' },
  { num: '02', title: 'Connected information', desc: 'Data that flows across agencies to reduce friction and duplication.' },
  { num: '03', title: 'Efficient delivery', desc: 'Doing more with constrained resources through modern technology.' },
]

const layers = [
  { label: 'Citizen Layer', desc: 'Accessible digital public services', bg: 'var(--q-teal-10)' },
  { label: 'Service Delivery', desc: 'Workflows and case management', bg: 'var(--q-teal-20)' },
  { label: 'Data & Integration', desc: 'Connected information across agencies', bg: 'rgba(179,227,228,.5)' },
  { label: 'Infrastructure', desc: 'Secure, scalable cloud foundations', bg: '#f4f4f4' },
]

const helps = ['Citizen Experiences', 'Digital Public Services', 'Data Platforms', 'Workflow Modernisation', 'Cloud', 'Secure Infrastructure', 'Analytics']

const outcomes = [
  { num: '01', title: 'Better Citizen Services' },
  { num: '02', title: 'Connected Information' },
  { num: '03', title: 'Modernised Infrastructure' },
  { num: '04', title: 'Improved Efficiency' },
]

export default function Government() {
  return (
    <Layout>
      <section className="split-hero split-hero--light">
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Industry · Government</p>
            <h1>Technology designed around public outcomes.</h1>
            <p className="split-hero__sub">Qlugen works with public sector organisations to design and deliver technology that improves services, connects information and builds digital capability at scale.</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <img src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80" alt="Government building representing public sector services" style={{ width: '100%', height: '20rem', objectFit: 'cover', borderRadius: '.75rem' }} loading="lazy" decoding="async" />
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={10} md={8} sm={4}>
            <p className="section-label">Citizen-first technology</p>
            <h2 style={{ maxWidth: '40rem' }}>Public sector organisations must deliver more with constrained resources, legacy systems and rising citizen expectations.</h2>
          </Column>
        </Grid>
        <Grid style={{ marginTop: '2.5rem' }}>
          {principles.map(p => (
            <Column key={p.num} lg={5} md={4} sm={4} style={{ marginBottom: '1.5rem' }}>
              <span className="num-challenge-num" style={{ fontSize: '2rem' }}>{p.num}</span>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--q-primary)', margin: '.5rem 0 .5rem' }}>{p.title}</h3>
              <p style={{ fontSize: '.9375rem', color: '#525252', margin: 0, lineHeight: 1.65 }}>{p.desc}</p>
            </Column>
          ))}
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={10} md={8} sm={4}>
            <p className="section-label">Service architecture</p>
            <h2>Layered public service delivery</h2>
            <div className="svc-arch">
              {layers.map(l => (
                <div key={l.label} className="svc-arch-layer" style={{ background: l.bg }}>
                  <span data-heading-visual className="diagram-label">{l.label}</span>
                  <span>{l.desc}</span>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label">Where we help</p>
            <h2>Focused on public value</h2>
            <ul className="solutions-list">
              {helps.map(area => (
                <li key={area}><Checkmark size={18} /> {area}</li>
              ))}
            </ul>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Business priorities</p>
            <h2>What government leaders focus on</h2>
            <div className="metric-row">
              {outcomes.map(m => (
                <div key={m.num} className="metric-block">
                  <div className="metric-block-num">{m.num}</div>
                  <p className="metric-block-title">{m.title}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading="Related capabilities" items={[
        { eyebrow: 'Capability', title: 'Digital Transformation', desc: 'Modernise public services end to end.', to: '/capabilities/digital-transformation' },
        { eyebrow: 'Capability', title: 'Cloud & Infrastructure', desc: 'Secure, scalable platforms for public services.', to: '/capabilities/cloud-infrastructure' },
        { eyebrow: 'Capability', title: 'Data & Analytics', desc: 'Connect information for better decisions.', to: '/capabilities/data-analytics' },
      ]} />

      <CTABanner heading="Transform what comes next." sub="Tell us about your industry challenge." btnTo="/contact" />
    </Layout>
  )
}
