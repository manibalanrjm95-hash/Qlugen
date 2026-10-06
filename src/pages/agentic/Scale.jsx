// Growth / scaling model — gradient hero + progression
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import content from '../../content/agentic-ai/details/scale.json'
import { stepNumber, toRelated } from '../../lib/content'
import '../../App.css'

export default function Scale() {
  const { hero, why, model, enablers, related, cta } = content
  const stages = model.stages
  return (
    <Layout>
      <section className="split-hero hero-image-bg" style={{ '--hero-image': `url(${hero.image})`, backgroundColor: '#022160' }}>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="split-hero__sub">{hero.description}</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '.5rem', width: '100%', height: '14rem' }}>
                {stages.map((m, i) => (
                  <div key={m} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ height: `${30 + i * 17}%`, background: 'rgba(11,242,118,.25)', border: '1px solid rgba(11,242,118,.5)', borderRadius: '4px 4px 0 0', minHeight: '2rem' }} />
                    <span style={{ fontSize: '.6875rem', color: 'rgba(255,255,255,.8)', fontWeight: 600, display: 'block', marginTop: '.5rem' }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label">{why.eyebrow}</p>
            <h2>{why.title}</h2>
            <p className="section-body">{why.body}</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{model.eyebrow}</p>
            <h2>{model.title}</h2>
            <div className="phase-flow">
              {stages.map((m, i) => {
                const last = i === stages.length - 1
                return (
                  <span key={m} style={{ display: 'flex', flex: 1, minWidth: '9rem' }}>
                    <div className="phase-card" style={{ background: last ? 'var(--q-primary)' : 'var(--q-teal-10)', color: last ? '#fff' : 'var(--q-primary)', flex: 1 }}>
                      <span style={{ fontSize: '.625rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .7 }}>{model.stepLabel} {i + 1}</span>
                      <span data-heading-visual className="phase-label" style={{ color: last ? '#fff' : 'var(--q-primary)' }}>{m}</span>
                    </div>
                    {!last && <div className="phase-arrow2"><ArrowRight size={18} /></div>}
                  </span>
                )
              })}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">{enablers.eyebrow}</p>
            <h2>{enablers.title}</h2>
            <div className="band-list band-list--light">
              {enablers.items.map(({ title, description }, i) => (
                <div key={title} className="band-row">
                  <span className="band-num">{stepNumber(i)}</span>
                  <div><h3>{title}</h3><p>{description}</p></div>
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
