import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import InternalPageHeader from "@/components/internal-page-header";

export const metadata: Metadata = {
  title: "Technology Partners & Ecosystem | Qlugen",
  description:
    "Explore how Qlugen works across modern AI, cloud, data and business technology ecosystems.",
};

const ecosystem = [
  ["AI Models & Platforms", "Models and AI platforms used to power language, reasoning, vision and intelligent product experiences.", "/images/partners/ai-models-platforms.webp"],
  ["Cloud & Infrastructure", "Infrastructure for deploying, operating and scaling production AI applications.", "/images/partners/cloud-infrastructure.webp"],
  ["Data & Knowledge", "Databases, search and knowledge systems that provide AI applications with the right business context.", "/images/partners/data-knowledge.webp"],
  ["Business Systems & APIs", "Enterprise applications and APIs that allow AI products and agents to work inside existing workflows.", "/images/partners/business-systems-apis.webp"],
] as const;

const principles = [
  ["Model-flexible", "Choose models based on the quality, speed, privacy and cost requirements of the product.", "/images/partners/model-flexible.webp"],
  ["Integration-first", "Design around the systems and data teams already use.", "/images/partners/integration-first.webp"],
  ["Production-focused", "Consider reliability, monitoring and operating cost from the beginning.", "/images/partners/production-focused.webp"],
  ["Future-ready", "Keep architecture flexible enough to evolve as AI technology changes.", "/images/partners/future-ready.webp"],
] as const;

export default function PartnersPage() {
  return (
    <div className="internal-page">
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
            {ecosystem.map(([title, body, image]) => (
              <article key={title} className="rounded-2xl border bg-card p-6">
                <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-2xl border bg-muted/40">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 22vw, (min-width: 768px) 45vw, 92vw"
                  />
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
            {principles.map(([title, body, image]) => (
              <article key={title} className="rounded-xl border bg-card p-5">
                <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-xl border bg-muted/40">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 22vw, (min-width: 768px) 45vw, 92vw"
                  />
                </div>
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

    </div>
  );
}
