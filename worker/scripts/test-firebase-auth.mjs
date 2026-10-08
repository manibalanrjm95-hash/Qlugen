// Firebase Email/Password sign-in for /admin, end to end and fully local: the Firebase Auth
// EMULATOR (no real Firebase project or users), an isolated throwaway CMS database, the CMS Worker in
// sign-in-required mode, and the admin app through the Vite dev server. Nothing touches Firebase or
// Cloudflare, and nothing is left behind.
//
//   npm run cms:test:auth
//
// Covers: /admin shows the sign-in screen; invalid login; approved admin signs in and edits (audit
// actor = verified email); a valid Firebase user who is not an approved admin is refused; an expired
// token returns to sign-in; Sign out; /api/admin/* protection (and /api/public/* stays open).
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, openSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as wait } from 'node:timers/promises'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const workerDir = path.join(root, 'worker')
const persistDir = '.wrangler/auth-test'
const logDir = path.join(workerDir, '.tmp')
const emulatorDir = path.join(logDir, 'firebase-auth-emulator')
const PROJECT = 'demo-qlugen-cms' // "demo-" projects never contact real Firebase
const EMULATOR = '127.0.0.1:9399'
const api = 'http://127.0.0.1:8807'
const site = 'http://127.0.0.1:5307'
const ADMIN = { email: 'admin@qlugen.test', password: 'Admin-password-1' }
const VISITOR = { email: 'visitor@qlugen.test', password: 'Visitor-password-1' }

rmSync(path.join(workerDir, persistDir), { recursive: true, force: true })
rmSync(emulatorDir, { recursive: true, force: true })
mkdirSync(emulatorDir, { recursive: true })
writeFileSync(path.join(emulatorDir, 'firebase.json'), JSON.stringify({ emulators: { auth: { host: '127.0.0.1', port: 9399 }, ui: { enabled: false } } }))
run(`npx wrangler d1 migrations apply qlugen-cms-local --local --persist-to ${persistDir}`, workerDir)
run('node worker/scripts/generate-seed-sql.mjs --out worker/.tmp/auth-seed.sql', root)
run(`npx wrangler d1 execute qlugen-cms-local --local --persist-to ${persistDir} --file .tmp/auth-seed.sql`, workerDir)

const processes = [spawnLogged(`npx firebase emulators:start --only auth --project ${PROJECT} --config "${path.join(emulatorDir, 'firebase.json')}"`, emulatorDir, {}, 'auth-emulator')]

