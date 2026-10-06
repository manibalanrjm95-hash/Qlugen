// Civic / structured, service architecture
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { Checkmark } from '@carbon/icons-react'
import content from '../../content/industries/details/government.json'
import { stepNumber, toRelated } from '../../lib/content'
import '../../App.css'

// Service layers fade from teal (citizen) to neutral (infrastructure).
const layerSurfaces = ['var(--q-teal-10)', 'var(--q-teal-20)', 'rgba(179,227,228,.5)', '#f4f4f4']

export default function Government() {
  const { hero, principles, architecture, help, outcomes, related, cta } = content
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
            <p className="section-label">{principles.eyebrow}</p>
            <h2 style={{ maxWidth: '40rem' }}>{principles.title}</h2>
          </Column>
        </Grid>
        <Grid style={{ marginTop: '2.5rem' }}>
          {principles.items.map((p, i) => (
            <Column key={p.title} lg={5} md={4} sm={4} style={{ marginBottom: '1.5rem' }}>
              <span className="num-challenge-num" style={{ fontSize: '2rem' }}>{stepNumber(i)}</span>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--q-primary)', margin: '.5rem 0 .5rem' }}>{p.title}</h3>
              <p style={{ fontSize: '.9375rem', color: '#525252', margin: 0, lineHeight: 1.65 }}>{p.description}</p>
            </Column>
          ))}
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={10} md={8} sm={4}>
            <p className="section-label">{architecture.eyebrow}</p>
            <h2>{architecture.title}</h2>
            <div className="svc-arch">
              {architecture.layers.map((l, i) => (
                <div key={l.title} className="svc-arch-layer" style={{ background: layerSurfaces[Math.min(i, layerSurfaces.length - 1)] }}>
                  <span data-heading-visual className="diagram-label">{l.title}</span>
                  <span>{l.description}</span>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label">{help.eyebrow}</p>
            <h2>{help.title}</h2>
            <ul className="solutions-list">
              {help.areas.map(area => <li key={area}><Checkmark size={18} /> {area}</li>)}
            </ul>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{outcomes.eyebrow}</p>
            <h2>{outcomes.title}</h2>
            <div className="metric-row">
              {outcomes.items.map((m, i) => (
                <div key={m.title} className="metric-block">
                  <div className="metric-block-num">{stepNumber(i)}</div>
                  <p className="metric-block-title">{m.title}</p>
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
