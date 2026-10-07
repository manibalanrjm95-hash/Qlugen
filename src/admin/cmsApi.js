const apiBase = import.meta.env.VITE_CMS_API_BASE || ''

export async function listPages() {
  return request('/api/admin/pages')
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

async function request(path, options = {}) {
  const isForm = options.body instanceof FormData
  const response = await fetch(`${apiBase}${path}`, {
    headers: isForm ? {} : { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`)
  }
  return data
}
