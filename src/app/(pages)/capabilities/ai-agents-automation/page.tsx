import Link from "next/link";
import {
  ArrowUpRight,
  HeadphonesIcon,
  BookOpen,
  Settings2,
  TrendingUp,
  ScanText,
  Network,
  BrainCircuit,
  Database,
  Wrench,
  Layers,
  ShieldCheck,
  Activity,
  CheckCircle,
  GitFork,
  Lock,
  Eye,
  Bot,
  FileText,
  MessageSquareMore,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CTA from "@/components/shadcn-space/blocks/cta-01/cta";
import { blogPosts } from "@/lib/blog-data";
import InternalPageHeader from "@/components/internal-page-header";

// ─── Data ─────────────────────────────────────────────────────────────────────

const valuePoints = [
  {
    title: "Understand",
    body: "Interpret requests, context and business information.",
  },
  {
    title: "Act",
    body: "Use tools, APIs and connected systems to perform tasks.",
  },
  {
    title: "Coordinate",
    body: "Complete multi-step workflows with rules, context and human approvals where required.",
  },
];

const agentTypes = [
  {
    Icon: HeadphonesIcon,
    title: "Customer Service Agents",
    body: "Handle common requests, search knowledge and help teams resolve customer issues faster.",
  },
  {
    Icon: BookOpen,
    title: "Internal Knowledge Agents",
    body: "Help employees search, understand and use company knowledge across documents and systems.",
  },
  {
    Icon: Settings2,
    title: "Operations Agents",
    body: "Automate repetitive work involving research, validation, data entry and system updates.",
  },
  {
    Icon: TrendingUp,
    title: "Sales & Service Copilots",
    body: "Give teams contextual information, recommendations and next actions inside their workflows.",
  },
  {
    Icon: ScanText,
    title: "Document Processing Agents",
    body: "Read, classify, extract and route information from business documents.",
  },
  {
    Icon: Network,
    title: "Multi-Agent Workflows",
    body: "Coordinate specialised agents and tools across more complex business processes.",
  },
];

const agentSteps = [
  {
    step: "01",
    title: "Understand",
    body: "Receive a request, event or workflow trigger.",
  },
  {
    step: "02",
    title: "Retrieve Context",
    body: "Gather relevant knowledge, user context and business data.",
  },
  {
    step: "03",
    title: "Decide",
    body: "Determine the next action using instructions, rules and available tools.",
  },
  {
    step: "04",
    title: "Act",
    body: "Call APIs, search systems, update records or complete workflow actions.",
  },
  {
    step: "05",
    title: "Verify",
    body: "Check the result or route sensitive/uncertain actions for human approval.",
  },
];

const automationLevels = [
  {
    level: "01",
    title: "Workflow Automation",
    desc: "For predictable rule-based processes.",
    examples: ["Notifications", "Approvals", "Data movement", "Scheduled actions", "System updates"],
  },
  {
    level: "02",
    title: "AI-Assisted Automation",
    desc: "AI understands unstructured information before triggering a defined workflow.",
    examples: ["Document classification", "Email understanding", "Extraction", "Summarisation", "Intelligent routing"],
  },
  {
    level: "03",
    title: "Agentic Automation",
    desc: "AI determines which actions and tools are needed to complete a broader objective.",
    examples: ["Investigate customer issues", "Gather information across systems", "Generate recommendations", "Multi-step operational tasks", "Escalate exceptions"],
  },
];

const humanControl = [
  {
    Icon: CheckCircle,
    title: "Approval Gates",
    body: "Require human approval before sensitive actions.",
  },
  {
    Icon: GitFork,
    title: "Escalation",
    body: "Send uncertain or exceptional cases to the right person.",
  },
  {
    Icon: Lock,
    title: "Permissions",
    body: "Control which systems, information and actions an agent can access.",
  },
  {
    Icon: Eye,
    title: "Auditability",
    body: "Maintain visibility into important agent actions and workflow outcomes.",
  },
];

const useCases = [
  {
    Icon: HeadphonesIcon,
    title: "Customer Operations",
    body: "Investigate requests and help teams resolve issues faster.",
  },
  {
    Icon: Settings2,
    title: "Back-Office Operations",
    body: "Reduce repetitive processing and system updates.",
  },
  {
    Icon: BookOpen,
    title: "Knowledge & Research",
    body: "Search internal knowledge and bring information together.",
  },
  {
    Icon: TrendingUp,
    title: "Sales Operations",
    body: "Prepare account context and support follow-up workflows.",
  },
  {
    Icon: FileText,
    title: "Document Operations",
    body: "Process forms, invoices, reports and other documents.",
  },
  {
    Icon: MessageSquareMore,
    title: "Internal Support",
    body: "Help employees find information and automate common service workflows.",
  },
];

const productionBlocks = [
  {
    Icon: BrainCircuit,
    title: "Models",
    body: "Select models based on quality, speed and cost.",
  },
  {
    Icon: Database,
    title: "Knowledge",
    body: "Connect relevant documents, databases and business information.",
  },
  {
    Icon: Wrench,
    title: "Tools",
    body: "Give agents controlled access to APIs and systems.",
  },
  {
    Icon: Layers,
    title: "Context",
    body: "Maintain the information needed across interactions and tasks.",
  },
  {
    Icon: ShieldCheck,
    title: "Guardrails",
    body: "Define permissions, rules and boundaries.",
  },
  {
    Icon: Activity,
    title: "Evaluation & Monitoring",
    body: "Track quality, failures, usage and workflow outcomes.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Identify",
    body: "Find a repetitive or valuable workflow suitable for AI.",
  },
  {
    step: "02",
    title: "Map",
    body: "Understand users, decisions, systems, data and exceptions.",
  },
  {
    step: "03",
    title: "Prototype",
    body: "Test the agent with representative real-world tasks.",
  },
  {
    step: "04",
    title: "Integrate",
    body: "Connect knowledge, APIs, tools and business systems.",
  },
  {
    step: "05",
    title: "Deploy & Improve",
    body: "Launch with monitoring, human oversight and continuous evaluation.",
  },
];

const insightPosts = blogPosts.slice(0, 3);

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AIAgentsAutomationPage() {
  return (
    <div>
            <InternalPageHeader
        eyebrow="AI Agents & Automation"
        title="AI that does the work, not just answers questions."
      />

      {/* ── S2: Intro ────────────────────────────────────────────────────── */}
      <section className="border-t">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-6">
                Move beyond simple chatbots.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Traditional assistants mainly respond to questions. AI agents can go
                further — gathering information, reasoning through tasks, using tools,
                calling APIs and coordinating actions across business systems.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {valuePoints.map((vp) => (
                <div key={vp.title} className="p-5 rounded-xl border bg-muted/40">
                  <h3 className="font-semibold mb-1.5">{vp.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{vp.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── S3: Agent Capabilities ───────────────────────────────────────── */}
      <section className="border-t bg-muted/30" aria-labelledby="agent-types-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
              Agent capabilities
            </p>
            <h2 id="agent-types-heading" className="text-3xl md:text-4xl font-medium tracking-tight">
              Agents designed around real workflows.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {agentTypes.map(({ Icon, title, body }) => (
              <div key={title} className="rounded-2xl border bg-card p-6 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S4: How An Agent Works ───────────────────────────────────────── */}
      <section id="how-it-works" className="border-t" aria-labelledby="agent-flow-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
              How it works
            </p>
            <h2 id="agent-flow-heading" className="text-3xl md:text-4xl font-medium tracking-tight">
              From request to completed task.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {agentSteps.map(({ step, title, body }) => (
              <div key={step} className="rounded-2xl border bg-card p-5 flex flex-col gap-3">
                <span className="text-xs font-bold text-primary tracking-widest">{step}</span>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S5: Types of Automation ──────────────────────────────────────── */}
      <section className="border-t bg-muted/30" aria-labelledby="automation-levels-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mb-12">
            <h2 id="automation-levels-heading" className="text-3xl md:text-4xl font-medium tracking-tight">
              From automation to agentic workflows.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {automationLevels.map(({ level, title, desc, examples }) => (
              <div key={level} className="rounded-2xl border bg-card p-6 flex flex-col gap-4">
                <div>
                  <span className="text-xs font-bold text-primary tracking-widest block mb-2">{level}</span>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t">
                  {examples.map((ex) => (
                    <Badge key={ex} variant="secondary" className="text-xs h-auto px-2 py-0.5 font-normal">
                      {ex}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S6: Human Control ────────────────────────────────────────────── */}
      <section className="border-t" aria-labelledby="human-control-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
                Human-in-the-loop
              </p>
              <h2 id="human-control-heading" className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                Autonomous where useful. Human where important.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Not every business decision should be fully automated. Qlugen designs
                the right level of human control based on workflow risk and complexity.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {humanControl.map(({ Icon, title, body }) => (
              <div key={title} className="rounded-xl border bg-card p-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S7: Where Agents Create Value ────────────────────────────────── */}
      <section className="border-t bg-muted/30" aria-labelledby="use-cases-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mb-12">
            <h2 id="use-cases-heading" className="text-3xl md:text-4xl font-medium tracking-tight">
              Where agents create value.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map(({ Icon, title, body }) => (
              <div key={title} className="rounded-xl border bg-card p-5 flex gap-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S8: Production Agent Foundation ──────────────────────────────── */}
      <section className="border-t" aria-labelledby="production-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
                Built for production
              </p>
              <h2 id="production-heading" className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                More than a model and a prompt.
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productionBlocks.map(({ Icon, title, body }) => (
              <div key={title} className="rounded-xl border bg-card p-5 flex gap-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S9: Process ──────────────────────────────────────────────────── */}
      <section className="border-t bg-muted/30" aria-labelledby="process-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mb-12">
            <h2 id="process-heading" className="text-3xl md:text-4xl font-medium tracking-tight">
              Start with one useful workflow.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {processSteps.map(({ step, title, body }) => (
              <div key={step} className="rounded-2xl border bg-card p-5 flex flex-col gap-3">
                <span className="text-xs font-bold text-primary tracking-widest">{step}</span>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S10: Related Capabilities ────────────────────────────────────── */}
      <section className="border-t" aria-labelledby="related-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <h2 id="related-heading" className="text-3xl md:text-4xl font-medium tracking-tight mb-10">
            Need more than agents?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border bg-card p-8 flex flex-col gap-5">
              <div>
                <h3 className="text-lg font-semibold mb-2">AI Product Development</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Design the applications and experiences through which users interact with AI.
                </p>
              </div>
              <Link href="/capabilities/ai-product-development" className="mt-auto w-fit">
                <Button variant="outline" className="rounded-full gap-2 cursor-pointer">
                  Explore AI Product Development <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="rounded-2xl border bg-card p-8 flex flex-col gap-5">
              <div>
                <h3 className="text-lg font-semibold mb-2">Integration & Deployment</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect agents with business systems and deploy them reliably into production.
                </p>
              </div>
              <Link href="/capabilities/integration-deployment" className="mt-auto w-fit">
                <Button variant="outline" className="rounded-full gap-2 cursor-pointer">
                  Explore Integration & Deployment <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── S11: Insights ────────────────────────────────────────────────── */}
      <section className="border-t bg-muted/30" aria-labelledby="insights-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
            <h2 id="insights-heading" className="text-3xl md:text-4xl font-medium tracking-tight max-w-xl">
              Ideas for building better AI agents
            </h2>
            <Link href="/tech-blogs" className="shrink-0">
              <Button variant="outline" className="rounded-full gap-2 cursor-pointer">
                Explore Tech Blogs <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {insightPosts.map((post) => (
              <Link key={post.slug} href={`/tech-blogs/${post.slug}`} className="group block">
                <article className="rounded-2xl border bg-card p-6 hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h3 className="text-base font-medium tracking-tight mb-3 group-hover:text-primary transition-colors flex-1 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-5">
                    {post.excerpt}
                  </p>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary mt-auto">
                    Read article <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <CTA />
    </div>
  );
}
