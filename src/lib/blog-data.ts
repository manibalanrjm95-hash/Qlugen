export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  featured?: boolean;
  introduction?: string;
  content?: {
    heading: string;
    body: string;
  }[];
  callout?: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "from-ai-prototype-to-production",
    title: "From AI prototype to production: what changes?",
    excerpt:
      "A working demo proves an idea. A production AI product has to handle real users, real data, failures, integrations, quality and operating cost. Here's what teams need to consider when moving beyond the prototype.",
    category: "AI Product Development",
    readTime: "6 min read",
    featured: true,
    introduction:
      "The jump from prototype to production is where AI work becomes a product and engineering problem, not only a model problem.",
    content: [
      {
        heading: "A prototype proves possibility",
        body: "Early prototypes help teams test whether an AI interaction, workflow or automation direction is worth exploring. They are intentionally narrow, fast and forgiving.",
      },
      {
        heading: "Production introduces real constraints",
        body: "Once real users arrive, teams need to account for permissions, data quality, error handling, latency, monitoring and the operating cost of every interaction.",
      },
      {
        heading: "The product experience matters",
        body: "Useful AI products make confidence, limitations, actions and handoffs clear. The interface has to help people understand what the system is doing.",
      },
    ],
    callout:
      "The strongest AI products treat reliability, integration and user trust as core product requirements from the start.",
  },
  {
    slug: "when-should-a-workflow-use-an-ai-agent",
    title: "When should a workflow use an AI agent?",
    excerpt:
      "Not every automation needs an autonomous agent. Learn how to choose between traditional workflows, AI-assisted automation and agentic systems.",
    category: "AI Agents",
    readTime: "5 min read",
    introduction:
      "Agentic systems are most useful when a workflow needs context, decisions, tool use and flexible sequencing.",
  },
  {
    slug: "designing-ai-products-people-can-trust",
    title: "Designing AI products people can trust",
    excerpt:
      "Good AI UX makes capabilities, limitations and actions understandable instead of hiding complexity behind a chat box.",
    category: "AI Products",
    readTime: "5 min read",
  },
  {
    slug: "from-automation-to-agentic-workflows",
    title: "From automation to agentic workflows",
    excerpt:
      "How AI changes traditional automation by adding context, reasoning and flexible decision-making.",
    category: "Automation",
    readTime: "4 min read",
  },
  {
    slug: "connecting-ai-to-enterprise-systems",
    title: "Connecting AI to enterprise systems",
    excerpt:
      "Why APIs, permissions, data and existing business applications are critical to making AI genuinely useful.",
    category: "Integration",
    readTime: "6 min read",
  },
  {
    slug: "what-makes-an-ai-application-production-ready",
    title: "What makes an AI application production-ready?",
    excerpt:
      "Reliability, evaluation, monitoring, latency and cost become just as important as model quality once real users arrive.",
    category: "Production AI",
    readTime: "6 min read",
  },
  {
    slug: "choosing-the-right-model-for-an-ai-product",
    title: "Choosing the right model for an AI product",
    excerpt:
      "The best model is not always the largest. Product requirements should determine the balance between quality, speed and cost.",
    category: "AI Engineering",
    readTime: "5 min read",
  },
];

export const blogCategories = [
  "All",
  "AI Products",
  "AI Agents",
  "Automation",
  "AI Engineering",
  "Integration",
  "Production AI",
];
