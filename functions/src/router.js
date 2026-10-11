import { validatePageContent } from '../../src/cms/contentValidation.js'
import { listTemplates } from '../../src/cms/templateRegistry.js'
import { authenticate } from './auth.js'
import { assertWriteOrigin, preflightResponse, withAdminHeaders } from './cors.js'
import { httpError, json, readJsonBody } from './http.js'
import {
  archivePage,
  createPage,
  deleteDraft,
  deletePage,
  getDraft,
  getPage,
  getVersion,
  listPages,
  listVersions,
  publishDraft,
  restorePage,
  restoreVersion,
  upsertDraft,
} from './cms.js'
import { deleteMedia, getMedia, listMedia, updateMediaAlt, uploadMedia } from './media.js'
import { rebuildAllSnapshots } from './snapshots.js'

// Firestore documents are capped at 1 MiB and the draft_saved audit entry holds the previous and
// the new content, so a page's content stays well under half of that (largest page today: ~17 KB).
export const MAX_CONTENT_CHARS = 300_000

// /api/admin/* on Firebase: every request needs a verified Firebase admin UID (auth.js);
// CORS only for CMS_ALLOWED_ORIGINS (cors.js).
export async function handleAdminRequest(request, config) {
  if (request.method.toUpperCase() === 'OPTIONS') return preflightResponse(request, config)
  try {
    return withAdminHeaders(await routeAdmin(request, config), request, config)
  } catch (error) {
    const response = error.status
      ? json({ error: error.message, ...error.extra }, error.status)
      : json({ error: 'Internal server error' }, 500)
    if (!error.status) console.error(error)
    return withAdminHeaders(response, request, config)
  }
}

async function routeAdmin(request, config) {
  const url = new URL(request.url)
  const method = request.method.toUpperCase()
  if (!url.pathname.startsWith('/api/admin/')) return json({ error: 'Not found' }, 404)
  const parts = url.pathname.replace(/^\/api\/admin\/?/, '').split('/').filter(Boolean)

  const { actor, mode, uid, projectId } = await authenticate(request, config)
  if (!config.authDisabled) assertWriteOrigin(request, config)

  if (method === 'GET' && parts.length === 1 && parts[0] === 'me') return json({ actor, mode, uid, projectId })
  if (method === 'GET' && parts.length === 1 && parts[0] === 'pages') return json({ pages: await listPages() })
  if (method === 'POST' && parts.length === 1 && parts[0] === 'pages') {
    return json({ page: await createPage(await readJsonBody(request), actor) }, 201)
  }
  if (method === 'GET' && parts.length === 1 && parts[0] === 'templates') return json({ templates: listTemplates() })
  if (parts[0] === 'media') return routeMedia(request, method, parts.slice(1), url, actor)
  // Recovery: rewrites every public snapshot from the current published versions in Firestore.
  if (method === 'POST' && parts.length === 2 && parts[0] === 'snapshots' && parts[1] === 'rebuild') {
    return json(await rebuildAllSnapshots())
  }
  if (parts[0] !== 'pages' || !parts[1]) return json({ error: 'Not found' }, 404)

  const pageId = decodeURIComponent(parts[1])
  const loadPage = async () => {
    const page = await getPage(pageId)
    if (!page) throw httpError(404, 'Page not found')
    return page
  }

  if (method === 'GET' && parts.length === 2) {
    const page = await getPage(pageId)
    return page ? json({ page }) : json({ error: 'Page not found' }, 404)
  }
  if (method === 'DELETE' && parts.length === 2) return json(await deletePage(await loadPage(), actor))

  if (parts.length === 3 && parts[2] === 'draft') {
    if (method === 'GET') return json({ draft: await getDraft(pageId) })
    if (method === 'PUT') {
      const body = await readJsonBody(request)
      const page = await loadPage()
      if (JSON.stringify(body?.content ?? null).length > MAX_CONTENT_CHARS) {
        return json({ error: `Page content is too large (limit ${MAX_CONTENT_CHARS / 1000} KB).` }, 413)
      }
      const validation = validatePageContent(page, body?.content)
      if (!validation.ok) return json({ error: 'Invalid content', details: validation.errors }, 400)
      return json({ draft: await upsertDraft(page, body.content, actor) })
    }
    if (method === 'DELETE') return json(await deleteDraft(await loadPage(), actor))
  }

  if (method === 'POST' && parts.length === 3 && parts[2] === 'publish') {
    const body = await readJsonBody(request)
    const page = await loadPage()
    const published = await publishDraft(page, (_contentType, content) => validatePageContent(page, content), {
      expectedDraftSavedAt: body?.expectedDraftSavedAt,
      actor,
    })
    return pageResult(published)
  }
  if (method === 'POST' && parts.length === 3 && parts[2] === 'archive') return pageResult(await archivePage(await loadPage(), actor))
  if (method === 'POST' && parts.length === 3 && parts[2] === 'unarchive') return json({ page: await restorePage(await loadPage(), actor) })

  if (method === 'GET' && parts.length === 3 && parts[2] === 'versions') {
    await loadPage()
    return json({ versions: await listVersions(pageId) })
  }
  if (parts[2] === 'versions' && parts[3]) {
    const versionId = decodeURIComponent(parts[3])
    if (method === 'GET' && parts.length === 4) {
      const version = await getVersion(pageId, versionId)
      return version ? json({ version }) : json({ error: 'Version not found' }, 404)
    }
    if (method === 'POST' && parts.length === 5 && parts[4] === 'restore') {
      return json({ draft: await restoreVersion(await loadPage(), versionId, actor) })
    }
  }

  return json({ error: 'Not found' }, 404)
}

// { page } as from the Worker, plus { warning } when the public snapshot could not be updated.
function pageResult({ warning, ...page }) {
  return json(warning ? { page, warning } : { page })
}

async function routeMedia(request, method, parts, url, actor) {
  if (method === 'GET' && parts.length === 0) {
    return json({ media: await listMedia({ query: url.searchParams.get('q'), limit: url.searchParams.get('limit') }) })
  }
  if (method === 'POST' && parts.length === 1 && parts[0] === 'upload') return json({ media: await uploadMedia(request, actor) }, 201)
  if (parts.length !== 1) return json({ error: 'Not found' }, 404)

  const mediaId = decodeURIComponent(parts[0])
  if (method === 'GET') {
    const media = await getMedia(mediaId)
    return media ? json({ media }) : json({ error: 'Media not found' }, 404)
  }
  if (method === 'PUT') {
    const body = await readJsonBody(request)
    const media = await updateMediaAlt(mediaId, body?.altText, actor)
    return media ? json({ media }) : json({ error: 'Media not found' }, 404)
  }
  if (method === 'DELETE') {
    const result = await deleteMedia(mediaId, actor)
    return result ? json(result) : json({ error: 'Media not found' }, 404)
  }
  return json({ error: 'Not found' }, 404)
}
