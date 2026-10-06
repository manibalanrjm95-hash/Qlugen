// Infrastructure / asset visual, operational intelligence
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import content from '../../content/industries/details/energy-utilities.json'
import { stepNumber, toRelated } from '../../lib/content'
import '../../App.css'

// Phase cards deepen from field (light) to intelligence (brand).
const phaseSurfaces = [
  { bg: 'var(--q-teal-10)', color: 'var(--q-primary)' },
  { bg: 'var(--q-teal-20)', color: 'var(--q-primary)' },
  { bg: 'var(--q-primary)', color: '#fff' },
]

function GridVisual() {
  const pts = [[40, 40], [140, 40], [240, 40], [90, 130], [190, 130], [40, 220], [140, 220], [240, 220]]
  const links = [[0, 1], [1, 2], [0, 3], [1, 3], [1, 4], [2, 4], [3, 5], [3, 6], [4, 6], [4, 7], [5, 6], [6, 7]]

  return (
    <div className="diagram-wrap">
      <svg viewBox="0 0 280 260" aria-hidden="true">
        {links.map(([a, b], i) => (
          <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="rgba(11,242,118,.35)" strokeWidth="1" />
        ))}
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 7 : 5} fill={i % 3 === 0 ? '#0788D6' : 'rgba(255,255,255,.5)'} />
        ))}
      </svg>
    </div>
  )
}

export default function EnergyUtilities() {
  const { hero, challenge, flow, help, outcomes, related, cta } = content
  return (
    <Layout>
      <section className="split-hero hero-image-bg" style={{ '--hero-image': `url(${hero.image})`, backgroundColor: '#012749' }}>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="split-hero__sub">{hero.description}</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap"><GridVisual /></div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={10} md={8} sm={4}>
            <p className="section-label">{challenge.eyebrow}</p>
            <h2>{challenge.title}</h2>
            <p className="section-body" style={{ maxWidth: '54rem' }}>{challenge.body}</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{flow.eyebrow}</p>
            <h2>{flow.title}</h2>
            <div className="phase-flow">
              {flow.phases.map((p, i) => {
                const surface = phaseSurfaces[Math.min(i, phaseSurfaces.length - 1)]
                return (
                  <span key={p.title} style={{ display: 'flex', flex: 1, minWidth: '12rem' }}>
                    <div className="phase-card" style={{ background: surface.bg, color: surface.color, flex: 1 }}>
                      <span style={{ fontSize: '.625rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .7 }}>{flow.phaseLabel} {i + 1}</span>
                      <h3 style={{ color: surface.color }}>{p.title}</h3>
                      <p style={{ color: surface.color, opacity: .8 }}>{p.description}</p>
                    </div>
                    {i < flow.phases.length - 1 && <div className="phase-arrow2"><ArrowRight size={20} /></div>}
                  </span>
                )
              })}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{help.eyebrow}</p>
            <h2>{help.title}</h2>
            <div className="tile-grid">
              {help.areas.map(h => <div key={h} className="tile-card"><span data-heading-visual className="tile-label">{h}</span></div>)}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{outcomes.eyebrow}</p>
            <h2>{outcomes.title}</h2>
            <div className="outcome-grid">
              {outcomes.items.map(({ title }, i) => (
                <div key={title} className="outcome-card outcome-card--dark">
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
