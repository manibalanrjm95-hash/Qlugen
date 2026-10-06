// Build pipeline visual + alternating technical sections
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import content from '../../content/agentic-ai/details/build-run.json'
import { toRelated } from '../../lib/content'
import '../../App.css'

export default function BuildRun() {
  const { hero, why, process, related, cta } = content
  return (
    <Layout>
      <section className="split-hero split-hero--darkest hero-image-bg" style={{ '--hero-image': `url(${hero.image})` }}>
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="split-hero__sub">{hero.description}</p>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="proc-flow" style={{ justifyContent: 'center' }}>
                {hero.pipeline.map((n, i) => (
                  <span key={n} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span className="proc-node" style={{ background: 'rgba(11,242,118,.12)', color: 'var(--q-accent)', border: '1px solid rgba(11,242,118,.3)' }}>{n}</span>
                    {i < hero.pipeline.length - 1 && <ArrowRight size={16} className="proc-arrow" style={{ color: 'rgba(255,255,255,.35)' }} />}
                  </span>
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
            <p className="section-label">{process.eyebrow}</p>
            <h2 style={{ marginBottom: '2.5rem' }}>{process.title}</h2>
          </Column>
        </Grid>
        {process.items.map((s, i) => (
          <Grid key={s.title} style={{ marginBottom: '1.5rem', flexDirection: i % 2 === 1 ? 'row-reverse' : 'row' }}>
            <Column lg={8} md={4} sm={4}>
              <h3 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--q-primary)', margin: '0 0 1rem' }}>{s.title}</h3>
              <p style={{ fontSize: '1rem', color: '#525252', lineHeight: 1.7, margin: 0 }}>{s.description}</p>
            </Column>
            <Column lg={8} md={4} sm={4}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '.5rem' }}>
                {s.deliverables.map(it => (
                  <div key={it} style={{ padding: '1rem 1.25rem', background: '#fff', border: '1px solid #e0e0e0', fontSize: '.875rem', fontWeight: 600, color: 'var(--q-primary)' }}>{it}</div>
                ))}
              </div>
            </Column>
          </Grid>
        ))}
      </section>

      <RelatedCards heading={related.heading} items={toRelated(related.items)} />

      <CTABanner heading={cta.heading} sub={cta.sub} btnText={cta.label} btnTo={cta.url} />
    </Layout>
  )
}
