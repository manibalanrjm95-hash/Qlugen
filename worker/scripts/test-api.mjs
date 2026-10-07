import { spawn, spawnSync } from 'node:child_process'
import { setTimeout as wait } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { contentRegistry } from './content-registry.mjs'

const lifecyclePages = [
  'home',
  'product-ai-readiness-assessment',
  'capability-automation',
  'industry-healthcare',
  'company-leadership',
  'insight-ai-pilots-to-enterprise-impact',
]
const port = 8787
const baseUrl = `http://127.0.0.1:${port}`
const testStartedAt = new Date().toISOString()
const workerDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const workerCommand = process.platform === 'win32'
  ? ['cmd.exe', ['/d', '/s', '/c', `npx wrangler dev --local --port ${port}`]]
  : ['npx', ['wrangler', 'dev', '--local', '--port', String(port)]]
const worker = spawn(workerCommand[0], workerCommand[1], {
  cwd: workerDir,
  shell: false,
  stdio: ['ignore', 'pipe', 'pipe'],
})

let output = ''
worker.stdout.on('data', chunk => { output += chunk.toString() })
worker.stderr.on('data', chunk => { output += chunk.toString() })

try {
  await waitForWorker()

  const pages = await request('/api/admin/pages')
  assertEqual(pages.pages.length, contentRegistry.length, 'seeded page count')

  const home = await request('/api/admin/pages/home')
  assertEqual(home.page.id, 'home', 'home page id')
  assert(home.page.content.hero, 'home content has hero')

  const editedHome = structuredClone(home.page.content)
  editedHome.__phase1Test = 'draft'
  await request('/api/admin/pages/home/draft', {
    method: 'PUT',
    body: JSON.stringify({ content: editedHome, actor: 'phase1-test' }),
  })
  const homeDraft = await request('/api/admin/pages/home/draft')
  assertEqual(homeDraft.draft.content.__phase1Test, 'draft', 'home draft round trip')
  await request('/api/admin/pages/home/draft', { method: 'DELETE' })
  const deletedHomeDraft = await request('/api/admin/pages/home/draft')
  assertEqual(deletedHomeDraft.draft, null, 'home draft deleted')
  const homeVersions = await request('/api/admin/pages/home/versions')
  assert(homeVersions.versions.length >= 1, 'home versions exist')

  const aiReadiness = await request('/api/admin/pages/product-ai-readiness-assessment')
  assertEqual(aiReadiness.page.id, 'product-ai-readiness-assessment', 'AI Readiness page id')
  const editedProduct = structuredClone(aiReadiness.page.content)
  editedProduct.__phase1Test = 'draft'
  await request('/api/admin/pages/product-ai-readiness-assessment/draft', {
    method: 'PUT',
    body: JSON.stringify({ content: editedProduct, actor: 'phase1-test' }),
  })
  const productDraft = await request('/api/admin/pages/product-ai-readiness-assessment/draft')
  assertEqual(productDraft.draft.content.__phase1Test, 'draft', 'AI Readiness draft round trip')
  await request('/api/admin/pages/product-ai-readiness-assessment/draft', { method: 'DELETE' })

  await testMedia()

  for (const pageId of lifecyclePages) {
    await testPublishLifecycle(pageId)
  }
  await testHistoricalMediaProtection()
  await testAuditLog()

  console.log(`API tests passed. Seeded page count: ${pages.pages.length}`)
} finally {
  stopWorker(worker)
  await wait(500)
}

