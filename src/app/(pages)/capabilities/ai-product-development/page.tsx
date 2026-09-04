import Link from "next/link";
import {
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/lib/blog-data";
import CardImage from "@/components/card-image";
import InternalPageHeader from "@/components/internal-page-header";

// ─── Data ─────────────────────────────────────────────────────────────────────

const valuePoints = [
  {
    title: "Product-first",
    body: "Start with the user, workflow and business problem before choosing the technology.",
  },
  {
    title: "AI-native",
    body: "Design experiences around what modern AI models can actually do.",
  },
  {
    title: "Production-ready",
    body: "Build with reliability, integration, security and scalability in mind from the beginning.",
  },
];

const whatWeBuild = [
  {
    imageSrc: "product",
    title: "AI-Powered Applications",
    body: "Custom web or internal applications built around AI capabilities.",
  },
  {
    imageSrc: "workflow",
    title: "AI Copilots",
    body: "Assistants embedded into existing workflows to help users research, create, analyse and act faster.",
  },
  {
    imageSrc: "editorial",
    title: "Knowledge Assistants",
    body: "AI systems that understand company documents, knowledge bases and internal information.",
  },
  {
    imageSrc: "data",
    title: "Document Intelligence Products",
    body: "Applications that extract, understand and process information from documents.",
  },
  {
    imageSrc: "editorial",
    title: "AI Search & Discovery",
    body: "Natural-language experiences that help users find and understand information faster.",
  },
  {
    imageSrc: "systems",
    title: "Internal AI Tools",
    body: "Purpose-built AI tools for operations, service, sales, finance and other business teams.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Discover",
    body: "Understand users, workflows, business goals, data and existing systems.",
  },
  {
    step: "02",
    title: "Define",
    body: "Select the right AI use case, experience and technical approach.",
  },
  {
    step: "03",
    title: "Prototype",
    body: "Build and test a working concept quickly with real workflows and representative data.",
  },
  {
    step: "04",
    title: "Build",
    body: "Develop the production product, AI layer, interfaces and integrations.",
  },
  {
    step: "05",
    title: "Launch & Improve",
    body: "Deploy, monitor real usage and continuously improve quality, cost and user experience.",
  },
];

const productionConcerns = [
  {
    imageSrc: "editorial",
    title: "Quality",
    body: "Evaluate outputs and improve response relevance for real use cases.",
  },
  {
    imageSrc: "workflow",
    title: "Speed",
    body: "Design experiences and architecture around acceptable response times.",
  },
  {
    imageSrc: "systems",
    title: "Reliability",
    body: "Handle failures, edge cases and inconsistent model behaviour safely.",
  },
  {
    imageSrc: "data",
    title: "Context",
    body: "Connect business data and knowledge so AI can provide useful, grounded responses.",
  },
  {
    imageSrc: "people",
    title: "User Experience",
    body: "Design clear human-AI interactions that users can understand and trust.",
  },
  {
    imageSrc: "data",
    title: "Scale & Cost",
    body: "Choose models and infrastructure based on performance, usage and operating cost.",
  },
];

const techCategories = [
  { imageSrc: "agents", label: "Large Language Models" },
  { imageSrc: "data", label: "Retrieval & Knowledge Systems" },
  { imageSrc: "workflow", label: "APIs & Business Systems" },
  { imageSrc: "systems", label: "Cloud Infrastructure" },
  { imageSrc: "data", label: "Databases & Vector Search" },
  { imageSrc: "editorial", label: "Evaluation & Monitoring" },
];

const useCases = [
  {
    imageSrc: "people",
    title: "Customer Support",
    body: "Help teams answer, investigate and resolve customer requests faster.",
  },
  {
    imageSrc: "workflow",
    title: "Operations",
    body: "Reduce manual research, data entry and repetitive operational work.",
  },
  {
    imageSrc: "editorial",
    title: "Knowledge Management",
    body: "Make internal company knowledge easier to search and use.",
  },
  {
    imageSrc: "data",
    title: "Sales",
    body: "Give teams faster access to account, product and customer information.",
  },
  {
    imageSrc: "workflow",
    title: "Document Workflows",
    body: "Understand and process high volumes of business documents.",
  },
  {
    imageSrc: "editorial",
    title: "Decision Support",
    body: "Bring information together to help teams make better-informed decisions.",
  },
];

const insightPosts = blogPosts.slice(0, 3);

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AIProductDevelopmentPage() {
  return (
    <div className="internal-page">
            <InternalPageHeader
        eyebrow="AI Product Development"
        title="Build AI products people actually use."
      />

      {/* ── S2: Intro / Value ────────────────────────────────────────────── */}
      <section className="border-t">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-6">
                From AI concept to working product.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                AI prototypes are easy to create. Building an AI product that works
                reliably for real users is harder.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Qlugen works across product strategy, experience design, AI engineering
                and integration to turn promising ideas into useful systems that fit
                real business workflows.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {valuePoints.map((vp) => (
                <div key={vp.title} className="p-5 rounded-xl border bg-muted/40">
                  <CardImage src="product" seed={vp.title} className="mb-4 h-24 w-full" />
                  <h3 className="font-semibold mb-1.5">{vp.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{vp.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── S3: What We Build ────────────────────────────────────────────── */}
      <section className="border-t bg-muted/30" aria-labelledby="what-we-build">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
              What we build
            </p>
            <h2 id="what-we-build" className="text-3xl md:text-4xl font-medium tracking-tight">
              AI products for real business workflows.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whatWeBuild.map(({ imageSrc, title, body }) => (
              <div key={title} className="group rounded-2xl border bg-card overflow-hidden transition-all duration-200 hover:border-primary/20 hover:shadow-sm hover:shadow-primary/5 hover:-translate-y-0.5">
                <div className="relative w-full aspect-[3/2] overflow-hidden">
                  <CardImage src={imageSrc} seed={title} className="h-full w-full rounded-none border-0" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S4: Process ──────────────────────────────────────────────────── */}
      <section id="process" className="border-t" aria-labelledby="process-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
              How we work
            </p>
            <h2 id="process-heading" className="text-3xl md:text-4xl font-medium tracking-tight">
              From opportunity to production.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {processSteps.map(({ step, title, body }) => (
              <div key={step} className="rounded-2xl border bg-card p-5 flex flex-col gap-3">
                <CardImage src="workflow" seed={title} className="mb-2 h-24 w-full" />
                <span className="text-xs font-bold text-primary tracking-widest">{step}</span>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S5: Production-Ready AI ──────────────────────────────────────── */}
      <section className="border-t bg-muted/30" aria-labelledby="production-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
            <div>
              <h2 id="production-heading" className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                A prototype is only the beginning.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Production AI products need more than a model API. Qlugen designs
                the full system around the AI experience.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productionConcerns.map(({ imageSrc, title, body }) => (
              <div key={title} className="rounded-xl border bg-card p-5 flex gap-4">
                <CardImage src={imageSrc} seed={title} className="h-16 w-24 shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S6: Technology Approach ──────────────────────────────────────── */}
      <section className="border-t" aria-labelledby="tech-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
                Technology
              </p>
              <h2 id="tech-heading" className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                Model-flexible. Product-focused.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We choose the AI stack around the product requirement rather than
                forcing every use case into one model or platform.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {techCategories.map(({ imageSrc, label }) => (
                <div
                  key={label}
                  className="rounded-xl border bg-muted/40 p-4 flex flex-col items-start gap-2.5"
                >
                  <div className="relative h-14 w-full overflow-hidden rounded-lg border bg-background/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <CardImage src={imageSrc} seed={label} className="h-full w-full rounded-none border-0" />
                  </div>
                  <span className="text-xs font-medium leading-snug">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── S7: Where AI Products Create Value ───────────────────────────── */}
      <section className="border-t bg-muted/30" aria-labelledby="use-cases-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mb-12">
            <h2 id="use-cases-heading" className="text-3xl md:text-4xl font-medium tracking-tight">
              Where teams use AI products.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map(({ imageSrc, title, body }) => (
              <div key={title} className="rounded-xl border bg-card p-5 flex gap-4">
                <CardImage src={imageSrc} seed={title} className="h-16 w-24 shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S8: Related Capabilities ─────────────────────────────────────── */}
      <section className="border-t" aria-labelledby="related-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <h2 id="related-heading" className="text-3xl md:text-4xl font-medium tracking-tight mb-10">
            Need more than the product?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border bg-card p-8 flex flex-col gap-5">
              <div>
                <h3 className="text-lg font-semibold mb-2">AI Agents & Automation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Build AI systems that can use tools and complete multi-step workflows.
                </p>
              </div>
              <Link href="/capabilities/ai-agents-automation" className="mt-auto w-fit">
                <Button variant="outline" className="rounded-full gap-2 cursor-pointer">
                  Explore AI Agents & Automation <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="rounded-2xl border bg-card p-8 flex flex-col gap-5">
              <div>
                <h3 className="text-lg font-semibold mb-2">Integration & Deployment</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect AI products with business systems, APIs and production infrastructure.
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

      {/* ── S9: Insights ─────────────────────────────────────────────────── */}
      <section className="border-t bg-muted/30" aria-labelledby="insights-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
            <h2 id="insights-heading" className="text-3xl md:text-4xl font-medium tracking-tight max-w-xl">
              Ideas for building better AI products
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
                  <CardImage src="editorial" seed={post.title} className="mb-5 h-40 w-full" />
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

    </div>
  );
}
