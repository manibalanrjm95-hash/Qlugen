import Link from "next/link";
import { Fragment } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/lib/blog-data";
import InternalPageHeader from "@/components/internal-page-header";

// ─── Data ────────────────────────────────────────────────────────────────────

type Industry = {
  name: string;
  description: string;
  capabilities: string[];
  imageSrc: string;
  imageAlt: string;
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
    imageSrc: "/images/industries/bfsi.svg",
    imageAlt: "",
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
    imageSrc: "/images/industries/telecom.svg",
    imageAlt: "",
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
    imageSrc: "/images/industries/fashion.svg",
    imageAlt: "",
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
    imageSrc: "/images/industries/hightech.svg",
    imageAlt: "",
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
    imageSrc: "/images/industries/manufacturing.svg",
    imageAlt: "",
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
    imageSrc: "/images/industries/retail.svg",
    imageAlt: "",
    slug: "retail-consumer-goods",
  },
];

const howWeHelp = [
  {
    imageSrc: "/images/workflows/ai-products.svg",
    title: "AI Products",
    body: "Build production-ready AI experiences around real users and workflows.",
  },
  {
    imageSrc: "/images/workflows/ai-agents.svg",
    title: "AI Agents",
    body: "Create agents that can reason, use tools and complete multi-step business tasks.",
  },
  {
    imageSrc: "/images/workflows/automation.svg",
    title: "Automation",
    body: "Connect repetitive processes across teams, systems and data.",
  },
  {
    imageSrc: "/images/workflows/integration.svg",
    title: "Integration",
    body: "Connect APIs, enterprise software and AI models into reliable production workflows.",
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function IndustryCard({ industry }: { industry: Industry }) {
  return (
    <article className="group flex flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5 hover:-translate-y-0.5">
      {/* Image area — ~40% of card height */}
      <div className="relative w-full aspect-[3/2] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={industry.imageSrc}
          alt={industry.imageAlt}
          aria-hidden="true"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold tracking-tight leading-snug">
            {industry.name}
          </h3>
          <ArrowUpRight
            className="w-4 h-4 shrink-0 mt-0.5 text-transparent transition-all duration-200 group-hover:text-primary/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
          {industry.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {industry.capabilities.map((cap) => (
            <Badge
              key={cap}
              variant="secondary"
              className="text-xs h-auto px-2 py-0.5 font-normal"
            >
              {cap}
            </Badge>
          ))}
        </div>
      </div>
    </article>
  );
}

function FeaturedBlogCard({ post }: { post: (typeof blogPosts)[0] }) {
  return (
    <Link href={`/tech-blogs/${post.slug}`} className="group block">
      <article className="rounded-2xl border bg-card p-6 md:p-8 transition-all duration-200 hover:border-primary/20 hover:shadow-sm hover:shadow-primary/5 hover:-translate-y-0.5">
        <div className="flex items-center gap-3 mb-5">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="text-xs text-muted-foreground">{post.readTime}</span>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-primary/60">
            Featured
          </span>
        </div>
        <h3 className="text-xl md:text-2xl font-medium tracking-tight mb-3 group-hover:text-primary transition-colors leading-snug max-w-2xl">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-2xl">
          {post.excerpt}
        </p>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          Read article{" "}
          <ArrowUpRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </article>
    </Link>
  );
}

function BlogInsightCard({ post }: { post: (typeof blogPosts)[0] }) {
  return (
    <Link href={`/tech-blogs/${post.slug}`} className="group block h-full">
      <article className="rounded-2xl border bg-card p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-sm hover:shadow-primary/5 hover:-translate-y-0.5 h-full flex flex-col">
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
          Read article{" "}
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </article>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function IndustriesPage() {
  const insightPosts = blogPosts.slice(0, 3);

  return (
    <div className="internal-page">
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

      {/* ── SECTION 3: Built for Real Business Workflows ─────────────────── */}
      <section
        className="border-t bg-primary/[0.02]"
        aria-labelledby="how-we-help-heading"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
          {/* Section header — full width above the flow */}
          <div className="max-w-2xl mb-12">
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

          {/* Desktop: horizontal connected flow with image-led cards */}
          <div className="hidden lg:flex items-stretch rounded-2xl border bg-card overflow-hidden">
            {howWeHelp.map(({ imageSrc, title, body }, i) => (
              <Fragment key={title}>
                <div className="group flex-1 min-w-0 flex flex-col transition-colors duration-200 hover:bg-primary/[0.025]">
                  {/* Image area */}
                  <div className="relative w-full aspect-[2/1] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSrc}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                      loading="lazy"
                    />
                  </div>
                  {/* Content */}
                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <span className="text-[10px] font-bold tracking-widest text-primary/50 uppercase">
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {body}
                      </p>
                    </div>
                  </div>
                </div>
                {i < howWeHelp.length - 1 && (
                  <div className="w-7 shrink-0 flex items-center justify-center border-x bg-muted/20 transition-colors duration-200">
                    <ArrowRight
                      className="w-3 h-3 text-muted-foreground/40"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          {/* Tablet: 2×2 grid */}
          <div className="hidden sm:grid lg:hidden grid-cols-2 gap-3">
            {howWeHelp.map(({ imageSrc, title, body }, i) => (
              <div
                key={title}
                className="group rounded-xl border bg-card overflow-hidden transition-all duration-200 hover:border-primary/20 hover:shadow-sm hover:shadow-primary/5 hover:-translate-y-0.5"
              >
                <div className="relative w-full aspect-[2/1] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <span className="text-[10px] font-bold tracking-widest text-primary/50 uppercase">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: single column with vertical connectors */}
          <div className="sm:hidden flex flex-col">
            {howWeHelp.map(({ imageSrc, title, body }, i) => (
              <Fragment key={title}>
                <div className="rounded-xl border bg-card overflow-hidden">
                  <div className="relative w-full aspect-[2/1] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSrc}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                    <span className="text-[10px] font-bold tracking-widest text-primary/50 uppercase">
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {body}
                      </p>
                    </div>
                  </div>
                </div>
                {i < howWeHelp.length - 1 && (
                  <div className="flex justify-center py-2.5">
                    <ArrowDown
                      className="w-4 h-4 text-muted-foreground/40"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </Fragment>
            ))}
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

          {/* Featured first article + two supporting below */}
          <div className="space-y-5">
            <FeaturedBlogCard post={insightPosts[0]} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {insightPosts.slice(1).map((post) => (
                <BlogInsightCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