let browser
try {
  await waitFor(`http://${EMULATOR}/`)
  const admin = await createUser(ADMIN)
  const visitor = await createUser(VISITOR)

  // CMS Worker in sign-in-required mode on loopback (CMS_ENV is not "local"); only ADMIN is approved.
  processes.push(spawnLogged(
    `npx wrangler dev --local --port 8807 --persist-to ${persistDir} --var CMS_ENV:auth-test --var FIREBASE_PROJECT_ID:${PROJECT} --var CMS_ADMIN_UIDS:${admin.localId} --var FIREBASE_AUTH_EMULATOR_HOST:${EMULATOR}`,
    workerDir, {}, 'auth-worker',
  ))
  processes.push(spawnLogged('npx vite --host 127.0.0.1 --port 5307 --strictPort', root, {
    CMS_DEV_API_TARGET: api,
    VITE_CMS_API_BASE: '',
    VITE_FIREBASE_API_KEY: 'demo-api-key',
    VITE_FIREBASE_AUTH_DOMAIN: `${PROJECT}.firebaseapp.com`,
    VITE_FIREBASE_PROJECT_ID: PROJECT,
    VITE_FIREBASE_APP_ID: 'demo-app',
    VITE_FIREBASE_AUTH_EMULATOR_HOST: EMULATOR,
  }, 'auth-vite'))
  await waitFor(`${api}/api/public/pages?ids=home`)
  await waitFor(`${site}/`)

  await testAdminApiProtection(admin, visitor)

  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))

  // /admin without a session: sign-in screen only.
  await page.goto(`${site}/admin`)
  await page.getByRole('heading', { name: 'Sign in' }).waitFor()
  assertEqual(await page.locator('.cms-ref__sidebar').count(), 0, 'CMS hidden before sign-in')
  await shot(page, 'login-screen')

  // Invalid login.
  await signInWith(page, ADMIN.email, 'wrong-password')
  await page.getByRole('alert').getByText('Incorrect email or password.').waitFor()
  await shot(page, 'login-invalid')
  await signInWith(page, 'nobody@qlugen.test', 'whatever-1')
  await page.getByRole('alert').getByText('Incorrect email or password.').waitFor()
  assertEqual(await page.locator('.cms-ref__sidebar').count(), 0, 'invalid login does not open the CMS')
  console.log('Invalid login: wrong password / unknown user -> "Incorrect email or password.", CMS stays closed.')

  // A real Firebase user who is not an approved CMS admin.
  await signInWith(page, VISITOR.email, VISITOR.password)
  await page.getByRole('heading', { name: 'Access not allowed' }).waitFor()
  assertEqual(await page.locator('.cms-ref__sidebar').count(), 0, 'non-admin never sees the CMS')
  await shot(page, 'login-not-allowed')
  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.getByRole('heading', { name: 'Sign in' }).waitFor()
  console.log('Non-admin Firebase user: verified by the Worker, refused (403) -> "Access not allowed" + Sign out.')

  // Approved admin.
  await signInWith(page, ADMIN.email, ADMIN.password)
  await page.locator(`.cms-ref__identity[data-identity="${ADMIN.email}"]`).waitFor()
  await page.getByText(`Signed in as ${ADMIN.email}`).waitFor()
  await page.frameLocator('.cms-ref__canvas iframe.cms-ref__preview-iframe').locator('h1').first().waitFor()
  await shot(page, 'admin-signed-in')

  // Edits are attributed to the verified email, never to anything the browser claims.
  const preview = page.frameLocator('.cms-ref__canvas iframe.cms-ref__preview-iframe')
  await preview.locator('[data-cms-field="hero.titleLines"]').click()
  await page.locator('.cms-ref__panel textarea').first().fill('Signed-in edit\nsecond line')
  await page.locator('.cms-ref__actions').getByRole('button', { name: 'Save Draft' }).click()
  await page.locator('.cms-ref__status', { hasText: /^Draft$/ }).waitFor()
  const draft = await apiJson('/api/admin/pages/home/draft', await idToken(ADMIN))
  assertEqual(draft.draft.createdBy, ADMIN.email, 'audit actor is the verified Firebase email')

  // The session survives a reload (Firebase keeps the user signed in).
  await page.reload()
  await page.getByText(`Signed in as ${ADMIN.email}`).waitFor()
  console.log('Approved admin: signs in, CMS opens, Save Draft attributed to the verified email, session survives reload.')

  // Expired token: the Worker rejects it -> back to sign-in.
  const expired = forgedToken({ sub: admin.localId, email: ADMIN.email, exp: Math.floor(Date.now() / 1000) - 600 })
  await page.route('**/api/admin/**', route => route.continue({ headers: { ...route.request().headers(), authorization: `Bearer ${expired}` } }))
  await page.locator('[data-record-id="company-about"]').click()
  await page.getByRole('heading', { name: 'Sign in' }).waitFor()
  await page.getByText('Your session has expired. Please sign in again.').waitFor()
  await page.unroute('**/api/admin/**')
  await shot(page, 'login-expired')
  console.log('Expired token: Worker returns 401 -> signed out, back to sign-in with "Your session has expired".')

  // Sign out.
  await signInWith(page, ADMIN.email, ADMIN.password)
  await page.getByText(`Signed in as ${ADMIN.email}`).waitFor()
  await page.locator('.cms-ref__signout').click()
  await page.getByRole('heading', { name: 'Sign in' }).waitFor()
  await page.getByText('You have signed out.').waitFor()
  await page.goto(`${site}/admin`)
  await page.getByRole('heading', { name: 'Sign in' }).waitFor()
  assertEqual(await page.locator('.cms-ref__sidebar').count(), 0, 'after Sign out, /admin needs sign-in again')
  console.log('Sign out: back to sign-in; reopening /admin requires signing in again.')

  assertEqual(pageErrors.length, 0, `no page errors (${pageErrors.join(' | ')})`)
  console.log('Firebase sign-in tests passed (emulator users and isolated database removed).')
} finally {
  await browser?.close()
  processes.forEach(stopProcess)
  await wait(800)
  rmSync(path.join(workerDir, persistDir), { recursive: true, force: true })
  rmSync(emulatorDir, { recursive: true, force: true })
}

