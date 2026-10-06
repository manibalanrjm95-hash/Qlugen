// Human-centred, lighter, journey-based
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { User, Activity, Enterprise, Chip, Awake } from '@carbon/icons-react'
import content from '../../content/industries/details/healthcare.json'
import { stepNumber, toRelated } from '../../lib/content'
import '../../App.css'

const pathwayIcons = [User, Activity, Enterprise, Chip, Awake]

export default function Healthcare() {
  const { hero, challenges, help, pathway, outcomes, related, cta } = content
  return (
    <Layout>
      <section className="split-hero split-hero--light hero-image-bg" style={{ '--hero-image': `url(${hero.image})` }}>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="split-hero__sub">{hero.description}</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <img src={hero.visualImage} alt={hero.visualImageAlt || ''} style={{ width: '100%', height: '20rem', objectFit: 'cover', borderRadius: '.75rem' }} loading="lazy" decoding="async" />
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={10} md={8} sm={4}>
            <p className="section-label">{challenges.eyebrow}</p>
            <h2>{challenges.title}</h2>
            <div className="num-challenge">
              {challenges.items.map((c, i) => (
                <div key={c.title} className="num-challenge-item">
                  <span className="num-challenge-num">{stepNumber(i)}</span>
                  <div><h3>{c.title}</h3><p>{c.description}</p></div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{help.eyebrow}</p>
            <h2>{help.title}</h2>
            <div className="tile-grid">
              {help.items.map((t, i) => (
                <div key={t.title} className="tile-card">
                  <span className="tile-card-num">{stepNumber(i)}</span>
                  <h3>{t.title}</h3>
                  <p>{t.description}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{pathway.eyebrow}</p>
            <h2>{pathway.title}</h2>
            <div className="journey-flow">
              {pathway.steps.map((label, i) => {
                const Icon = pathwayIcons[i % pathwayIcons.length]
                return (
                  <span key={label} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <div className="journey-node">
                      <div className="journey-node-circle"><Icon size={22} /></div>
                      <span data-heading-visual className="diagram-label">{label}</span>
                    </div>
                    {i < pathway.steps.length - 1 && <div className="journey-connector" />}
                  </span>
                )
              })}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{outcomes.eyebrow}</p>
            <h2>{outcomes.title}</h2>
            <div className="outcome-grid">
              {outcomes.items.map(({ title }, i) => (
                <div key={title} className="outcome-card">
                  <span className="outcome-num">{stepNumber(i)}</span>
                  <p className="outcome-title">{title}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading={related.heading} items={toRelated(related.items)} />

      <CTABanner heading={cta.heading} sub={cta.sub} btnText={cta.label} btnTo={cta.url} />
    </Layout>
  )
}
