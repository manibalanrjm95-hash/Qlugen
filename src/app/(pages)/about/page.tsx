import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import InternalPageHeader from "@/components/internal-page-header";
import ProcessFlow from "@/components/process-flow";

export const metadata: Metadata = {
  title: "About Qlugen | AI Development Agency",
  description:
    "Learn how Qlugen designs, builds and deploys useful AI products, agents and automated workflows.",
};

const capabilities = [
  {
    title: "AI Product Development",
    body: "Turn AI opportunities into products designed around users and business workflows.",
    href: "/capabilities/ai-product-development",
    imageSrc: "/images/company/about-ai-product.svg",
    imageAlt: "Dark-themed AI product interface with sidebar navigation, conversation panel and analytics metrics",
  },
  {
    title: "AI Agents & Automation",
    body: "Build intelligent systems that can understand, use tools and complete real tasks.",
    href: "/capabilities/ai-agents-automation",
    imageSrc: "/images/company/about-ai-agents.svg",
    imageAlt: "AI agent node at center connected by flow lines to input and three output tool nodes",
  },
  {
    title: "Integration & Deployment",
    body: "Connect AI with business data and systems and move it reliably into production.",
    href: "/capabilities/integration-deployment",
    imageSrc: "/images/company/about-integration.svg",
    imageAlt: "Three source systems connecting into a central AI platform which routes to three deployment targets",
  },
];

const principles = [
  {
    title: "Useful before impressive",
    body: "A simple solution solving the right problem is more valuable than an impressive demo nobody uses.",
    imageSrc: "/images/company/principle-useful.svg",
    imageAlt: "Clean focused AI interface completing one task clearly, contrasted with a cluttered complex demo",
  },
  {
    title: "Start with the workflow",
    body: "Understand people, processes and systems before selecting models or tools.",
    imageSrc: "/images/company/principle-workflow.svg",
    imageAlt: "Horizontal discovery map showing users, tasks, systems and AI opportunity connected in sequence",
  },
  {
    title: "Build to learn",
    body: "Prototype early, test assumptions and improve using real feedback.",
    imageSrc: "/images/company/principle-build-learn.svg",
    imageAlt: "Three product iterations evolving from a rough wireframe through an improved version to a polished production interface",
  },
  {
    title: "Production is part of the product",
    body: "Reliability, integration, monitoring and cost matter from the beginning.",
    imageSrc: "/images/company/principle-production.svg",
    imageAlt: "Four connected production components: application interface, integration layer, monitoring and infrastructure",
  },
];

const stages = [
  ["Discover", "Understand the opportunity and existing workflow."],
  ["Design", "Define the product experience and AI approach."],
  ["Build", "Develop the product, agents, workflows and integrations."],
  ["Deploy", "Launch, monitor and improve the production system."],
] as const;

const industries = [
  { name: "Banking, Financial Services & Insurance", imageSrc: "/images/industries/bfsi.svg" },
  { name: "Telecom, Media & Entertainment",         imageSrc: "/images/industries/telecom.svg" },
  { name: "Fashion & Luxury",                        imageSrc: "/images/industries/fashion.svg" },
  { name: "High-Tech",                               imageSrc: "/images/industries/hightech.svg" },
  { name: "Manufacturing & Distribution",            imageSrc: "/images/industries/manufacturing.svg" },
  { name: "Retail & Consumer Goods",                 imageSrc: "/images/industries/retail.svg" },
];

export default function AboutPage() {
  return (
    <div className="internal-page">
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
            {capabilities.map(({ title, body, href, imageSrc, imageAlt }) => (
              <Link key={title} href={href} className="group block">
                <article className="flex h-full flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-200 hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5">
                  <div className="relative w-full aspect-[3/2] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageSrc} alt={imageAlt}
                         className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                         loading="lazy"/>
                  </div>
                  <div className="flex flex-col flex-1 p-6">
                    <h3 className="mb-2 font-semibold transition-colors group-hover:text-primary">{title}</h3>
                    <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                    <span className="mt-auto flex items-center gap-1 text-xs font-medium text-primary">
                      Explore <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
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
            {principles.map(({ title, body, imageSrc, imageAlt }) => (
              <article key={title} className="rounded-xl border bg-card overflow-hidden">
                <div className="relative h-24 w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageSrc} alt={imageAlt}
                       className="h-full w-full object-cover" loading="lazy"/>
                </div>
                <div className="p-5">
                  <h3 className="mb-2 font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30" aria-labelledby="work-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <h2 id="work-heading" className="mb-10 text-3xl font-medium tracking-tight md:text-4xl">One team from discovery to deployment.</h2>
          <ProcessFlow steps={stages.map(([title, body]) => ({ title, body }))} />
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
            {industries.map(({ name, imageSrc }) => (
              <div key={name} className="rounded-xl border bg-card overflow-hidden">
                <div className="relative h-20 w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageSrc} alt="" aria-hidden="true"
                       className="h-full w-full object-cover" loading="lazy"/>
                </div>
                <div className="px-4 py-3 text-sm font-medium">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
