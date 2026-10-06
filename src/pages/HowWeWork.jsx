import { useState } from 'react'
import Layout from '../components/Layout'
import CTABanner from '../components/CTABanner'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import content from '../content/how-we-work.json'
import { stepNumber } from '../lib/content'
import '../App.css'

export default function HowWeWork() {
  const { hero, principles, deliveryModel, cta } = content
  const [active, setActive] = useState(0)

  return (
    <Layout>
      <section className="page-hero hero-image-bg" style={{ '--hero-image': `url(${hero.image})` }}>
        <Grid>
          <Column lg={11} md={6} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="page-hero__sub">{hero.description}</p>
          </Column>
        </Grid>
      </section>

      <section className="approach-section" style={{ paddingBottom: '5rem' }}>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{principles.eyebrow}</p>
            <h2>{principles.title}</h2>
            <div className="approach-gallery">
              {principles.items.map((p, i) => (
                <div
                  key={p.title}
                  className={`approach-card${i === active ? ' approach-card--active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  <img src={p.image} alt={p.imageAlt || ''} className="approach-card-img" loading="lazy" decoding="async" />
                  <div className="approach-card-overlay" />
                  <div className="approach-card-content">
                    <span className="approach-card-num">{principles.principleLabel} {stepNumber(i)}</span>
                    <div className="approach-card-foot">
                      <h3 className="approach-card-title">{p.title}</h3>
                      <p className="approach-card-desc">{p.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={7} md={5} sm={4}>
            <p className="section-label">{deliveryModel.eyebrow}</p>
            <h2>{deliveryModel.title}</h2>
            <p className="section-body">{deliveryModel.body}</p>
            <Link to={deliveryModel.linkUrl} className="cta-btn cta-btn--outline-dark" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              {deliveryModel.linkLabel} <ArrowRight size={18} />
            </Link>
          </Column>
          <Column lg={9} md={3} sm={4}>
            <div className="how-process-visual">
              <img src={deliveryModel.image} alt={deliveryModel.imageAlt || ''} className="how-process-visual__img" loading="lazy" decoding="async" />
              <div className="how-process-visual__overlay" />
            </div>
          </Column>
        </Grid>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <div className="delivery-stepper">
              {deliveryModel.phases.map((p, i) => (
                <div key={p.title} className="delivery-step">
                  <span className="delivery-step-num">{deliveryModel.phaseLabel} {stepNumber(i)}</span>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
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
