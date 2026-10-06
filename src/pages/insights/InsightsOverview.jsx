import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import { Grid, Column } from '@carbon/react'
import { Link } from 'react-router-dom'
import { ArrowRight } from '@carbon/icons-react'
import content from '../../content/insights/overview.json'
import { articles } from '../../lib/insights'
import '../../App.css'

export default function InsightsOverview() {
  const { hero, related, cta } = content
  return (
    <Layout>
      <section className="insights-hero insights-hero--resources hero-image-bg" style={{ '--hero-image': `url(${hero.image})` }}>
        <Grid>
          <Column lg={10} md={5} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="page-hero__sub page-hero__sub--light">{hero.description}</p>
          </Column>
          <Column lg={6} md={3} sm={4}>
            <div className="insights-hero__tags">
              {hero.tags.map(tag => <span key={tag} className="tile-eyebrow insights-hero__tag">{tag}</span>)}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="resources-overview">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <div className="resources-grid">
              {articles.map(article => (
                <Link key={article.slug} to={`/insights/${article.slug}`} className="resource-card">
                  <div className="resource-card__media">
                    <img src={article.card.image} alt={article.card.imageAlt || article.title} />
                    <div className="resource-card__media-overlay" />
                  </div>
                  <div className="resource-card__body">
                    <span className="tile-eyebrow resource-card__meta">{article.category} · {article.card.dateLabel}</span>
                    <div className="resource-card__footer">
                      <h2>{article.title}</h2>
                      <span className="resource-card__arrow" aria-hidden="true">
                        <ArrowRight size={20} />
                      </span>
                    </div>
                    <p>{article.card.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={10} md={6} sm={4}>
            <p className="section-label">{related.eyebrow}</p>
            <h2>{related.title}</h2>
            <p className="section-body">{related.body}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', marginTop: '1.5rem' }}>
              {related.links.map(link => (
                <Link key={link.url} to={link.url} className="cta-btn cta-btn--outline-dark">{link.label} <ArrowRight size={16} /></Link>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <CTABanner heading={cta.heading} sub={cta.sub} btnText={cta.label} btnTo={cta.url} />
    </Layout>
  )
}
