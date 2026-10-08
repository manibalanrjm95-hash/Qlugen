// Admin sidebar for the coded site's pages. Pages created with "+ Add Page" are added to the
// group named by their template (see src/cms/templateRegistry.js).
export const adminGroups = [
  {
    label: 'Home',
    items: [
      item('home', 'Overview'),
    ],
  },
  {
    label: 'Capabilities',
    items: [
      item('capabilities-overview', 'Overview'),
      item('capability-ai-agent-development', 'AI Agent Development'),
      item('capability-automation', 'Automation'),
      item('capability-cloud-infrastructure', 'Cloud Infrastructure'),
      item('capability-cybersecurity', 'Cybersecurity'),
      item('capability-data-analytics', 'Data Analytics'),
      item('capability-digital-transformation', 'Digital Transformation'),
      item('capability-sustainability', 'Sustainability'),
    ],
  },
  {
    label: 'Products & Platforms',
    items: [
      item('products-overview', 'Overview'),
      item('product-ai-readiness-assessment', 'AI Readiness Assessment'),
      item('product-data-migration-factory', 'Data Migration Factory'),
      item('product-analytics-migration-factory', 'Analytics Migration Factory'),
      item('product-cloud-optimize', 'Cloud Optimize'),
      item('product-data-governance', 'Data Governance'),
      item('product-ai-governance', 'AI Governance'),
      item('product-qlugen-context', 'Qlugen Context'),
      item('product-data-agent-platform', 'Data Agent Platform'),
    ],
  },
  {
    label: 'Industries',
    items: [
      item('industries-overview', 'Overview'),
      item('industry-energy-utilities', 'Energy & Utilities'),
      item('industry-financial-services', 'Financial Services'),
      item('industry-government', 'Government'),
      item('industry-healthcare', 'Healthcare'),
      item('industry-manufacturing', 'Manufacturing'),
      item('industry-retail-commerce', 'Retail & Commerce'),
    ],
  },
  {
    label: 'Agentic AI',
    items: [
      item('agentic-overview', 'Overview'),
      item('agentic-build-run', 'Build & Run'),
      item('agentic-discover', 'Discover'),
      item('agentic-govern', 'Govern'),
      item('agentic-orchestrate', 'Orchestrate'),
      item('agentic-scale', 'Scale'),
    ],
  },
  {
    label: 'Insights',
    items: [
      item('insights-overview', 'Overview'),
      item('insight-agentic-enterprise-operating-model', 'Agentic Enterprise Operating Model'),
      item('insight-ai-pilots-to-enterprise-impact', 'AI Pilots to Enterprise Impact'),
      item('insight-modernise-without-slowing-business', 'Modernise Without Slowing Business'),
    ],
  },
  {
    label: 'Company',
    items: [
      item('company-overview', 'Overview'),
      item('company-about', 'About'),
      item('company-leadership', 'Leadership'),
      item('company-careers', 'Careers'),
      item('how-we-work', 'How We Work'),
      item('technology', 'Technology'),
      item('contact', 'Contact'),
    ],
  },
  {
    label: 'Legal',
    items: [
      item('legal-privacy', 'Privacy'),
      item('legal-terms', 'Terms'),
      item('legal-cookies', 'Cookies'),
    ],
  },
  {
    label: 'Global',
    items: [
      item('global-navigation', 'Navigation'),
      item('global-footer', 'Footer'),
      item('global-seo', 'SEO'),
      item('global-not-found', 'Not Found'),
    ],
  },
]

export const supportedRecordIds = adminGroups.flatMap(group => group.items.map(entry => entry.id))

function item(id, label) {
  return { id, label }
}
