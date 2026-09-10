// Editorial transformation story, alternating sections
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import '../../App.css'

const pairs = [
  { title: 'Transformation Strategy', desc: 'Define the vision, priorities and roadmap that turn ambition into a deliverable programme — then design the digital products and platforms that create new value.', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80', alt: 'Team planning priorities together using a sticky-note board' },
  { title: 'Experience & Platforms', desc: 'Reshape customer and employee experiences around real journeys, and implement the core enterprise platforms that run the business day to day.', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80', alt: 'Software team collaborating on digital products and platforms' },
  { title: 'Modernisation & Operating Model', desc: 'Reduce legacy complexity and change how teams, processes and technology work together — so the change actually sticks.', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80', alt: 'Colleagues reviewing documents and business processes together' },
]

const outcomes = [
  { num: '01', title: 'Faster Innovation', desc: 'New capabilities reach customers sooner.' },
  { num: '02', title: 'Modern Experiences', desc: 'Experiences built around real needs.' },
  { num: '03', title: 'Simplified Operations', desc: 'Less complexity across the estate.' },
  { num: '04', title: 'New Capabilities', desc: 'Foundations for future growth.' },
]

const phases = [
  { num: '01', label: 'Assess', desc: 'Understand the current state, ambition and constraints.' },
  { num: '02', label: 'Envision', desc: 'Define the target operating model and roadmap.' },
  { num: '03', label: 'Design', desc: 'Shape products, platforms and experiences.' },
  { num: '04', label: 'Build', desc: 'Deliver iteratively with continuous validation.' },
  { num: '05', label: 'Adopt', desc: 'Embed change across teams and processes.' },
  { num: '06', label: 'Scale', desc: 'Extend and compound the capability built.' },
]

export default function DigitalTransformation() {
  return (
    <Layout>
      <section className="bleed-hero">
        <img className="bleed-hero-img" src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=80" alt="" />
        <div className="bleed-hero-scrim" />
        <div className="bleed-hero-content">
          <p className="section-label">Capability · Digital Transformation</p>
          <h1>Reimagine the enterprise.</h1>
          <p>Design and deliver end-to-end transformation programmes that modernise operations and unlock new digital capabilities.</p>
        </div>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={7} md={5} sm={4}>
            <p className="section-label">The transformation gap</p>
            <h2>Technology without change rarely sticks</h2>
            <p className="section-body">Digital transformation programmes often stall because they focus on technology rather than the business change needed to make technology stick. The gap is rarely technical — it is organisational.</p>
          </Column>
          <Column lg={7} md={3} sm={4}>
            <blockquote className="pull-quote" style={{ marginTop: '2.5rem' }}>
              <p>"The organisations that succeed treat transformation as a change in capability, not a change in tooling."</p>
            </blockquote>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal" style={{ paddingBottom: 0 }}>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">What Qlugen delivers</p>
            <h2 style={{ marginBottom: '2.5rem' }}>End-to-end, from strategy to adoption</h2>
          </Column>
        </Grid>
        <div style={{ marginTop: '1rem' }}>
          {pairs.map(p => (
            <div key={p.title} className="alt-row">
              <div className="alt-img"><img src={p.img} alt={p.alt} /></div>
              <div className="alt-text">
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="inner-section inner-section--dark">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Transformation outcomes</p>
            <h2>What strong transformation enables</h2>
            <div className="metric-row">
              {outcomes.map(m => (
                <div key={m.title} className="metric-block">
                  <div className="metric-block-num">{m.num}</div>
                  <p className="metric-block-title">{m.title}</p>
                  <p className="metric-block-desc">{m.desc}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Transformation roadmap</p>
            <h2>Six phases from ambition to capability</h2>
            <div className="timeline-row">
              {phases.map(p => (
                <div key={p.num} className="timeline-phase">
                  <span className="timeline-phase-num">Phase {p.num}</span>
                  <h3>{p.label}</h3>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading="Related capabilities" items={[
        { eyebrow: 'Capability', title: 'Cloud & Infrastructure', desc: 'Build the resilient foundations transformation depends on.', to: '/capabilities/cloud-infrastructure' },
        { eyebrow: 'Capability', title: 'Automation', desc: 'Remove friction from the processes you modernise.', to: '/capabilities/automation' },
      ]} />

      <CTABanner heading="Turn digital transformation into business impact." sub="Talk to Qlugen about your priorities." btnTo="/contact" />
    </Layout>
  )
}
