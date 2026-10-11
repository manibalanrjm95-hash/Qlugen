// LOCAL rehearsal of the staging Worker (`--env staging`): same Worker code, staging bindings,
// staging static assets (out-staging/) and Firebase sign-in enforcement — but everything runs on
// this machine. D1/R2 are local simulations in an isolated persist dir; Firebase ID tokens are
// RS256 tokens minted here and verified by the Worker against a local key server (the loopback-only
// FIREBASE_JWKS_URL test override). Nothing touches Cloudflare or Firebase.
import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:http'
import { generateKeyPairSync, sign } from 'node:crypto'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as wait } from 'node:timers/promises'
import { chromium } from 'playwright'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const workerDir = path.join(root, 'worker')
const persistDir = '.wrangler/staging-rehearsal'
const port = 8789
const base = `http://127.0.0.1:${port}`
const PROJECT = 'qlugen-enterprise' // FIREBASE_PROJECT_ID of [env.staging] in wrangler.toml
const ADMIN_UID = 'rehearsal-admin-uid'
const EDITOR = 'editor@qlugen.test'
const EMAIL_ADMIN = 'email-admin@qlugen.test'

export async function runStagingRehearsal() {
  const keys = makeKey('rehearsal-key')
  const otherKeys = makeKey('rehearsal-key') // same kid, different key: must be rejected
  const jwks = await startJwksServer([keys.jwk])
  const jwksUrl = `http://127.0.0.1:${jwks.address().port}/firebase-keys`
  const firebaseClaims = (claims = {}) => ({
    iss: `https://securetoken.google.com/${PROJECT}`,
    aud: PROJECT,
    sub: ADMIN_UID,
    email: EDITOR,
    email_verified: true,
    auth_time: Math.floor(Date.now() / 1000) - 60,
    firebase: { sign_in_provider: 'password', identities: { email: [EDITOR] } },
    ...claims,
  })
  const token = (claims = {}) => mintToken(keys, firebaseClaims(claims))
  const bearer = value => ({ Authorization: `Bearer ${value}` })

  // Fresh, isolated local "staging" database: migrations + seed, exactly as the remote commands do.
  rmSync(path.join(workerDir, persistDir), { recursive: true, force: true })
  run(`npx vite build --outDir out-staging --emptyOutDir`, root, { VITE_CMS_RUNTIME_ENABLED: 'true', VITE_CMS_API_BASE: '/' })
  run(`npx wrangler d1 migrations apply qlugen-cms-staging --local --env staging --persist-to ${persistDir}`, workerDir)
  mkdirSync(path.join(workerDir, '.tmp'), { recursive: true })
  run('node worker/scripts/generate-seed-sql.mjs --out worker/.tmp/rehearsal-seed.sql --mode insert-missing --no-transaction', root)
  run(`npx wrangler d1 execute qlugen-cms-staging --local --env staging --persist-to ${persistDir} --file .tmp/rehearsal-seed.sql`, workerDir)

  const worker = spawnCommand(
    `npx wrangler dev --env staging --local --port ${port} --persist-to ${persistDir} --var FIREBASE_JWKS_URL:${jwksUrl} --var CMS_ADMIN_UIDS:${ADMIN_UID} --var CMS_ADMIN_EMAILS:${EMAIL_ADMIN}`,
    workerDir,
  )
  let browser
  try {
    await waitForWorker()
    const auth = bearer(token())
    const write = { ...auth, Origin: base, 'Content-Type': 'application/json' }

    // Public site + public API: no sign-in needed.
    assertEqual((await fetch(`${base}/`)).status, 200, 'public home served from staging assets')
    assert((await (await fetch(`${base}/products/ai-readiness-assessment`)).text()).includes('<div id="root">'), 'SPA route served')
    const pub = await fetch(`${base}/api/public/pages?ids=home,global-navigation,global-footer`)
    assertEqual(pub.status, 200, 'public content API works without admin login')
    assertEqual(Object.keys((await pub.json()).pages).length, 3, 'public API returns only requested pages')
    assertEqual((await fetch(`${base}/api/public/content`)).status, 404, 'bulk all-pages endpoint removed')
    assertEqual((await fetch(`${base}/api/public/pages?ids=home`, { method: 'POST' })).status, 405, 'public API read-only')
    assertEqual((await fetch(`${base}/api/public/pages?ids=${Array.from({ length: 21 }, (_, i) => `p${i}`).join(',')}`)).status, 400, 'public API caps ids')

    // Admin shell is public (it shows the sign-in screen); the admin API needs a verified admin.
    const adminShell = await fetch(`${base}/admin`)
    assertEqual(adminShell.status, 200, '/admin shell served (sign-in screen)')
    assert((await adminShell.text()).includes('<div id="root">'), '/admin returns the app shell')

    const now = Math.floor(Date.now() / 1000)
    const rejected = [
      ['no token', {}],
      ['spoofed identity headers only', { 'X-Firebase-Uid': ADMIN_UID, 'X-User-Email': EDITOR }],
      ['garbage token', bearer('not.a.jwt')],
      ['token signed by another key', bearer(mintToken(otherKeys, firebaseClaims()))],
      ['wrong audience', bearer(token({ aud: 'another-project' }))],
      ['wrong issuer', bearer(token({ iss: 'https://securetoken.google.com/another-project' }))],
      ['expired token', bearer(token({ iat: now - 7200, exp: now - 3600 }))],
      ['alg none', bearer(`${b64url({ alg: 'none', kid: 'rehearsal-key' })}.${b64url({ ...firebaseClaims(), exp: 9999999999 })}.`)],
      ['not an email/password sign-in', bearer(token({ firebase: { sign_in_provider: 'anonymous' } }))],
      ['token in a cookie instead of the Authorization header', { Cookie: `token=${token()}` }],
    ]
    for (const [label, headers] of rejected) {
      const response = await fetch(`${base}/api/admin/pages`, { headers })
      assertEqual(response.status, 401, `admin API rejects ${label}`)
      assertEqual(response.headers.get('access-control-allow-origin'), null, `no CORS on rejected admin response (${label})`)
    }
    const forbidden = [
      ['valid Firebase user who is not a CMS admin', bearer(token({ sub: 'someone-else', email: 'visitor@qlugen.test' }))],
      ['allow-listed email that is not verified', bearer(token({ sub: 'email-admin-uid', email: EMAIL_ADMIN, email_verified: false }))],
    ]
    for (const [label, headers] of forbidden) {
      assertEqual((await fetch(`${base}/api/admin/pages`, { headers })).status, 403, `admin API refuses ${label}`)
    }
    const emailAdmin = await fetch(`${base}/api/admin/me`, { headers: bearer(token({ sub: 'email-admin-uid', email: EMAIL_ADMIN.toUpperCase() })) })
    assertEqual(emailAdmin.status, 200, 'verified allow-listed email is admitted')
    assertEqual((await emailAdmin.json()).actor, EMAIL_ADMIN, 'actor is the verified email (normalised)')

    const pagesResponse = await fetch(`${base}/api/admin/pages`, { headers: auth })
    assertEqual(pagesResponse.status, 200, 'admin API works with a verified admin token')
    assertEqual(pagesResponse.headers.get('access-control-allow-origin'), null, 'admin API is same-origin only')
    assertEqual(pagesResponse.headers.get('cache-control'), 'no-store', 'admin API not cached')
    const me = await (await fetch(`${base}/api/admin/me`, { headers: auth })).json()
    assertEqual(`${me.mode}/${me.actor}`, `firebase/${EDITOR}`, 'actor is the verified Firebase email')
    assertEqual((await fetch(`${base}/api/admin/pages`, { method: 'OPTIONS' })).headers.get('access-control-allow-origin'), null, 'no CORS preflight for admin')

    // Writes: same-origin only; actor from verified identity (body actor ignored).
    const home = (await (await fetch(`${base}/api/admin/pages/home`, { headers: auth })).json()).page
    const textA = home.content.hero.titleLines[0]
    const textB = textA.replace(/o/, 'a')
    const draft = structuredClone(home.content)
    draft.hero.titleLines[0] = textB
    const body = JSON.stringify({ content: draft, actor: 'spoofed@evil.test' })
    assertEqual((await fetch(`${base}/api/admin/pages/home/draft`, { method: 'PUT', headers: { ...auth, 'Content-Type': 'application/json' }, body })).status, 403, 'write without Origin rejected')
    assertEqual((await fetch(`${base}/api/admin/pages/home/draft`, { method: 'PUT', headers: { ...write, Origin: 'https://evil.test' }, body })).status, 403, 'cross-site write rejected')
    const saved = await (await fetch(`${base}/api/admin/pages/home/draft`, { method: 'PUT', headers: write, body })).json()
    assertEqual(saved.draft.createdBy, EDITOR, 'draft actor is verified identity, not body')

    // Browser on the staging origin: Save Draft does not change the site; Publish does.
    browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const publicRequests = []
    page.on('request', request => request.url().includes('/api/') && publicRequests.push(new URL(request.url())))
    await page.goto(`${base}/`)
    await page.waitForFunction(text => document.querySelector('h1')?.innerText.includes(text), textA)
    const stylesA = await headingStyles(page)
    assert(publicRequests.every(url => url.pathname === '/api/public/pages'), 'public site only calls the public API')
    assertEqual(publicRequests[0].searchParams.get('ids'), 'global-navigation,global-footer,home', 'home loads only home + navigation + footer')

    const published = await (await fetch(`${base}/api/admin/pages/home/publish`, { method: 'POST', headers: write, body: JSON.stringify({ expectedDraftSavedAt: saved.draft.createdAt }) })).json()
    assertEqual(published.page.version.createdBy, EDITOR, 'published version actor is verified identity')
    await page.reload()
    await page.waitForFunction(text => document.querySelector('h1')?.innerText.includes(text), textB)
    assertSameStyles(stylesA, await headingStyles(page), 'staging design unchanged after publish')

    // Version history + restore.
    const versions = (await (await fetch(`${base}/api/admin/pages/home/versions`, { headers: auth })).json()).versions
    assertEqual(`${versions[0].status}/${versions[1].status}`, 'published/archived', 'version history after publish')
    const restored = await (await fetch(`${base}/api/admin/pages/home/versions/${versions[1].id}/restore`, { method: 'POST', headers: write })).json()
    assertEqual(restored.draft.content.hero.titleLines[0], textA, 'restore creates draft from old version')
    await page.reload()
    await page.waitForFunction(text => document.querySelector('h1')?.innerText.includes(text), textB)
    await fetch(`${base}/api/admin/pages/home/publish`, { method: 'POST', headers: write, body: JSON.stringify({ expectedDraftSavedAt: restored.draft.createdAt }) })
    await page.reload()
    await page.waitForFunction(text => document.querySelector('h1')?.innerText.includes(text), textA)

    // Media upload by the signed-in admin; served publicly.
    const form = new FormData()
    form.append('file', new Blob([await sharp({ create: { width: 40, height: 30, channels: 3, background: '#0f62fe' } }).png().toBuffer()], { type: 'image/png' }), 'staging-test.png')
    const noAuthUpload = await fetch(`${base}/api/admin/media/upload`, { method: 'POST', body: form })
    assertEqual(noAuthUpload.status, 401, 'media upload rejected without sign-in')
    const upload = await fetch(`${base}/api/admin/media/upload`, { method: 'POST', headers: { ...auth, Origin: base }, body: form })
    assertEqual(upload.status, 201, 'media upload works for a signed-in admin')
    const media = (await upload.json()).media
    assertEqual(media.createdBy, EDITOR, 'media created_by is verified identity')
    assertEqual((await fetch(`${base}${media.publicUrl}`)).status, 200, 'uploaded media served publicly')
    assertEqual((await fetch(`${base}/api/admin/media/${media.id}`, { method: 'DELETE', headers: write })).status, 200, 'unused media deleted by a signed-in admin')

    // /admin in a browser without a Firebase session never opens the CMS. (This rehearsal build has no
    // Firebase settings, so it fails closed; the sign-in flow itself: npm run cms:test:auth.)
    const admin = await browser.newPage()
    await admin.goto(`${base}/admin`)
    await admin.getByText('Sign-in is not configured for this CMS build').waitFor()
    assertEqual(await admin.locator('.cms-ref__sidebar').count(), 0, 'CMS not shown without a verified admin')

    // Audit actor comes only from verified identities.
    const audit = d1(`SELECT DISTINCT actor FROM cms_audit_log WHERE actor IS NOT 'seed'`)
    assertEqual(JSON.stringify(audit.map(row => row.actor).sort()), JSON.stringify([EDITOR]), 'audit actor is the verified Firebase email')

    console.log('Staging rehearsal passed: Firebase ID tokens verified server-side on /api/admin/* (signature, project, expiry, provider, admin allow-list), public API open and read-only, verified actor in audit, publish/restore/media on staging config.')
  } finally {
    await browser?.close()
    stopProcess(worker)
    jwks.close()
  }
}

