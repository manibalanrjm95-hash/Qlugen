import { seoPages } from './pages.js'
import { escapeHtml, validateOrigin } from './metadata.js'

// This explicit public-page catalogue excludes the wildcard 404 handler and
// never discovers URLs from build files, development pages or preview output.
export function renderSitemap(origin) {
  validateOrigin(origin)
  const entries = Object.keys(seoPages).map(path => {
    const canonical = new URL(path, origin).href
    return `  <url><loc>${escapeHtml(canonical)}</loc></url>`
  })
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n')
}

export function renderRobots(origin) {
  validateOrigin(origin)
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`
}
