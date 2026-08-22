import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/shadcn-space/blocks/contact-01/contact-form";
import InternalPageHeader from "@/components/internal-page-header";

export const metadata: Metadata = {
  title: "Contact Qlugen",
  description:
    "Talk to Qlugen about AI product development, agents, automation, integrations and production AI.",
};

const nextSteps = [
  ["01", "Tell us the problem", "Share the workflow, product idea or opportunity you're exploring."],
  ["02", "We review the fit", "Our team looks at the requirement and identifies the most useful next conversation."],
  ["03", "We talk through it", "Discuss goals, constraints and practical ways to move forward."],
] as const;

const contactDetails = [
  ["Email", "Vinay@qlugen.com", "mailto:Vinay@qlugen.com", Mail],
  ["Phone", "+91 99000 12736", "tel:+919900012736", Phone],
  ["Location", "Remote-first, serving clients globally", undefined, MapPin],
] as const;

export default function ContactPage() {
  return (
    <div>
            <InternalPageHeader
        eyebrow="Contact"
        title="Let's build something useful with AI."
      />

      <section className="border-t" aria-labelledby="form-heading">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-20 md:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 id="form-heading" className="mb-4 text-3xl font-medium tracking-tight md:text-4xl">Start the conversation.</h2>
            <p className="mb-8 leading-relaxed text-muted-foreground">
              Share a little about the product, workflow, integration or opportunity you want to explore.
            </p>
            <div className="grid grid-cols-1 gap-4">
              {contactDetails.map(([label, value, href, Icon]) => (
                <div key={label} className="flex gap-4 rounded-xl border bg-card p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    {href ? (
                      <a href={href} className="font-medium text-primary">{value}</a>
                    ) : (
                      <p className="font-medium text-primary">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <section className="border-t bg-muted/30" aria-labelledby="next-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <h2 id="next-heading" className="mb-10 text-3xl font-medium tracking-tight md:text-4xl">What happens next?</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {nextSteps.map(([number, title, body]) => (
              <article key={number} className="rounded-xl border bg-card p-5">
                <span className="mb-4 block text-sm font-semibold text-primary">{number}</span>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t" aria-labelledby="alternative-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 id="alternative-heading" className="mb-4 text-3xl font-medium tracking-tight md:text-4xl">Not ready for a project yet?</h2>
            <p className="mb-8 leading-relaxed text-muted-foreground">Explore practical ideas on AI products, agents and automation.</p>
            <Link href="/tech-blogs">
              <Button variant="outline" className="h-12 rounded-full px-6 cursor-pointer gap-2">Explore Tech Blogs <ArrowUpRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
