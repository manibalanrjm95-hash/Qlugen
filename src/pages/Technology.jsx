// Technology matrix / ecosystem bands
import Layout from '../components/Layout'
import CTABanner from '../components/CTABanner'
import { Grid, Column } from '@carbon/react'
import { Cloud, Analytics, Security, SettingsAdjust, Chip } from '@carbon/icons-react'
import '../App.css'

const categories = [
  { icon: Cloud, label: 'Cloud', tags: ['AWS', 'Microsoft Azure', 'Google Cloud', 'Hybrid & multi-cloud'], desc: 'Scalable, resilient and cost-effective infrastructure across major cloud environments.' },
  { icon: Analytics, label: 'Data & AI', tags: ['Data platforms', 'Analytics & BI', 'ML frameworks', 'Vector stores'], desc: 'Decision-ready data foundations and AI model development.' },
  { icon: Chip, label: 'Enterprise Platforms', tags: ['SAP', 'Salesforce', 'ServiceNow', 'Snowflake'], desc: 'Implement, extend and integrate mission-critical business applications.' },
  { icon: Security, label: 'Security', tags: ['IAM', 'Cloud posture', 'AppSec', 'SecOps'], desc: 'Security across the stack, from identity to cloud workload protection.' },
  { icon: SettingsAdjust, label: 'Integration & Automation', tags: ['API management', 'RPA', 'Event-driven', 'Orchestration'], desc: 'Connecting systems and orchestrating workflows across the enterprise.' },
]

const badges = ['AWS', 'Azure', 'Google Cloud', 'SAP', 'Salesforce', 'Snowflake']

export default function Technology() {
  return (
    <Layout>
      <section className="split-hero">
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Technology</p>
            <h1>Built around the platforms enterprises trust.</h1>
            <p className="split-hero__sub">Qlugen works across modern cloud, data, AI, security, integration and enterprise technologies to build solutions suited to each organisation's architecture and goals.</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="tech-hero-visual">
                <div className="tech-hero-visual__image">
                  <img
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80"
                    alt=""
                  />
                </div>
                <div className="tech-badge-grid">
                  {badges.map(b => <div key={b} className="tech-badge">{b}</div>)}
                </div>
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label">Technology landscape</p>
            <h2>Our technology landscape</h2>
            <p className="section-body">We are technology-informed, not technology-prescribed. The right platform for each organisation depends on its architecture, goals and existing investments.</p>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <div className="tech-architecture-band">
              <div className="tech-architecture-band__panel tech-architecture-band__panel--primary">
                <span>Experience</span>
              </div>
              <div className="tech-architecture-band__panel tech-architecture-band__panel--secondary">
                <span>Data + AI</span>
              </div>
              <div className="tech-architecture-band__panel tech-architecture-band__panel--tertiary">
                <span>Security + Integration</span>
              </div>
              <div className="tech-architecture-band__panel tech-architecture-band__panel--base">
                <span>Cloud + Platforms</span>
              </div>
            </div>
          </Column>
          <Column lg={16} md={8} sm={4}>
            <div className="tech-matrix">
              {categories.map(({ icon: Icon, label, tags, desc }) => (
                <div key={label} className="tech-row">
                  <div className="tech-category">
                    <Icon size={22} style={{ color: 'var(--q-primary)' }} />
                    <h3>{label}</h3>
                  </div>
                  <div className="tech-tags">
                    {tags.map(t => <span key={t} className="tech-tag">{t}</span>)}
                  </div>
                  <div className="tech-desc">{desc}</div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <CTABanner
        heading="Looking for the right technology foundation?"
        sub="Qlugen can help you evaluate, design and build the technology architecture that fits your organisation."
        btnTo="/contact"
      />
    </Layout>
  )
}
