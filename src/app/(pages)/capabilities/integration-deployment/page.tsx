import Link from "next/link";
import {
  ArrowUpRight,
  Globe,
  AppWindow,
  Database,
  BookOpen,
  MessageSquareMore,
  Wrench,
  BrainCircuit,
  ShieldCheck,
  Zap,
  Activity,
  BarChart2,
  Cloud,
  Lock,
  Workflow,
  ScanText,
  Bot,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CTA from "@/components/shadcn-space/blocks/cta-01/cta";
import { blogPosts } from "@/lib/blog-data";
import InternalPageHeader from "@/components/internal-page-header";

// ─── Data ─────────────────────────────────────────────────────────────────────

const valuePoints = [
  {
    title: "Connect",
    body: "Bring AI together with business systems, APIs and data.",
  },
  {
    title: "Deploy",
    body: "Move AI applications from prototype environments into production.",
  },
  {
    title: "Operate",
    body: "Build systems that can be monitored, maintained and improved over time.",
  },
];

const integrationTypes = [
  {
    Icon: Globe,
    title: "APIs & Services",
    body: "Connect internal and external APIs to AI applications and agents.",
  },
  {
    Icon: AppWindow,
    title: "Business Applications",
    body: "Integrate AI into existing operational and enterprise software.",
  },
  {
    Icon: Database,
    title: "Databases & Data Platforms",
    body: "Give AI controlled access to structured business information.",
  },
  {
    Icon: BookOpen,
    title: "Knowledge & Documents",
    body: "Connect document repositories and knowledge bases for grounded AI experiences.",
  },
  {
    Icon: MessageSquareMore,
    title: "Communication Platforms",
    body: "Integrate AI workflows with messaging, email and collaboration systems.",
  },
  {
    Icon: Wrench,
    title: "Custom Internal Systems",
    body: "Connect legacy or purpose-built applications through appropriate integration layers.",
  },
];

const integrationLayers = [
  {
    Icon: Database,
    title: "Data",
    body: "Identify and connect the information required by the AI workflow.",
  },
  {
    Icon: Globe,
    title: "APIs",
    body: "Expose controlled actions through reliable service integrations.",
  },
  {
    Icon: ShieldCheck,
    title: "Identity & Permissions",
    body: "Ensure users and agents access only appropriate information and actions.",
  },
  {
    Icon: BrainCircuit,
    title: "AI Layer",
    body: "Connect models, context, tools and workflow logic into the application.",
  },
];

const deploymentAreas = [
  {
    Icon: Cloud,
    title: "Environment",
    body: "Set up appropriate development, testing and production environments.",
  },
  {
    Icon: ShieldCheck,
    title: "Reliability",
    body: "Handle failures, retries and external service issues gracefully.",
  },
  {
    Icon: Lock,
    title: "Security",
    body: "Apply appropriate authentication, permissions and data handling controls.",
  },
  {
    Icon: Zap,
    title: "Performance",
    body: "Optimise response time and system behaviour for real usage.",
  },
  {
    Icon: Activity,
    title: "Monitoring",
    body: "Track technical health, AI behaviour and important application events.",
  },
  {
    Icon: BarChart2,
    title: "Cost",
    body: "Monitor model and infrastructure usage to keep operating costs visible.",
  },
];

const deploymentSteps = [
  {
    step: "01",
    title: "Assess",
    body: "Understand the existing application, infrastructure, APIs and business systems.",
  },
  {
    step: "02",
    title: "Architect",
    body: "Define how the AI application should connect, communicate and operate.",
  },
  {
    step: "03",
    title: "Integrate",
    body: "Build and test the required data and system connections.",
  },
  {
    step: "04",
    title: "Deploy",
    body: "Launch into the appropriate production environment.",
  },
  {
    step: "05",
    title: "Monitor & Improve",
    body: "Track performance, reliability, AI quality and operating cost.",
  },
];

const whatWeDeploy = [
  {
    Icon: AppWindow,
    title: "AI Web Applications",
    body: "Production AI-powered customer or employee applications.",
  },
  {
    Icon: Bot,
    title: "AI Agents",
    body: "Agents connected to knowledge, APIs and business tools.",
  },
  {
    Icon: Wrench,
    title: "Internal AI Tools",
    body: "Purpose-built tools for operations and internal teams.",
  },
  {
    Icon: MessageSquareMore,
    title: "AI Copilots",
    body: "AI experiences embedded into existing workflows.",
  },
  {
    Icon: ScanText,
    title: "Document Intelligence Systems",
    body: "Automated document extraction and processing workflows.",
  },
  {
    Icon: Workflow,
    title: "AI Workflow Automation",
    body: "AI connected across multiple applications and business processes.",
  },
];

const techCategories = [
  { Icon: BrainCircuit, label: "AI Models" },
  { Icon: Globe,        label: "APIs" },
  { Icon: AppWindow,    label: "Business Applications" },
  { Icon: Database,     label: "Databases" },
  { Icon: Cloud,        label: "Cloud Infrastructure" },
  { Icon: Lock,         label: "Authentication & Identity" },
  { Icon: Activity,     label: "Observability" },
  { Icon: Layers,       label: "Workflow Systems" },
];

const insightPosts = blogPosts.slice(0, 3);

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function IntegrationDeploymentPage() {
  return (
    <div>
            <InternalPageHeader
        eyebrow="Integration & Deployment"
        title="Connect AI to the systems that run your business."
      />

      {/* ── S2: Intro ────────────────────────────────────────────────────── */}
      <section className="border-t">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-6">
                AI becomes useful when it connects to your workflow.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A standalone AI model can answer questions. A production AI system
                needs access to the right information, tools and business applications.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Qlugen builds the integration layer that allows AI products and agents
                to work safely across your existing technology ecosystem.
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

      {/* ── S3: What We Integrate ────────────────────────────────────────── */}
      <section className="border-t bg-muted/30" aria-labelledby="integration-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
              Integration
            </p>
            <h2 id="integration-heading" className="text-3xl md:text-4xl font-medium tracking-tight">
              Connect AI across your technology ecosystem.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {integrationTypes.map(({ Icon, title, body }) => (
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

      {/* ── S4: Integration Approach ─────────────────────────────────────── */}
      <section id="approach" className="border-t" aria-labelledby="approach-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
                How we connect
              </p>
              <h2 id="approach-heading" className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                The right data. The right tools. The right access.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Each layer of integration gives the AI system what it needs to be
                useful — without exposing more than is appropriate.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {integrationLayers.map(({ Icon, title, body }) => (
                <div key={title} className="p-5 rounded-xl border bg-muted/40">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── S5: From Prototype to Production ─────────────────────────────── */}
      <section className="border-t bg-muted/30" aria-labelledby="production-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
                Deployment
              </p>
              <h2 id="production-heading" className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                Move beyond the demo.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Production deployment requires more than hosting an AI application.
                The complete system needs reliability, security controls, monitoring
                and an architecture that fits real usage.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {deploymentAreas.map(({ Icon, title, body }) => (
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

      {/* ── S6: Deployment Workflow ──────────────────────────────────────── */}
      <section className="border-t" aria-labelledby="deploy-steps-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mb-12">
            <h2 id="deploy-steps-heading" className="text-3xl md:text-4xl font-medium tracking-tight">
              A practical path to production.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {deploymentSteps.map(({ step, title, body }) => (
              <div key={step} className="rounded-2xl border bg-card p-5 flex flex-col gap-3">
                <span className="text-xs font-bold text-primary tracking-widest">{step}</span>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S7: What We Help Deploy ──────────────────────────────────────── */}
      <section className="border-t bg-muted/30" aria-labelledby="deploy-types-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mb-12">
            <h2 id="deploy-types-heading" className="text-3xl md:text-4xl font-medium tracking-tight">
              Production systems we help deliver.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {whatWeDeploy.map(({ Icon, title, body }) => (
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

      {/* ── S8: Technology Approach ──────────────────────────────────────── */}
      <section className="border-t" aria-labelledby="tech-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
                Technology approach
              </p>
              <h2 id="tech-heading" className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                Work with the systems you already have.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Qlugen designs integrations around your existing technology environment
                rather than forcing a complete platform replacement.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {techCategories.map(({ Icon, label }) => (
                <div
                  key={label}
                  className="rounded-xl border bg-muted/40 p-4 flex flex-col items-start gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-medium leading-snug">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── S9: Related Capabilities ─────────────────────────────────────── */}
      <section className="border-t bg-muted/30" aria-labelledby="related-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <h2 id="related-heading" className="text-3xl md:text-4xl font-medium tracking-tight mb-10">
            Need more than integration?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border bg-card p-8 flex flex-col gap-5">
              <div>
                <h3 className="text-lg font-semibold mb-2">AI Product Development</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Design and build the applications and experiences powered by AI.
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
                <h3 className="text-lg font-semibold mb-2">AI Agents & Automation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Build intelligent agents that can use integrations to complete business workflows.
                </p>
              </div>
              <Link href="/capabilities/ai-agents-automation" className="mt-auto w-fit">
                <Button variant="outline" className="rounded-full gap-2 cursor-pointer">
                  Explore AI Agents & Automation <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── S10: Insights ────────────────────────────────────────────────── */}
      <section className="border-t" aria-labelledby="insights-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
            <h2 id="insights-heading" className="text-3xl md:text-4xl font-medium tracking-tight max-w-xl">
              Ideas for connecting AI to production
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
