import { useState } from 'react'
import Layout from '../components/Layout'
import CTABanner from '../components/CTABanner'
import { Link } from 'react-router-dom'
import { Grid, Column } from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'
import '../App.css'

const principles = [
  { num: '01', title: 'Start with the outcome', desc: 'Every engagement begins by defining what success looks like measurably and in business terms.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80' },
  { num: '02', title: 'Design for real people', desc: 'Solutions are built around the employees, customers and stakeholders who will actually use them.', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80' },
  { num: '03', title: 'Build for scale from day one', desc: 'Architecture, security, integration and governance are considered early, not retrofitted later.', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80' },
  { num: '04', title: 'Leave lasting capability behind', desc: 'Engagements create reusable foundations and transfer knowledge to client teams.', img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1400&q=80' },
]

const phases = [
  { num: '01', label: 'Discover', desc: 'Understand the business challenge, current state, stakeholder priorities and constraints.' },
  { num: '02', label: 'Define', desc: 'Establish the outcomes, scope, approach and success measures for the engagement.' },
  { num: '03', label: 'Design', desc: 'Create the solution architecture, user experience and implementation plan.' },
  { num: '04', label: 'Build', desc: 'Deliver the solution iteratively with continuous integration of feedback and validation.' },
  { num: '05', label: 'Scale', desc: 'Extend, optimise and hand over the solution with full capability transfer.' },
]

export default function HowWeWork() {
  const [active, setActive] = useState(0)

  return (
    <Layout>
      <section className="page-hero">
        <Grid>
          <Column lg={11} md={6} sm={4}>
            <p className="section-label">How we work</p>
            <h1>Rigour meets momentum.</h1>
            <p className="page-hero__sub">The strongest transformations happen when clear outcomes, thoughtful design and disciplined execution move together from first conversation to lasting capability.</p>
          </Column>
        </Grid>
      </section>

      <section className="approach-section" style={{ paddingBottom: '5rem' }}>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Our principles</p>
            <h2>Four commitments behind every engagement</h2>
            <div className="approach-gallery">
              {principles.map((p, i) => (
                <div
                  key={p.num}
                  className={`approach-card${i === active ? ' approach-card--active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  <img src={p.img} alt="" className="approach-card-img" loading="lazy" decoding="async" />
                  <div className="approach-card-overlay" />
                  <div className="approach-card-content">
                    <span className="approach-card-num">Principle {p.num}</span>
                    <div className="approach-card-foot">
                      <h3 className="approach-card-title">{p.title}</h3>
                      <p className="approach-card-desc">{p.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--gray">
        <Grid>
          <Column lg={7} md={5} sm={4}>
            <p className="section-label">Our delivery model</p>
            <h2>A structured path from problem to capability</h2>
            <p className="section-body">Qlugen&apos;s delivery model is built to create progress at every stage, not just at the end of a long programme.</p>
            <Link to="/capabilities" className="cta-btn cta-btn--outline-dark" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              See our capabilities <ArrowRight size={18} />
            </Link>
          </Column>
          <Column lg={9} md={3} sm={4}>
            <div className="how-process-visual">
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80"
                alt=""
                className="how-process-visual__img"
                loading="lazy"
                decoding="async"
              />
              <div className="how-process-visual__overlay" />
            </div>
          </Column>
        </Grid>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <div className="delivery-stepper">
              {phases.map(p => (
                <div key={p.num} className="delivery-step">
                  <span className="delivery-step-num">Phase {p.num}</span>
                  <h3>{p.label}</h3>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <CTABanner
        heading="Ready to start with the outcome?"
        sub="Tell us about your challenge and we will help identify the strongest path forward."
        btnTo="/contact"
      />
    </Layout>
  )
}
