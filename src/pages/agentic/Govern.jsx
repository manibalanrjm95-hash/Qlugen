// Governance framework — dark, 2x3 grid + editorial list
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { Password, Security, View, User, Rule, CheckmarkOutline } from '@carbon/icons-react'
import content from '../../content/agentic-ai/details/govern.json'
import { stepNumber, toRelated } from '../../lib/content'
import '../../App.css'

const dimensionIcons = [Password, Security, View, User, Rule, CheckmarkOutline]

export default function Govern() {
  const { hero, why, dimensions, principles, related, cta } = content
  return (
    <Layout>
      <section className="split-hero split-hero--darkest hero-image-bg" style={{ '--hero-image': `url(${hero.image})` }}>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <p className="section-label">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="split-hero__sub">{hero.description}</p>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="diagram-wrap">
                <svg viewBox="0 0 320 260" aria-hidden="true">
                  <rect x="60" y="20" width="200" height="220" rx="8" fill="none" stroke="rgba(11,242,118,.4)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x="160" y="12" textAnchor="middle" fill="rgba(11,242,118,.8)" fontSize="10" fontWeight="700">{hero.diagramBoundary}</text>
                  {[[110, 90], [210, 90], [110, 170], [210, 170]].map(([x, y], i) => (
                    <g key={i}>
                      <circle cx={x} cy={y} r="26" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.25)" />
                      <text x={x} y={y + 4} textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize="9">{hero.diagramNode}</text>
                    </g>
                  ))}
                  <line x1="110" y1="90" x2="210" y2="90" stroke="rgba(255,255,255,.15)" />
                  <line x1="110" y1="170" x2="210" y2="170" stroke="rgba(255,255,255,.15)" />
                  <line x1="110" y1="90" x2="110" y2="170" stroke="rgba(255,255,255,.15)" />
                  <line x1="210" y1="90" x2="210" y2="170" stroke="rgba(255,255,255,.15)" />
                </svg>
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

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">{dimensions.eyebrow}</p>
            <h2>{dimensions.title}</h2>
            <div className="tile-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {dimensions.items.map(({ title, description }, i) => {
                const Icon = dimensionIcons[i % dimensionIcons.length]
                return (
                  <div key={title} className="tile-card" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)' }}>
                    <Icon size={24} style={{ color: 'var(--q-accent)', marginBottom: '.875rem' }} />
                    <h3 style={{ color: '#fff' }}>{title}</h3>
                    <p style={{ color: 'rgba(255,255,255,.6)' }}>{description}</p>
                  </div>
                )
              })}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={9} md={6} sm={4}>
            <p className="section-label">{principles.eyebrow}</p>
            <h2>{principles.title}</h2>
            <div style={{ marginTop: '2rem' }}>
              {principles.items.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.5rem', padding: '1.25rem 0', borderBottom: '1px solid var(--q-teal-20)' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'rgba(2,33,96,.25)', minWidth: '2rem' }}>{stepNumber(i)}</span>
                  <p style={{ fontSize: '1.0625rem', color: 'var(--q-primary)', margin: 0, lineHeight: 1.5 }}>{p}</p>
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
