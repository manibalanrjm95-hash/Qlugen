import HeroSection from "@/components/shadcn-space/blocks/hero-01/hero";
import Header from "@/components/shadcn-space/blocks/hero-01/header";
import type { AvatarList } from "@/components/shadcn-space/blocks/hero-01/hero";
import { siteNavigation } from "@/lib/nav";

const HERO_BACKGROUND_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4";

export default function AgencyHeroSection() {
  const avatarList: AvatarList[] = [
    {
      image: "https://images.shadcnspace.com/assets/profiles/user-1.jpg",
    },
    {
      image: "https://images.shadcnspace.com/assets/profiles/user-2.jpg",
    },
    {
      image: "https://images.shadcnspace.com/assets/profiles/user-3.jpg",
    },
    {
      image: "https://images.shadcnspace.com/assets/profiles/user-5.jpg",
    },
  ];

  const navigationData = siteNavigation;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src={HERO_BACKGROUND_VIDEO} type="video/mp4" />
      </video>
      <Header navigationData={navigationData} />
      <main className="relative z-10 flex min-h-screen flex-col justify-center">
        <HeroSection avatarList={avatarList} />
      </main>
    </div>
  );
}
