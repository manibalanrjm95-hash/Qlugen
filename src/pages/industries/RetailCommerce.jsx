// Commerce journey, dynamic, channel-connected
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import '../../App.css'

const journey = ['Physical Store', 'Online', 'Mobile', 'Supply Chain', 'Analytics']

const pairs = [
  { title: 'A widening set of channels', desc: 'Retail and commerce organisations operate across more channels, fulfilment models and customer expectations than ever. The organisations that compete effectively connect their operations most coherently.', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Experience meets operations', desc: 'Customer experience is only as strong as the inventory, supply chain and intelligence behind it. Connecting the front and back of commerce is where advantage is built.', img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80' },
]

const helps = ['Customer Experience', 'Commerce Platforms', 'Inventory Visibility', 'Supply Chain', 'Retail Analytics', 'AI', 'Store Technology', 'Automation']

const bubbles = ['Customer Experience', 'Commerce Engine', 'Inventory', 'Supply Chain', 'Intelligence']

const outcomes = [
  { num: '01', title: 'Connected Commerce' },
  { num: '02', title: 'Better Experience' },
  { num: '03', title: 'Inventory Visibility' },
  { num: '04', title: 'Operational Efficiency' },
]

export default function RetailCommerce() {
  return (
    <Layout>
      <section className="split-hero">
        <Grid>
          <Column lg={6} md={4} sm={4}>
            <p className="section-label">Industry · Retail &amp; Commerce</p>
            <h1>Connect every part of commerce.</h1>
            <p className="split-hero__sub">From customer experience to supply chain, Qlugen helps retail and commerce organisations build the connected operations and intelligence needed to compete.</p>
          </Column>
          <Column lg={10} md={4} sm={4}>
            <div className="split-visual-wrap">
              <div className="proc-flow" style={{ justifyContent: 'center' }}>
                {journey.map((n, i) => (
                  <span key={n} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span className="proc-node" style={{ background: 'rgba(255,255,255,.08)', color: '#fff' }}>{n}</span>
                    {i < journey.length - 1 && <ArrowRight size={16} className="proc-arrow" style={{ color: 'rgba(255,255,255,.35)' }} />}
                  </span>
                ))}
              </div>
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section" style={{ paddingBottom: 0 }}>
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">Commerce challenge</p>
            <h2 style={{ marginBottom: '2.5rem' }}>Competing on connected operations</h2>
          </Column>
        </Grid>
        <div>
          {pairs.map(p => (
            <div key={p.title} className="alt-row">
              <div className="alt-img"><img src={p.img} alt="" loading="lazy" decoding="async" /></div>
              <div className="alt-text"><h3>{p.title}</h3><p>{p.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Where we help</p>
            <h2>Connected commerce, end to end</h2>
            <div className="tile-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {helps.map((h, i) => (
                <div key={h} className="tile-card" style={{ borderTop: '3px solid var(--q-accent)' }}>
                  <span className="tile-card-num">{String(i + 1).padStart(2, '0')}</span>
                  <span data-heading-visual className="tile-label">{h}</span>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Connected commerce</p>
            <h2>Five interconnected capabilities</h2>
            <div className="bubble-row">
              {bubbles.map((b, i) => (
                <span key={b} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <div className="bubble">{b}</div>
                  {i < bubbles.length - 1 && <div className="bubble-link" />}
                </span>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Business priorities</p>
            <h2>What retail &amp; commerce leaders focus on</h2>
            <div className="outcome-grid">
              {outcomes.map(({ num, title }) => (
                <div key={num} className="outcome-card">
                  <span className="outcome-num">{num}</span>
                  <p className="outcome-title">{title}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading="Related capabilities" items={[
        { eyebrow: 'Capability', title: 'Data & Analytics', desc: 'Turn commerce data into timely decisions.', to: '/capabilities/data-analytics' },
        { eyebrow: 'Capability', title: 'Automation', desc: 'Remove friction across commerce operations.', to: '/capabilities/automation' },
        { eyebrow: 'Capability', title: 'AI & Agent Development', desc: 'Intelligent systems for demand and service.', to: '/capabilities/ai-agent-development' },
      ]} />

      <CTABanner heading="Transform what comes next." sub="Tell us about your industry challenge." btnTo="/contact" />
    </Layout>
  )
}
