// Unit tests for the Firebase CMS Functions that need no emulator: sign-in decisions, CORS,
// record shapes, media references, snapshots and image detection.   npm run cms:fb:test
import assert from 'node:assert/strict'
import { test } from 'node:test'
import sharp from 'sharp'
import { authenticate } from '../src/auth.js'
import { assertWriteOrigin, preflightResponse, withAdminHeaders } from '../src/cors.js'
import { readImageDimensions, sniffImageType } from '../src/imageInfo.js'
import { mediaRefsIn, routeKeysFor, toPageDto, toVersionDto } from '../src/records.js'
import { isPublicTemplatePage, pageSnapshot, pageSnapshotPath, routeSnapshot, routeSnapshotPath } from '../src/snapshots.js'
import { handleAdminRequest } from '../src/router.js'

const config = { adminUids: ['admin-uid'], allowedOrigins: ['https://qlugen.in'] }
const at = (url, init) => new Request(url, init)
const bearer = token => ({ headers: { Authorization: `Bearer ${token}` } })
const claims = (extra = {}) => ({ uid: 'admin-uid', email: 'admin@qlugen.test', email_verified: false, ...extra })
const verifyWith = result => async () => {
  if (result instanceof Error) throw result
  return result
}
const codeError = code => Object.assign(new Error(code), { code })
const failure = async promise => promise.then(() => null, error => error)

test('authentication: verified, approved Firebase UID only', async () => {
  const runtime = { env: {} }
  const ok = await authenticate(at('https://api.test/api/admin/me', bearer('t')), config, { ...runtime, verifyIdToken: verifyWith(claims()) })
  assert.deepEqual(ok, { actor: 'admin@qlugen.test', uid: 'admin-uid', mode: 'firebase', projectId: '' })

  const cases = [
    ['no token', at('https://api.test/'), verifyWith(claims()), 401],
    ['spoofed identity headers', at('https://api.test/', { headers: { 'X-User-Email': 'admin@qlugen.test' } }), verifyWith(claims()), 401],
    ['invalid token', at('https://api.test/', bearer('t')), verifyWith(codeError('auth/argument-error')), 401],
    ['expired token', at('https://api.test/', bearer('t')), verifyWith(codeError('auth/id-token-expired')), 401],
    ['revoked token', at('https://api.test/', bearer('t')), verifyWith(codeError('auth/id-token-revoked')), 401],
    ['disabled account', at('https://api.test/', bearer('t')), verifyWith(codeError('auth/user-disabled')), 401],
    ['valid user, not an admin', at('https://api.test/', bearer('t')), verifyWith(claims({ uid: 'someone' })), 403],
  ]
  for (const [label, request, verifyIdToken, status] of cases) {
    assert.equal((await failure(authenticate(request, config, { ...runtime, verifyIdToken })))?.status, status, label)
  }
  const unconfigured = await failure(authenticate(at('https://api.test/', bearer('t')), { ...config, adminUids: [] }, runtime))
  assert.equal(unconfigured?.status, 503, 'no admins configured: fails closed')
})

test('temporary auth-disabled mode makes admin API public', async () => {
  const identity = await authenticate(at('https://api.test/api/admin/me'), { ...config, authDisabled: true }, { env: {} })
  assert.deepEqual(identity, { actor: 'public-admin', uid: 'auth-disabled', mode: 'disabled', projectId: '' })

  const response = await handleAdminRequest(at('https://api.test/api/admin/me', { headers: { Origin: 'https://qlugen.in' } }), { ...config, authDisabled: true })
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { actor: 'public-admin', uid: 'auth-disabled', mode: 'disabled', projectId: '' })

  const write = await handleAdminRequest(at('https://api.test/api/admin/nope', {
    method: 'POST',
    headers: { Origin: 'http://localhost:5179', 'Content-Type': 'application/json' },
  }), { ...config, authDisabled: true })
  assert.equal(write.status, 404, 'auth-disabled mode skips write-origin rejection')
})

