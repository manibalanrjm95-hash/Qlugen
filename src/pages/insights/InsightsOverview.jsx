import Layout from '../../components/Layout'
import { Grid, Column } from '@carbon/react'
import { Link } from 'react-router-dom'
import { ArrowRight } from '@carbon/icons-react'
import '../../App.css'

const articles = [
  {
    tag: 'AI & Analytics', date: 'Aug 2026',
    title: 'From AI pilots to enterprise impact',
    excerpt: 'Why enterprise AI depends on operating models, integration and governance as much as the models themselves.',
    to: '/insights/ai-pilots-to-enterprise-impact',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  },
  {
    tag: 'Cloud', date: 'Jul 2026',
    title: 'Modernise without slowing the business',
    excerpt: 'How organisations can reduce legacy complexity while protecting the operations they depend on today.',
    to: '/insights/modernise-without-slowing-business',
    img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    tag: 'Agentic AI', date: 'Jun 2026',
    title: 'Designing the operating model for an agentic enterprise',
    excerpt: 'What changes when AI agents become active participants in enterprise workflows.',
    to: '/insights/agentic-enterprise-operating-model',
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
  },
]

export default function InsightsOverview() {
  return (
    <Layout>
      <section className="insights-hero insights-hero--resources">
        <Grid>
          <Column lg={10} md={5} sm={4}>
            <p className="section-label">Resources</p>
            <h1>Insights</h1>
            <p className="page-hero__sub page-hero__sub--light">
              Research, perspective and practical guidance across AI, cloud and enterprise transformation.
            </p>
          </Column>
          <Column lg={6} md={3} sm={4}>
            <div className="insights-hero__tags">
              {['AI & Analytics', 'Cloud', 'Agentic AI'].map(tag => (
                <span key={tag} className="tile-eyebrow insights-hero__tag">{tag}</span>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="resources-overview">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <div className="resources-grid">
              {articles.map(article => (
                <Link key={article.to} to={article.to} className="resource-card">
                  <div className="resource-card__media">
                    <img src={article.img} alt="" />
                    <div className="resource-card__media-overlay" />
                  </div>
                  <div className="resource-card__body">
                    <span className="tile-eyebrow resource-card__meta">{article.tag} · {article.date}</span>
                    <div className="resource-card__footer">
                      <h2>{article.title}</h2>
                      <span className="resource-card__arrow" aria-hidden="true">
                        <ArrowRight size={20} />
                      </span>
                    </div>
                    <p>{article.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Column>
        </Grid>
      </section>
    </Layout>
  )
}
