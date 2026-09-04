import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import InternalPageHeader from "@/components/internal-page-header";
import ProcessFlow from "@/components/process-flow";

export const metadata: Metadata = {
  title: "Careers at Qlugen",
  description:
    "Explore opportunities to work on AI products, intelligent agents, automation and engineering at Qlugen.",
};

const workCards = [
  ["Meaningful problems", "Work on AI use cases connected to real users, workflows and business outcomes.", "/images/careers/meaningful-problems.webp"],
  ["End-to-end ownership", "See projects move from an early idea through prototype, engineering and production.", "/images/careers/end-to-end-ownership.webp"],
  ["Learn by building", "Work with rapidly evolving AI technology while developing strong product and engineering judgement.", "/images/careers/learn-by-building.webp"],
] as const;

const values = [
  ["Build together", "Product, design and engineering work closely instead of operating as separate handoffs.", "/images/careers/build-together.webp"],
  ["Share what you know", "Learning becomes more valuable when knowledge is shared across the team.", "/images/careers/share-knowledge.webp"],
  ["Challenge the solution", "The goal is not to use more AI. The goal is to build the right solution.", "/images/careers/challenge-solution.webp"],
  ["Take ownership", "Strong teams care about the outcome, not just their individual task.", "/images/careers/take-ownership.webp"],
] as const;

const growth = [
  ["Hands-on learning", "Learn by solving practical product and engineering challenges."],
  ["Knowledge sharing", "Share experiments, discoveries and lessons across projects."],
  ["Growing responsibility", "Take on broader product, technical and client responsibilities as your experience develops."],
] as const;

const roleFamilies = [
  ["AI & Software Engineering", "Build AI applications, integrations and production systems.", "/images/careers/ai-software-engineering.webp"],
  ["AI Product", "Turn business opportunities into useful product experiences and clear delivery plans.", "/images/careers/ai-product.webp"],
  ["Design", "Create simple, understandable experiences around complex AI capabilities.", "/images/careers/design.webp"],
  ["Business & Operations", "Help projects, clients and internal operations move efficiently.", "/images/careers/business-operations.webp"],
] as const;

const hiringSteps = [
  ["01", "Introduction", "A conversation to understand your experience, interests and what you're looking for.", "/images/careers/hiring-introduction.webp"],
  ["02", "Role Discussion", "Explore the role, the work and how your experience could fit the team.", "/images/careers/role-discussion.webp"],
  ["03", "Practical Conversation", "Discuss how you approach relevant product, design, engineering or business problems.", "/images/careers/practical-conversation.webp"],
  ["04", "Decision", "Align on expectations, responsibilities and next steps.", "/images/careers/hiring-decision.webp"],
] as const;

export default function CareersPage() {
  return (
    <div className="internal-page">
            <InternalPageHeader
        eyebrow="Careers"
        title="Build useful AI with people who like building."
      />

      <section id="life-at-qlugen" className="border-t" aria-labelledby="working-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <h2 id="working-heading" className="mb-4 text-3xl font-medium tracking-tight md:text-4xl">Work where product and AI meet.</h2>
            <p className="leading-relaxed text-muted-foreground">
              Qlugen brings product thinking, design and engineering together. Our work starts with real user and business problems and ends with something working in production.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {workCards.map(([title, body, image]) => (
              <article key={title} className="rounded-2xl border bg-card p-6">
                <div className="group relative mb-5 aspect-[16/9] overflow-hidden rounded-2xl border bg-muted/40">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.02]"
                    sizes="(min-width: 768px) 30vw, 92vw"
                  />
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30" aria-labelledby="culture-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Culture</p>
            <h2 id="culture-heading" className="text-3xl font-medium tracking-tight md:text-4xl">Good work is collaborative.</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map(([title, body, image]) => (
              <article key={title} className="rounded-xl border bg-card p-5">
                <div className="group relative mb-4 aspect-[16/9] overflow-hidden rounded-xl border bg-muted/40">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.02]"
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

      <section className="border-t" aria-labelledby="growth-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Growth</p>
            <h2 id="growth-heading" className="mb-4 text-3xl font-medium tracking-tight md:text-4xl">AI keeps changing. So should we.</h2>
            <p className="leading-relaxed text-muted-foreground">
              Working in AI means continuously learning new models, tools and patterns while strengthening the fundamentals that do not change.
            </p>
          </div>
          <ProcessFlow steps={growth.map(([title, body]) => ({ title, body }))} />
        </div>
      </section>

      <section className="border-t bg-muted/30" aria-labelledby="people-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <h2 id="people-heading" className="mb-10 text-3xl font-medium tracking-tight md:text-4xl">People who can turn ambiguity into progress.</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {roleFamilies.map(([title, body, image]) => (
              <article key={title} className="rounded-2xl border bg-card p-6">
                <div className="group relative mb-5 aspect-[16/9] overflow-hidden rounded-2xl border bg-muted/40">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.02]"
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

      <section id="open-positions" className="border-t" aria-labelledby="open-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="max-w-2xl rounded-2xl border bg-card p-8">
            <div className="group relative mb-6 aspect-[16/8] overflow-hidden rounded-2xl border bg-muted/40">
              <Image
                src="/images/careers/open-application.webp"
                alt="Don't see the right role?"
                fill
                className="object-cover transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.02]"
                sizes="(min-width: 1024px) 42vw, 92vw"
              />
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Opportunities</p>
            <h2 id="open-heading" className="mb-4 text-3xl font-medium tracking-tight md:text-4xl">Don't see the right role?</h2>
            <p className="mb-8 leading-relaxed text-muted-foreground">
              We're always interested in meeting people who care about building thoughtful AI products. Send us your profile and tell us what you'd like to work on.
            </p>
            <Link href="/contact">
              <Button className="h-12 rounded-full px-6 cursor-pointer gap-2">Open application <ArrowUpRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30" aria-labelledby="process-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <h2 id="process-heading" className="mb-10 text-3xl font-medium tracking-tight md:text-4xl">What to expect</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {hiringSteps.map(([number, title, body, image]) => (
              <article key={number} className="rounded-xl border bg-card p-5">
                <div className="group relative mb-4 aspect-[16/9] overflow-hidden rounded-xl border bg-muted/40">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.02]"
                    sizes="(min-width: 1024px) 22vw, (min-width: 768px) 45vw, 92vw"
                  />
                </div>
                <span className="mb-4 block text-sm font-semibold text-primary">{number}</span>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