async function testMedia() {
  const formats = [
    { format: 'png', type: 'image/png', width: 64, height: 40 },
    { format: 'jpeg', type: 'image/jpeg', width: 120, height: 80 },
    { format: 'webp', type: 'image/webp', width: 90, height: 30 },
    { format: 'avif', type: 'image/avif', width: 48, height: 48 },
  ]
  const uploaded = []

  for (const { format, type, width, height } of formats) {
    const bytes = await sharp({ create: { width, height, channels: 3, background: '#0f62fe' } })[format]().toBuffer()
    const { status, body } = await upload(bytes, `Phase3 Test ${format}.${format}`, type, `${format} alt`)
    assertEqual(status, 201, `${format} upload status`)
    const media = body.media
    assert(media.id.startsWith('media_'), `${format} media id`)
    assertEqual(media.mimeType, type, `${format} mime type`)
    assertEqual(media.width, width, `${format} width`)
    assertEqual(media.height, height, `${format} height`)
    assertEqual(media.altText, `${format} alt`, `${format} alt text`)
    assert(media.r2Key.startsWith('cms/') && media.publicUrl === `/media/${media.r2Key}`, `${format} public url`)

    const served = await fetch(`${baseUrl}${media.publicUrl}`)
    assertEqual(served.status, 200, `${format} served from R2`)
    assertEqual(served.headers.get('content-type'), type, `${format} served content type`)
    assertEqual(Buffer.compare(Buffer.from(await served.arrayBuffer()), bytes), 0, `${format} served bytes`)
    uploaded.push(media)
  }

  const png = await sharp({ create: { width: 10, height: 10, channels: 3, background: '#000' } }).png().toBuffer()
  const again = await upload(png, 'Phase3 Test png.png', 'image/png')
  assert(again.body.media.r2Key !== uploaded[0].r2Key, 'same filename gets a new immutable key')
  uploaded.push(again.body.media)

  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')
  assertEqual((await upload(svg, 'evil.svg', 'image/svg+xml')).status, 415, 'svg rejected')
  assertEqual((await upload(Buffer.from('not really a png'), 'fake.png', 'image/png')).status, 415, 'spoofed png rejected')
  assertEqual((await upload(Buffer.from('MZ executable'), 'tool.exe', 'application/octet-stream')).status, 415, 'non-image rejected')
  const oversized = Buffer.concat([png, Buffer.alloc(10 * 1024 * 1024)])
  assertEqual((await upload(oversized, 'huge.png', 'image/png')).status, 413, 'oversized upload rejected')

  const listed = await request('/api/admin/media?q=phase3-test')
  for (const media of uploaded) {
    assert(listed.media.some(item => item.id === media.id), `listed ${media.filename}`)
  }

  const updated = await request(`/api/admin/media/${uploaded[0].id}`, {
    method: 'PUT',
    body: JSON.stringify({ altText: 'Updated alt' }),
  })
  assertEqual(updated.media.altText, 'Updated alt', 'alt text updated')
  assertEqual((await request(`/api/admin/media/${uploaded[0].id}`)).media.altText, 'Updated alt', 'alt text persisted')

  const home = await request('/api/admin/pages/home')
  const draftContent = structuredClone(home.page.content)
  draftContent.hero.image = { id: uploaded[0].id, url: uploaded[0].publicUrl, alt: 'Hero alt' }
  await request('/api/admin/pages/home/draft', {
    method: 'PUT',
    body: JSON.stringify({ content: draftContent, actor: 'phase3-test' }),
  })
  const draft = await request('/api/admin/pages/home/draft')
  assertEqual(draft.draft.content.hero.image.id, uploaded[0].id, 'media reference saved in draft')

  const inUse = await fetch(`${baseUrl}/api/admin/media/${uploaded[0].id}`, { method: 'DELETE' })
  assertEqual(inUse.status, 409, 'in-use media cannot be deleted')
  assert((await request(`/api/admin/media/${uploaded[0].id}`)).media.inUse, 'media reports in use')

  const unsafe = structuredClone(draftContent)
  unsafe.hero.image = { id: uploaded[0].id, url: 'javascript:alert(1)', alt: '' }
  const unsafeSave = await fetch(`${baseUrl}/api/admin/pages/home/draft`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: unsafe }),
  })
  assertEqual(unsafeSave.status, 400, 'unsafe image url rejected')

  await request('/api/admin/pages/home/draft', { method: 'DELETE' })
  for (const media of uploaded) {
    await request(`/api/admin/media/${media.id}`, { method: 'DELETE' })
    assertEqual((await fetch(`${baseUrl}${media.publicUrl}`)).status, 404, `${media.filename} removed from R2`)
  }
  assertEqual((await fetch(`${baseUrl}/api/admin/media/${uploaded[0].id}`)).status, 404, 'deleted media metadata gone')

  console.log(`Media tests passed: ${formats.length} formats uploaded, unsafe uploads rejected.`)
}

