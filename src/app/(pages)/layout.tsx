import type { ReactNode } from "react";
import SiteHeader from "@/components/site-header";
import Footer from "@/components/shadcn-space/blocks/footer-02/footer";

export default function PagesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="pt-24">{children}</div>
      <Footer />
    </>
  );
}
