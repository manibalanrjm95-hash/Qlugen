import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BrainCircuit, Building2, CloudCog, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import CTA from "@/components/shadcn-space/blocks/cta-01/cta";
import InternalPageHeader from "@/components/internal-page-header";

export const metadata: Metadata = {
  title: "Technology Partners & Ecosystem | Qlugen",
  description:
    "Explore how Qlugen works across modern AI, cloud, data and business technology ecosystems.",
};

const ecosystem = [
  ["AI Models & Platforms", "Models and AI platforms used to power language, reasoning, vision and intelligent product experiences.", BrainCircuit],
  ["Cloud & Infrastructure", "Infrastructure for deploying, operating and scaling production AI applications.", CloudCog],
  ["Data & Knowledge", "Databases, search and knowledge systems that provide AI applications with the right business context.", Database],
  ["Business Systems & APIs", "Enterprise applications and APIs that allow AI products and agents to work inside existing workflows.", Building2],
] as const;

const principles = [
  ["Model-flexible", "Choose models based on the quality, speed, privacy and cost requirements of the product."],
  ["Integration-first", "Design around the systems and data teams already use."],
  ["Production-focused", "Consider reliability, monitoring and operating cost from the beginning."],
  ["Future-ready", "Keep architecture flexible enough to evolve as AI technology changes."],
] as const;

export default function PartnersPage() {
  return (
    <div>
            <InternalPageHeader
        eyebrow="Partners"
        title="Better AI starts with the right technology."
      />

      <section className="border-t" aria-labelledby="ecosystem-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Technology ecosystem</p>
            <h2 id="ecosystem-heading" className="mb-4 text-3xl font-medium tracking-tight md:text-4xl">Flexible by design.</h2>
            <p className="leading-relaxed text-muted-foreground">
              We choose technology around the product and business requirement rather than forcing every solution onto one platform.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {ecosystem.map(([title, body, Icon]) => (
              <article key={title} className="rounded-2xl border bg-card p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30" aria-labelledby="technology-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <h2 id="technology-heading" className="mb-10 text-3xl font-medium tracking-tight md:text-4xl">Technology should fit the problem.</h2>
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

      <section className="border-t" aria-labelledby="partner-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Work with us</p>
            <h2 id="partner-heading" className="mb-4 text-3xl font-medium tracking-tight md:text-4xl">Build better AI solutions together.</h2>
            <p className="mb-8 leading-relaxed text-muted-foreground">
              We are open to working with technology providers, platforms and specialist teams where our capabilities can create stronger solutions for clients.
            </p>
            <Link href="/contact">
              <Button className="h-12 rounded-full px-6 cursor-pointer gap-2">
                Talk to our team <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <CTA
        title="Already have a technology stack?"
        description="We can help connect AI products and agents to the systems your team already relies on."
        buttonLabel="Start a project"
      />
    </div>
  );
}
