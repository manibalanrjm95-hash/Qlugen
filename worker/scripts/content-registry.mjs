export const contentRegistry = [
  { id: 'global-navigation', route: '/__global/navigation', slug: 'navigation', contentType: 'globalNavigation', title: 'Global Navigation', file: 'src/content/global/navigation.json' },
  { id: 'global-footer', route: '/__global/footer', slug: 'footer', contentType: 'globalFooter', title: 'Global Footer', file: 'src/content/global/footer.json' },
  { id: 'global-seo', route: '/__global/seo', slug: 'seo', contentType: 'globalSeo', title: 'Global SEO', file: 'src/content/global/seo.json' },
  { id: 'global-not-found', route: '/404', slug: 'not-found', contentType: 'globalNotFound', title: 'Not Found', file: 'src/content/global/not-found.json' },
  { id: 'home', route: '/', slug: 'home', contentType: 'home', title: 'Home', file: 'src/content/home.json' },
  { id: 'capabilities-overview', route: '/capabilities', slug: 'capabilities', contentType: 'capabilitiesOverview', title: 'Capabilities Overview', file: 'src/content/capabilities/overview.json' },
  { id: 'products-overview', route: '/products', slug: 'products', contentType: 'productsOverview', title: 'Products Overview', file: 'src/content/products/overview.json' },
  { id: 'industries-overview', route: '/industries', slug: 'industries', contentType: 'industriesOverview', title: 'Industries Overview', file: 'src/content/industries/overview.json' },
  { id: 'agentic-overview', route: '/agentic-ai', slug: 'agentic-ai', contentType: 'agenticOverview', title: 'Agentic AI Overview', file: 'src/content/agentic-ai/overview.json' },
  { id: 'how-we-work', route: '/how-we-work', slug: 'how-we-work', contentType: 'howWeWork', title: 'How We Work', file: 'src/content/how-we-work.json' },
  { id: 'technology', route: '/technology', slug: 'technology', contentType: 'technology', title: 'Technology', file: 'src/content/technology.json' },
  { id: 'insights-overview', route: '/insights', slug: 'insights', contentType: 'insightsOverview', title: 'Insights Overview', file: 'src/content/insights/overview.json' },
  { id: 'company-overview', route: '/company', slug: 'company', contentType: 'company', title: 'Company Overview', file: 'src/content/company/overview.json' },
  { id: 'company-about', route: '/about', slug: 'about', contentType: 'about', title: 'About', file: 'src/content/company/about.json' },
  { id: 'company-leadership', route: '/leadership', slug: 'leadership', contentType: 'leadership', title: 'Leadership', file: 'src/content/company/leadership.json' },
  { id: 'company-careers', route: '/careers', slug: 'careers', contentType: 'careers', title: 'Careers', file: 'src/content/company/careers.json' },
  { id: 'contact', route: '/contact', slug: 'contact', contentType: 'contact', title: 'Contact', file: 'src/content/contact.json' },
  { id: 'legal-privacy', route: '/privacy', slug: 'privacy', contentType: 'legal', title: 'Privacy', file: 'src/content/legal/privacy.json' },
  { id: 'legal-terms', route: '/terms', slug: 'terms', contentType: 'legal', title: 'Terms', file: 'src/content/legal/terms.json' },
  { id: 'legal-cookies', route: '/cookies', slug: 'cookies', contentType: 'legal', title: 'Cookies', file: 'src/content/legal/cookies.json' },
  ...collection('capability', '/capabilities', 'capabilityDetail', 'src/content/capabilities/details', [
    'ai-agent-development',
    'automation',
    'cloud-infrastructure',
    'cybersecurity',
    'data-analytics',
    'digital-transformation',
    'sustainability',
  ]),
  ...collection('product', '/products', 'productDetail', 'src/content/products/details', [
    'ai-governance',
    'ai-readiness-assessment',
    'analytics-migration-factory',
    'cloud-optimize',
    'data-agent-platform',
    'data-governance',
    'data-migration-factory',
    'qlugen-context',
  ]),
  ...collection('industry', '/industries', 'industryDetail', 'src/content/industries/details', [
    'energy-utilities',
    'financial-services',
    'government',
    'healthcare',
    'manufacturing',
    'retail-commerce',
  ]),
  ...collection('agentic', '/agentic-ai', 'agenticDetail', 'src/content/agentic-ai/details', [
    'build-run',
    'discover',
    'govern',
    'orchestrate',
    'scale',
  ]),
  ...collection('insight', '/insights', 'insightArticle', 'src/content/insights/articles', [
    'agentic-enterprise-operating-model',
    'ai-pilots-to-enterprise-impact',
    'modernise-without-slowing-business',
  ]),
]

function collection(prefix, routeBase, contentType, dir, slugs) {
  return slugs.map(slug => ({
    id: `${prefix}-${slug}`,
    route: `${routeBase}/${slug}`,
    slug,
    contentType,
    title: titleFromSlug(slug),
    file: `${dir}/${slug}.json`,
  }))
}

function titleFromSlug(slug) {
  return slug.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join(' ')
}
