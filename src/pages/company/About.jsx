// Narrative, human, alternating editorial
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import '../../App.css'

const stands = [
  { title: 'Start with the outcome', desc: 'We define success in measurable business terms before choosing a single piece of technology. Clarity of outcome shapes every decision that follows.' },
  { title: 'Design for the people who use it', desc: 'Solutions are built around the employees, customers and stakeholders who rely on them. Real adoption is designed, not assumed.' },
  { title: 'Leave lasting capability behind', desc: 'We transfer knowledge and build reusable foundations so client teams own and extend what we deliver together.' },
]

export default function About() {
  return (
    <Layout>
      <section className="split-hero split-hero--light">
        <Grid>
          <Column lg={10} md={6} sm={4}>
            <p className="section-label">About Us</p>
            <h1>Built for what comes next.</h1>
            <p className="split-hero__sub">Qlugen is an enterprise technology firm helping ambitious organisations turn data, AI, cloud, automation and digital transformation into lasting business capability.</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={6} md={4} sm={4}>
            <h2 style={{ fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 700, color: 'var(--q-primary)' }}>One connected technology partner.</h2>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <p className="section-body">Enterprises no longer face isolated technology problems. Data, AI, cloud, security and automation are deeply interconnected — and solving them well requires a partner who can work across all of them as one connected capability.</p>
            <p className="section-body">We bring together specialists across data and analytics, AI and agent development, cloud and infrastructure, cybersecurity, automation, digital transformation and sustainability. Working as one team, we help organisations design and deliver technology that moves the business forward.</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h2 className="section-label">What we stand for</h2>
          </Column>
        </Grid>
        {stands.map(s => (
          <Grid key={s.title} style={{ marginTop: '2.5rem' }}>
            <Column lg={7} md={4} sm={4}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>{s.title}</h3>
            </Column>
            <Column lg={9} md={4} sm={4}>
              <p className="section-body" style={{ marginTop: '.5rem' }}>{s.desc}</p>
            </Column>
          </Grid>
        ))}
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={9} md={6} sm={4}>
            <p className="section-label">How we work differently</p>
            <h2>Rigour meets momentum</h2>
            <p className="section-body">Our delivery model creates progress at every stage — combining clear outcomes, thoughtful design and disciplined execution from first conversation to lasting capability.</p>
            <Link to="/how-we-work" className="cta-btn cta-btn--outline-dark" style={{ marginTop: '1.5rem' }}>
              See how we work <ArrowRight size={18} />
            </Link>
          </Column>
        </Grid>
      </section>

      <CTABanner heading="Ready to move further?" sub="Tell us what you're looking to transform." btnTo="/contact" />
    </Layout>
  )
}
