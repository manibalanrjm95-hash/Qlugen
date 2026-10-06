// Culture-first, people-focused
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight, Tools, Growth, Certificate } from '@carbon/icons-react'
import content from '../../content/company/careers.json'
import '../../App.css'

const cultureIcons = [Tools, Growth, Certificate]

export default function Careers() {
  const { hero, culture, working, areas, openRoles, cta } = content
  return (
    <Layout>
      <section className="careers-hero hero-image-bg" style={{ '--hero-image': `url(${hero.image})` }}>
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="split-hero__sub">{hero.description}</p>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <div className="careers-collage">
              {hero.collage.slice(0, 3).map((frame, index) => (
                <div key={frame.image} className={`careers-collage__frame careers-collage__frame--${index + 1}`}>
                  <img src={frame.image} alt={frame.imageAlt || ''} />
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{culture.eyebrow}</p>
            <h2>{culture.title}</h2>
            <div className="culture-row">
              {culture.items.map(({ title, description }, i) => {
                const Icon = cultureIcons[i % cultureIcons.length]
                return (
                  <div key={title} className="culture-item">
                    <Icon size={28} />
                    <div className="culture-word">{title}</div>
                    <p>{description}</p>
                  </div>
                )
              })}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label">{working.eyebrow}</p>
            <h2>{working.title}</h2>
            <p className="section-body">{working.body}</p>
            <Link to={working.linkUrl} className="cta-btn cta-btn--outline-dark" style={{ marginTop: '1.5rem' }}>
              {working.linkLabel} <ArrowRight size={18} />
            </Link>
          </Column>
          <Column lg={7} md={2} sm={4}>
            <ul className="solutions-list" style={{ marginTop: 0 }}>
              {working.principles.map(w => <li key={w}>{w}</li>)}
            </ul>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{areas.eyebrow}</p>
            <h2>{areas.title}</h2>
            <div className="flow-list">
              {areas.items.map(a => <div key={a} className="flow-item"><div><span data-heading-visual className="career-area-label">{a}</span></div></div>)}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={9} md={6} sm={4}>
            <p className="section-label">{openRoles.eyebrow}</p>
            <h2>{openRoles.title}</h2>
            <p className="section-body">{openRoles.body}</p>
            <Link to={openRoles.linkUrl} className="cta-btn cta-btn--primary" style={{ marginTop: '1.5rem' }}>
              {openRoles.linkLabel} <ArrowRight size={18} />
            </Link>
          </Column>
        </Grid>
      </section>

      <CTABanner heading={cta.heading} sub={cta.sub} btnText={cta.label} btnTo={cta.url} />
    </Layout>
  )
}
