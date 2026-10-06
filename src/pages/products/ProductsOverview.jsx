import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import { getValidatedProductsOverview } from '../../data/productContent'
import '../../App.css'

export default function ProductsOverview({ content = getValidatedProductsOverview() }) {
  const { hero, portfolio, model, cta } = content

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
          <Column lg={7} md={4} sm={4}>
            <p className="section-label">{portfolio.eyebrow}</p>
            <h2>{portfolio.title}</h2>
            <p className="section-body">{portfolio.body}</p>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <div className="related-grid related-grid--compact">
              {portfolio.products.map(product => (
                <Link key={product.slug} to={`/products/${product.slug}`} className="related-card">
                  <p className="tile-eyebrow">{product.maturityLabel}</p>
                  <h3>{product.name}</h3>
                  <p>{product.short}</p>
                  <span className="related-card__footer"><ArrowRight size={18} /></span>
                </Link>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={8} md={5} sm={4}>
            <p className="section-label">{model.eyebrow}</p>
            <h2>{model.title}</h2>
            <p className="section-body">{model.body}</p>
          </Column>
          <Column lg={8} md={3} sm={4}>
            <div className="delivery-stepper">
              {model.steps.map((item, index) => (
                <div key={`${item.label}-${item.desc}`} className="delivery-step">
                  <span className="delivery-step-num">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{item.label}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <CTABanner heading={cta.heading} sub={cta.sub} btnText={cta.label} btnTo={cta.url} />
    </Layout>
  )
}
