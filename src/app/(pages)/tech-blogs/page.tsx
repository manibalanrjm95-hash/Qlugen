import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { blogCategories, blogPosts } from "@/lib/blog-data";
import InternalPageHeader from "@/components/internal-page-header";

export const metadata: Metadata = {
  title: "AI & Technology Insights | Qlugen",
  description:
    "Practical insights on AI products, agents, automation, integrations and production AI from Qlugen.",
};

const topicCards = [
  {
    title: "AI Product Development",
    body: "Designing and building useful AI-powered applications.",
    imageSrc: "/images/blog/topic-ai-product-development.svg",
    imageAlt: "Sophisticated AI product interface with dark sidebar, conversation panel and analytics widgets",
  },
  {
    title: "AI Agents",
    body: "Building systems that understand, decide and act.",
    imageSrc: "/images/blog/topic-ai-agents.svg",
    imageAlt: "Central AI agent node connected to multiple tool and knowledge nodes through radiating network lines",
  },
  {
    title: "Automation",
    body: "Improving business workflows with AI and software.",
    imageSrc: "/images/blog/topic-automation.svg",
    imageAlt: "Sequential workflow pipeline with business tasks progressing through connected process stages to a completed output",
  },
  {
    title: "AI Engineering",
    body: "Integration, architecture, evaluation and production deployment.",
    imageSrc: "/images/blog/topic-ai-engineering.svg",
    imageAlt: "Technical AI architecture showing layered system with APIs, retrieval, models, evaluation and infrastructure components",
  },
];

function BlogCard({
  post,
  featured = false,
}: {
  post: (typeof blogPosts)[0];
  featured?: boolean;
}) {
  return (
    <Link href={`/tech-blogs/${post.slug}`} className="group block h-full">
      <article
        className={
          featured
            ? "flex h-full flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:-translate-y-0.5"
            : "flex h-full flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-200 hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5"
        }
      >
        {/* Unique per-article image */}
        <div className={`relative w-full overflow-hidden ${featured ? "h-56" : "h-40"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageSrc ?? ""}
            alt={post.imageAlt ?? ""}
            aria-hidden={post.imageAlt ? undefined : "true"}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
            loading="lazy"
          />
        </div>

        <div className={featured ? "flex flex-col flex-1 p-8" : "flex flex-col flex-1 p-6"}>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{post.category}</Badge>
            <span className="text-xs text-muted-foreground">{post.readTime}</span>
          </div>
          <h2
            className={
              featured
                ? "mb-4 text-2xl font-medium tracking-tight transition-colors group-hover:text-primary md:text-3xl"
                : "mb-3 text-lg font-medium tracking-tight transition-colors group-hover:text-primary"
            }
          >
            {post.title}
          </h2>
          <p className="mb-6 leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          <span className="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary">
            Read article <ArrowUpRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function TechBlogsPage() {
  const featuredPost = blogPosts.find((post) => post.featured) ?? blogPosts[0];
  const latestPosts = blogPosts.filter((post) => post.slug !== featuredPost.slug);

  return (
    <div className="internal-page">
            <InternalPageHeader
        eyebrow="Tech Blogs"
        title="Practical ideas for building with AI."
      />

      <section className="border-t" aria-labelledby="featured-heading">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
          <h2
            id="featured-heading"
            className="mb-8 text-3xl font-medium tracking-tight md:text-4xl"
          >
            Featured
          </h2>
          <BlogCard post={featuredPost} featured />
        </div>
      </section>

      <section className="border-t bg-muted/30" aria-label="Topic filters">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {blogCategories.map((category) => (
              <a
                key={category}
                href="#latest-thinking"
                className="rounded-full border bg-background px-4 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                {category}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section
        id="latest-thinking"
        className="border-t"
        aria-labelledby="latest-heading"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <h2
            id="latest-heading"
            className="mb-10 text-3xl font-medium tracking-tight md:text-4xl"
          >
            Latest thinking
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30" aria-labelledby="topics-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <h2
            id="topics-heading"
            className="mb-10 text-3xl font-medium tracking-tight md:text-4xl"
          >
            Explore by topic
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {topicCards.map(({ title, body, imageSrc, imageAlt }) => (
              <article key={title} className="group rounded-2xl border bg-card overflow-hidden transition-all duration-200 hover:border-primary/20 hover:shadow-sm hover:-translate-y-0.5">
                <div className="relative w-full aspect-[3/2] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
