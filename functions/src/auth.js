import { getAuth } from 'firebase-admin/auth'
import { httpError } from './http.js'

export async function authenticate(request, config, { verifyIdToken = defaultVerify, env = process.env } = {}) {
  if (config.authDisabled) {
    return {
      actor: 'public-admin',
      uid: 'auth-disabled',
      mode: 'disabled',
      projectId: env.GCLOUD_PROJECT || env.GCP_PROJECT || '',
    }
  }

  if (!config.adminUids.length) throw httpError(503, 'CMS sign-in is not configured for this environment')

  const token = bearerToken(request)
  if (!token) throw httpError(401, 'Sign in required')

  let claims
  try {
    claims = await verifyIdToken(token)
  } catch (error) {
    if (error?.code === 'auth/id-token-expired') throw httpError(401, 'Sign in required')
    if (error?.code === 'auth/id-token-revoked') throw httpError(401, 'Sign in required')
    throw httpError(401, 'Sign in required')
  }

  if (!config.adminUids.includes(claims.uid)) throw httpError(403, 'Not authorized')

  const email = typeof claims.email === 'string' ? claims.email.trim().toLowerCase() : ''
  return {
    actor: (email || `firebase:${claims.uid}`).slice(0, 200),
    uid: claims.uid,
    mode: 'firebase',
    projectId: env.GCLOUD_PROJECT || env.GCP_PROJECT || '',
  }
}

function defaultVerify(token) {
  return getAuth().verifyIdToken(token)
}

function bearerToken(request) {
  const match = /^Bearer\s+(\S+)$/i.exec((request.headers.get('Authorization') || '').trim())
  return match ? match[1] : ''
}
