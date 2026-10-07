// Published-content runtime for the public site (local/staging only).
//
// VITE_CMS_RUNTIME_ENABLED=true  -> before the app renders, load the CURRENT PUBLISHED version of
//                                   every CMS page from the Worker's read-only public API.
// unset / anything else          -> no request is made; pages use their local JSON exactly as before.
//
// Any failure or timeout falls back to local JSON. Loaded content is design-locked (presentation
// fields stripped) and media references are resolved to plain URLs, so it is only ever passed to
// the existing page components as their normal `content` data.
import { stripDesignKeys } from '../lib/designLock'
import { normalizeMediaContent } from '../lib/media'

export const cmsRuntimeEnabled = import.meta.env.VITE_CMS_RUNTIME_ENABLED === 'true'

const apiBase = (import.meta.env.VITE_CMS_API_BASE || '').replace(/\/+$/, '')
const timeoutMs = Number(import.meta.env.VITE_CMS_RUNTIME_TIMEOUT_MS) || 3000

let publishedPages = null

export async function loadPublishedContent() {
  if (!cmsRuntimeEnabled) return

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${apiBase}/api/public/content`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!data?.pages || typeof data.pages !== 'object') throw new Error('Unexpected response')

    publishedPages = Object.fromEntries(
      Object.entries(data.pages)
        .filter(([, content]) => content && typeof content === 'object' && !Array.isArray(content))
        .map(([id, content]) => [id, prepare(content)]),
    )
  } catch (error) {
    publishedPages = null
    console.warn(`[cms] Published content unavailable, using local content (${error.message})`)
  } finally {
    clearTimeout(timer)
  }
}

// Published content for a CMS page id, or `fallback` (local JSON / undefined) when unavailable.
export function cmsContent(id, fallback) {
  return publishedPages?.[id] ?? fallback
}

function prepare(content) {
  return normalizeMediaContent(stripDesignKeys(content), { resolveUrl: resolveMediaUrl })
}

function resolveMediaUrl(url) {
  return typeof url === 'string' && url.startsWith('/media/') ? `${apiBase}${url}` : url
}
