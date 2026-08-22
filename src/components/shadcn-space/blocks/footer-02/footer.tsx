import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const footerLinks = [
  { label: "Industries", href: "/industries" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "Tech Blogs", href: "/tech-blogs" },
  { label: "Partners", href: "/partners" },
  { label: "Careers", href: "/careers" },
  { label: "About Us", href: "/about" },
  { label: "Executive Team", href: "/executive-team" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="dark bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-24 lg:px-8">
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-12">
            <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100 ease-in-out fill-mode-both">
              <div className="col-span-12 md:col-span-3">
                <p className="w-full text-foreground">
                  Qlugen is an AI development agency building products, agents,
                  automations and integrations.
                </p>
              </div>
              <div className="md:col-span-1" />
              <div className="col-span-12 md:col-span-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:gap-10">
                  <form className="flex flex-1 gap-2">
                    <Input
                      required
                      type="email"
                      name="email"
                      placeholder="enter your email"
                      className="h-full rounded-full py-2 text-white"
                    />
                    <Button
                      type="submit"
                      className="h-auto rounded-full px-4 py-2 font-medium hover:bg-primary/80 cursor-pointer"
                    >
                      Subscribe
                    </Button>
                  </form>
                  <p className="flex-1 text-sm text-foreground">
                    Get occasional updates on AI product development, agent
                    design, automation and launch.
                  </p>
                </div>
              </div>
            </div>
            <Separator />
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100 ease-in-out fill-mode-both md:col-span-7">
              <h2 className="mb-6 text-3xl font-medium text-foreground sm:text-5xl">
                Ready to build something useful with AI?
              </h2>
              <Link href="/contact">
                <Button className="h-auto rounded-full bg-primary px-6 py-3.5 hover:bg-primary/80 gap-2">
                  Get in touch <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="md:col-span-1" />
            <div className="col-span-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100 ease-in-out fill-mode-both md:col-span-2">
              <div className="flex flex-col gap-4">
                {footerLinks.slice(0, 4).map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-base text-muted-foreground hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="col-span-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200 ease-in-out fill-mode-both md:col-span-2">
              <div className="flex flex-col gap-4">
                {footerLinks.slice(4, 8).map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-base text-muted-foreground hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-12">
            <Separator />
            <p className="text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 ease-in-out fill-mode-both">
              Copyright 2026 Qlugen. All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