async function testPublishLifecycle(pageId) {
  const base = `/api/admin/pages/${pageId}`
  const initial = (await request(base)).page
  const original = initial.content
  const v0 = initial.version.versionNumber
  await request(`${base}/draft`, { method: 'DELETE' })

  assertEqual((await send('POST', `${base}/publish`)).status, 409, `${pageId} publish without draft rejected`)

  // edit -> Save Draft -> published unchanged
  const edited1 = withEditedText(original, ' [lifecycle 1]')
  await request(`${base}/draft`, { method: 'PUT', body: JSON.stringify({ content: edited1, actor: 'spoofed-actor' }) })
  assertDeepEqual((await request(base)).page.content, original, `${pageId} save draft leaves published unchanged`)

  // Publish -> new version, previous archived, draft cleared
  const draft1 = (await request(`${base}/draft`)).draft
  assertEqual((await send('POST', `${base}/publish`, { expectedDraftSavedAt: '2000-01-01T00:00:00.000Z' })).status, 409, `${pageId} stale publish rejected`)
  const published1 = (await request(`${base}/publish`, { method: 'POST', body: JSON.stringify({ expectedDraftSavedAt: draft1.createdAt }) })).page
  assertEqual(published1.version.versionNumber, v0 + 1, `${pageId} publish increments version`)
  assertDeepEqual(published1.content, edited1, `${pageId} published content is the draft`)
  assertEqual((await request(`${base}/draft`)).draft, null, `${pageId} draft cleared after publish`)

  let versions = (await request(`${base}/versions`)).versions
  assertEqual(versions[0].versionNumber, v0 + 1, `${pageId} newest version first`)
  assertEqual(versions[0].status, 'published', `${pageId} newest is published`)
  assertEqual(versions[1].status, 'archived', `${pageId} previous archived`)
  assertEqual(versions.filter(version => version.status === 'published').length, 1, `${pageId} exactly one published`)
  assert(versions.every(version => version.status !== 'draft' && !('content' in version)), `${pageId} history excludes drafts and content`)
  const archived = versions.find(version => version.versionNumber === v0)
  assertDeepEqual((await request(`${base}/versions/${archived.id}`)).version.content, original, `${pageId} archived content unchanged`)

  // edit again -> Save Draft -> restore older version into a new draft
  await request(`${base}/draft`, { method: 'PUT', body: JSON.stringify({ content: withEditedText(edited1, ' [lifecycle 2]') }) })
  const restored = (await request(`${base}/versions/${archived.id}/restore`, { method: 'POST' })).draft
  assertDeepEqual(restored.content, original, `${pageId} restore copies old content into draft`)
  assertEqual(restored.restoredFromVersion, v0, `${pageId} restored draft remembers its source`)
  assertDeepEqual((await request(base)).page.content, edited1, `${pageId} restore does not touch published`)

  // Publish restored draft -> another new version
  const published2 = (await request(`${base}/publish`, { method: 'POST', body: JSON.stringify({ expectedDraftSavedAt: restored.createdAt }) })).page
  assertEqual(published2.version.versionNumber, v0 + 2, `${pageId} restored publish is a new version`)
  assertDeepEqual(published2.content, original, `${pageId} restored content published`)

  versions = (await request(`${base}/versions`)).versions
  assertDeepEqual(versions.slice(0, 3).map(version => `${version.versionNumber}:${version.status}`), [`${v0 + 2}:published`, `${v0 + 1}:archived`, `${v0}:archived`], `${pageId} version statuses`)
  assertDeepEqual((await request(`${base}/versions/${archived.id}`)).version.content, original, `${pageId} restored source still unchanged`)
  assertDeepEqual((await request(`${base}/versions/${versions[1].id}`)).version.content, edited1, `${pageId} v${v0 + 1} still unchanged`)
  assert(versions.slice(0, 2).every(version => version.createdBy === 'local-admin'), `${pageId} actor comes from server, not client`)

  console.log(`Lifecycle passed: ${pageId} v${v0} -> v${v0 + 1} -> restore v${v0} -> v${v0 + 2}`)
}

