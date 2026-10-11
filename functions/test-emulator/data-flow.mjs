// End-to-end CMS data flow in the Firebase emulators (Functions + Firestore + Storage + Auth):
// seed -> draft -> publish -> public snapshot -> versions/restore -> Add Page -> archive -> delete ->
// media upload / in-use protection, plus the Firestore and Storage security rules.
//   npm run cms:fb:test:data
// Needs Java 11+ (the Firestore and Storage emulators are Java programs). Uses the "demo-" project,
// so nothing ever reaches the real qlugen-enterprise project.
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as wait } from 'node:timers/promises'
import sharp from 'sharp'

const functionsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const root = path.resolve(functionsDir, '..')
const PROJECT = 'demo-qlugen-cms'
const BUCKET = `${PROJECT}.appspot.com`
const API = `http://127.0.0.1:5001/${PROJECT}/asia-south1/cmsAdminApi/api/admin`
const STORAGE = `http://127.0.0.1:9199/v0/b/${BUCKET}/o`
const FIRESTORE = `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents`
const envFile = path.join(functionsDir, `.env.${PROJECT}`)

if (spawnSync('java', ['-version'], { shell: true }).status !== 0) {
  console.error('Java is not installed: the Firestore and Storage emulators need Java 11 or newer.')
  process.exit(1)
}
if (existsSync(path.join(functionsDir, '.env.local'))) {
  console.error('functions/.env.local exists and would override this test\'s settings; move it aside and run again.')
  process.exit(1)
}
writeFileSync(envFile, 'CMS_LOCAL_BYPASS=true\nCMS_ADMIN_UIDS=\nCMS_ADMIN_EMAILS=\nCMS_ALLOWED_ORIGINS=\n')

const emulators = spawn(`npx firebase emulators:start --only auth,functions,firestore,storage --project ${PROJECT}`, { cwd: root, shell: true, stdio: ['ignore', 'pipe', 'pipe'] })
let output = ''
emulators.stdout.on('data', data => { output += data })
emulators.stderr.on('data', data => { output += data })

let passed = 0
const pass = label => {
  passed += 1
  console.log(`PASS ${label}`)
}

