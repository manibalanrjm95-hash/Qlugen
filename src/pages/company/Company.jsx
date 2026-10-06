// Brand story, oversized typography
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import content from '../../content/company/overview.json'
import { stepNumber } from '../../lib/content'
import '../../App.css'

export default function Company() {
  const { hero, beliefs, explore, cta } = content
  return (
    <Layout>
      <section className="hero-image-bg" style={{ '--hero-image': `url(${hero.image})`, backgroundColor: 'var(--q-primary)', color: '#fff', padding: '8rem 0 6rem' }}>
        <Grid>
          <Column lg={14} md={7} sm={4}>
            <p className="section-label" style={{ color: 'var(--q-accent)' }}>{hero.eyebrow}</p>
            <h1 style={{ fontSize: 'clamp(3rem,7vw,5.5rem)', fontWeight: 700, color: '#fff', lineHeight: 1.05, letterSpacing: '-.02em', margin: '1rem 0 2rem' }}>
              {hero.title}
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,.7)', maxWidth: '42rem', lineHeight: 1.7, margin: 0 }}>
              {hero.description}
            </p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h2 className="section-label">{beliefs.title}</h2>
          </Column>
        </Grid>
        <Grid>
          {beliefs.items.map((b, i) => (
            <Column key={b.title} lg={5} md={4} sm={4}>
              <div className="belief-item">
                <span className="belief-bg-num">{stepNumber(i)}</span>
                <h3>{b.title}</h3>
                <p>{b.description}</p>
              </div>
            </Column>
          ))}
        </Grid>
      </section>

      <section style={{ background: 'var(--q-primary)', color: '#fff', padding: '5rem 0' }}>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label" style={{ color: 'var(--q-accent)' }}>{explore.eyebrow}</p>
            <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem,2.5vw,2.25rem)', margin: '0 0 2.5rem' }}>{explore.title}</h2>
          </Column>
        </Grid>
        <Grid>
          {explore.items.map(l => (
            <Column key={l.url} lg={5} md={4} sm={4}>
              <Link to={l.url} className="co-panel">
                <h3>{l.title}</h3>
                <p>{l.description}</p>
                <span className="co-panel-arrow">&rarr;</span>
              </Link>
            </Column>
          ))}
        </Grid>
      </section>

      <CTABanner heading={cta.heading} sub={cta.sub} btnText={cta.label} btnTo={cta.url} />
    </Layout>
  )
}
