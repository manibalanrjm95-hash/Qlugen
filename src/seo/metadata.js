import { seoCatalogue } from './pages.js'

const { site, pages, articles, breadcrumbs, person } = seoCatalogue

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
  const knownPage = Object.hasOwn(pages, path)
  const page = knownPage ? pages[path] : site.notFound
  const canonical = new URL(path, origin).href
  const imagePath = page.ogImage || site.defaultOgImage
  const image = new URL(imagePath, origin).href
  // Dimensions and alt text are known only for the default social card.
  const defaultImage = imagePath === site.defaultOgImage
  const imageAlt = defaultImage ? site.ogImageAlt : page.title
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
    meta('og:site_name', site.siteName),
    ...(knownPage ? [meta('og:url', canonical)] : []),
    meta('og:image', image),
    ...(defaultImage ? [meta('og:image:type', 'image/png'), meta('og:image:width', '1200'), meta('og:image:height', '630')] : []),
    meta('og:image:alt', imageAlt),
    meta('twitter:card', 'summary_large_image'),
    meta('twitter:title', page.title),
    meta('twitter:description', page.description),
    meta('twitter:image', image),
    meta('twitter:image:alt', imageAlt),
  ]
}

export function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
}

function renderJsonLd(pathname, origin) {
  const path = normalisePath(pathname)
  const graphs = []
  const qlugenOrg = { '@type': 'Organization', name: site.siteName, url: origin + '/' }

  // ── Homepage: WebSite + Organization ──────────────────────────────────────
  if (path === '/') {
    graphs.push(
      { '@context': 'https://schema.org', '@type': 'WebSite', name: site.siteName, url: origin + '/' },
      { '@context': 'https://schema.org', '@type': 'Organization', name: site.siteName, url: origin + '/', logo: origin + '/favicon.png' },
    )
  }

  // ── Leadership: Person ────────────────────────────────────────────────────
  if (path === person.route) {
    graphs.push({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: person.name,
      url: origin + person.route,
      worksFor: qlugenOrg,
      description: person.description,
      sameAs: person.sameAs,
    })
  }

  // ── Insight articles: Article ─────────────────────────────────────────────
  if (Object.hasOwn(articles, path)) {
    const a = articles[path]
    graphs.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.headline,
      description: a.description,
      datePublished: a.datePublished,
      image: new URL(pages[path].ogImage || site.defaultOgImage, origin).href,
      author: qlugenOrg,
      publisher: { ...qlugenOrg, '@type': 'Organization', logo: { '@type': 'ImageObject', url: origin + '/favicon.png' } },
      url: origin + path,
      mainEntityOfPage: { '@type': 'WebPage', '@id': origin + path },
    })
  }

  // ── BreadcrumbList for hierarchical sub-pages ─────────────────────────────
  if (Object.hasOwn(breadcrumbs, path)) {
    const crumbs = [[site.homeBreadcrumbLabel, '/'], ...breadcrumbs[path]]
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
