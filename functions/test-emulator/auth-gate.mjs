// cmsAdminApi sign-in gate in the real Functions emulator with the Auth emulator (no Java needed):
// real Firebase ID tokens verified by the Admin SDK inside the deployed-shape function.
//   npm run cms:fb:test:auth
// (Data routes need the Firestore/Storage emulators, which need Java: see the report.)
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as wait } from 'node:timers/promises'

const functionsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const root = path.resolve(functionsDir, '..')
const PROJECT = 'demo-qlugen-cms'
const AUTH = '127.0.0.1:9099'
const API = `http://127.0.0.1:5001/${PROJECT}/asia-south1/cmsAdminApi`
const envFile = path.join(functionsDir, `.env.${PROJECT}`)
const ORIGIN = 'https://qlugen.in'

if (existsSync(path.join(functionsDir, '.env.local'))) {
  console.error('functions/.env.local exists and would override this test\'s settings; move it aside and run again.')
  process.exit(1)
}
writeFileSync(envFile, `CMS_ADMIN_UIDS=test-admin-uid\nCMS_ADMIN_EMAILS=\nCMS_ALLOWED_ORIGINS=${ORIGIN}\nCMS_LOCAL_BYPASS=false\n`)

const emulators = spawn(`npx firebase emulators:start --only auth,functions --project ${PROJECT}`, { cwd: root, shell: true, stdio: ['ignore', 'pipe', 'pipe'] })
let output = ''
emulators.stdout.on('data', data => { output += data })
emulators.stderr.on('data', data => { output += data })

try {
  await until(async () => (await fetch(`${API}/api/admin/me`).catch(() => null))?.status === 401, 'cmsAdminApi in the Functions emulator')
  const admin = await createUser('test-admin-uid', 'admin@qlugen.test')
  const visitor = await createUser('test-visitor-uid', 'visitor@qlugen.test')

  const call = (requestPath, { token, method = 'GET', origin, body } = {}) => fetch(`${API}${requestPath}`, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(origin ? { Origin: origin } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body,
  })
  const check = async (label, response, status, extra = () => true) => {
    const data = await response.json().catch(() => ({}))
    if (response.status !== status || !extra(data, response)) throw new Error(`${label}: expected ${status}, got ${response.status} ${JSON.stringify(data)}`)
    console.log(`PASS ${label} -> ${response.status}${data.actor ? ` ${data.mode}/${data.actor}` : data.error ? ` "${data.error}"` : ''}`)
  }

  await check('no token', await call('/api/admin/me'), 401)
  await check('garbage token', await call('/api/admin/me', { token: 'not.a.token' }), 401)
  await check('valid Firebase user who is not an admin', await call('/api/admin/me', { token: visitor }), 403)
  await check('approved admin (UID allow-list)', await call('/api/admin/me', { token: admin, origin: ORIGIN }), 200,
    (data, response) => data.actor === 'admin@qlugen.test' && data.mode === 'firebase' && response.headers.get('access-control-allow-origin') === ORIGIN && response.headers.get('cache-control') === 'no-store')
  await check('approved admin from a foreign origin gets no CORS', await call('/api/admin/me', { token: admin, origin: 'https://evil.test' }), 200,
    (data, response) => response.headers.get('access-control-allow-origin') === null)
  await check('write from a foreign origin', await call('/api/admin/pages', { token: admin, method: 'POST', origin: 'https://evil.test', body: '{}' }), 403)
  await check('write without a token', await call('/api/admin/pages', { method: 'POST', origin: ORIGIN, body: '{}' }), 401)
  const preflight = await fetch(`${API}/api/admin/pages`, { method: 'OPTIONS', headers: { Origin: ORIGIN, 'Access-Control-Request-Method': 'PUT', 'Access-Control-Request-Headers': 'authorization,content-type' } })
  if (preflight.status !== 204 || preflight.headers.get('access-control-allow-origin') !== ORIGIN) throw new Error(`preflight: ${preflight.status} ${preflight.headers.get('access-control-allow-origin')}`)
  console.log('PASS CORS preflight from the allowed origin -> 204')
  console.log('cmsAdminApi sign-in gate passed in the Functions + Auth emulators.')
} catch (error) {
  console.error(error.message)
  console.error(output.split('\n').slice(-25).join('\n'))
  process.exitCode = 1
} finally {
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(emulators.pid), '/T', '/F'], { stdio: 'ignore' })
  else emulators.kill()
  await wait(500)
  rmSync(envFile, { force: true })
}

async function createUser(localId, email) {
  const created = await fetch(`http://${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
    body: JSON.stringify({ localId, email, password: 'Password-123' }),
  })
  if (!created.ok) throw new Error(`create user ${email}: ${await created.text()}`)
  const signedIn = await fetch(`http://${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Password-123', returnSecureToken: true }),
  })
  return (await signedIn.json()).idToken
}

async function until(probe, label) {
  for (let attempt = 0; attempt < 180; attempt += 1) {
    if (await probe()) return
    await wait(500)
  }
  throw new Error(`Timed out waiting for ${label}`)
}
