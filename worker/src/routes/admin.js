import {
  deleteDraft,
  archivePage,
  createPage,
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
} from '../services/cms.js'
import { authRequired, authenticate } from '../services/auth.js'
import { httpError, json, readJsonBody } from '../services/http.js'
import { deleteMedia, getMedia, listMedia, updateMediaAlt, uploadMedia } from '../services/media.js'
import { validatePageContent } from '../validation/content.js'
import { listTemplates } from '../../../src/cms/templateRegistry.js'

export async function routeRequest(request, env) {
  const url = new URL(request.url)
  const method = request.method.toUpperCase()
  const parts = url.pathname.replace(/^\/api\/admin\/?/, '').split('/').filter(Boolean)

  if (method === 'OPTIONS') {
    // Cross-origin admin calls are only for local development (admin on Vite, Worker on wrangler).
    return new Response(null, { status: 204, headers: authRequired(env, request) ? {} : corsHeaders() })
  }

  const { actor, mode } = await authenticate(request, env)
  if (authRequired(env, request) && method !== 'GET' && method !== 'HEAD') assertSameOrigin(request, url)

  if (method === 'GET' && parts.length === 1 && parts[0] === 'me') {
    return json({ actor, mode })
  }

  if (method === 'GET' && parts.length === 1 && parts[0] === 'pages') {
    return json({ pages: await listPages(env.CMS_DB) })
  }

  if (method === 'POST' && parts.length === 1 && parts[0] === 'pages') {
    const body = await readJsonBody(request)
    const page = await createPage(env.CMS_DB, body, actor)
    return json({ page }, 201)
  }

  if (method === 'GET' && parts.length === 1 && parts[0] === 'templates') {
    return json({ templates: listTemplates() })
  }

  if (parts[0] === 'media') {
    return routeMediaRequest(request, env, method, parts.slice(1), url, actor)
  }

  if (parts[0] !== 'pages' || !parts[1]) {
    return json({ error: 'Not found' }, 404)
  }

  const pageId = decodeURIComponent(parts[1])

  if (method === 'GET' && parts.length === 2) {
    const page = await getPage(env.CMS_DB, pageId)
    return page ? json({ page }) : json({ error: 'Page not found' }, 404)
  }

  if (method === 'GET' && parts.length === 3 && parts[2] === 'draft') {
    const draft = await getDraft(env.CMS_DB, pageId)
    return draft ? json({ draft }) : json({ draft: null })
  }

  if (method === 'PUT' && parts.length === 3 && parts[2] === 'draft') {
    const body = await readJsonBody(request)
    const page = await getPage(env.CMS_DB, pageId)
    if (!page) return json({ error: 'Page not found' }, 404)

    const content = body?.content
    const validation = validatePageContent(page, content)
    if (!validation.ok) {
      return json({ error: 'Invalid content', details: validation.errors }, 400)
    }

    const draft = await upsertDraft(env.CMS_DB, page, content, actor)
    return json({ draft })
  }

  if (method === 'DELETE' && parts.length === 3 && parts[2] === 'draft') {
    const page = await getPage(env.CMS_DB, pageId)
    if (!page) return json({ error: 'Page not found' }, 404)
    const result = await deleteDraft(env.CMS_DB, page, actor)
    return json(result)
  }

  if (method === 'POST' && parts.length === 3 && parts[2] === 'publish') {
    const body = await readJsonBody(request)
    const page = await getPage(env.CMS_DB, pageId)
    if (!page) return json({ error: 'Page not found' }, 404)
    const published = await publishDraft(env.CMS_DB, page, (_contentType, content) => validatePageContent(page, content), {
      expectedDraftSavedAt: body?.expectedDraftSavedAt,
      actor,
    })
    return json({ page: published })
  }

  if (method === 'POST' && parts.length === 3 && parts[2] === 'archive') {
    const page = await getPage(env.CMS_DB, pageId)
    if (!page) return json({ error: 'Page not found' }, 404)
    return json({ page: await archivePage(env.CMS_DB, page, actor) })
  }

  if (method === 'POST' && parts.length === 3 && parts[2] === 'unarchive') {
    const page = await getPage(env.CMS_DB, pageId)
    if (!page) return json({ error: 'Page not found' }, 404)
    return json({ page: await restorePage(env.CMS_DB, page, actor) })
  }

  if (method === 'DELETE' && parts.length === 2) {
    const page = await getPage(env.CMS_DB, pageId)
    if (!page) return json({ error: 'Page not found' }, 404)
    return json(await deletePage(env.CMS_DB, page, actor))
  }

  if (method === 'GET' && parts.length === 3 && parts[2] === 'versions') {
    const page = await getPage(env.CMS_DB, pageId)
    if (!page) return json({ error: 'Page not found' }, 404)
    const versions = await listVersions(env.CMS_DB, pageId)
    return json({ versions })
  }

  if (parts[2] === 'versions' && parts[3]) {
    const versionId = decodeURIComponent(parts[3])

    if (method === 'GET' && parts.length === 4) {
      const version = await getVersion(env.CMS_DB, pageId, versionId)
      return version ? json({ version }) : json({ error: 'Version not found' }, 404)
    }

    if (method === 'POST' && parts.length === 5 && parts[4] === 'restore') {
      const page = await getPage(env.CMS_DB, pageId)
      if (!page) return json({ error: 'Page not found' }, 404)
      const draft = await restoreVersion(env.CMS_DB, page, versionId, actor)
      return json({ draft })
    }
  }

  return json({ error: 'Not found' }, 404)
}

async function routeMediaRequest(request, env, method, parts, url, actor) {
  if (method === 'GET' && parts.length === 0) {
    const media = await listMedia(env.CMS_DB, {
      query: url.searchParams.get('q'),
      limit: url.searchParams.get('limit'),
    })
    return json({ media })
  }

  if (method === 'POST' && parts.length === 1 && parts[0] === 'upload') {
    return json({ media: await uploadMedia(request, env, actor) }, 201)
  }

  if (parts.length !== 1) return json({ error: 'Not found' }, 404)
  const mediaId = decodeURIComponent(parts[0])

  if (method === 'GET') {
    const media = await getMedia(env.CMS_DB, mediaId)
    return media ? json({ media }) : json({ error: 'Media not found' }, 404)
  }

  if (method === 'PUT') {
    const body = await readJsonBody(request)
    const media = await updateMediaAlt(env.CMS_DB, mediaId, body?.altText, actor)
    return media ? json({ media }) : json({ error: 'Media not found' }, 404)
  }

  if (method === 'DELETE') {
    const result = await deleteMedia(env, mediaId, actor)
    return result ? json(result) : json({ error: 'Media not found' }, 404)
  }

  return json({ error: 'Not found' }, 404)
}

// Writes must come from the CMS's own origin (defence in depth next to the bearer token; blocks
// cross-site form posts). Browsers always send Origin on these requests.
function assertSameOrigin(request, url) {
  if (request.headers.get('Origin') !== url.origin) {
    throw httpError(403, 'Admin write requests must come from the CMS origin')
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}
