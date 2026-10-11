import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import '../../App.css'

// "Standard Page" template. Built only from existing site components and CSS classes, so its
// look is controlled by code exactly like the hand-built pages.
export default function StandardPage({ content }) {
  const { hero, intro, cards, cta } = content

  return (
    <Layout>
      <section className="split-hero split-hero--light hero-image-bg" style={{ '--hero-image': `url(${hero.image})` }}>
        <Grid>
          <Column lg={10} md={6} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="split-hero__sub">{hero.description}</p>
            {hero.cta?.label && hero.cta?.url && (
              <Link to={hero.cta.url} className="cta-btn cta-btn--primary" style={{ marginTop: '1.5rem' }}>
                {hero.cta.label} <ArrowRight size={18} />
              </Link>
            )}
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label">{intro.eyebrow}</p>
            <h2>{intro.title}</h2>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <p className="section-body">{intro.body}</p>
          </Column>
        </Grid>
      </section>

      {cards.items.length > 0 && (
        <section className="inner-section inner-section--gray">
          <Grid>
            <Column lg={12} md={8} sm={4}>
              <p className="section-label">{cards.eyebrow}</p>
              <h2>{cards.title}</h2>
              <div className="svc-rows">
                {cards.items.map((card, index) => (
                  <div className="svc-row" key={`${index}-${card.title}`}>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                ))}
              </div>
            </Column>
          </Grid>
        </section>
      )}

      <CTABanner heading={cta.heading} sub={cta.sub} btnText={cta.label} btnTo={cta.url} />
    </Layout>
  )
}