async function headingStyles(page) {
  await page.evaluate(() => document.fonts.ready)
  return page.locator('h1').first().evaluate(element => {
    const style = getComputedStyle(element)
    const rect = element.getBoundingClientRect()
    return Object.fromEntries([
      ...['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor', 'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom']
        .map(prop => [prop, style[prop]]),
      ['rect', [rect.x, rect.y, rect.width, rect.height].map(Math.round).join(',')],
    ])
  })
}

function assertSameStyles(before, after, message) {
  for (const key of Object.keys(before)) assertEqual(after[key], before[key], `${message} (${key})`)
}

function makeKey(kid) {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  return { kid, privateKey, jwk: { ...publicKey.export({ format: 'jwk' }), kid, alg: 'RS256', use: 'sig' } }
}

function mintToken({ kid, privateKey }, claims) {
  const now = Math.floor(Date.now() / 1000)
  const header = b64url({ alg: 'RS256', kid, typ: 'JWT' })
  const payload = b64url({ iat: now, nbf: now, exp: now + 3600, sub: 'test-user', ...claims })
  const signature = sign('RSA-SHA256', Buffer.from(`${header}.${payload}`), privateKey).toString('base64url')
  return `${header}.${payload}.${signature}`
}

function b64url(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function startJwksServer(keys) {
  const server = createServer((request, response) => {
    if (request.url === '/firebase-keys') {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ keys }))
      return
    }
    response.writeHead(404).end()
  })
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)))
}