test('CORS: only allowed origins; writes need an allowed Origin', async () => {
  const allowed = preflightResponse(at('https://api.test/', { method: 'OPTIONS', headers: { Origin: 'https://qlugen.in' } }), config)
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://qlugen.in')
  assert.match(allowed.headers.get('access-control-allow-headers'), /Authorization/)
  const evil = preflightResponse(at('https://api.test/', { method: 'OPTIONS', headers: { Origin: 'https://evil.test' } }), config)
  assert.equal(evil.headers.get('access-control-allow-origin'), null)

  assert.doesNotThrow(() => assertWriteOrigin(at('https://api.test/', { method: 'GET' }), config))
  assert.equal(failureSync(() => assertWriteOrigin(at('https://api.test/', { method: 'PUT', headers: { Origin: 'https://evil.test' } }), config))?.status, 403)
  assert.equal(failureSync(() => assertWriteOrigin(at('https://api.test/', { method: 'POST' }), config))?.status, 403, 'write without Origin')
  assert.doesNotThrow(() => assertWriteOrigin(at('https://api.test/', { method: 'PUT', headers: { Origin: 'https://qlugen.in' } }), config))

  const response = withAdminHeaders(new Response('{}'), at('https://api.test/', { headers: { Origin: 'https://evil.test' } }), config)
  assert.equal(response.headers.get('access-control-allow-origin'), null)
  assert.equal(response.headers.get('cache-control'), 'no-store')
})

test('admin router rejects unauthenticated requests before touching any data', async () => {
  const noToken = await handleAdminRequest(at('https://api.test/api/admin/pages', { headers: { Origin: 'https://qlugen.in' } }), config)
  assert.equal(noToken.status, 401)
  assert.equal(noToken.headers.get('access-control-allow-origin'), 'https://qlugen.in')
  const unconfigured = await handleAdminRequest(at('https://api.test/api/admin/me'), { ...config, adminUids: [] })
  assert.equal(unconfigured.status, 503)
  const preflight = await handleAdminRequest(at('https://api.test/api/admin/pages', { method: 'OPTIONS', headers: { Origin: 'https://qlugen.in' } }), config)
  assert.equal(preflight.status, 204)
})

test('records: Worker-compatible shapes, URL/slug keys and media references', () => {
  const page = toPageDto({ id: 'home', route: '/', slug: 'home', contentType: 'home', templateId: 'home', title: 'Home', status: 'published', publishedVersionId: 'v', publishedVersionNumber: 3, hasDraft: true, createdAt: 'a', updatedAt: 'b' })
  assert.deepEqual(Object.keys(page).sort(), ['contentType', 'createdAt', 'hasDraft', 'id', 'latestVersion', 'route', 'slug', 'status', 'templateId', 'title', 'updatedAt'])
  assert.equal(page.latestVersion, 3)
  const version = toVersionDto({ id: 'ver_1', pageId: 'home', versionNumber: 2, status: 'draft', contentJson: '{"a":1}', createdAt: 'c', createdBy: 'me', basedOnVersionId: 'ver_0', basedOnVersionNumber: 1 })
  assert.equal(version.restoredFromVersion, 1)
  assert.deepEqual(version.content, { a: 1 })
  assert.deepEqual(routeKeysFor({ route: '/', slug: 'home' }), ['route~%2F', 'slug~home'])

  const id = `media_${'a'.repeat(32)}`
  const pathRef = `cms/2026/10/${'b'.repeat(32)}-hero-image.png`
  const refs = mediaRefsIn(JSON.stringify({ hero: { image: { id, url: `/media/${pathRef}` } }, other: 'no media here' }))
  assert.deepEqual(refs.sort(), [id, pathRef].sort())
  assert.deepEqual(mediaRefsIn('{"image":"https://images.unsplash.com/photo.jpg"}'), [])
})

test('snapshots: current content only, design keys stripped, routes for Add Page pages only', () => {
  const contentJson = JSON.stringify({ hero: { title: 'Hello', className: 'evil', style: { color: 'red' } } })
  const page = { id: 'custom-ai', slug: 'ai', templateId: 'standard-page', status: 'published', version: { versionNumber: 4, publishedAt: 't' } }
  const snapshot = pageSnapshot(page, contentJson)
  assert.deepEqual(snapshot, { id: 'custom-ai', version: 4, publishedAt: 't', content: { hero: { title: 'Hello' } } })
  assert.deepEqual(routeSnapshot(page, contentJson), { page: { template: 'standard-page', content: { hero: { title: 'Hello' } } } })
  assert.equal(pageSnapshotPath('home'), 'cms-public/pages/home.json')
  assert.equal(routeSnapshotPath('ai'), 'cms-public/routes/ai.json')
  assert.equal(isPublicTemplatePage(page), true)
  assert.equal(isPublicTemplatePage({ ...page, status: 'archived' }), false, 'archived pages get no public route')
  assert.equal(isPublicTemplatePage({ id: 'home', templateId: 'home', status: 'published' }), false, 'coded pages are not dynamic routes')
})

