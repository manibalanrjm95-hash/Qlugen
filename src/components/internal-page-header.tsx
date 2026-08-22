type InternalPageHeaderProps = {
  eyebrow: string;
  title: string;
};

export default function InternalPageHeader({
  eyebrow,
  title,
}: InternalPageHeaderProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-14 md:px-6 md:pb-14 md:pt-20 lg:px-8">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
        <h1 className="max-w-[800px] text-4xl font-medium tracking-tight md:text-6xl">
          {title}
        </h1>
      </div>
    </section>
  );
}