function d1(sqlText) {
  const file = '.tmp/rehearsal-query.sql'
  writeFileSync(path.join(workerDir, file), sqlText)
  const result = spawnSync('cmd.exe', ['/d', '/s', '/c', `npx wrangler d1 execute qlugen-cms-staging --local --env staging --persist-to ${persistDir} --json --file ${file}`], { cwd: workerDir, encoding: 'utf8' })
  return JSON.parse(result.stdout)[0].results
}

function run(command, cwd, env = {}) {
  const result = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', command], { cwd, env: { ...process.env, ...env }, encoding: 'utf8' })
    : spawnSync('sh', ['-c', command], { cwd, env: { ...process.env, ...env }, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`Command failed: ${command}\n${result.stdout}\n${result.stderr}`)
  return result.stdout
}

function spawnCommand(command, cwd) {
  const options = { cwd, stdio: ['ignore', 'pipe', 'pipe'] }
  return process.platform === 'win32' ? spawn('cmd.exe', ['/d', '/s', '/c', command], options) : spawn('sh', ['-c', command], options)
}

async function waitForWorker() {
  for (let index = 0; index < 80; index += 1) {
    try {
      if ((await fetch(`${base}/api/public/pages?ids=home`)).ok) return
    } catch {
      // keep polling
    }
    await wait(500)
  }
  throw new Error('Staging rehearsal Worker did not start')
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

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await runStagingRehearsal()
}
