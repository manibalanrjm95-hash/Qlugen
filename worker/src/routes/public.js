import { stripDesignKeys } from '../../../src/lib/designLock.js'
import { isTemplateKey } from '../../../src/cms/templateRegistry.js'

const MAX_IDS = 20
const PAGE_ID = /^[a-z0-9-]{1,80}$/

// Read-only content API for the public site. Returns ONLY the current published version of each
// page (via cms_pages.published_version_id): never drafts, archived versions or admin metadata.
export async function routePublicRequest(request, env) {
  const url = new URL(request.url)
  const method = request.method.toUpperCase()
  const parts = url.pathname.replace(/^\/api\/public\/?/, '').split('/').filter(Boolean)

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: publicHeaders() })
  if (method !== 'GET') return publicJson({ error: 'Method not allowed' }, 405)

  // GET /api/public/pages?ids=home,global-navigation,global-footer
  if (parts.length === 1 && parts[0] === 'pages') {
    const ids = [...new Set((url.searchParams.get('ids') || '').split(',').map(id => id.trim()).filter(Boolean))]
    if (ids.length === 0 || ids.length > MAX_IDS || !ids.every(id => PAGE_ID.test(id))) {
      return publicJson({ error: `Provide 1-${MAX_IDS} page ids` }, 400)
    }

    const result = await env.CMS_DB.prepare(
      `SELECT p.id, v.content_json
       FROM cms_pages p
       JOIN cms_versions v ON v.id = p.published_version_id AND v.page_id = p.id AND v.status = 'published'
       WHERE p.id IN (${ids.map(() => '?').join(', ')})`
    ).bind(...ids).all()

    const pages = {}
    for (const row of result.results) pages[row.id] = publicContent(row.content_json)
    return publicJson({ pages })
  }

  if (parts.length === 3 && parts[0] === 'pages' && parts[2] === 'content') {
    const row = await env.CMS_DB.prepare(
      `SELECT v.content_json
       FROM cms_pages p
       JOIN cms_versions v ON v.id = p.published_version_id AND v.page_id = p.id AND v.status = 'published'
       WHERE p.id = ?`
    ).bind(decodeURIComponent(parts[1])).first()
    return row ? publicJson({ content: publicContent(row.content_json) }) : publicJson({ error: 'Not found' }, 404)
  }

  // GET /api/public/route?path=/ai-strategy -> a published page created with "+ Add Page".
  // Only CMS-created template pages are served here; archived and unpublished pages are not.
  if (parts.length === 1 && parts[0] === 'route') {
    const route = normalizeRoute(url.searchParams.get('path'))
    if (!route) return publicJson({ error: 'Provide a route path' }, 400)
    const row = await env.CMS_DB.prepare(
      `SELECT p.template_id, v.content_json
       FROM cms_pages p
       JOIN cms_versions v ON v.id = p.published_version_id AND v.page_id = p.id AND v.status = 'published'
       WHERE p.route = ? AND p.id LIKE 'custom-%' AND p.page_status = 'published'`
    ).bind(route).first()
    if (!row || !isTemplateKey(row.template_id)) return publicJson({ error: 'Not found' }, 404)
    return publicJson({ page: { template: row.template_id, content: publicContent(row.content_json) } })
  }

  return publicJson({ error: 'Not found' }, 404)
}

function normalizeRoute(value) {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return ''
  return `/${raw.replace(/^\/+/, '').replace(/\/+$/, '')}`.toLowerCase()
}

function publicContent(contentJson) {
  return stripDesignKeys(JSON.parse(contentJson))
}

function publicJson(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: publicHeaders() })
}

function publicHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    // Local/staging: always serve the latest published version so a Publish shows on the next load.
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
  }
}