async function testAdminApiProtection(admin, visitor) {
  const adminToken = await idToken(ADMIN)
  const visitorToken = await idToken(VISITOR)
  const status = async (requestPath, token, init = {}) => (await fetch(`${api}${requestPath}`, {
    ...init,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers || {}) },
  })).status

  assertEqual(await status('/api/admin/pages'), 401, 'no token -> 401')
  assertEqual(await status('/api/admin/pages', 'garbage'), 401, 'garbage token -> 401')
  assertEqual(await status('/api/admin/pages', forgedToken({ sub: admin.localId, email: ADMIN.email })), 401, 'token not issued by Firebase -> 401')
  assertEqual(await status('/api/admin/pages', forgedToken({ sub: admin.localId, email: ADMIN.email, exp: Math.floor(Date.now() / 1000) - 600 })), 401, 'expired token -> 401')
  assertEqual(await status('/api/admin/pages', visitorToken), 403, 'verified non-admin -> 403')
  assertEqual(await status('/api/admin/pages', null, { headers: { 'X-Firebase-Uid': admin.localId, 'X-User-Email': ADMIN.email } }), 401, 'identity headers without a token -> 401')
  assertEqual(await status('/api/admin/pages/home/draft', visitorToken, { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: api }, body: '{}' }), 403, 'non-admin cannot write')
  assertEqual(await status('/api/admin/pages', adminToken), 200, 'approved admin -> 200')
  const me = await apiJson('/api/admin/me', adminToken)
  assertEqual(`${me.mode}/${me.actor}`, `firebase/${ADMIN.email}`, 'identity = verified Firebase email')
  assertEqual((await fetch(`${api}/api/public/pages?ids=home`)).status, 200, '/api/public stays open')
  assertEqual((await fetch(`${api}/api/public/pages?ids=home`, { method: 'POST' })).status, 405, '/api/public stays read-only')
  console.log('Admin API protection: no/garbage/forged/expired token 401, non-admin 403, approved admin 200; public API open and read-only.')
}

async function createUser({ email, password }) {
  const response = await fetch(`http://${EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(`emulator signUp failed: ${JSON.stringify(body)}`)
  return body
}

async function idToken({ email, password }) {
  const response = await fetch(`http://${EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  })
  return (await response.json()).idToken
}

// An unsigned token shaped like an emulator token but NOT issued by the emulator for this session.
function forgedToken(claims) {
  const now = Math.floor(Date.now() / 1000)
  const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({
    iss: `https://securetoken.google.com/${PROJECT}`,
    aud: PROJECT,
    iat: now - 60,
    exp: now + 3600,
    auth_time: now - 60,
    user_id: claims.sub,
    email_verified: false,
    firebase: { sign_in_provider: 'password', identities: { email: [claims.email] } },
    ...claims,
  })}.`
}

async function apiJson(requestPath, token) {
  const response = await fetch(`${api}${requestPath}`, { headers: { Authorization: `Bearer ${token}` } })
  const body = await response.json()
  if (!response.ok) throw new Error(`GET ${requestPath} failed: ${body.error || response.status}`)
  return body
}

async function signInWith(page, email, password) {
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

async function shot(page, name) {
  if (process.env.CMS_EDITOR_SCREENSHOTS) await page.screenshot({ path: path.join(process.env.CMS_EDITOR_SCREENSHOTS, `${name}.png`) })
}

function run(command, cwd) {
  const result = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', command], { cwd, encoding: 'utf8' })
    : spawnSync('sh', ['-c', command], { cwd, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`Command failed: ${command}\n${result.stdout}\n${result.stderr}`)
}

function spawnLogged(command, cwd, env, name) {
  const log = openSync(path.join(logDir, `${name}.log`), 'w')
  const options = { cwd, env: { ...process.env, ...env }, stdio: ['ignore', log, log], shell: true }
  return spawn(command, options)
}

async function waitFor(url) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      // keep polling
    }
    await wait(500)
  }
  throw new Error(`Timed out waiting for ${url}`)
}

function stopProcess(child) {
  if (!child.pid) return
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
  else child.kill()
}

function assert(value, message) {
  if (!value) throw new Error(`Assertion failed: ${message}`)
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`Assertion failed: ${message}. Expected ${expected}, got ${actual}`)
}
