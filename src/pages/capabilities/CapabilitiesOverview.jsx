// Giant editorial hero + asymmetric masonry grid
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import '../../App.css'

const caps = [
  { cls: 'cap-item--wide', eyebrow: 'Data & Analytics', title: 'Turn data into decisions', to: '/capabilities/data-analytics', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80' },
  { cls: 'cap-item--med', eyebrow: 'AI & Agent Development', title: 'Intelligent systems that act', to: '/capabilities/ai-agent-development', img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80' },
  { cls: 'cap-item--med', eyebrow: 'Cloud & Infrastructure', title: 'Scale without limits', to: '/capabilities/cloud-infrastructure', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80' },
  { cls: 'cap-item--wide', eyebrow: 'Cybersecurity', title: 'Protect what matters most', to: '/capabilities/cybersecurity', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80' },
  { cls: 'cap-item--half cap-item--tall', eyebrow: 'Automation', title: 'Eliminate friction at scale', to: '/capabilities/automation', img: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=1600&q=80' },
  { cls: 'cap-item--half', eyebrow: 'Digital Transformation', title: 'Reimagine the enterprise', to: '/capabilities/digital-transformation', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80' },
  { cls: 'cap-item--full', eyebrow: 'Sustainability', title: 'Build a responsible future', to: '/capabilities/sustainability', img: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1600&q=80' },
]

export default function CapabilitiesOverview() {
  return (
    <Layout>
      <section style={{ background: 'var(--q-primary)', padding: '8rem 0 6rem', color: '#fff' }}>
        <Grid>
          <Column lg={14} md={7} sm={4}>
            <p className="section-label" style={{ color: 'var(--q-accent)' }}>Capabilities</p>
            <h1 style={{ fontSize: 'clamp(3rem,7vw,6rem)', fontWeight: 700, lineHeight: 1.05, margin: '1rem 0 2rem', color: '#fff', letterSpacing: '-0.02em' }}>
              Technology that moves the enterprise forward.
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,.7)', maxWidth: '42rem', lineHeight: 1.7, margin: 0 }}>
              Seven connected capabilities. One enterprise technology partner — Qlugen.
            </p>
          </Column>
        </Grid>
      </section>

      <section style={{ padding: '0 2rem 6rem', maxWidth: '1440px', margin: '0 auto' }}>
        <div className="cap-masonry">
          {caps.map(({ cls, eyebrow, title, to, img }) => (
            <Link key={to} to={to} className={`cap-item ${cls}`}>
              <img src={img} alt="" className="cap-item-img" />
              <div className="cap-item-scrim" />
              <div className="cap-item-content">
                <span className="cap-item-eyebrow">{eyebrow}</span>
                <div className="cap-item-body">
                  <h2 className="cap-item-title">{title}</h2>
                  <span className="cap-item-arrow">Explore <ArrowRight size={16} /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <CTABanner
        heading="Have a transformation challenge?"
        sub="Talk to our team about your enterprise technology priorities."
        btnText="Talk to our team"
        btnTo="/contact"
      />
    </Layout>
  )
}
