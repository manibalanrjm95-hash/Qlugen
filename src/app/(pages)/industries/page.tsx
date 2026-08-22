import Link from "next/link";
import {
  Landmark,
  Radio,
  Gem,
  Cpu,
  Factory,
  ShoppingBag,
  ArrowUpRight,
  Layers,
  Bot,
  Workflow,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CTA from "@/components/shadcn-space/blocks/cta-01/cta";
import { blogPosts } from "@/lib/blog-data";
import InternalPageHeader from "@/components/internal-page-header";

// ─── Data ────────────────────────────────────────────────────────────────────

type Industry = {
  name: string;
  description: string;
  capabilities: string[];
  Icon: React.ElementType;
  slug: string;
};

const industries: Industry[] = [
  {
    name: "Banking, Financial Services & Insurance",
    description:
      "Build secure AI workflows that simplify operations, accelerate document-heavy processes and help teams make faster, more informed decisions.",
    capabilities: [
      "AI Agents",
      "Workflow Automation",
      "Document Intelligence",
      "Data & API Integration",
    ],
    Icon: Landmark,
    slug: "banking-financial-services-insurance",
  },
  {
    name: "Telecom, Media & Entertainment",
    description:
      "Use AI to improve customer operations, automate high-volume workflows and connect teams, data and digital experiences.",
    capabilities: [
      "Customer Service Agents",
      "Process Automation",
      "Data Integration",
      "AI-powered Knowledge Systems",
    ],
    Icon: Radio,
    slug: "telecom-media-entertainment",
  },
  {
    name: "Fashion & Luxury",
    description:
      "Create smarter digital experiences and operations with AI for product content, customer engagement, commerce workflows and internal teams.",
    capabilities: [
      "AI Content Workflows",
      "Product Intelligence",
      "Customer Experience Agents",
      "Commerce Automation",
    ],
    Icon: Gem,
    slug: "fashion-luxury",
  },
  {
    name: "High-Tech",
    description:
      "Design and deploy AI-native products, agents and internal tools that help technology companies automate work and scale faster.",
    capabilities: [
      "AI Product Development",
      "Custom AI Agents",
      "Agentic Workflows",
      "API & Platform Integration",
    ],
    Icon: Cpu,
    slug: "high-tech",
  },
  {
    name: "Manufacturing & Distribution",
    description:
      "Connect operational data and automate repetitive processes across planning, documentation, support and business workflows.",
    capabilities: [
      "Operations Automation",
      "Document Intelligence",
      "AI Assistants",
      "System Integration",
    ],
    Icon: Factory,
    slug: "manufacturing-distribution",
  },
  {
    name: "Retail & Consumer Goods",
    description:
      "Use AI to improve commerce operations, product workflows, customer engagement and decision-making across digital and physical retail.",
    capabilities: [
      "Retail AI Agents",
      "Product Data Automation",
      "Customer Experience",
      "Workflow Automation",
    ],
    Icon: ShoppingBag,
    slug: "retail-consumer-goods",
  },
];

const howWeHelp = [
  {
    Icon: Layers,
    title: "AI Products",
    body: "Build production-ready AI experiences around real users and workflows.",
  },
  {
    Icon: Bot,
    title: "AI Agents",
    body: "Create agents that can reason, use tools and complete multi-step business tasks.",
  },
  {
    Icon: Workflow,
    title: "Automation",
    body: "Connect repetitive processes across teams, systems and data.",
  },
  {
    Icon: Plug,
    title: "Integration",
    body: "Connect APIs, enterprise software and AI models into reliable production workflows.",
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function IndustryCard({ industry }: { industry: Industry }) {
  const { Icon } = industry;
  return (
    <article className="group flex flex-col rounded-2xl border bg-card p-6 hover:shadow-md transition-shadow">
      <div className="mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>
      <h3 className="text-base font-semibold tracking-tight mb-3 leading-snug">
        {industry.name}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
        {industry.description}
      </p>
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {industry.capabilities.map((cap) => (
          <Badge key={cap} variant="secondary" className="text-xs h-auto px-2 py-0.5 font-normal">
            {cap}
          </Badge>
        ))}
      </div>
    </article>
  );
}

function BlogInsightCard({
  post,
}: {
  post: (typeof blogPosts)[0];
}) {
  return (
    <Link href={`/tech-blogs/${post.slug}`} className="group block">
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
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function IndustriesPage() {
  const insightPosts = blogPosts.slice(0, 3);

  return (
    <div>
            <InternalPageHeader
        eyebrow="Industries"
        title="AI built around the way your industry works."
      />

      {/* ── SECTION 2: Industries We Serve ──────────────────────────────── */}
      <section className="border-t" aria-labelledby="industries-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mb-12">
            <h2
              id="industries-heading"
              className="text-3xl md:text-4xl font-medium tracking-tight mb-4"
            >
              Industries we serve
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We combine AI engineering with practical business workflows to build
              solutions designed around the challenges of each industry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {industries.map((industry) => (
              <IndustryCard key={industry.slug} industry={industry} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: How Qlugen Helps ─────────────────────────────────── */}
      <section
        className="border-t bg-muted/30"
        aria-labelledby="how-we-help-heading"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: copy */}
            <div>
              <h2
                id="how-we-help-heading"
                className="text-3xl md:text-4xl font-medium tracking-tight mb-4"
              >
                Built for real business workflows
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                From the first AI use case to production deployment, Qlugen brings
                product thinking, AI engineering and automation together in one
                delivery team.
              </p>
            </div>

            {/* Right: 4 items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {howWeHelp.map(({ Icon, title, body }) => (
                <div key={title} className="p-5 rounded-xl border bg-card">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold mb-1.5 text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Insights ─────────────────────────────────────────── */}
      <section className="border-t" aria-labelledby="insights-heading">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
            <div className="max-w-xl">
              <h2
                id="insights-heading"
                className="text-3xl md:text-4xl font-medium tracking-tight mb-3"
              >
                Ideas for applying AI in your industry
              </h2>
            </div>
            <Link href="/tech-blogs" className="shrink-0">
              <Button
                variant="outline"
                className="rounded-full gap-2 cursor-pointer"
              >
                Explore tech blogs <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {insightPosts.map((post) => (
              <BlogInsightCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: CTA ──────────────────────────────────────────────── */}
      <CTA />
    </div>
  );
}
