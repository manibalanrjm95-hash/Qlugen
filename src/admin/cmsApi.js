import { currentIdToken } from './firebaseAuth'

const apiBase = (import.meta.env.VITE_CMS_API_BASE || '').replace(/\/+$/, '')

// Identity as verified by the Worker (Firebase admin in staging, "local-admin" in local dev).
export async function getIdentity() {
  return request('/api/admin/me')
}

export async function listPages() {
  return request('/api/admin/pages')
}

export async function listTemplates() {
  return request('/api/admin/templates')
}

export async function createPage({ title, slug, template }) {
  return request('/api/admin/pages', {
    method: 'POST',
    body: JSON.stringify({ title, slug, template }),
  })
}

export async function getPage(id) {
  return request(`/api/admin/pages/${encodeURIComponent(id)}`)
}

export async function getDraft(id) {
  return request(`/api/admin/pages/${encodeURIComponent(id)}/draft`)
}

export async function saveDraft(id, content) {
  return request(`/api/admin/pages/${encodeURIComponent(id)}/draft`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
}

export async function publishDraft(id, expectedDraftSavedAt) {
  return request(`/api/admin/pages/${encodeURIComponent(id)}/publish`, {
    method: 'POST',
    body: JSON.stringify({ expectedDraftSavedAt }),
  })
}

export async function archivePage(id) {
  return request(`/api/admin/pages/${encodeURIComponent(id)}/archive`, { method: 'POST' })
}

export async function restorePage(id) {
  return request(`/api/admin/pages/${encodeURIComponent(id)}/unarchive`, { method: 'POST' })
}

export async function deletePage(id) {
  return request(`/api/admin/pages/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function listVersions(id) {
  return request(`/api/admin/pages/${encodeURIComponent(id)}/versions`)
}

export async function getVersion(id, versionId) {
  return request(`/api/admin/pages/${encodeURIComponent(id)}/versions/${encodeURIComponent(versionId)}`)
}

export async function restoreVersion(id, versionId) {
  return request(`/api/admin/pages/${encodeURIComponent(id)}/versions/${encodeURIComponent(versionId)}/restore`, {
    method: 'POST',
  })
}

export async function resetDraft(id) {
  return request(`/api/admin/pages/${encodeURIComponent(id)}/draft`, { method: 'DELETE' })
}

export async function listMedia(query = '') {
  const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''
  return request(`/api/admin/media${params}`)
}

export async function getMedia(id) {
  return request(`/api/admin/media/${encodeURIComponent(id)}`)
}

export async function uploadMedia(file, alt = '') {
  const form = new FormData()
  form.append('file', file)
  form.append('alt', alt)
  return request('/api/admin/media/upload', { method: 'POST', body: form })
}

export async function updateMediaAlt(id, altText) {
  return request(`/api/admin/media/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ altText }),
  })
}

export async function deleteMedia(id) {
  return request(`/api/admin/media/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// Worker-served media URLs are relative (/media/...); point them at the CMS API when it runs on another origin.
export function mediaSrc(url) {
  return typeof url === 'string' && url.startsWith('/media/') ? `${apiBase}${url}` : url
}

// Local development = Vite dev server or a loopback host: connection failures are reported as
// "CMS API not reachable" (with how to start it).
const isLocalAdmin = import.meta.env.DEV
  || ['localhost', '127.0.0.1', '[::1]'].includes(globalThis.location?.hostname)

export const SESSION_EXPIRED_EVENT = 'cms:session-expired'
const SESSION_EXPIRED_MESSAGE = 'Your sign-in session has ended. Please sign in again.'

// A CMS API that accepts connections but never answers (e.g. a hung local Worker) must not leave
// the admin waiting forever: requests time out and surface an error instead.
const REQUEST_TIMEOUT_MS = 12000
const UPLOAD_TIMEOUT_MS = 120000

async function request(path, options = {}) {
  const isForm = options.body instanceof FormData
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), isForm ? UPLOAD_TIMEOUT_MS : REQUEST_TIMEOUT_MS)
  // The signed-in admin's Firebase ID token; the Worker verifies it on every request.
  // (Local development has no sign-in: no token, and the local Worker needs none.)
  const token = await currentIdToken().catch(() => null)
  let response
  try {
    response = await fetch(`${apiBase}${path}`, {
      headers: {
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      redirect: 'manual',
      signal: controller.signal,
      ...options,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw apiTimedOut()
    throw isLocalAdmin ? apiUnreachable() : new Error('Cannot reach the CMS. Check your connection and try again.')
  } finally {
    clearTimeout(timer)
  }

  let data
  try {
    data = await response.json()
  } catch {
    // A non-JSON reply means the request never reached the CMS Worker.
    throw isLocalAdmin ? apiUnreachable() : new Error('The CMS returned an unexpected response. Please try again.')
  }
  // A rejected token (expired, revoked, signed out elsewhere) sends the editor back to sign-in.
  if (response.status === 401 && token) throw sessionExpired()
  if (!response.ok) {
    const error = new Error(data.error || `Request failed: ${response.status}`)
    error.status = response.status
    throw error
  }
  return data
}

function apiTimedOut() {
  return new Error(isLocalAdmin
    ? `The local CMS API${apiBase ? ` at ${apiBase}` : ''} is not responding. Restart it with "npm run cms:dev".`
    : 'The CMS is not responding. Please try again.')
}

function apiUnreachable() {
  return new Error(`Cannot reach the local CMS API${apiBase ? ` at ${apiBase}` : ''}. Start it with "npm run cms:dev".`)
}

function sessionExpired() {
  globalThis.dispatchEvent?.(new Event(SESSION_EXPIRED_EVENT))
  const error = new Error(SESSION_EXPIRED_MESSAGE)
  error.status = 401
  return error
}
