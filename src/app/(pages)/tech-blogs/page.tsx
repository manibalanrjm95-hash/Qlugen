import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Bot, BrainCircuit, Cog, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CTA from "@/components/shadcn-space/blocks/cta-01/cta";
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
    Icon: BrainCircuit,
  },
  {
    title: "AI Agents",
    body: "Building systems that understand, decide and act.",
    Icon: Bot,
  },
  {
    title: "Automation",
    body: "Improving business workflows with AI and software.",
    Icon: Cog,
  },
  {
    title: "AI Engineering",
    body: "Integration, architecture, evaluation and production deployment.",
    Icon: Layers,
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
            ? "flex h-full flex-col rounded-2xl border bg-card p-8 transition-shadow hover:shadow-lg"
            : "flex h-full flex-col rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md"
        }
      >
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
          Read article <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </article>
    </Link>
  );
}

export default function TechBlogsPage() {
  const featuredPost = blogPosts.find((post) => post.featured) ?? blogPosts[0];
  const latestPosts = blogPosts.filter((post) => post.slug !== featuredPost.slug);

  return (
    <div>
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
            {topicCards.map(({ Icon, title, body }) => (
              <article key={title} className="rounded-2xl border bg-card p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTA
        title="Have an AI problem worth discussing?"
        description="Tell us what your team is trying to build, improve or automate."
        buttonLabel="Start a project"
      />
    </div>
  );
}
