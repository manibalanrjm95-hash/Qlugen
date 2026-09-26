import { Navigate, Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { productDeliveryModel, productMap } from '../../data/products'
import '../../App.css'

export default function ProductDetail({ slug }) {
  const product = productMap[slug]
  if (!product) return <Navigate to="/products" replace />

  const related = product.related.map(key => productMap[key]).filter(Boolean).map(item => ({
    to: `/products/${item.slug}`,
    eyebrow: item.type,
    title: item.name,
    desc: item.short,
  }))

  return (
    <Layout>
      <section className="split-hero product-hero" style={{ '--hero-image': `url(${product.heroImage})` }}>
        <Grid>
          <Column lg={8} md={5} sm={4}>
            <p className="section-label">{product.type}</p>
            <h1>{product.name}</h1>
            <p className="split-hero__sub">{product.short}</p>
            <Link to="/contact" className="cta-btn cta-btn--primary" style={{ marginTop: '1.5rem' }}>
              Discuss with an Architect <ArrowRight size={18} />
            </Link>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={6} md={4} sm={4}>
            <p className="section-label">Core outcome</p>
            <h2>{product.outcome}</h2>
          </Column>
          <Column lg={10} md={4} sm={4}>
            <div className="flow-list">
              {product.capabilities.map((capability, index) => (
                <div key={capability} className="flow-item">
                  <span className="delivery-step-num">{String(index + 1).padStart(2, '0')}</span>
                  <div><h3>{capability}</h3><p>{product.capabilityDetails[index]}</p></div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label">Delivery flow</p>
            <h2>From current state to operating improvement</h2>
            <p className="section-body">The engagement shape changes by product maturity, but the operating logic stays consistent: discover evidence, design the target state, adapt reusable IP, engineer the integration and improve in production.</p>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <div className="delivery-stepper">
              {productDeliveryModel.map((step, index) => (
                <div key={step.label} className="delivery-step">
                  <span className="delivery-step-num">Phase {String(index + 1).padStart(2, '0')}</span>
                  <h3>{step.label}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label">Engagement model</p>
            <h2>Products plus consulting, engineering and managed operations.</h2>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <ul className="solutions-list" style={{ marginTop: 0 }}>
              {product.services.map(service => <li key={service}>{service}</li>)}
            </ul>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading="Related products" items={related} />
      <CTABanner heading={`Start a ${product.name} conversation`} sub="Bring the problem, current constraints and desired outcome. We will map the product fit and engineering path." btnText="Start a Discovery" btnTo="/contact" />
    </Layout>
  )
}
