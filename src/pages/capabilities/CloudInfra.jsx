import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import '../../App.css'

const layers = [
  { label: 'Applications', bg: 'var(--q-teal-10)', color: 'var(--q-primary)' },
  { label: 'Services', bg: 'var(--q-teal-20)', color: 'var(--q-primary)' },
  { label: 'Platform', bg: '#0788D6' },
  { label: 'Infrastructure', bg: '#0444C6' },
  { label: 'Cloud', bg: '#0D3DA8' },
  { label: 'Physical', bg: '#010a23' },
]

const bands = [
  { title: 'Cloud Strategy', desc: 'Define the cloud operating model, target architecture and roadmap aligned to business and cost objectives.' },
  { title: 'Migration & Modernisation', desc: 'Move workloads to the cloud and modernise applications to unlock flexibility and reduce technical debt.' },
  { title: 'Hybrid & Multi-Cloud', desc: 'Design environments that balance performance, control and portability across providers.' },
]

const deliver = [
  { title: 'Platform Engineering', desc: 'Build internal platforms and paved paths that let teams ship reliably and securely at speed.' },
  { title: 'Infrastructure Automation', desc: 'Automate provisioning, configuration and delivery with infrastructure-as-code and CI/CD.' },
  { title: 'Reliability & Optimisation', desc: 'Improve resilience and control cost through observability, tuning and FinOps practices.' },
]

const metrics = [
  { num: '99.9%', title: 'Improved Resilience', desc: 'Infrastructure that stays available under load.' },
  { num: '10x', title: 'Faster Deployment', desc: 'Shorter cycles from build to release.' },
  { num: '∞', title: 'Better Scalability', desc: 'Capacity that grows with demand.' },
  { num: '-30%', title: 'Optimised Cost', desc: 'Spend aligned to real usage.' },
]

export default function CloudInfra() {
  return (
    <Layout>
      <section className="split-hero">
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Capability · Cloud &amp; Infrastructure</p>
            <h1>Scale without limits.</h1>
            <p className="split-hero__sub">Build resilient cloud and infrastructure foundations capable of supporting modern enterprise workloads at any scale.</p>
          </Column>
          <Column lg={7} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="cloud-hero-stack">
                <img
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="cloud-hero-stack__img"
                  loading="lazy"
                  decoding="async"
                />
                <div className="cloud-hero-stack__overlay" />
                <div className="infra-layer cloud-hero-stack__layers">
                  {layers.map(layer => (
                    <div key={layer.label} className="infra-strip" style={{ background: layer.bg, color: layer.color || '#fff' }}>{layer.label}</div>
                  ))}
                </div>
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">The challenge</p>
            <h2>Legacy infrastructure constrains growth</h2>
            <p className="section-body">Rising costs, poor reliability, and slow deployment cycles make it difficult for enterprises to compete. Modern cloud foundations change the equation.</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="capability-scene">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
                alt=""
                className="capability-scene__img"
                loading="lazy"
                decoding="async"
              />
              <div className="capability-scene__overlay capability-scene__overlay--light" />
            </div>
          </Column>
        </Grid>
      </section>

      <section className="wide-image-band">
        <img src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80" alt="" loading="lazy" decoding="async" />
        <div className="wide-image-band__overlay" />
        <Grid className="wide-image-band__content">
          <Column lg={9} md={6} sm={4}>
            <p className="section-label">Cloud strategy</p>
            <h2>Architecture that connects flexibility, resilience and control.</h2>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Cloud strategy</p>
            <h2>A layered approach to the cloud</h2>
          </Column>
        </Grid>
        {bands.map((band, i) => (
          <Grid key={band.title} style={{ marginTop: i === 0 ? '2.5rem' : '1px', background: i % 2 === 0 ? '#fff' : 'var(--q-teal-10)', padding: '2rem 0' }}>
            <Column lg={5} md={3} sm={4}><h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--q-primary)', margin: 0 }}>{band.title}</h3></Column>
            <Column lg={9} md={5} sm={4}><p style={{ fontSize: '1rem', color: '#525252', lineHeight: 1.7, margin: 0 }}>{band.desc}</p></Column>
          </Grid>
        ))}
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">What we deliver</p>
            <h2>Engineering for reliability at scale</h2>
            <div className="band-list band-list--light">
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
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Outcomes</p>
            <h2>What strong cloud &amp; infrastructure enables</h2>
            <div className="metric-row">
              {metrics.map(metric => (
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
        { eyebrow: 'Capability', title: 'Digital Transformation', desc: 'Modernise operations on top of resilient foundations.', to: '/capabilities/digital-transformation' },
        { eyebrow: 'Capability', title: 'Cybersecurity', desc: 'Secure cloud workloads from identity to runtime.', to: '/capabilities/cybersecurity' },
      ]} />

      <CTABanner heading="Turn cloud & infrastructure into business impact." sub="Talk to Qlugen about your priorities." btnTo="/contact" />
    </Layout>
  )
}
