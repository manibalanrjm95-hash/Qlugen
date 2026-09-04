type InternalPageHeaderProps = {
  eyebrow: string;
  title: string;
};

const BANNER_BACKGROUND_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4";

export default function InternalPageHeader({
  eyebrow,
  title,
}: InternalPageHeaderProps) {
  return (
    <section className="internal-page-header relative isolate -mt-24 flex min-h-[500px] items-center overflow-hidden bg-[#08070d] px-4 pb-12 pt-28 text-white sm:min-h-[540px] md:min-h-[520px] md:px-6 md:pb-20 md:pt-36 lg:px-8">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-85 [object-position:24%_center] md:scale-100 md:[object-position:center]"
      >
        <source src={BANNER_BACKGROUND_VIDEO} type="video/mp4" />
      </video>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_70%,rgba(168,85,247,0.78),transparent_34%),radial-gradient(circle_at_45%_95%,rgba(115,0,255,0.42),transparent_38%),linear-gradient(90deg,rgba(8,7,13,0.48),rgba(8,7,13,0.68)_48%,rgba(8,7,13,0.94))]" />
      <div className="absolute inset-0 -z-10 opacity-24 bg-[linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:56px_100%] md:bg-[size:86px_100%]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(8,7,13,0.84),rgba(8,7,13,0.12)_26%,rgba(8,7,13,0.18)_62%,rgba(8,7,13,0.9)_100%)]" />

      <div className="mx-auto flex max-w-7xl flex-col items-center text-center">
        <p className="mb-4 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-normal text-white/75 backdrop-blur md:mb-5 md:text-xs">
          {eyebrow}
        </p>
        <h1 className="max-w-5xl text-[2.35rem] font-bold leading-[1.08] tracking-normal text-white drop-shadow-[0_12px_44px_rgba(0,0,0,0.38)] sm:text-5xl md:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-white/76 md:mt-6 md:text-base">
          We design, build, and launch AI-powered software, custom agents,
          workflow automations, and integrations that move from idea to
          production.
        </p>
      </div>
    </section>
  );
}
