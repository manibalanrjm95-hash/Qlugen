import { httpError } from './http.js'
import { SYSTEM_ACTOR } from './records.js'

// Admin authentication for /api/admin/*: Firebase Email/Password, verified HERE, server side.
//
// - Local development: no sign-in; every write is attributed to SYSTEM_ACTOR. Allowed ONLY when
//   BOTH CMS_ENV="local" (set solely in the top-level wrangler.toml used by `wrangler dev`) AND the
//   request was addressed to a loopback host (localhost / 127.0.0.1 / ::1). A deployed Worker is
//   only ever reached through its Cloudflare hostname, so even a mis-deployed local config fails
//   closed instead of becoming an open admin API.
// - Everything else (staging, any non-loopback host): the browser sends the signed-in user's
//   Firebase ID token as `Authorization: Bearer <token>`. The Worker verifies it: RS256 signature
//   against Google's published Firebase keys, issuer + audience = this Firebase project, expiry,
//   issue/auth time, and that the user signed in with Email/Password. The user must then be an
//   approved CMS admin (CMS_ADMIN_UIDS, or CMS_ADMIN_EMAILS with a verified email). The audit
//   actor is the verified email. Identity sent any other way by the browser is never trusted, and
//   no passwords are ever seen or stored by the CMS.
//
// Config (wrangler.toml [env.*.vars] or `wrangler secret put ... --env <env>`):
//   FIREBASE_PROJECT_ID  Firebase project id (token audience)
//   CMS_ADMIN_UIDS       comma-separated Firebase UIDs allowed to use the CMS (preferred)
//   CMS_ADMIN_EMAILS     comma-separated emails allowed to use the CMS (email must be verified)
// Test-only, honoured ONLY for loopback addresses (unreachable from a deployed Worker):
//   FIREBASE_JWKS_URL            http://127.0.0.1:<port>/... signing keys for minted test tokens
//   FIREBASE_AUTH_EMULATOR_HOST  127.0.0.1:<port> of the Firebase Auth emulator

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
const JWKS_TTL_MS = 60 * 60 * 1000
const CLOCK_SKEW_SECONDS = 30
let jwksCache = { url: '', fetchedAt: 0, keys: [] }

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1'])

export function isLocalDevelopment(env, request) {
  if (env.CMS_ENV !== 'local') return false
  try {
    return LOOPBACK_HOSTS.has(new URL(request.url).hostname)
  } catch {
    return false
  }
}

export function authRequired(env, request) {
  return !isLocalDevelopment(env, request)
}

export async function authenticate(request, env) {
  if (isLocalDevelopment(env, request)) return { actor: SYSTEM_ACTOR, mode: 'local' }

  const projectId = String(env.FIREBASE_PROJECT_ID || '').trim()
  const admins = adminLists(env)
  if (!projectId || (!admins.uids.size && !admins.emails.size)) {
    throw httpError(503, 'CMS sign-in is not configured for this environment')
  }

  const token = bearerToken(request)
  if (!token) throw httpError(401, 'Sign in required')

  const claims = await verifyFirebaseIdToken(token, env, projectId)
  const email = typeof claims.email === 'string' ? claims.email.trim().toLowerCase() : ''
  const allowed = admins.uids.has(claims.sub) || (email && claims.email_verified === true && admins.emails.has(email))
  if (!allowed) throw httpError(403, 'This account is not allowed to use the CMS.')

  return { actor: (email || `firebase:${claims.sub}`).slice(0, 200), uid: claims.sub, mode: 'firebase' }
}

