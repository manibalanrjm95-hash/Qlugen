import { resolveCmsMediaUrl } from '../cms/storageUrls'
import { currentIdToken } from './firebaseAuth'

const apiBase = (import.meta.env.VITE_CMS_API_BASE || '').replace(/\/+$/, '')
const apiLabel = 'Firebase CMS API'

// Identity as verified by the Firebase CMS API.
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

// CMS media URLs are stored as "/media/<path>": Firebase Storage when VITE_CMS_STORAGE_BASE is set
// or in Vite dev, otherwise the rollback Worker origin (see src/cms/storageUrls.js).
export function mediaSrc(url) {
  return resolveCmsMediaUrl(url, apiBase)
}

// A CMS API that accepts connections but never answers must not leave
// the admin waiting forever: requests time out and surface an error instead.
const REQUEST_TIMEOUT_MS = 12000
const UPLOAD_TIMEOUT_MS = 120000

async function request(path, options = {}) {
  const isForm = options.body instanceof FormData
  const token = await currentIdToken()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), isForm ? UPLOAD_TIMEOUT_MS : REQUEST_TIMEOUT_MS)
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
    throw apiUnreachable()
  } finally {
    clearTimeout(timer)
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    if (response.status >= 500) throw backendError(response.status)
    throw new Error(`The ${apiLabel} returned an unexpected response. Please try again.`)
  }
  if (!response.ok) {
    if (response.status >= 500) throw backendError(response.status, data?.error)
    const error = new Error(data.error || `Request failed: ${response.status}`)
    error.status = response.status
    throw error
  }
  return data
}

function apiTimedOut() {
  return new Error(`The ${apiLabel}${apiBase ? ` at ${apiBase}` : ''} is not responding. Please try again.`)
}

function apiUnreachable() {
  return new Error(`Cannot reach the ${apiLabel}${apiBase ? ` at ${apiBase}` : ''}. Check the function URL and CORS settings.`)
}

function backendError(status, message = '') {
  const error = new Error(`${apiLabel[0].toUpperCase()}${apiLabel.slice(1)} returned ${status}${message ? `: ${message}` : ''}.`)
  error.status = status
  return error
}

