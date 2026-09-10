// Culture-first, people-focused
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight, Tools, Growth, Certificate } from '@carbon/icons-react'
import '../../App.css'

const culture = [
  { icon: Tools, word: 'Craft', desc: 'We care about how things are built. Depth, rigour and quality are how we work — not an afterthought.' },
  { icon: Growth, word: 'Impact', desc: 'We work on the technology challenges that matter most to large organisations, and we measure ourselves by outcomes.' },
  { icon: Certificate, word: 'Ownership', desc: 'People here take responsibility from first conversation to lasting capability — and grow quickly because of it.' },
]

const working = ['Start with the outcome', 'Design for real people', 'Build for scale from day one', 'Leave lasting capability behind']

const areas = ['Data & Analytics', 'AI & Agent Development', 'Cloud & Infrastructure', 'Cybersecurity', 'Automation', 'Enterprise Architecture', 'Consulting & Delivery', 'Digital Transformation']

const cultureFrames = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
]

export default function Careers() {
  return (
    <Layout>
      <section className="careers-hero">
        <Grid>
          <Column lg={7} md={4} sm={4}>
            <p className="section-label">Careers</p>
            <h1>Build what enterprises use next.</h1>
            <p className="split-hero__sub">
              Qlugen is a place for people who want to solve hard problems, work across the full breadth of enterprise technology, and see their work create real outcomes.
            </p>
          </Column>
          <Column lg={9} md={4} sm={4}>
            <div className="careers-collage">
              {cultureFrames.map((src, index) => (
                <div key={src} className={`careers-collage__frame careers-collage__frame--${index + 1}`}>
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Why Qlugen</p>
            <h2>Meaningful problems, exceptional colleagues</h2>
            <div className="culture-row">
              {culture.map(({ icon: Icon, word, desc }) => (
                <div key={word} className="culture-item">
                  <Icon size={28} />
                  <div className="culture-word">{word}</div>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label">How we work</p>
            <h2>Outcomes, ownership and growth</h2>
            <p className="section-body">Our teams start with the outcome, design for the people who use what we build, and take ownership from first conversation to lasting capability.</p>
            <Link to="/how-we-work" className="cta-btn cta-btn--outline-dark" style={{ marginTop: '1.5rem' }}>
              See how we work <ArrowRight size={18} />
            </Link>
          </Column>
          <Column lg={7} md={2} sm={4}>
            <ul className="solutions-list" style={{ marginTop: 0 }}>
              {working.map(w => <li key={w}>{w}</li>)}
            </ul>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Areas we hire</p>
            <h2>Where you might fit</h2>
            <div className="flow-list">
              {areas.map(a => (
                <div key={a} className="flow-item"><div><span data-heading-visual className="career-area-label">{a}</span></div></div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={9} md={6} sm={4}>
            <p className="section-label">Open roles</p>
            <h2>Introduce yourself</h2>
            <p className="section-body">We don't have published openings right now. You can still introduce yourself — we're always glad to hear from talented people who want to build what enterprises use next.</p>
            <Link to="/contact" className="cta-btn cta-btn--primary" style={{ marginTop: '1.5rem' }}>
              Get in touch <ArrowRight size={18} />
            </Link>
          </Column>
        </Grid>
      </section>

      <CTABanner heading="Think you'd be a fit?" sub="Tell us about yourself and what you'd like to work on." btnText="Introduce yourself" btnTo="/contact" />
    </Layout>
  )
}
