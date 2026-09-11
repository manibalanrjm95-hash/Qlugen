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

function renderJsonLd(pathname, origin) {
  if (normalisePath(pathname) !== '/') return ''
  const graphs = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Qlugen',
      url: origin + '/',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Qlugen',
      url: origin + '/',
      logo: origin + '/favicon.svg',
    },
  ]
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