try {
  await until(async () => (await fetch(`${API}/me`).catch(() => null))?.ok, 'cmsAdminApi + emulators')
  const seed = spawnSync('node functions/scripts/seed-firestore.mjs --emulators --reset', { cwd: root, shell: true, encoding: 'utf8', env: { ...process.env, GCLOUD_PROJECT: PROJECT } })
  if (seed.status !== 0) throw new Error(`seed failed: ${seed.stderr || seed.stdout}`)

  // ── Seed + public snapshots ──────────────────────────────────────────────────────────────────
  const me = await api('GET', '/me')
  assertEqual(me.mode, 'local', 'emulator bypass identity')
  const { pages } = await api('GET', '/pages')
  assert(pages.length >= 40 && pages.every(page => page.status === 'published'), `seeded pages published (${pages.length})`)
  const homeSnapshot = await snapshot('cms-public/pages/home.json')
  assert(homeSnapshot?.version === 1 && homeSnapshot.content?.hero, 'home snapshot readable without sign-in')
  pass(`seed: ${pages.length} published pages, public snapshots readable anonymously`)

  // ── Draft -> publish -> snapshot ────────────────────────────────────────────────────────────
  const { page: home } = await api('GET', '/pages/home')
  const edited = structuredClone(home.content)
  edited.hero.titleLines = ['Published from the Firebase emulator']
  await expectError('design keys rejected', 'PUT', '/pages/home/draft', { content: { ...edited, className: 'x' } }, 400)
  await expectError('oversized content rejected', 'PUT', '/pages/home/draft', { content: { ...edited, filler: 'x'.repeat(300_001) } }, 413)
  const { draft } = await api('PUT', '/pages/home/draft', { content: edited })
  assertEqual(draft.versionNumber, 2, 'draft is the next version')
  assertEqual((await api('GET', '/pages/home')).page.content.hero.titleLines[0], home.content.hero.titleLines[0], 'draft is not public')
  assertEqual((await snapshot('cms-public/pages/home.json')).version, 1, 'snapshot unchanged by a draft')
  await expectError('stale publish', 'POST', '/pages/home/publish', { expectedDraftSavedAt: '2000-01-01T00:00:00.000Z' }, 409)
  const published = await api('POST', '/pages/home/publish', { expectedDraftSavedAt: draft.createdAt })
  assertEqual(published.page.version.versionNumber, 2, 'published version 2')
  assertEqual(published.warning, undefined, 'no snapshot warning')
  const homeV2 = await snapshot('cms-public/pages/home.json')
  assert(homeV2.version === 2 && homeV2.content.hero.titleLines[0] === 'Published from the Firebase emulator', 'snapshot updated on publish')
  await expectError('publish without a draft', 'POST', '/pages/home/publish', {}, 409)
  pass('draft stays private; publish writes version 2 and the public snapshot')

  // ── Versions + restore ─────────────────────────────────────────────────────────────────────
  const { versions } = await api('GET', '/pages/home/versions')
  assertEqual(versions.map(version => `${version.versionNumber}:${version.status}`).join(','), '2:published,1:archived', 'version history')
  const v1 = versions.find(version => version.versionNumber === 1)
  const restored = await api('POST', `/pages/home/versions/${v1.id}/restore`)
  assert(restored.draft.restoredFromVersion === 1 && restored.draft.versionNumber === 3, 'restore makes draft v3 from v1')
  assertEqual((await snapshot('cms-public/pages/home.json')).version, 2, 'restore does not publish')
  await api('DELETE', '/pages/home/draft')
  assertEqual((await api('GET', '/pages/home/draft')).draft, null, 'draft discarded')
  pass('version history, restore-as-draft and discard draft')

  // ── + Add Page: create, publish (route snapshot), archive, restore, delete ──────────────────
  const created = await api('POST', '/pages', { title: 'Emulator Flow', slug: 'emulator-flow', template: 'standard-page' }, 201)
  assertEqual(created.page.status, 'draft', 'new pages start as drafts')
  await expectError('duplicate URL', 'POST', '/pages', { title: 'Again', slug: 'emulator-flow', template: 'standard-page' }, 409)
  assertEqual(await snapshot('cms-public/routes/emulator-flow.json'), null, 'unpublished page has no route snapshot')
  const newDraft = (await api('GET', '/pages/custom-emulator-flow/draft')).draft
  await api('POST', '/pages/custom-emulator-flow/publish', { expectedDraftSavedAt: newDraft.createdAt })
  const route = await snapshot('cms-public/routes/emulator-flow.json')
  assert(route?.page?.template === 'standard-page' && route.page.content.hero, 'route snapshot written on publish')
  await expectError('published pages cannot be deleted', 'DELETE', '/pages/custom-emulator-flow', undefined, 409)
  await expectError('coded pages cannot be archived', 'POST', '/pages/home/archive', undefined, 400)
  const archived = await api('POST', '/pages/custom-emulator-flow/archive')
  assertEqual(archived.page.status, 'archived', 'archived')
  assertEqual(await snapshot('cms-public/routes/emulator-flow.json'), null, 'archive removes the route snapshot')
  assertEqual(await snapshot('cms-public/pages/custom-emulator-flow.json'), null, 'archive removes the page snapshot')
  const unarchived = await api('POST', '/pages/custom-emulator-flow/unarchive')
  assert(unarchived.page.status === 'draft' && unarchived.page.hasDraft, 'restored page is an unpublished draft')
  assertEqual(await snapshot('cms-public/routes/emulator-flow.json'), null, 'restore does not republish')

  await api('POST', '/pages', { title: 'Throwaway', slug: 'emulator-throwaway', template: 'standard-page' }, 201)
  await api('DELETE', '/pages/custom-emulator-throwaway')
  await expectError('deleted page is gone', 'GET', '/pages/custom-emulator-throwaway', undefined, 404)
  await api('POST', '/pages', { title: 'Throwaway again', slug: 'emulator-throwaway', template: 'standard-page' }, 201)
  pass('Add Page lifecycle: unique URL, route snapshot, archive/restore, delete frees the URL')

  // ── Media ──────────────────────────────────────────────────────────────────────────────────
  const png = await sharp({ create: { width: 48, height: 32, channels: 3, background: '#0f62fe' } }).png().toBuffer()
  const used = (await upload(png, 'Hero Image.png', 'image/png')).media
  assert(used.width === 48 && used.height === 32 && used.publicUrl === `/media/${used.r2Key}`, 'media metadata')
  const file = await fetch(`${STORAGE}/${encodeURIComponent(used.r2Key)}?alt=media`)
  assert(file.ok && (await file.arrayBuffer()).byteLength === png.length, 'uploaded file downloadable anonymously')
  const fake = await uploadRaw(new TextEncoder().encode('<svg/>'), 'evil.png', 'image/png')
  assertEqual(fake.status, 415, 'non-image bytes rejected')

  const withImage = structuredClone(homeV2.content)
  withImage.hero.image = { id: used.id, url: used.publicUrl, alt: 'Hero' }
  await api('PUT', '/pages/home/draft', { content: withImage })
  assertEqual((await api('GET', `/media/${used.id}`)).media.inUse, true, 'media in use by a draft')
  await expectError('media used by a draft cannot be deleted', 'DELETE', `/media/${used.id}`, undefined, 409)
  await api('PUT', `/media/${used.id}`, { altText: 'Updated alt' })
  assertEqual((await api('GET', `/media/${used.id}`)).media.altText, 'Updated alt', 'alt text updated')

  const spare = (await upload(png, 'spare.png', 'image/png')).media
  assertEqual(spare.inUse, false, 'unused media')
  await api('DELETE', `/media/${spare.id}`)
  assertEqual((await fetch(`${STORAGE}/${encodeURIComponent(spare.r2Key)}?alt=media`)).status, 404, 'deleted media file removed from Storage')
  assert((await api('GET', '/media')).media.some(item => item.id === used.id), 'media library lists uploads')
  pass('media: upload to Storage, type sniffing, in-use protection, alt text, delete')

  // ── Recovery + security rules ──────────────────────────────────────────────────────────────
  const rebuilt = await api('POST', '/snapshots/rebuild')
  assert(rebuilt.written >= pages.length && rebuilt.removed >= 1, `snapshot rebuild (${JSON.stringify(rebuilt)})`)
  assertEqual(await snapshot('cms-public/routes/emulator-flow.json'), null, 'rebuild keeps unpublished pages off the site')

  const directRead = await fetch(`${FIRESTORE}/cms_pages/home`)
  assertEqual(directRead.status, 403, 'Firestore: browsers cannot read CMS data directly')
  const directWrite = await fetch(`${FIRESTORE}/cms_pages?documentId=evil`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"fields":{}}' })
  assertEqual(directWrite.status, 403, 'Firestore: browsers cannot write CMS data')
  const storageUpload = await fetch(`${STORAGE}?name=${encodeURIComponent('cms-public/pages/home.json')}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"content":"defaced"}' })
  assert(storageUpload.status === 403 || storageUpload.status === 401, `Storage: anonymous overwrite denied (${storageUpload.status})`)
  const listing = await fetch(`${STORAGE}?prefix=cms%2F`)
  assert(listing.status === 403 || listing.status === 401, `Storage: listing denied (${listing.status})`)
  const draftPeek = await fetch(`${STORAGE}/${encodeURIComponent('cms_pages/home')}?alt=media`)
  assert(draftPeek.status === 403 || draftPeek.status === 404, 'Storage: nothing outside cms/ and cms-public/ is readable')
  assertEqual((await snapshot('cms-public/pages/home.json')).version, 2, 'public snapshot intact')
  pass('snapshot rebuild; Firestore/Storage rules deny direct browser reads/writes')

  console.log(`Firebase CMS data flow passed (${passed} groups) in the emulators.`)
} catch (error) {
  console.error(error.stack || error.message)
  console.error(output.split('\n').slice(-30).join('\n'))
  process.exitCode = 1
} finally {
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(emulators.pid), '/T', '/F'], { stdio: 'ignore' })
  else emulators.kill()
  await wait(500)
  rmSync(envFile, { force: true })
}

async function api(method, requestPath, body, status = 200) {
  const response = await fetch(`${API}${requestPath}`, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  if (response.status !== status) throw new Error(`${method} ${requestPath}: expected ${status}, got ${response.status} ${JSON.stringify(data)}`)
  return data
}

async function expectError(label, method, requestPath, body, status) {
  await api(method, requestPath, body, status)
}

// A published snapshot as the public website reads it (anonymous Storage download), or null.
async function snapshot(objectPath) {
  const response = await fetch(`${STORAGE}/${encodeURIComponent(objectPath)}?alt=media`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`snapshot ${objectPath}: ${response.status}`)
  return response.json()
}

function uploadRaw(bytes, name, type) {
  const form = new FormData()
  form.append('file', new Blob([bytes], { type }), name)
  form.append('alt', 'Test image')
  return fetch(`${API}/media/upload`, { method: 'POST', body: form })
}

async function upload(bytes, name, type) {
  const response = await uploadRaw(bytes, name, type)
  const data = await response.json()
  if (response.status !== 201) throw new Error(`upload ${name}: ${response.status} ${JSON.stringify(data)}`)
  return data
}

async function until(probe, label) {
  for (let attempt = 0; attempt < 240; attempt += 1) {
    if (await probe()) return
    await wait(500)
  }
  throw new Error(`Timed out waiting for ${label}`)
}

function assert(value, message) {
  if (!value) throw new Error(`Assertion failed: ${message}`)
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`Assertion failed: ${message}. Expected ${expected}, got ${actual}`)
}
