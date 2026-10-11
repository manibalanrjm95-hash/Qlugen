import { httpError } from './http.js'

// The admin site (Hostinger) and the API (Cloud Functions) are different origins, so the admin API
// answers CORS only for the configured origins (CMS_ALLOWED_ORIGINS). Writes must come from one of
// them (replaces the Worker's same-origin check; blocks cross-site form posts). The bearer token is
// still required for every request; no cookies are used.

const ALLOWED_METHODS = 'GET,POST,PUT,DELETE,OPTIONS'
const ALLOWED_HEADERS = 'Authorization, Content-Type'

export function isAllowedOrigin(origin, config) {
  return Boolean(origin) && config.allowedOrigins.includes(origin)
}

export function preflightResponse(request, config, { permissive = false } = {}) {
  const origin = request.headers.get('Origin') || ''
  const headers = new Headers({ 'Cache-Control': 'no-store' })
  if (permissive || isAllowedOrigin(origin, config)) {
    headers.set('Access-Control-Allow-Origin', permissive ? '*' : origin)
    headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS)
    headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS)
    headers.set('Access-Control-Max-Age', '600')
    headers.set('Vary', 'Origin')
  }
  return new Response(null, { status: 204, headers })
}

export function assertWriteOrigin(request, config) {
  const method = request.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD') return
  if (!isAllowedOrigin(request.headers.get('Origin') || '', config)) {
    throw httpError(403, 'Admin write requests must come from an allowed CMS origin')
  }
}

// Adds CORS (allowed origins only, or "*" for local development) and no-store to an admin response.
export function withAdminHeaders(response, request, config, { permissive = false } = {}) {
  const headers = new Headers(response.headers)
  const origin = request.headers.get('Origin') || ''
  headers.delete('Access-Control-Allow-Origin')
  if (permissive) headers.set('Access-Control-Allow-Origin', '*')
  else if (isAllowedOrigin(origin, config)) headers.set('Access-Control-Allow-Origin', origin)
  headers.set('Vary', 'Origin')
  headers.set('Cache-Control', 'no-store')
  headers.set('X-Content-Type-Options', 'nosniff')
  return new Response(response.body, { status: response.status, headers })
}
