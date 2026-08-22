import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Bot, BrainCircuit, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import CTA from "@/components/shadcn-space/blocks/cta-01/cta";
import InternalPageHeader from "@/components/internal-page-header";

export const metadata: Metadata = {
  title: "About Qlugen | AI Development Agency",
  description:
    "Learn how Qlugen designs, builds and deploys useful AI products, agents and automated workflows.",
};

const capabilities = [
  ["AI Product Development", "Turn AI opportunities into products designed around users and business workflows.", "/capabilities/ai-product-development", BrainCircuit],
  ["AI Agents & Automation", "Build intelligent systems that can understand, use tools and complete real tasks.", "/capabilities/ai-agents-automation", Bot],
  ["Integration & Deployment", "Connect AI with business data and systems and move it reliably into production.", "/capabilities/integration-deployment", Plug],
] as const;

const principles = [
  ["Useful before impressive", "A simple solution solving the right problem is more valuable than an impressive demo nobody uses."],
  ["Start with the workflow", "Understand people, processes and systems before selecting models or tools."],
  ["Build to learn", "Prototype early, test assumptions and improve using real feedback."],
  ["Production is part of the product", "Reliability, integration, monitoring and cost matter from the beginning."],
] as const;

const stages = [
  ["Discover", "Understand the opportunity and existing workflow."],
  ["Design", "Define the product experience and AI approach."],
  ["Build", "Develop the product, agents, workflows and integrations."],
  ["Deploy", "Launch, monitor and improve the production system."],
] as const;

const industries = [
  "Banking, Financial Services & Insurance",
  "Telecom, Media & Entertainment",
  "Fashion & Luxury",
  "High-Tech",
  "Manufacturing & Distribution",
  "Retail & Consumer Goods",
];

export default function AboutPage() {
  return (
    <div>
            <InternalPageHeader
        eyebrow="About Qlugen"
        title="We turn AI potential into useful products."
      />

      <section className="border-t" aria-labelledby="mission-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Our mission</p>
            <h2 id="mission-heading" className="mb-6 text-3xl font-medium tracking-tight md:text-4xl">Make AI useful in the real world.</h2>
            <div className="space-y-4 leading-relaxed text-muted-foreground">
              <p>AI creates value when it becomes part of the way people actually work.</p>
              <p>Qlugen brings product thinking and AI engineering together to help teams move beyond experiments and build systems that solve practical problems.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30" aria-labelledby="what-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <h2 id="what-heading" className="mb-10 text-3xl font-medium tracking-tight md:text-4xl">From idea to production.</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {capabilities.map(([title, body, href, Icon]) => (
              <Link key={title} href={href} className="group block">
                <article className="flex h-full flex-col rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 font-semibold transition-colors group-hover:text-primary">{title}</h3>
                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  <span className="mt-auto flex items-center gap-1 text-xs font-medium text-primary">
                    Explore <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t" aria-labelledby="principles-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Our principles</p>
            <h2 id="principles-heading" className="text-3xl font-medium tracking-tight md:text-4xl">How we approach AI.</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {principles.map(([title, body]) => (
              <article key={title} className="rounded-xl border bg-card p-5">
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30" aria-labelledby="work-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <h2 id="work-heading" className="mb-10 text-3xl font-medium tracking-tight md:text-4xl">One team from discovery to deployment.</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stages.map(([title, body], index) => (
              <article key={title} className="rounded-xl border bg-card p-5">
                <span className="mb-4 block text-sm font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t" aria-labelledby="industries-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="industries-heading" className="max-w-2xl text-3xl font-medium tracking-tight md:text-4xl">AI shaped around your industry.</h2>
            <Link href="/industries">
              <Button variant="outline" className="h-12 rounded-full px-6 cursor-pointer gap-2">Explore Industries <ArrowUpRight className="h-4 w-4" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <div key={industry} className="rounded-xl border bg-card p-4 text-sm font-medium">{industry}</div>
            ))}
          </div>
        </div>
      </section>

      <CTA title="Have an AI opportunity worth exploring?" description="Let's turn it into something useful." buttonLabel="Start a project" />
    </div>
  );
}
