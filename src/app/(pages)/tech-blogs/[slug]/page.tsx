import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CTA from "@/components/shadcn-space/blocks/cta-01/cta";
import { blogPosts } from "@/lib/blog-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return {
      title: "Article | Qlugen",
    };
  }

  return {
    title: `${post.title} | Qlugen`,
    description: post.excerpt,
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) notFound();

  const relatedPosts = blogPosts
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

  return (
    <div>
      <article className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
        <Link href="/tech-blogs">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-8 gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Tech Blogs
          </Button>
        </Link>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {post.readTime}
          </span>
        </div>

        <h1 className="mb-6 text-3xl font-medium tracking-tight md:text-5xl">
          {post.title}
        </h1>
        <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
          {post.introduction ?? post.excerpt}
        </p>

        <div className="space-y-10 border-t pt-10">
          {(post.content ?? [
            {
              heading: "Why this matters",
              body: post.excerpt,
            },
            {
              heading: "How teams can use the idea",
              body: "Use this article as a starting point for practical conversations about product value, workflow fit, engineering constraints and production readiness.",
            },
          ]).map((section) => (
            <section key={section.heading}>
              <h2 className="mb-3 text-2xl font-medium tracking-tight">
                {section.heading}
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}

          <aside className="rounded-2xl border bg-muted/30 p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {post.callout ??
                "This article is an editable starting point. Add deeper examples, diagrams or implementation notes as Qlugen's content library grows."}
            </p>
          </aside>
        </div>
      </article>

      <section className="border-t bg-muted/30" aria-labelledby="related-heading">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
          <h2
            id="related-heading"
            className="mb-10 text-3xl font-medium tracking-tight md:text-4xl"
          >
            Related articles
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {relatedPosts.map((item) => (
              <Link
                key={item.slug}
                href={`/tech-blogs/${item.slug}`}
                className="group block"
              >
                <article className="flex h-full flex-col rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md">
                  <Badge variant="secondary" className="mb-4 w-fit">
                    {item.category}
                  </Badge>
                  <h3 className="mb-3 font-medium tracking-tight transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                    {item.excerpt}
                  </p>
                  <span className="mt-auto flex items-center gap-1 text-xs font-medium text-primary">
                    Read article
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </article>
              </Link>
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
