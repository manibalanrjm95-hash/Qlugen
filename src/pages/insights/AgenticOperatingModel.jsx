// Editorial reading layout
import Layout from '../../components/Layout'
import { Grid, Column } from '@carbon/react'
import { Link } from 'react-router-dom'
import { ArrowRight } from '@carbon/icons-react'
import '../../App.css'

export default function AgenticOperatingModel() {
  return (
    <Layout>
      <section className="article-page-hero">
        <Grid>
          <Column lg={10} md={5} sm={4}>
            <span className="article-category">Agentic AI</span>
            <h1 className="article-title">Designing the operating model for an agentic enterprise</h1>
            <p className="article-subtitle">What changes when AI agents become active participants in enterprise workflows.</p>
          </Column>
          <Column lg={6} md={3} sm={4}>
            <div className="article-meta-block">June 2026<br />9 min read</div>
          </Column>
        </Grid>
      </section>

      <section className="article-reading">
        <Grid>
          <Column lg={{ span: 8, offset: 4 }} md={6} sm={4}>
            <div className="article-body-col">
              <h2>From assistants to agents</h2>
              <p>Most enterprises have grown comfortable with AI assistants — tools that respond to prompts and help people work faster. Agents are different. They take actions, make decisions within defined boundaries, and carry out multi-step tasks with a degree of autonomy.</p>

              <blockquote className="article-pull-quote"><p>"An assistant that produces a poor answer wastes a moment; an agent that takes a poor action affects a system. Designing for agents means designing for consequence."</p></blockquote>

              <h2>Human and agent responsibilities</h2>
              <p>An agentic operating model needs a clear division of responsibility between people and agents. Which decisions can an agent make independently? Which require human approval? Where does accountability sit when an agent acts?</p>
              <p>These questions are organisational as much as technical. The most effective designs define explicit boundaries for agent autonomy and keep humans firmly in the loop for decisions that carry significant risk or judgement.</p>

              <hr className="article-hr" />

              <h2>Governance</h2>
              <p>As agents take on more responsibility, governance moves from the periphery to the centre of the operating model. Policies for what agents may do, what data they may access and how their actions are constrained become foundational rather than optional. Effective governance is designed in, not bolted on.</p>

              <h2>Tool access</h2>
              <p>Agents create value through the tools and systems they can act on — but every tool an agent can use is also a capability that must be controlled. Principled approaches grant agents the minimum access required for their task, make that access explicit and auditable, and treat the expansion of tool access as a deliberate decision rather than a default.</p>

              <hr className="article-hr" />

              <h2>Observability</h2>
              <p>You cannot govern what you cannot see. An agentic enterprise depends on observability — the ability to understand what agents are doing, why, and with what effect. Traceability of agent actions, clear logging and meaningful monitoring are what make it possible to trust agents with greater responsibility.</p>

              <h2>Scaling agent ecosystems</h2>
              <p>A single well-governed agent is a manageable thing. An ecosystem of many agents, interacting with each other and with human workflows, is a different order of complexity. Scaling requires shared foundations — common governance, reusable capabilities and consistent observability. Organisations that approach agents with platform thinking are positioned to scale coherently.</p>

              <div className="article-end-cta">
                <p>Ready to design your agentic operating model?</p>
                <Link to="/contact" className="cta-btn cta-btn--primary">Talk to Qlugen <ArrowRight size={18} /></Link>
              </div>
            </div>
          </Column>
        </Grid>
      </section>
    </Layout>
  )
}