export async function verifyFirebaseIdToken(token, env, projectId) {
  const segments = String(token).split('.')
  if (segments.length !== 3) throw invalid('malformed token')

  let header
  let claims
  try {
    header = JSON.parse(textFromBase64Url(segments[0]))
    claims = JSON.parse(textFromBase64Url(segments[1]))
  } catch {
    throw invalid('malformed token')
  }

  const emulatorHost = loopbackHost(env.FIREBASE_AUTH_EMULATOR_HOST)
  if (emulatorHost) {
    // Emulator tokens are unsigned; the emulator itself confirms the token belongs to its user.
    await confirmWithEmulator(emulatorHost, token, claims)
  } else {
    if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw invalid('unsupported token algorithm')
    const key = await signingKey(env, header.kid)
    const signed = new TextEncoder().encode(`${segments[0]}.${segments[1]}`)
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, bytesFromBase64Url(segments[2]), signed)
    if (!valid) throw invalid('bad signature')
  }

  const now = Math.floor(Date.now() / 1000)
  if (claims.iss !== `https://securetoken.google.com/${projectId}`) throw invalid('wrong issuer')
  if (claims.aud !== projectId) throw invalid('wrong audience')
  if (typeof claims.exp !== 'number' || claims.exp <= now - CLOCK_SKEW_SECONDS) throw httpError(401, 'Your sign-in has expired')
  if (typeof claims.iat !== 'number' || claims.iat > now + CLOCK_SKEW_SECONDS) throw invalid('issued in the future')
  if (typeof claims.auth_time !== 'number' || claims.auth_time > now + CLOCK_SKEW_SECONDS) throw invalid('bad auth time')
  if (typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 128) throw invalid('missing user')
  if (claims.firebase?.sign_in_provider !== 'password') throw invalid('not an email/password sign-in')
  return claims
}

function adminLists(env) {
  const list = value => new Set(String(value || '').split(',').map(item => item.trim()).filter(Boolean))
  return {
    uids: list(env.CMS_ADMIN_UIDS),
    emails: new Set([...list(env.CMS_ADMIN_EMAILS)].map(email => email.toLowerCase())),
  }
}

function bearerToken(request) {
  const header = request.headers.get('Authorization') || ''
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim())
  return match ? match[1] : ''
}

async function signingKey(env, kid) {
  const url = jwksUrl(env)
  let jwk = (await loadJwks(url, false)).find(key => key.kid === kid)
  if (!jwk) jwk = (await loadJwks(url, true)).find(key => key.kid === kid) // key rotation
  if (!jwk) throw invalid('unknown signing key')
  return crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])
}

// Google's keys, unless a loopback test key server is configured (local tests only).
function jwksUrl(env) {
  const override = String(env.FIREBASE_JWKS_URL || '').trim()
  if (!override) return GOOGLE_JWKS_URL
  try {
    const url = new URL(override)
    if (url.protocol === 'http:' && LOOPBACK_HOSTS.has(url.hostname)) return url.href
  } catch {
    // fall through
  }
  return GOOGLE_JWKS_URL
}

async function loadJwks(url, forceRefresh) {
  const fresh = jwksCache.url === url && Date.now() - jwksCache.fetchedAt < JWKS_TTL_MS
  if (fresh && !forceRefresh) return jwksCache.keys

  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw httpError(503, 'Could not load Firebase signing keys')
  const data = await response.json()
  const keys = Array.isArray(data?.keys) ? data.keys.filter(key => key.kty === 'RSA') : []
  jwksCache = { url, fetchedAt: Date.now(), keys }
  return keys
}

// "127.0.0.1:9099" -> "127.0.0.1:9099" only for loopback hosts; anything else is ignored.
function loopbackHost(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  try {
    const url = new URL(`http://${raw}`)
    return LOOPBACK_HOSTS.has(url.hostname) && url.port ? url.host : ''
  } catch {
    return ''
  }
}

async function confirmWithEmulator(host, token, claims) {
  let response
  try {
    response = await fetch(`http://${host}/identitytoolkit.googleapis.com/v1/accounts:lookup?key=emulator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    })
  } catch {
    throw httpError(503, 'Firebase Auth emulator unavailable')
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.users?.[0]?.localId !== claims.sub) throw invalid('rejected by emulator')
}

function invalid(reason) {
  return httpError(401, `Invalid sign-in token (${reason})`)
}

function bytesFromBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0))
}

function textFromBase64Url(value) {
  return new TextDecoder().decode(bytesFromBase64Url(value))
}
