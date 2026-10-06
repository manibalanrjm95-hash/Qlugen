// Editorial reading layout
import { useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import { Grid, Column } from '@carbon/react'
import { Link } from 'react-router-dom'
import { ArrowRight } from '@carbon/icons-react'
import NotFound from '../NotFound'
import { findArticle } from '../../lib/insights'
import '../../App.css'

function BodyBlock({ type, text }) {
  if (type === 'heading') return <h2>{text}</h2>
  if (type === 'quote') return <blockquote className="article-pull-quote"><p>{text}</p></blockquote>
  if (type === 'divider') return <hr className="article-hr" />
  return <p>{text}</p>
}

export default function InsightArticle() {
  const article = findArticle(useParams().slug)
  if (!article) return <NotFound />

  return (
    <Layout>
      <section className="article-page-hero hero-image-bg" style={{ '--hero-image': `url(${article.heroImage})` }}>
        <Grid>
          <Column lg={10} md={5} sm={4}>
            <span className="article-category">{article.category}</span>
            <h1 className="article-title">{article.title}</h1>
            <p className="article-subtitle">{article.subtitle}</p>
          </Column>
          <Column lg={6} md={3} sm={4}>
            <div className="article-meta-block">{article.dateLabel}<br />{article.readTime}</div>
          </Column>
        </Grid>
      </section>

      <section className="article-reading">
        <Grid>
          <Column lg={{ span: 8, offset: 4 }} md={6} sm={4}>
            <div className="article-body-col">
              {article.body.map((block, i) => <BodyBlock key={i} {...block} />)}

              <div className="article-end-cta">
                <p>{article.endCta.text}</p>
                <Link to={article.endCta.url} className="cta-btn cta-btn--primary">{article.endCta.label} <ArrowRight size={18} /></Link>
              </div>
            </div>
          </Column>
        </Grid>
      </section>
    </Layout>
  )
}
