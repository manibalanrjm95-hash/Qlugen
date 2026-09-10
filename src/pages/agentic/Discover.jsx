// Lighter, exploratory — discovery methodology
import Layout from '../../components/Layout'
import CTABanner from '../../components/CTABanner'
import RelatedCards from '../../components/RelatedCards'
import { Grid, Column } from '@carbon/react'
import { Search, Analytics, ListChecked, Rule, ChartLineData } from '@carbon/icons-react'
import '../../App.css'

const journey = [
  { icon: Search, label: 'Opportunity Discovery' },
  { icon: Analytics, label: 'Workflow Analysis' },
  { icon: ListChecked, label: 'Use-Case Prioritisation' },
  { icon: Rule, label: 'Feasibility' },
  { icon: ChartLineData, label: 'Value Assessment' },
]

const analyse = [
  { title: 'Business workflows', desc: 'Where does effort concentrate, and where would intelligence create leverage?' },
  { title: 'Data readiness', desc: 'Is the data available, accessible and good enough to support the use case?' },
  { title: 'Feasibility', desc: 'Can this be delivered reliably with acceptable effort and risk?' },
  { title: 'Measurable value', desc: 'Will it move a business metric that matters — and can we prove it?' },
]

export default function Discover() {
  return (
    <Layout>
      <section className="split-hero split-hero--light">
        <Grid>
          <Column lg={9} md={6} sm={4}>
            <p className="section-label">Agentic Enterprise · 03</p>
            <h1>Find where intelligence creates value.</h1>
            <p className="split-hero__sub">Identify high-value AI opportunities mapped to real business workflows and measurable outcomes.</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <p className="section-label">Why it matters</p>
            <h2>Not every workflow is worth automating</h2>
            <p className="section-body">The organisations that get the most from AI start by finding the right opportunities — the workflows where intelligence creates measurable value and is feasible to deliver. Disciplined discovery prevents wasted investment in capabilities that never move a business metric.</p>
          </Column>
        </Grid>
      </section>

      <section className="inner-section inner-section--teal">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <p className="section-label">Discovery methodology</p>
            <h2>Five phases from question to prioritised roadmap</h2>
            <div className="journey-flow">
              {journey.map(({ icon: Icon, label }, i) => (
                <span key={label} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <div className="journey-node">
                    <div className="journey-node-circle" style={{ background: '#fff' }}><Icon size={22} /></div>
                    <span data-heading-visual className="diagram-label">{label}</span>
                  </div>
                  {i < journey.length - 1 && <div className="journey-connector" />}
                </span>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <section className="inner-section">
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <p className="section-label">What we analyse</p>
            <h2>Finding the right opportunities</h2>
            <div className="flow-list">
              {analyse.map(a => (
                <div key={a.title} className="flow-item">
                  <div><h3>{a.title}</h3><p>{a.desc}</p></div>
                </div>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      <RelatedCards heading="Explore the agentic stages" items={[
        { eyebrow: 'Stage 02', title: 'Build & Run', desc: 'Engineer the opportunities you prioritise.', to: '/agentic-ai/build-run' },
        { eyebrow: 'Stage 04', title: 'Govern', desc: 'Keep intelligence within trusted boundaries.', to: '/agentic-ai/govern' },
      ]} />

      <CTABanner heading="Ready to find where AI creates value?" sub="Talk to Qlugen about discovering and prioritising high-value use cases." btnTo="/contact" />
    </Layout>
  )
}
