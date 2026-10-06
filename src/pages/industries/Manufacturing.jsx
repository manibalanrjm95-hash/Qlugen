// Operational, factory-floor, process-driven
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { Analytics, Enterprise, Industry, ArrowDown } from '@carbon/icons-react'
import content from '../../content/industries/details/manufacturing.json'
import { stepNumber, toRelated } from '../../lib/content'
import '../../App.css'

// Layer bands alternate dark → teal → light, top of the stack first.
const layerSurfaces = ['inner-section--dark', 'inner-section--teal', '']

export default function Manufacturing() {
  const { hero, layers, help, outcomes, related, cta } = content
  const { architecture } = hero
  return (
    <Layout>
      <section className="split-hero hero-image-bg" style={{ '--hero-image': `url(${hero.image})`, backgroundColor: '#001c1e' }}>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="split-hero__sub">{hero.description}</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="factory-arch">
                <div className="factory-zone factory-zone--cloud"><span data-heading-visual className="diagram-label" style={{ color: 'var(--q-accent)' }}>{architecture.cloud}</span><Analytics size={20} style={{ color: 'var(--q-accent)' }} /></div>
                <div className="factory-arrow"><ArrowDown size={16} /></div>
                <div className="factory-zone factory-zone--enterprise"><span data-heading-visual className="diagram-label">{architecture.enterprise}</span><Enterprise size={20} style={{ color: 'rgba(255,255,255,.6)' }} /></div>
                <div className="factory-arrow"><ArrowDown size={16} /></div>
                <div className="factory-zone factory-zone--floor"><span data-heading-visual className="diagram-label">{architecture.floor}</span><Industry size={20} style={{ color: 'rgba(255,255,255,.5)' }} /></div>
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      {layers.map((b, i) => {
        const surface = layerSurfaces[i % layerSurfaces.length]
        const dark = surface === 'inner-section--dark'
        return (
          <section key={b.title} className={`inner-section ${surface}`}>
            <Grid>
              <Column lg={2} md={2} sm={4}>
                <span style={{ fontSize: '3rem', fontWeight: 800, color: dark ? 'rgba(255,255,255,.15)' : 'var(--q-teal-20)', lineHeight: 1 }}>{stepNumber(i)}</span>
              </Column>
              <Column lg={10} md={6} sm={4}>
                <h2 style={{ color: dark ? '#fff' : 'var(--q-primary)' }}>{b.title}</h2>
                <p className="section-body">{b.description}</p>
              </Column>
            </Grid>
          </section>
        )
      })}

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{help.eyebrow}</p>
            <h2>{help.title}</h2>
            <div className="highlight-grid">
              {help.areas.map(h => <div key={h} className="highlight-cell"><span>{h}</span></div>)}
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
