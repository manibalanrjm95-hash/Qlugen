import Layout from '../components/Layout'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import content from '../content/global/not-found.json'
import '../App.css'

export default function NotFound() {
  const { eyebrow, title, description, image, primaryLink, secondaryLink } = content
  return (
    <Layout>
      <section className="hero-image-bg" style={{ '--hero-image': `url(${image})`, backgroundColor: 'var(--q-primary)', padding: '8rem 0', color: '#fff', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label" style={{ color: 'var(--q-accent)' }}>{eyebrow}</p>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', margin: '0 0 1.25rem', lineHeight: 1.15 }}>{title}</h1>
            <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,.75)', margin: '0 0 2.5rem', lineHeight: 1.7 }}>{description}</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to={primaryLink.url} className="cta-btn cta-btn--primary">{primaryLink.label} <ArrowRight size={18} /></Link>
              <Link to={secondaryLink.url} className="cta-btn cta-btn--outline">{secondaryLink.label}</Link>
            </div>
          </Column>
        </Grid>
      </section>
    </Layout>
  )
}
