import { Link, useParams } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import NotFound from '../NotFound'
import { getValidatedProduct, getValidatedProductMap } from '../../data/productContent'
import '../../App.css'

export default function ProductDetail({ content }) {
  const { slug } = useParams()
  const productMap = getValidatedProductMap()
  const product = content || getValidatedProduct(slug)
  if (!product) return <NotFound />

  const related = product.related.items.map(key => productMap[key]).filter(Boolean).map(item => ({
    to: `/products/${item.slug}`,
    eyebrow: item.maturityLabel,
    title: item.name,
    desc: item.short,
  }))

  return (
    <Layout>
      <section className="split-hero product-hero" style={{ '--hero-image': `url(${product.hero.image})` }}>
        <Grid>
          <Column lg={8} md={5} sm={4}>
            <p className="section-label">{product.hero.eyebrow}</p>
            <h1>{product.hero.title}</h1>
            <p className="split-hero__sub">{product.hero.description}</p>
            <Link to={product.heroCta.url} className="cta-btn cta-btn--primary" style={{ marginTop: '1.5rem' }}>
              {product.heroCta.label} <ArrowRight size={18} />
            </Link>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={6} md={4} sm={4}>
            <p className="section-label">{product.outcome.eyebrow}</p>
            <h2>{product.outcome.title}</h2>
          </Column>
          <Column lg={10} md={4} sm={4}>
            <div className="flow-list">
              {product.outcome.items.map((capability, index) => (
                <div key={capability.title} className="flow-item">
                  <span className="delivery-step-num">{String(index + 1).padStart(2, '0')}</span>
                  <div><h3>{capability.title}</h3><p>{capability.description}</p></div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label">{product.deliveryFlow.eyebrow}</p>
            <h2>{product.deliveryFlow.title}</h2>
            <p className="section-body">{product.deliveryFlow.body}</p>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <div className="delivery-stepper">
              {product.deliveryFlow.steps.map((step, index) => (
                <div key={step.label} className="delivery-step">
                  <span className="delivery-step-num">{product.deliveryFlow.phaseLabel} {String(index + 1).padStart(2, '0')}</span>
                  <h3>{step.label}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label">{product.engagementModel.eyebrow}</p>
            <h2>{product.engagementModel.title}</h2>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <ul className="solutions-list" style={{ marginTop: 0 }}>
              {product.engagementModel.services.map(service => <li key={service}>{service}</li>)}
            </ul>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label">{product.operations.eyebrow}</p>
            <h2>{product.operations.title}</h2>
            <p className="section-body">{product.operations.body}</p>
          </Column>
          {product.operations.items.length > 0 && (
            <Column lg={9} md={4} sm={4}>
              <div className="flow-list">
                {product.operations.items.map(item => (
                  <div key={item.title} className="flow-item">
                    <div><h3>{item.title}</h3><p>{item.description}</p></div>
                  </div>
                ))}
              </div>
            </Column>
          )}
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label">{product.coreCapabilities.eyebrow}</p>
            <h2>{product.coreCapabilities.title}</h2>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <div className="flow-list">
              {product.coreCapabilities.items.map((item, index) => (
                <div key={`${item.title}-${index}`} className="flow-item">
                  <span className="delivery-step-num">{String(index + 1).padStart(2, '0')}</span>
                  <div><h3>{item.title}</h3><p>{item.description}</p></div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading={product.related.heading} items={related} />
      <CTABanner heading={product.cta.heading} sub={product.cta.sub} btnText={product.cta.label} btnTo={product.cta.url} />
    </Layout>
  )
}