async function testHistoricalMediaProtection() {
  const base = '/api/admin/pages/legal-cookies'
  const initial = (await request(base)).page
  const bytes = await sharp({ create: { width: 30, height: 20, channels: 3, background: '#ff832b' } }).png().toBuffer()

  const draftOnly = (await upload(bytes, 'phase4-draft-only.png', 'image/png')).body.media
  const draftContent = structuredClone(initial.content)
  draftContent.hero.image = { id: draftOnly.id, url: draftOnly.publicUrl, alt: '' }
  await request(`${base}/draft`, { method: 'PUT', body: JSON.stringify({ content: draftContent }) })
  assertEqual((await send('DELETE', `/api/admin/media/${draftOnly.id}`)).status, 409, 'saved-draft media cannot be deleted')
  await request(`${base}/draft`, { method: 'DELETE' })
  await request(`/api/admin/media/${draftOnly.id}`, { method: 'DELETE' })

  const historical = (await upload(bytes, 'phase4-historical.png', 'image/png')).body.media
  const withMedia = structuredClone(initial.content)
  withMedia.hero.image = { id: historical.id, url: historical.publicUrl, alt: 'History test' }
  await request(`${base}/draft`, { method: 'PUT', body: JSON.stringify({ content: withMedia }) })
  await request(`${base}/publish`, { method: 'POST' })
  assertEqual((await send('DELETE', `/api/admin/media/${historical.id}`)).status, 409, 'published media cannot be deleted')

  const previous = (await request(`${base}/versions`)).versions.find(version => version.versionNumber === initial.version.versionNumber)
  await request(`${base}/versions/${previous.id}/restore`, { method: 'POST' })
  await request(`${base}/publish`, { method: 'POST' })
  assertDeepEqual((await request(base)).page.content, initial.content, 'cookies page restored')

  const blocked = await send('DELETE', `/api/admin/media/${historical.id}`)
  assertEqual(blocked.status, 409, 'archived-version media cannot be deleted')
  assert(blocked.body.usage.some(usage => usage.status === 'archived'), 'usage lists the archived version')
  assertEqual((await fetch(`${baseUrl}${historical.publicUrl}`)).status, 200, 'archived-version media still served from R2')
  console.log('Historical media protection passed (draft, published and archived references).')
}

async function testAuditLog() {
  const rows = d1Json(`SELECT action, actor, COUNT(*) AS count FROM cms_audit_log WHERE created_at BETWEEN '${testStartedAt}' AND '9999' GROUP BY action, actor`)
  const actions = new Set(rows.map(row => row.action))
  for (const action of ['draft_saved', 'draft_deleted', 'published', 'version_restored', 'media_uploaded', 'media_alt_updated', 'media_deleted']) {
    assert(actions.has(action), `audit log records ${action}`)
  }
  assert(rows.every(row => row.actor === 'local-admin'), 'audit actor is the server placeholder')
  console.log(`Audit log passed: ${[...actions].sort().join(', ')}`)
}

function d1Json(sqlText) {
  // cmd.exe mangles quoted --command arguments, so the query goes through a file.
  const file = '.tmp/test-query.sql'
  mkdirSync(path.join(workerDir, '.tmp'), { recursive: true })
  writeFileSync(path.join(workerDir, file), sqlText)
  const command = `npx wrangler d1 execute qlugen-cms-local --local --json --file ${file}`
  const result = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', command], { cwd: workerDir, encoding: 'utf8' })
    : spawnSync('sh', ['-c', command], { cwd: workerDir, encoding: 'utf8' })
  return JSON.parse(result.stdout)[0].results
}

function withEditedText(content, suffix) {
  const copy = structuredClone(content)
  const skip = /url|link|image|portrait|logo|icon|alt|slug|type|date|id$/i
  const visit = value => {
    if (Array.isArray(value)) return value.some(visit)
    if (!value || typeof value !== 'object') return false
    for (const [key, child] of Object.entries(value)) {
      if (typeof child === 'string' && child.trim() && !skip.test(key)) {
        value[key] = `${child}${suffix}`
        return true
      }
      if (visit(child)) return true
    }
    return false
  }
  assert(visit(copy), 'found a text field to edit')
  return copy
}

async function send(method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: response.status, body: await response.json() }
}

function assertDeepEqual(actual, expected, message) {
  assertEqual(JSON.stringify(actual), JSON.stringify(expected), message)
}

async function upload(bytes, filename, type, alt = '') {
  const form = new FormData()
  form.append('file', new Blob([bytes], { type }), filename)
  form.append('alt', alt)
  form.append('actor', 'phase3-test')
  const response = await fetch(`${baseUrl}/api/admin/media/upload`, { method: 'POST', body: form })
  return { status: response.status, body: await response.json() }
}

async function waitForWorker() {
  for (let i = 0; i < 40; i += 1) {
    if (output.includes(`http://127.0.0.1:${port}`) || output.includes(`http://localhost:${port}`)) {
      await wait(500)
      return
    }
    await wait(250)
  }
  throw new Error(`Worker did not start.\n${output}`)
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const body = await response.json()
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed: ${JSON.stringify(body)}`)
  }
  return body
}

function assert(value, message) {
  if (!value) throw new Error(`Assertion failed: ${message}`)
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}. Expected ${expected}, got ${actual}`)
  }
}

function stopWorker(child) {
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    return
  }

  child.kill()
}
