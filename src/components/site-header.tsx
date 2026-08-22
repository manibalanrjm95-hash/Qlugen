"use client";

import Header from "@/components/shadcn-space/blocks/hero-01/header";
import { siteNavigation } from "@/lib/nav";

export default function SiteHeader() {
  return <Header navigationData={siteNavigation} />;
}
