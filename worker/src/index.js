import { routeRequest } from './routes/admin.js'
import { routePublicRequest } from './routes/public.js'
import { authRequired } from './services/auth.js'
import { json } from './services/http.js'
import { serveMedia } from './services/media.js'

// Routes:
//   /media/*        public, read-only R2 images
//   /api/public/*   public, read-only published content
//   /api/admin/*    CMS API; verified Firebase admin required outside local dev (services/auth.js)
//   /admin          admin app shell (staging: static assets). Public: it shows the sign-in screen;
//                   every CMS read/write goes through /api/admin/*, which is protected.
//   everything else static site assets when an ASSETS binding exists (staging), else 404
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const method = request.method.toUpperCase()
    const isAdminApi = url.pathname.startsWith('/api/admin/')

    try {
      if (url.pathname.startsWith('/media/') && (method === 'GET' || method === 'HEAD')) {
        return await serveMedia(request, env, decodeURIComponent(url.pathname.slice('/media/'.length)))
      }

      if (url.pathname.startsWith('/api/public/')) {
        return await routePublicRequest(request, env)
      }

      if (isAdminApi) {
        return protectAdminResponse(await routeRequest(request, env), env, request)
      }

      if (env.ASSETS) return env.ASSETS.fetch(request)
      return json({ error: 'Not found' }, 404)
    } catch (error) {
      const response = error.status
        ? json({ error: error.message, ...error.extra }, error.status)
        : json({ error: 'Internal server error' }, 500)
      if (!error.status) console.error(error)
      return isAdminApi ? protectAdminResponse(response, env, request) : response
    }
  },
}

// Outside local dev the admin API is same-origin only (no CORS) and never cached.
function protectAdminResponse(response, env, request) {
  if (!authRequired(env, request)) return response
  const headers = new Headers(response.headers)
  headers.delete('Access-Control-Allow-Origin')
  headers.set('Cache-Control', 'no-store')
  return new Response(response.body, { status: response.status, headers })
}