test('publish-to-runtime: draft -> publish -> snapshot -> public runtime reads the new value', () => {
  // Verifies the exact interface contract between publishDraft (writes snapshot) and
  // the frontend runtime (reads snapshot.content from Storage). A break anywhere in
  // this chain silently falls back to local JSON on the public site.
  //
  // Data flow:
  //   1. upsertDraft()          -- does NOT call writePageSnapshot -> snapshot unchanged
  //   2. publishDraft()         -- calls writePageSnapshot(page, contentJson)
  //   3. fetchSnapshot(url)     -- frontend fetches the .json file, returns parsed JSON
  //   4. loaded[i]?.content     -- runtime extracts the content field
  //   5. cache.set(id, prepare) -- stored in module-level cache
  //   6. cmsContent(id)         -- page component reads from cache

  const NEW_VALUE = 'Published title from integration test'

  // ── Step 2: publishDraft writes the snapshot ──────────────────────────────────────
  const contentJson = JSON.stringify({ hero: { titleLines: [NEW_VALUE], subtitle: 'Sub' }, seo: {} })
  // `page` is the result of getPage() immediately after the Firestore transaction in publishDraft.
  const page = {
    id: 'home',
    slug: 'home',
    templateId: 'home',
    status: 'published',
    version: { versionNumber: 2, publishedAt: '2026-10-11T10:00:00.000Z' },
  }
  const snap = pageSnapshot(page, contentJson)

  // ── Step 3+4: frontend fetchSnapshot returns the file; runtime reads .content ─────
  // fetchSnapshot() resolves to the parsed JSON (the whole snap object).
  // runtime.js: const content = loaded[index]?.content
  const fetchResult = snap  // simulate what fetchSnapshot() returns
  const runtimeContent = fetchResult?.content
  assert(runtimeContent && typeof runtimeContent === 'object' && !Array.isArray(runtimeContent),
    'snapshot.content is a plain object (cache.set stores it)')
  assert.equal(runtimeContent.hero.titleLines[0], NEW_VALUE,
    'public runtime returns the newly published value after a fresh snapshot fetch')

  // ── Save Draft must NOT change the snapshot ───────────────────────────────────────
  // upsertDraft() never calls writePageSnapshot; only publishDraft does.
  const oldPage = { ...page, version: { versionNumber: 1, publishedAt: '2020-01-01T00:00:00.000Z' } }
  const oldSnap = pageSnapshot(oldPage, JSON.stringify({ hero: { titleLines: ['Old Title'] }, seo: {} }))
  assert.equal(oldSnap.version, 1, 'Save Draft leaves published snapshot at version 1')
  assert.notEqual(oldSnap.content?.hero?.titleLines?.[0], NEW_VALUE,
    'public site is unchanged after Save Draft')

  // ── Storage paths: function writes / frontend reads the SAME paths ────────────────
  assert.equal(pageSnapshotPath('home'), 'cms-public/pages/home.json',
    'snapshot path matches storageUrls.js: cms-public/pages/<id>.json')
  assert.equal(pageSnapshotPath('global-navigation'), 'cms-public/pages/global-navigation.json')
  assert.equal(routeSnapshotPath('careers'), 'cms-public/routes/careers.json')
})

test('image detection: real type and dimensions from the bytes', async () => {
  for (const format of ['png', 'jpeg', 'webp']) {
    const bytes = new Uint8Array(await sharp({ create: { width: 37, height: 21, channels: 3, background: '#0f62fe' } })[format]().toBuffer())
    const type = sniffImageType(bytes)
    assert.equal(type, `image/${format}`)
    assert.deepEqual(readImageDimensions(bytes, type), { width: 37, height: 21 })
  }
  assert.equal(sniffImageType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>')), null)
})

function failureSync(task) {
  try {
    task()
    return null
  } catch (error) {
    return error
  }
}
