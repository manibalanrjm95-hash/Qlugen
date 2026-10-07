import { stripDesignKeys } from '../../../src/lib/designLock.js'

// Read-only content API for the public site. Returns ONLY the current published version of each
// page (via cms_pages.published_version_id): never drafts, archived versions or admin metadata.
export async function routePublicRequest(request, env) {
  const url = new URL(request.url)
  const method = request.method.toUpperCase()
  const parts = url.pathname.replace(/^\/api\/public\/?/, '').split('/').filter(Boolean)

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: publicHeaders() })
  if (method !== 'GET') return publicJson({ error: 'Method not allowed' }, 405)

  if (parts.length === 1 && parts[0] === 'content') {
    const result = await env.CMS_DB.prepare(
      `SELECT p.id, v.content_json
       FROM cms_pages p
       JOIN cms_versions v ON v.id = p.published_version_id AND v.page_id = p.id AND v.status = 'published'
       ORDER BY p.id`
    ).all()

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

  return publicJson({ error: 'Not found' }, 404)
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
