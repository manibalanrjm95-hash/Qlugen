type Props = {
  params: Promise<{ slug: string }>;
};

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function CapabilityPage({ params }: Props) {
  const { slug } = await params;
  const title = slugToTitle(slug);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20 md:py-32">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
          Capabilities
        </p>
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground">
          Qlugen delivers focused AI capability that moves your product forward. This page is being built — check back soon.
        </p>
      </div>
    </section>
  );
}
