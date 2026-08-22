import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  CloudCog,
  FileText,
  Headphones,
  Network,
  Plug,
  Search,
  Settings2,
  Sparkles,
  Workflow,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CTA from "@/components/shadcn-space/blocks/cta-01/cta";
import InternalPageHeader from "@/components/internal-page-header";

type Capability = {
  title: string;
  description: string;
  services: string[];
  cta: string;
  href: string;
  Icon: React.ElementType;
};

const capabilities: Capability[] = [
  {
    title: "AI Product Development",
    description:
      "Design and build AI-native products that solve real user and business problems - from early concepts and prototypes to production-ready experiences.",
    services: [
      "AI product strategy",
      "Rapid prototyping",
      "LLM-powered applications",
      "AI copilots",
      "Internal AI tools",
      "Production AI products",
    ],
    cta: "Explore AI Product Development",
    href: "/capabilities/ai-product-development",
    Icon: BrainCircuit,
  },
  {
    title: "AI Agents & Automation",
    description:
      "Build intelligent agents that can understand context, use tools and automate multi-step workflows across teams and business systems.",
    services: [
      "Custom AI agents",
      "Agentic workflows",
      "Workflow automation",
      "Knowledge assistants",
      "Customer support agents",
      "Internal operations agents",
    ],
    cta: "Explore AI Agents & Automation",
    href: "/capabilities/ai-agents-automation",
    Icon: Bot,
  },
  {
    title: "Integration & Deployment",
    description:
      "Connect AI products and agents with existing APIs, data and enterprise software, then deploy them as secure and reliable production systems.",
    services: [
      "API integration",
      "Data integration",
      "AI model integration",
      "Enterprise system integration",
      "Cloud deployment",
      "Production monitoring",
    ],
    cta: "Explore Integration & Deployment",
    href: "/capabilities/integration-deployment",
    Icon: Plug,
  },
];

const processSteps = [
  {
    number: "01",
    title: "Discover",
    body: "Understand the workflow, users, systems and AI opportunity.",
    Icon: Search,
  },
  {
    number: "02",
    title: "Prototype",
    body: "Test the experience and technical approach quickly before investing heavily.",
    Icon: Wrench,
  },
  {
    number: "03",
    title: "Build",
    body: "Develop the product, agent, integrations and production architecture.",
    Icon: Settings2,
  },
  {
    number: "04",
    title: "Deploy & Improve",
    body: "Launch into real workflows, monitor performance and continuously improve the system.",
    Icon: CloudCog,
  },
];

const values = [
  {
    title: "Product thinking",
    body: "AI should solve a real user or business problem, not exist only as a technology demo.",
  },
  {
    title: "Engineering depth",
    body: "We combine product development, AI engineering, automation and integrations in one delivery team.",
  },
  {
    title: "Production focus",
    body: "Every solution is designed with real workflows, security, reliability and deployment in mind.",
  },
];

const useCases = [
  {
    title: "AI customer support agent",
    body: "Resolve common requests with context from your systems.",
    Icon: Headphones,
  },
  {
    title: "Internal knowledge assistant",
    body: "Help teams find answers across documents and tools.",
    Icon: Sparkles,
  },
  {
    title: "Document processing workflow",
    body: "Extract, review and route information from business documents.",
    Icon: FileText,
  },
  {
    title: "AI-powered operations tool",
    body: "Support recurring operational decisions with AI assistance.",
    Icon: Boxes,
  },
  {
    title: "Sales or service copilot",
    body: "Give frontline teams faster access to useful next actions.",
    Icon: CheckCircle2,
  },
  {
    title: "Multi-system workflow automation",
    body: "Coordinate tasks across APIs, data sources and internal platforms.",
    Icon: Network,
  },
];

function CapabilityCard({ capability }: { capability: Capability }) {
  const { Icon } = capability;

  return (
    <article className="group flex h-full flex-col rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mb-3 text-xl font-semibold tracking-tight">
        {capability.title}
      </h3>
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
        {capability.description}
      </p>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {capability.services.map((service) => (
          <Badge
            key={service}
            variant="secondary"
            className="h-auto px-2 py-0.5 text-xs font-normal"
          >
            {service}
          </Badge>
        ))}
      </div>
      <Link href={capability.href} className="mt-auto">
        <Button variant="outline" className="w-full justify-between rounded-full">
          {capability.cta}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </Link>
    </article>
  );
}

export default function CapabilitiesPage() {
  return (
    <div>
            <InternalPageHeader
        eyebrow="Capabilities"
        title="From AI ideas to production-ready systems."
      />

      <section className="border-t" aria-labelledby="core-capabilities-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              What we build
            </p>
            <h2
              id="core-capabilities-heading"
              className="mb-4 text-3xl font-medium tracking-tight md:text-4xl"
            >
              Three capabilities. One delivery team.
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              From product design and AI engineering to automation and
              deployment, we help teams turn useful AI opportunities into working
              production systems.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {capabilities.map((capability) => (
              <CapabilityCard
                key={capability.title}
                capability={capability}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-t bg-muted/30"
        aria-labelledby="process-heading"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              From idea to production
            </p>
            <h2
              id="process-heading"
              className="text-3xl font-medium tracking-tight md:text-4xl"
            >
              A practical path to shipping AI.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map(({ Icon, number, title, body }) => (
              <article key={title} className="rounded-xl border bg-card p-5">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-primary">
                    {number}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mb-2 text-base font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t" aria-labelledby="why-qlugen-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <h2
              id="why-qlugen-heading"
              className="text-3xl font-medium tracking-tight md:text-4xl"
            >
              Built for teams shipping real AI products.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {values.map((value) => (
              <article key={value.title} className="rounded-2xl border bg-card p-6">
                <h3 className="mb-3 text-base font-semibold">{value.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {value.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-t bg-muted/30"
        aria-labelledby="use-cases-heading"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <h2
              id="use-cases-heading"
              className="text-3xl font-medium tracking-tight md:text-4xl"
            >
              What teams can build with Qlugen
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map(({ Icon, title, body }) => (
              <article
                key={title}
                className="flex gap-4 rounded-xl border bg-card p-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="mb-1.5 text-sm font-semibold">{title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTA
        title="Have an AI workflow worth building?"
        description="Tell us what your team wants to improve, automate or turn into a product."
        buttonLabel="Start a project"
      />
    </div>
  );
}
