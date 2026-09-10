// Brand story, oversized typography
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import '../../App.css'

const beliefs = [
  { num: '01', title: 'Outcomes over output', desc: 'Technology only matters when it changes what an organisation can do. We start with the outcome, not the deliverable.' },
  { num: '02', title: 'Built for real people', desc: 'We design around the people who will actually use what we build. Adoption is the true measure of success.' },
  { num: '03', title: 'Capability that lasts', desc: 'We measure success by the capability we leave behind — not the hours we deliver.' },
]

const links = [
  { title: 'How We Work', desc: 'The principles and delivery model behind every engagement.', to: '/how-we-work' },
  { title: 'Leadership', desc: 'The experienced team guiding Qlugen.', to: '/leadership' },
  { title: 'Careers', desc: 'Build what enterprises use next, alongside exceptional colleagues.', to: '/careers' },
]

export default function Company() {
  return (
    <Layout>
      <section style={{ background: 'var(--q-primary)', color: '#fff', padding: '8rem 0 6rem' }}>
        <Grid>
          <Column lg={14} md={7} sm={4}>
            <p className="section-label" style={{ color: 'var(--q-accent)' }}>Company</p>
            <h1 style={{ fontSize: 'clamp(3rem,7vw,5.5rem)', fontWeight: 700, color: '#fff', lineHeight: 1.05, letterSpacing: '-.02em', margin: '1rem 0 2rem' }}>
              Technology with enterprise ambition.
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,.7)', maxWidth: '42rem', lineHeight: 1.7, margin: 0 }}>
              Qlugen exists to help ambitious organisations move further with technology — combining deep technical capability with disciplined delivery and a focus on lasting outcomes.
            </p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h2 className="section-label">What we believe</h2>
          </Column>
        </Grid>
        <Grid>
          {beliefs.map(b => (
            <Column key={b.num} lg={5} md={4} sm={4}>
              <div className="belief-item">
                <span className="belief-bg-num">{b.num}</span>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            </Column>
          ))}
        </Grid>
      </section>

      <section style={{ background: 'var(--q-primary)', color: '#fff', padding: '5rem 0' }}>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label" style={{ color: 'var(--q-accent)' }}>Explore</p>
            <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem,2.5vw,2.25rem)', margin: '0 0 2.5rem' }}>More about Qlugen</h2>
          </Column>
        </Grid>
        <Grid>
          {links.map(l => (
            <Column key={l.to} lg={5} md={4} sm={4}>
              <Link to={l.to} className="co-panel">
                <h3>{l.title}</h3>
                <p>{l.desc}</p>
                <span className="co-panel-arrow">&rarr;</span>
              </Link>
            </Column>
          ))}
        </Grid>
      </section>

      <CTABanner heading="Want to work with Qlugen?" sub="Tell us what you're looking to transform." btnTo="/contact" />
    </Layout>
  )
}
