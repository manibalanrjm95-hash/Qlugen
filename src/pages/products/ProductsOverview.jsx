import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import { products } from '../../data/products'
import '../../App.css'

export default function ProductsOverview() {
  return (
    <Layout>
      <section className="split-hero split-hero--light hero-image-bg" style={{ '--hero-image': 'url(https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1800&q=80)' }}>
        <Grid>
          <Column lg={10} md={6} sm={4}>
            <p className="section-label">Products & Platforms</p>
            <h1>Reusable technology for repeated enterprise problems.</h1>
            <p className="split-hero__sub">Qlugen products, accelerators and roadmap platforms help teams move from strategy to production without starting from a blank page.</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label">Portfolio</p>
            <h2>Product-led engineering across Data, AI, Cloud and Analytics</h2>
            <p className="section-body">Some offers are mature accelerators. Some are concepts or roadmap platforms. The maturity label is part of the product, because enterprise buyers need clarity before commitment.</p>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <div className="related-grid related-grid--compact">
              {products.map(product => (
                <Link key={product.slug} to={`/products/${product.slug}`} className="related-card">
                  <p className="tile-eyebrow">{product.type}</p>
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
            <p className="section-label">Qlugen model</p>
            <h2>Product thinking. Engineering depth. Enterprise impact.</h2>
            <p className="section-body">Reusable IP reduces time-to-value. Engineering adapts it to your environment. Managed services keep outcomes running and improving.</p>
          </Column>
          <Column lg={8} md={3} sm={4}>
            <div className="delivery-stepper">
              {['Product - Reusable IP', 'Consult - Architecture', 'Implement - Engineering', 'Operate - Managed services', 'Learn - Better IP'].map((item, index) => (
                <div key={item} className="delivery-step">
                  <span className="delivery-step-num">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{item.split(' - ')[0]}</h3>
                  <p>{item.split(' - ')[1]}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <CTABanner heading="Have a transformation problem worth productising?" sub="Start with the problem. We will help identify the reusable IP, engineering path and operating model behind it." btnText="Talk to an Architect" btnTo="/contact" />
    </Layout>
  )
}
