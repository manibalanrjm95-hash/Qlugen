// Technology matrix / ecosystem bands
import Layout from '../components/Layout'
import CTABanner from '../components/CTABanner'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { Cloud, Analytics, Security, SettingsAdjust, Chip, ArrowRight } from '@carbon/icons-react'
import '../App.css'

const categories = [
  { icon: Cloud, label: 'Cloud', tags: ['AWS', 'Microsoft Azure', 'Google Cloud', 'Hybrid & multi-cloud'], desc: 'Scalable, resilient and cost-effective infrastructure across major cloud environments.' },
  { icon: Analytics, label: 'Data & AI', tags: ['Data platforms', 'Analytics & BI', 'ML frameworks', 'Vector stores'], desc: 'Decision-ready data foundations and AI model development.' },
  { icon: Chip, label: 'Enterprise Platforms', tags: ['SAP', 'Salesforce', 'ServiceNow', 'Snowflake'], desc: 'Implement, extend and integrate mission-critical business applications.' },
  { icon: Security, label: 'Security', tags: ['IAM', 'Cloud posture', 'AppSec', 'SecOps'], desc: 'Security across the stack, from identity to cloud workload protection.' },
  { icon: SettingsAdjust, label: 'Integration & Automation', tags: ['API management', 'RPA', 'Event-driven', 'Orchestration'], desc: 'Connecting systems and orchestrating workflows across the enterprise.' },
]

const badges = ['Azure', 'GCP', 'AWS', 'Databricks', 'Fabric', 'BigQuery']

export default function Technology() {
  return (
    <Layout>
      <section className="split-hero hero-image-bg" style={{ '--hero-image': 'url(https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=80)' }}>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">Technology</p>
            <h1>Architecture depth across the modern enterprise stack.</h1>
            <p className="split-hero__sub">Qlugen works across the cloud, data, governance, analytics, AI, agent and software technologies that shape enterprise delivery.</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="tech-hero-visual">
                <div className="tech-hero-visual__image">
                  <img
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
                    alt=""
                    loading="lazy"
                    decoding="async"
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
            <h2>Technologies we work with</h2>
            <p className="section-body">We are technology-informed, not technology-prescribed. These tools represent the architecture ecosystem we work across, not an official partner claim.</p>
            <Link to="/capabilities" className="cta-btn cta-btn--outline-dark" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              Explore our capabilities <ArrowRight size={18} />
            </Link>
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
