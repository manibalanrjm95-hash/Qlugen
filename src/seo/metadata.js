import { seoPages } from './pages.js'

export const socialImagePath = '/social/qlugen.png'

export function normalisePath(pathname) {
  return pathname.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
}

export function validateOrigin(origin) {
  const url = new URL(origin)
  if (url.protocol !== 'https:' || url.origin !== origin ||
      url.username || url.password ||
      /(^|\.)(web\.app|firebaseapp\.com|localhost)$/.test(url.hostname)) {
    throw new Error('SEO requires the confirmed HTTPS production custom origin, without a trailing slash.')
  }
  return origin
}

// Shared descriptors keep built HTML and browser navigation in sync.
export function metadataTags(pathname, origin) {
  validateOrigin(origin)
  const path = normalisePath(pathname)
  const knownPage = Object.hasOwn(seoPages, path)
  const page = knownPage ? seoPages[path] : {
    title: 'Page Not Found | Qlugen',
    description: 'The requested Qlugen page could not be found. Explore our enterprise technology capabilities or contact our team.',
  }
  const canonical = new URL(path, origin).href
  const image = new URL(socialImagePath, origin).href
  const meta = (key, content) => ({
    tag: 'meta', attrs: { [key.startsWith('og:') ? 'property' : 'name']: key, content },
  })
  return [
    { tag: 'title', text: page.title },
    meta('description', page.description),
    ...(knownPage ? [{ tag: 'link', attrs: { rel: 'canonical', href: canonical } }] : [meta('robots', 'noindex, follow')]),
    meta('og:title', page.title),
    meta('og:description', page.description),
    meta('og:type', path.startsWith('/insights/') && knownPage ? 'article' : 'website'),
    meta('og:site_name', 'Qlugen'),
    ...(knownPage ? [meta('og:url', canonical)] : []),
    meta('og:image', image),
    meta('og:image:type', 'image/png'),
    meta('og:image:width', '1200'),
    meta('og:image:height', '630'),
    meta('og:image:alt', 'Qlugen logo'),
    meta('twitter:card', 'summary_large_image'),
    meta('twitter:title', page.title),
    meta('twitter:description', page.description),
    meta('twitter:image', image),
    meta('twitter:image:alt', 'Qlugen logo'),
  ]
}

export function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
}

const articleData = {
  '/insights/ai-pilots-to-enterprise-impact': {
    headline: 'From AI pilots to enterprise impact',
    description: 'Why enterprise AI depends on operating models, integration and governance as much as the models themselves.',
    datePublished: '2026-08-01',
  },
  '/insights/modernise-without-slowing-business': {
    headline: 'Modernise without slowing the business',
    description: 'How organisations can reduce legacy complexity while protecting the operations they depend on today.',
    datePublished: '2026-07-01',
  },
  '/insights/agentic-enterprise-operating-model': {
    headline: 'Designing the operating model for an agentic enterprise',
    description: 'What changes when AI agents become active participants in enterprise workflows.',
    datePublished: '2026-06-01',
  },
}

const breadcrumbMap = {
  '/capabilities/data-analytics':           [['Capabilities', '/capabilities'], ['Data & Analytics', '/capabilities/data-analytics']],
  '/capabilities/ai-agent-development':     [['Capabilities', '/capabilities'], ['AI & Agent Development', '/capabilities/ai-agent-development']],
  '/capabilities/cloud-infrastructure':     [['Capabilities', '/capabilities'], ['Cloud & Infrastructure', '/capabilities/cloud-infrastructure']],
  '/capabilities/cybersecurity':            [['Capabilities', '/capabilities'], ['Cybersecurity', '/capabilities/cybersecurity']],
  '/capabilities/automation':               [['Capabilities', '/capabilities'], ['Automation', '/capabilities/automation']],
  '/capabilities/digital-transformation':   [['Capabilities', '/capabilities'], ['Digital Transformation', '/capabilities/digital-transformation']],
  '/capabilities/sustainability':           [['Capabilities', '/capabilities'], ['Sustainability', '/capabilities/sustainability']],
  '/industries/financial-services':         [['Industries', '/industries'], ['Financial Services', '/industries/financial-services']],
  '/industries/healthcare':                 [['Industries', '/industries'], ['Healthcare', '/industries/healthcare']],
  '/industries/retail-commerce':            [['Industries', '/industries'], ['Retail & Commerce', '/industries/retail-commerce']],
  '/industries/manufacturing':              [['Industries', '/industries'], ['Manufacturing', '/industries/manufacturing']],
  '/industries/government':                 [['Industries', '/industries'], ['Government', '/industries/government']],
  '/industries/energy-utilities':           [['Industries', '/industries'], ['Energy & Utilities', '/industries/energy-utilities']],
  '/agentic-ai/orchestrate':                [['Agentic AI', '/agentic-ai'], ['Orchestrate', '/agentic-ai/orchestrate']],
  '/agentic-ai/build-run':                  [['Agentic AI', '/agentic-ai'], ['Build & Run', '/agentic-ai/build-run']],
  '/agentic-ai/discover':                   [['Agentic AI', '/agentic-ai'], ['Discover', '/agentic-ai/discover']],
  '/agentic-ai/govern':                     [['Agentic AI', '/agentic-ai'], ['Govern', '/agentic-ai/govern']],
  '/agentic-ai/scale':                      [['Agentic AI', '/agentic-ai'], ['Scale', '/agentic-ai/scale']],
  '/insights/ai-pilots-to-enterprise-impact':      [['Insights', '/insights'], ['From AI pilots to enterprise impact', '/insights/ai-pilots-to-enterprise-impact']],
  '/insights/modernise-without-slowing-business':  [['Insights', '/insights'], ['Modernise without slowing the business', '/insights/modernise-without-slowing-business']],
  '/insights/agentic-enterprise-operating-model':  [['Insights', '/insights'], ['Designing the operating model for an agentic enterprise', '/insights/agentic-enterprise-operating-model']],
  '/leadership': [['Company', '/company'], ['Leadership', '/leadership']],
}

