// URL rules for pages created in the CMS ("+ Add Page"). Shared by the admin form (instant
// feedback) and the CMS Worker (authoritative check). A CMS page always lives at /<slug>
// (one segment) and can never take a URL that belongs to the coded site or the platform.
import { contentRegistry } from './contentRegistry.js'

// Platform paths plus every first URL segment of the coded site (derived from the content
// registry, so a new coded section is reserved automatically). test-pages checks main.jsx too.
const PLATFORM_SEGMENTS = ['admin', 'api', 'media', 'assets', 'cdn-cgi', 'uploads', 'social', 'static', 'public', '404', 'index']
const CODE_SEGMENTS = contentRegistry
  .map(entry => entry.route.split('/')[1])
  .filter(segment => segment && !segment.startsWith('__'))

export const RESERVED_SEGMENTS = new Set([...PLATFORM_SEGMENTS, ...CODE_SEGMENTS])

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_SLUG_LENGTH = 80

// "AI Strategy & Ops!" -> "ai-strategy-ops"
export function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, '')
}

// Returns an editor-friendly error, or '' when the slug is acceptable (uniqueness is checked separately).
export function slugError(slug) {
  if (!slug) return 'Enter a URL slug.'
  if (slug.length > MAX_SLUG_LENGTH) return `Keep the URL slug under ${MAX_SLUG_LENGTH} characters.`
  if (!SLUG_PATTERN.test(slug)) return 'Use lowercase letters, numbers and single hyphens only.'
  if (RESERVED_SEGMENTS.has(slug)) return `/${slug} is already used by the website. Choose another URL.`
  return ''
}

export const routeForSlug = slug => `/${slug}`
