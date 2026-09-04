"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { BOOK_BUILD_CALL_URL } from "@/lib/booking";

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
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-8">
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
                  <form
                    action="mailto:Vinay@qlugen.com?subject=Qlugen newsletter subscription"
                    method="post"
                    encType="text/plain"
                    className="flex flex-1 flex-col gap-2 sm:flex-row"
                  >
                    <Input
                      required
                      type="email"
                      name="email"
                      placeholder="enter your email"
                      className="h-11 rounded-full px-4 py-2 text-white"
                    />
                    <Button
                      type="submit"
                      className="h-11 rounded-full px-4 py-2 font-medium hover:bg-primary/80 cursor-pointer"
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

          <div className="grid grid-cols-12 gap-6 items-start">
            {/* CTA card — hardcoded light colors so it reads as light inside the dark footer */}
            <div className="col-span-12 md:col-span-7 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100 ease-in-out fill-mode-both">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 flex items-center justify-center px-5 py-8 sm:px-8 sm:py-10">
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="flex flex-col gap-3 items-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-foreground">
                      Have an AI problem worth discussing?
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      Tell us what your team is trying to build, improve or automate.
                    </p>
                  </div>
                  <a href={BOOK_BUILD_CALL_URL} target="_blank" rel="noopener noreferrer">
                    <Button className="relative text-sm font-medium rounded-full h-12 p-1 ps-6 pe-14 group transition-all duration-500 hover:ps-14 hover:pe-6 w-fit overflow-hidden hover:bg-primary/80 cursor-pointer">
                      <span className="relative z-10 transition-all duration-500">
                        Book a Build Call
                      </span>
                      <div className="absolute right-1 w-10 h-10 bg-background text-foreground rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45">
                        <ArrowUpRight size={16} />
                      </div>
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            <div className="md:col-span-1" />

            {/* Nav links */}
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

          <div className="flex flex-col gap-6">
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