function renderJsonLd(pathname, origin) {
  const path = normalisePath(pathname)
  const graphs = []
  const qlugenOrg = { '@type': 'Organization', name: 'Qlugen', url: origin + '/' }

  // ── Homepage: WebSite + Organization ──────────────────────────────────────
  if (path === '/') {
    graphs.push(
      { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Qlugen', url: origin + '/' },
      { '@context': 'https://schema.org', '@type': 'Organization', name: 'Qlugen', url: origin + '/', logo: origin + '/favicon.png' },
    )
  }

  // ── Leadership: Person ────────────────────────────────────────────────────
  if (path === '/leadership') {
    graphs.push({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Vinay Pachunoori',
      url: origin + '/leadership',
      worksFor: qlugenOrg,
      description: 'Enterprise technology leader with 23+ years of experience across Oracle, eBay, Amazon, Walmart and Coupang.',
      sameAs: ['https://www.linkedin.com/in/vinaypachunoori'],
    })
  }

  // ── Insight articles: Article ─────────────────────────────────────────────
  if (Object.hasOwn(articleData, path)) {
    const a = articleData[path]
    graphs.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.headline,
      description: a.description,
      datePublished: a.datePublished,
      image: origin + '/social/qlugen.png',
      author: qlugenOrg,
      publisher: { ...qlugenOrg, '@type': 'Organization', logo: { '@type': 'ImageObject', url: origin + '/favicon.png' } },
      url: origin + path,
      mainEntityOfPage: { '@type': 'WebPage', '@id': origin + path },
    })
  }

  // ── BreadcrumbList for hierarchical sub-pages ─────────────────────────────
  if (Object.hasOwn(breadcrumbMap, path)) {
    const crumbs = [['Home', '/'], ...breadcrumbMap[path]]
    graphs.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map(([name, p], i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name,
        item: origin + p,
      })),
    })
  }

  if (graphs.length === 0) return ''
  return graphs
    .map(g => `<script type="application/ld+json" data-qlugen-seo>${JSON.stringify(g)}</script>`)
    .join('\n    ')
}

export function renderMetadata(pathname, origin) {
  const tags = metadataTags(pathname, origin).map(({ tag, attrs = {}, text }) => {
    const attributes = Object.entries(attrs).map(([key, value]) => ` ${key}="${escapeHtml(value)}"`).join('')
    return tag === 'title'
      ? `<title data-qlugen-seo>${escapeHtml(text)}</title>`
      : `<${tag} data-qlugen-seo${attributes} />`
  }).join('\n    ')
  const jsonLd = renderJsonLd(pathname, origin)
  return jsonLd ? `${tags}\n    ${jsonLd}` : tags
}

export function replaceMetadata(html, pathname, origin) {
  const clean = html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<(?:meta|link)\b[^>]*\bdata-qlugen-seo\b[^>]*>/gi, '')
    .replace(/<script\b[^>]*\bdata-qlugen-seo\b[^>]*>[\s\S]*?<\/script>/gi, '')
  return clean.replace('</head>', `    ${renderMetadata(pathname, origin)}\n  </head>`)
}
