// Giant editorial hero + asymmetric masonry grid
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import content from '../../content/capabilities/overview.json'
import '../../App.css'

// Masonry rhythm is design, not content: tiles take these shapes in order.
const tileShapes = ['cap-item--wide', 'cap-item--med', 'cap-item--med', 'cap-item--wide', 'cap-item--half cap-item--tall', 'cap-item--half', 'cap-item--full']

export default function CapabilitiesOverview() {
  const { hero, grid, cta } = content
  return (
    <Layout>
      <section className="hero-image-bg" style={{ '--hero-image': `url(${hero.image})`, backgroundColor: 'var(--q-primary)', padding: '8rem 0 6rem', color: '#fff' }}>
        <Grid>
          <Column lg={14} md={7} sm={4}>
            <p className="section-label" style={{ color: 'var(--q-accent)' }}>{hero.eyebrow}</p>
            <h1 style={{ fontSize: 'clamp(3rem,7vw,6rem)', fontWeight: 700, lineHeight: 1.05, margin: '1rem 0 2rem', color: '#fff', letterSpacing: '-0.02em' }}>
              {hero.title}
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,.7)', maxWidth: '42rem', lineHeight: 1.7, margin: 0 }}>
              {hero.description}
            </p>
          </Column>
        </Grid>
      </section>

      <section style={{ padding: '0 2rem 6rem', maxWidth: '1440px', margin: '0 auto' }}>
        <div className="cap-masonry">
          {grid.items.map(({ eyebrow, title, url, image, imageAlt }, i) => (
            <Link key={url} to={url} className={`cap-item ${tileShapes[i % tileShapes.length]}`}>
              <img src={image} alt={imageAlt || ''} className="cap-item-img" loading="lazy" decoding="async" />
              <div className="cap-item-scrim" />
              <div className="cap-item-content">
                <span className="cap-item-eyebrow">{eyebrow}</span>
                <div className="cap-item-body">
                  <h2 className="cap-item-title">{title}</h2>
                  <span className="cap-item-arrow">{grid.exploreLabel} <ArrowRight size={16} /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <CTABanner heading={cta.heading} sub={cta.sub} btnText={cta.label} btnTo={cta.url} />
    </Layout>
  )
}
