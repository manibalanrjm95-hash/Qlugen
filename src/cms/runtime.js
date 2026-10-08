// Published-content runtime for the public site (local/staging only).
//
// VITE_CMS_RUNTIME_ENABLED=true  -> for each route, load ONLY the CMS records that route renders
//                                   (its page + global navigation/footer, plus collection records
//                                   on product/insight listings) from the Worker's read-only API.
// unset / anything else          -> no request is made; pages use their local JSON exactly as before.
//
// Any failure or timeout falls back to local JSON for the rest of the session. Loaded content is
// design-locked (presentation fields stripped) and media references are resolved to plain URLs,
// so it is only ever passed to the existing page components as their normal `content` data.
import { stripDesignKeys } from '../lib/designLock'
import { normalizeMediaContent } from '../lib/media'
import { contentRegistry } from './contentRegistry'

export const cmsRuntimeEnabled = import.meta.env.VITE_CMS_RUNTIME_ENABLED === 'true'

const apiBase = (import.meta.env.VITE_CMS_API_BASE || '').replace(/\/+$/, '')
const timeoutMs = Number(import.meta.env.VITE_CMS_RUNTIME_TIMEOUT_MS) || 3000

const GLOBAL_IDS = ['global-navigation', 'global-footer']
const routeIds = new Map(contentRegistry.filter(entry => !entry.route.startsWith('/__global')).map(entry => [entry.route, entry.id]))
const collectionIds = prefix => contentRegistry.filter(entry => entry.id.startsWith(prefix)).map(entry => entry.id)
// Product pages list/cross-link every product; the insights listing shows every article.
const PRODUCT_IDS = collectionIds('product-')
const INSIGHT_IDS = collectionIds('insight-')

const cache = new Map() // page id -> prepared published content, or null when not published
let unavailable = false

// CMS record ids rendered by a public route. /admin uses its own API and needs none.
export function cmsIdsForPath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/admin' || path.startsWith('/admin/')) return []

  const ids = new Set(GLOBAL_IDS)
  if (path === '/products' || path.startsWith('/products/')) PRODUCT_IDS.forEach(id => ids.add(id))
  if (path === '/insights') INSIGHT_IDS.forEach(id => ids.add(id))
  ids.add(routeIds.get(path) || 'global-not-found')
  return [...ids]
}

export function isCmsContentReady(pathname) {
  return !cmsRuntimeEnabled || unavailable || cmsIdsForPath(pathname).every(id => cache.has(id))
}

export async function loadPublishedContentFor(pathname) {
  if (isCmsContentReady(pathname)) return

  const missing = cmsIdsForPath(pathname).filter(id => !cache.has(id))
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${apiBase}/api/public/pages?ids=${missing.map(encodeURIComponent).join(',')}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!data?.pages || typeof data.pages !== 'object') throw new Error('Unexpected response')

    for (const id of missing) {
      const content = data.pages[id]
      cache.set(id, content && typeof content === 'object' && !Array.isArray(content) ? prepare(content) : null)
    }
  } catch (error) {
    // Stop asking for this session so every later navigation renders immediately from local JSON.
    unavailable = true
    console.warn(`[cms] Published content unavailable, using local content (${error.message})`)
  } finally {
    clearTimeout(timer)
  }
}

// A published page created with "+ Add Page" at this path: { template, content }, or null.
// Never called for coded routes (React Router matches those first).
export async function loadPublishedRoute(pathname) {
  if (!cmsRuntimeEnabled || unavailable) return null
  const path = pathname.replace(/\/+$/, '') || '/'
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${apiBase}/api/public/route?path=${encodeURIComponent(path)}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    return data.page?.template && data.page.content ? { template: data.page.template, content: prepare(data.page.content) } : null
  } catch (error) {
    console.warn(`[cms] Page lookup unavailable, showing not found (${error.message})`)
    return null
  } finally {
    clearTimeout(timer)
  }
}

// Published content for a CMS page id, or `fallback` (local JSON / undefined) when unavailable.
export function cmsContent(id, fallback) {
  return cache.get(id) ?? fallback
}

function prepare(content) {
  return normalizeMediaContent(stripDesignKeys(content), { resolveUrl: resolveMediaUrl })
}

function resolveMediaUrl(url) {
  return typeof url === 'string' && url.startsWith('/media/') ? `${apiBase}${url}` : url
}
