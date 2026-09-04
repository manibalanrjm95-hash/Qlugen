import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import InternalPageHeader from "@/components/internal-page-header";

export const metadata: Metadata = {
  title: "Executive Team | Qlugen",
  description:
    "Meet the leadership team guiding Qlugen's product, technology and business direction.",
};

const leaders: {
  name: string;
  role: string;
  bio: string;
  photo?: string;
  linkedInUrl?: string;
}[] = [];

const approach = [
  {
    title: "Product Thinking",
    body: "Start from user and business needs.",
    imageSrc: "/images/company/leadership-product.svg",
    imageAlt: "Product strategy view showing user personas, feature priority board and decision framework",
  },
  {
    title: "Technical Depth",
    body: "Make architecture and engineering decisions appropriate for production.",
    imageSrc: "/images/company/leadership-technical.svg",
    imageAlt: "Layered technical architecture diagram showing interface, AI logic, data integration and infrastructure layers",
  },
  {
    title: "Delivery Ownership",
    body: "Stay focused on turning plans into working outcomes.",
    imageSrc: "/images/company/leadership-delivery.svg",
    imageAlt: "Delivery timeline with stages from concept through design and build to an active deployed production state",
  },
];

export default function ExecutiveTeamPage() {
  return (
    <div className="internal-page">
            <InternalPageHeader
        eyebrow="Executive Team"
        title="Leadership focused on building useful technology."
      />

      <section className="border-t" aria-labelledby="leadership-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <h2 id="leadership-heading" className="mb-10 text-3xl font-medium tracking-tight md:text-4xl">Leadership</h2>
          {leaders.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {leaders.map((leader) => (
                <article key={leader.name} className="rounded-2xl border bg-card p-6">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    {leader.photo ? "Photo" : leader.name.slice(0, 2)}
                  </div>
                  <h3 className="text-lg font-semibold">{leader.name}</h3>
                  <p className="mb-4 text-sm font-medium text-primary">{leader.role}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{leader.bio}</p>
                  {leader.linkedInUrl ? (
                    <a href={leader.linkedInUrl} className="mt-5 inline-flex text-sm font-medium text-primary">
                      LinkedIn
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl rounded-2xl border bg-card p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
                Q
              </div>
              <h3 className="mb-3 text-xl font-semibold">Leadership profiles are ready to add.</h3>
              <p className="leading-relaxed text-muted-foreground">
                Verified executive names, roles, biographies, photos and LinkedIn URLs are needed before leadership cards can be published.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-t bg-muted/30" aria-labelledby="approach-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <h2 id="approach-heading" className="mb-4 text-3xl font-medium tracking-tight md:text-4xl">Built around product, technology and outcomes.</h2>
            <p className="leading-relaxed text-muted-foreground">
              Qlugen's leadership approach keeps business needs, product experience and technical execution connected from the beginning of every engagement.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {approach.map(({ title, body, imageSrc, imageAlt }) => (
              <article key={title} className="rounded-2xl border bg-card overflow-hidden">
                <div className="relative w-full aspect-[3/2] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageSrc} alt={imageAlt}
                       className="h-full w-full object-cover" loading="lazy"/>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t" aria-labelledby="contact-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 id="contact-heading" className="mb-4 text-3xl font-medium tracking-tight md:text-4xl">Talk to our team.</h2>
            <p className="mb-8 leading-relaxed text-muted-foreground">Tell us what you're trying to build or improve.</p>
            <Link href="/contact">
              <Button className="h-12 rounded-full px-6 cursor-pointer gap-2">Contact us <ArrowUpRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
