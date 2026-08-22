import type { NavigationSection } from "@/components/shadcn-space/blocks/hero-01/header";

export const siteNavigation: NavigationSection[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Industries",
    href: "/industries",
  },
  {
    title: "Capabilities",
    groups: [
      {
        group: "",
        items: [
          {
            title: "AI Product Development",
            href: "/capabilities/ai-product-development",
          },
          {
            title: "AI Agents & Automation",
            href: "/capabilities/ai-agents-automation",
          },
          {
            title: "Integration & Deployment",
            href: "/capabilities/integration-deployment",
          },
        ],
      },
    ],
  },
  {
    title: "Tech Blogs",
    href: "/tech-blogs",
  },
  {
    title: "Partners",
    href: "/partners",
  },
  {
    title: "Careers",
    href: "/careers",
  },
  {
    title: "Company",
    children: [
      { title: "About Us", href: "/about" },
      { title: "Executive Team", href: "/executive-team" },
      { title: "Contact Us", href: "/contact" },
    ],
  },
];
