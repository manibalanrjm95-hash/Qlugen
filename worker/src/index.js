import { routeRequest } from './routes/admin.js'
import { routePublicRequest } from './routes/public.js'
import { json } from './services/http.js'
import { serveMedia } from './services/media.js'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const method = request.method.toUpperCase()

    try {
      if (url.pathname.startsWith('/media/') && (method === 'GET' || method === 'HEAD')) {
        return await serveMedia(request, env, decodeURIComponent(url.pathname.slice('/media/'.length)))
      }

      if (url.pathname.startsWith('/api/public/')) {
        return await routePublicRequest(request, env)
      }

      if (!url.pathname.startsWith('/api/admin/')) {
        return json({ error: 'Not found' }, 404)
      }

      return await routeRequest(request, env)
    } catch (error) {
      if (error.status) {
        return json({ error: error.message, ...error.extra }, error.status)
      }
      console.error(error)
      return json({ error: 'Internal server error' }, 500)
    }
  },
}
