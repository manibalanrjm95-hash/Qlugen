import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
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
    capTo: '/capabilities/ai-agent-development',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  },
  {
    tag: 'Cloud', date: 'Jul 2026',
    title: 'Modernise without slowing the business',
    excerpt: 'How organisations can reduce legacy complexity while protecting the operations they depend on today.',
    to: '/insights/modernise-without-slowing-business',
    capTo: '/capabilities/cloud-infrastructure',
    img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    tag: 'Agentic AI', date: 'Jun 2026',
    title: 'Designing the operating model for an agentic enterprise',
    excerpt: 'What changes when AI agents become active participants in enterprise workflows.',
    to: '/insights/agentic-enterprise-operating-model',
    capTo: '/agentic-ai',
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
              Qlugen perspectives on enterprise AI adoption, cloud modernisation and the operating models behind digital transformation.
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
                    <img src={article.img} alt={article.title} />
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

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={10} md={6} sm={4}>
            <p className="section-label">Related capabilities</p>
            <h2>Put these insights to work</h2>
            <p className="section-body">Explore the Qlugen capabilities behind each topic — from AI agent development and cloud infrastructure to agentic enterprise design.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', marginTop: '1.5rem' }}>
              <Link to="/capabilities/ai-agent-development" className="cta-btn cta-btn--outline-dark">AI & Agent Development <ArrowRight size={16} /></Link>
              <Link to="/capabilities/cloud-infrastructure" className="cta-btn cta-btn--outline-dark">Cloud & Infrastructure <ArrowRight size={16} /></Link>
              <Link to="/agentic-ai" className="cta-btn cta-btn--outline-dark">Agentic Enterprise <ArrowRight size={16} /></Link>
            </div>
          </Column>
        </Grid>
      </section>

      <CTABanner
        heading="Want to discuss what you've read?"
        sub="Talk to the Qlugen team about applying these ideas to your enterprise."
        btnTo="/contact"
      />
    </Layout>
  )
}
