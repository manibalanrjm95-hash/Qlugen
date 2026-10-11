import { initializeApp } from 'firebase-admin/app'
import { setGlobalOptions } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'
import { REGION, settings } from './config.js'
import { handleAdminRequest } from './router.js'

// Qlugen CMS on Firebase. One HTTPS function serves the admin API (/api/admin/*); the public
// website does NOT call a function: it reads published snapshots straight from Storage
// (see snapshots.js). Low-cost defaults: small instance, no minimum instances, capped scale-out.
initializeApp()
setGlobalOptions({ region: REGION, maxInstances: 3, memory: '256MiB', timeoutSeconds: 60 })

// URL: https://asia-south1-<project>.cloudfunctions.net/cmsAdminApi/api/admin/...
// (emulator: http://127.0.0.1:5001/<project>/asia-south1/cmsAdminApi/api/admin/...)
// cors: false -> the framework adds no CORS of its own (the Functions emulator otherwise reflects any
// origin); cors.js answers CORS for CMS_ALLOWED_ORIGINS only, identically locally and deployed.
export const cmsAdminApi = onRequest({ invoker: 'public', cors: false }, async (req, res) => {
  const response = await handleAdminRequest(toFetchRequest(req), settings())
  for (const name of ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers', 'Access-Control-Max-Age']) res.removeHeader(name)
  res.status(response.status)
  response.headers.forEach((value, key) => res.setHeader(key, value))
  res.send(Buffer.from(await response.arrayBuffer()))
})

// The route handlers use the standard Fetch API (same code shape as the former Worker).
function toFetchRequest(req) {
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach(item => headers.append(key, item))
    else if (value != null) headers.set(key, String(value))
  }
  const url = `${req.protocol || 'https'}://${req.get('host')}${req.url}`
  const hasBody = !['GET', 'HEAD'].includes(req.method.toUpperCase()) && req.rawBody?.length
  return new Request(url, { method: req.method, headers, body: hasBody ? req.rawBody : undefined })
}
