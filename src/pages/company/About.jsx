// Narrative, human, alternating editorial
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import content from '../../content/company/about.json'
import '../../App.css'

export default function About() {
  const { hero, partner, values, approach, cta } = content
  return (
    <Layout>
      <section className="split-hero split-hero--light hero-image-bg" style={{ '--hero-image': `url(${hero.image})` }}>
        <Grid>
          <Column lg={10} md={6} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="split-hero__sub">{hero.description}</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={6} md={4} sm={4}>
            <h2 style={{ fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 700, color: 'var(--q-primary)' }}>{partner.title}</h2>
          </Column>
          <Column lg={8} md={4} sm={4}>
            {partner.paragraphs.map(paragraph => <p key={paragraph} className="section-body">{paragraph}</p>)}
            <Link to={partner.linkUrl} className="cta-btn cta-btn--outline-dark" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              {partner.linkLabel} <ArrowRight size={18} />
            </Link>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h2 className="section-label">{values.title}</h2>
          </Column>
        </Grid>
        {values.items.map(s => (
          <Grid key={s.title} style={{ marginTop: '2.5rem' }}>
            <Column lg={7} md={4} sm={4}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>{s.title}</h3>
            </Column>
            <Column lg={9} md={4} sm={4}>
              <p className="section-body" style={{ marginTop: '.5rem' }}>{s.description}</p>
            </Column>
          </Grid>
        ))}
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={9} md={6} sm={4}>
            <p className="section-label">{approach.eyebrow}</p>
            <h2>{approach.title}</h2>
            <p className="section-body">{approach.body}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', marginTop: '1.5rem' }}>
              {approach.links.map(link => (
                <Link key={link.url} to={link.url} className="cta-btn cta-btn--outline-dark">
                  {link.label} <ArrowRight size={18} />
                </Link>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <CTABanner heading={cta.heading} sub={cta.sub} btnText={cta.label} btnTo={cta.url} />
    </Layout>
  )
}
