// Page builder test ("+ Add Page"), fully isolated: a throwaway local database is migrated and
// seeded for each run and deleted afterwards, so repeated runs never add pages or media to the
// development database. Nothing touches Cloudflare.
//
//   npm run cms:test:pages
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as wait } from 'node:timers/promises'
import { chromium } from 'playwright'
import sharp from 'sharp'
import { RESERVED_SEGMENTS, slugError, slugify } from '../../src/cms/routeRules.js'
import { listTemplates } from '../../src/cms/templateRegistry.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const workerDir = path.join(root, 'worker')
const persistDir = '.wrangler/pages-test'
const logDir = path.join(workerDir, '.tmp')
const workerPort = 8796
const api = `http://127.0.0.1:${workerPort}`
const site = { cms: 'http://127.0.0.1:5296', local: 'http://127.0.0.1:5297' }
const NOT_FOUND = "This path doesn't lead anywhere."

testSharedRules()
setupIsolatedDatabase()

const processes = [
  spawnLogged(`npx wrangler dev --local --port ${workerPort} --persist-to ${persistDir}`, workerDir, {}, 'pages-worker'),
  spawnLogged('npx vite --host 127.0.0.1 --port 5296 --strictPort', root, { VITE_CMS_RUNTIME_ENABLED: 'true', VITE_CMS_API_BASE: api }, 'pages-vite-cms'),
  spawnLogged('npx vite --host 127.0.0.1 --port 5297 --strictPort', root, { VITE_CMS_RUNTIME_ENABLED: 'false' }, 'pages-vite-local'),
]

let browser
try {
  await waitFor(`${api}/api/admin/me`)
  await waitFor(`${site.cms}/`)
  await waitFor(`${site.local}/`)
  browser = await chromium.launch()

  await testLegacyDraftUpgrade()
  await testCreateValidation()
  await testStandardPageLifecycle()
  await testOtherTemplates()
  await testAdminAddPageFlow()
  console.log('Page builder tests passed (isolated database removed; no pages or media left behind).')
} finally {
  await browser?.close()
  processes.forEach(stopProcess)
  await wait(500)
  rmSync(path.join(workerDir, persistDir), { recursive: true, force: true })
}

// ---------------------------------------------------------------------------------------------

function testSharedRules() {
  assertEqual(slugify('AI Strategy'), 'ai-strategy', 'slug from page name')
  assertEqual(slugify('  Data & AI: Café Ops! '), 'data-and-ai-cafe-ops', 'unsafe characters trimmed')
  for (const bad of ['AI', 'ai_strategy', 'ai--strategy', '-ai', 'ai/strategy', 'a'.repeat(81)]) {
    assert(slugError(bad), `slug rejected: ${bad.slice(0, 20)}`)
  }
  // Every coded route's first segment is reserved, so a CMS page can never take over a coded page.
  const main = readFileSync(path.join(root, 'src/main.jsx'), 'utf8')
  const codeSegments = [...main.matchAll(/path="\/([^/"*:]+)/g)].map(match => match[1])
  assert(codeSegments.length > 20, 'found coded routes in main.jsx')
  for (const segment of codeSegments) assert(RESERVED_SEGMENTS.has(segment), `coded route /${segment} is reserved`)
  for (const segment of ['admin', 'api', 'media', 'about', 'products', 'capabilities', 'insights']) assert(slugError(segment), `/${segment} reserved`)

  const templates = listTemplates()
  assertEqual(templates.map(template => template.name).join(' | '), 'Standard Page | Product / Solution | Capability | Industry | Insight / Article', 'approved templates')
  assert(templates.every(template => Object.keys(template).join() === 'key,name,description'), 'template list exposes no schema/content type')
  console.log('Shared slug rules and template registry passed.')
}

function setupIsolatedDatabase() {
  rmSync(path.join(workerDir, persistDir), { recursive: true, force: true })
  mkdirSync(logDir, { recursive: true })
  run(`npx wrangler d1 migrations apply qlugen-cms-local --local --persist-to ${persistDir}`, workerDir)
  run('node worker/scripts/generate-seed-sql.mjs --out worker/.tmp/pages-seed.sql', root)
  run(`npx wrangler d1 execute qlugen-cms-local --local --persist-to ${persistDir} --file .tmp/pages-seed.sql`, workerDir)

  // An early-format ("standard-landing") never-published draft, as created before the templates
  // were finalised, then the 0005 upgrade migration re-run against it.
  const legacy = {
    hero: { image: '/uploads/legacy.webp', imageAlt: '', eyebrow: 'Qlugen', title: 'Legacy page', description: 'Old format.' },
    intro: { eyebrow: 'Overview', title: 'Intro', body: 'Body' },
    cards: [{ title: 'Card one', description: 'First' }],
    cta: { heading: 'Talk', sub: 'Sub', label: 'Contact', url: '/contact' },
    seo: { title: 'Legacy | Qlugen', description: 'Legacy', ogImage: '/social/qlugen.png' },
    slug: 'legacy-page',
  }
  const now = new Date().toISOString()
  const sqlText = [
    `INSERT INTO cms_pages (id, route, slug, content_type, title, created_at, updated_at, published_version_id, template_id, page_status) VALUES ('custom-legacy-page', '/legacy-page', 'legacy-page', 'standardLanding', 'Legacy Page', '${now}', '${now}', NULL, 'standard-landing', 'draft');`,
    `INSERT INTO cms_versions (id, page_id, version_number, status, content_json, created_at, created_by, published_at) VALUES ('ver-legacy-draft', 'custom-legacy-page', 1, 'draft', '${JSON.stringify(legacy).replace(/'/g, "''")}', '${now}', 'local-admin', NULL);`,
  ].join('\n')
  writeFileSync(path.join(logDir, 'pages-legacy.sql'), sqlText)
  run(`npx wrangler d1 execute qlugen-cms-local --local --persist-to ${persistDir} --file .tmp/pages-legacy.sql`, workerDir)
  run(`npx wrangler d1 execute qlugen-cms-local --local --persist-to ${persistDir} --file migrations/0005_standard_page_template.sql`, workerDir)
}

async function testLegacyDraftUpgrade() {
  const { page } = await get('/api/admin/pages/custom-legacy-page')
  assertEqual(page.templateId, 'standard-page', 'legacy draft page upgraded to Standard Page')
  const { draft } = await get('/api/admin/pages/custom-legacy-page/draft')
  assertEqual(JSON.stringify(Object.keys(draft.content)), JSON.stringify(['hero', 'intro', 'cards', 'cta', 'seo']), 'legacy draft reshaped to the template')
  assertEqual(draft.content.cards.items[0].title, 'Card one', 'legacy cards kept')
  assertEqual((await send('PUT', '/api/admin/pages/custom-legacy-page/draft', { content: draft.content })).status, 200, 'upgraded draft passes template validation')
  console.log('Legacy draft upgrade passed (0005 only touches never-published drafts).')
}

async function testCreateValidation() {
  const create = body => send('POST', '/api/admin/pages', body)
  assertEqual((await create({ title: '', slug: 'empty-name', template: 'standard-page' })).status, 400, 'page name required')
  assertEqual((await create({ title: 'X', slug: 'bad slug', template: 'standard-page' })).status, 400, 'unsafe slug rejected')
  assertEqual((await create({ title: 'X', slug: 'Upper-Case', template: 'standard-page' })).status, 400, 'uppercase slug rejected')
  for (const reserved of ['about', 'products', 'capabilities', 'admin', 'api', 'media', 'insights']) {
    assertEqual((await create({ title: 'X', slug: reserved, template: 'standard-page' })).status, 400, `reserved /${reserved} rejected`)
  }
  assertEqual((await create({ title: 'X', slug: 'nested/route', template: 'standard-page' })).status, 400, 'nested route rejected')
  assertEqual((await create({ title: 'X', slug: 'unknown-template', template: 'free-form' })).status, 400, 'unapproved template rejected')
  assertEqual((await create({ title: 'X', slug: 'old-key', template: 'standard-landing' })).status, 400, 'retired template key rejected')
  console.log('Create validation passed (name, slug format, reserved routes, approved templates only).')
}

async function testStandardPageLifecycle() {
  const created = await send('POST', '/api/admin/pages', { title: 'API Strategy', slug: 'api-strategy', template: 'standard-page', actor: 'spoofed@evil.test' })
  assertEqual(created.status, 201, 'standard page created')
  const page = created.body.page
  assertEqual(`${page.id}|${page.route}|${page.status}|${page.templateId}`, 'custom-api-strategy|/api-strategy|draft|standard-page', 'new page record')
  assertEqual(page.version, null, 'new page is not published')
  assertEqual((await send('POST', '/api/admin/pages', { title: 'Again', slug: 'api-strategy', template: 'product-detail' })).status, 409, 'duplicate slug rejected')

  const base = `/api/admin/pages/${page.id}`
  let draft = (await get(`${base}/draft`)).draft
  assertEqual(draft.content.hero.title, 'API Strategy', 'draft starts from template defaults with the page name')
  assertEqual(draft.createdBy, 'local-admin', 'actor from server, not request body')
  assertEqual((await send('DELETE', `${base}/draft`)).status, 409, 'cannot discard the only draft of an unpublished page')

  // Draft is never public.
  assertEqual((await fetch(`${api}/api/public/route?path=/api-strategy`)).status, 404, 'draft page not public')
  await expectNotFound(site.cms, '/api-strategy', 'draft page not on runtime site')

  // Content-only design lock + template schema.
  const rejected = [
    ['design field', content => { content.hero.color = 'red' }],
    ['style object', content => { content.cards.style = { padding: '9px' } }],
    ['unknown field', content => { content.hero.subtitle = 'not in template' }],
    ['missing field', content => { delete content.intro.body }],
    ['wrong type', content => { content.cards.items = 'not a list' }],
    ['empty required heading', content => { content.hero.title = '  ' }],
    ['script URL', content => { content.hero.cta.url = 'javascript:alert(1)' }],
    ['unsafe image URL', content => { content.hero.image = 'https://x.test/a.jpg) ; background:red' }],
  ]
  for (const [label, mutate] of rejected) {
    const content = structuredClone(draft.content)
    mutate(content)
    const response = await send('PUT', `${base}/draft`, { content })
    assertEqual(response.status, 400, `${label} rejected on save`)
  }

  // Edit text + image -> Save Draft -> Publish -> public.
  const bytes = await sharp({ create: { width: 64, height: 40, channels: 3, background: '#2563eb' } }).png().toBuffer()
  const media = (await upload(bytes, 'cms-test-banner.png')).media
  const v1 = structuredClone(draft.content)
  v1.hero.description = 'Published description one.'
  v1.hero.image = { id: media.id, url: media.publicUrl, alt: 'Banner' }
  draft = (await sendOk('PUT', `${base}/draft`, { content: v1 })).draft
  assertEqual((await fetch(`${api}/api/public/route?path=/api-strategy`)).status, 404, 'saved draft still not public')
  const published = (await sendOk('POST', `${base}/publish`, { expectedDraftSavedAt: draft.createdAt })).page
  assertEqual(`${published.status}|v${published.version.versionNumber}`, 'published|v1', 'first publish is version 1')
  assertEqual((await get(`${base}/draft`)).draft, null, 'draft cleared after publish')

  const pub = await (await fetch(`${api}/api/public/route?path=/API-Strategy/`)).json()
  assertEqual(JSON.stringify(Object.keys(pub.page)), JSON.stringify(['template', 'content']), 'public route returns no admin metadata')
  assertEqual(pub.page.content.hero.description, 'Published description one.', 'public route returns published content')
  const html = await renderedPage(site.cms, '/api-strategy')
  assert(html.h1 === 'API Strategy' && html.hero.includes('/media/cms/'), 'published standard page renders with uploaded banner')

  // Version 2, then restore version 1 into a new draft and publish it as version 3.
  const v2 = structuredClone(v1)
  v2.hero.description = 'Published description two.'
  draft = (await sendOk('PUT', `${base}/draft`, { content: v2 })).draft
  await sendOk('POST', `${base}/publish`, { expectedDraftSavedAt: draft.createdAt })
  let versions = (await get(`${base}/versions`)).versions
  assertEqual(versions.map(version => `${version.versionNumber}:${version.status}`).join(), '2:published,1:archived', 'v2 published, v1 archived')
  const restored = (await sendOk('POST', `${base}/versions/${versions[1].id}/restore`)).draft
  assertEqual(restored.content.hero.description, 'Published description one.', 'restore copies v1 into a draft')
  assertEqual((await renderedPage(site.cms, '/api-strategy')).text.includes('Published description two.'), true, 'restore does not change the live page')
  await sendOk('POST', `${base}/publish`, { expectedDraftSavedAt: restored.createdAt })
  versions = (await get(`${base}/versions`)).versions
  assertEqual(versions.map(version => `${version.versionNumber}:${version.status}`).join(), '3:published,2:archived,1:archived', 'restored content published as v3')

  // Archive: off the site, data/history/media kept. Coded and global pages cannot be archived.
  for (const id of ['home', 'global-navigation', 'global-footer', 'global-seo', 'company-about']) {
    assertEqual((await send('POST', `/api/admin/pages/${id}/archive`)).status, 400, `${id} cannot be archived`)
  }
  const archived = (await sendOk('POST', `${base}/archive`)).page
  assertEqual(archived.status, 'archived', 'page archived')
  assertEqual((await fetch(`${api}/api/public/route?path=/api-strategy`)).status, 404, 'archived page not public')
  await expectNotFound(site.cms, '/api-strategy', 'archived page removed from the site')
  assertEqual((await get(base)).page.content.hero.description, 'Published description one.', 'archived page content kept')
  assertEqual((await get(`${base}/versions`)).versions.length, 3, 'archived page history kept')
  const mediaDelete = await send('DELETE', `/api/admin/media/${media.id}`)
  assertEqual(mediaDelete.status, 409, 'media used by an archived page cannot be deleted')
  assertEqual((await fetch(`${api}${media.publicUrl}`)).status, 200, 'archived page media still served')
  assertEqual((await send('POST', '/api/admin/pages', { title: 'Reuse', slug: 'api-strategy', template: 'standard-page' })).status, 409, 'archived page URL stays reserved')
  console.log('Standard page lifecycle passed: draft -> publish v1 -> v2 -> restore -> v3 -> archive.')
}

async function testOtherTemplates() {
  const cases = [
    { template: 'product-detail', slug: 'api-product', title: 'API Product', marker: '.product-hero' },
    { template: 'capability-detail', slug: 'api-capability', title: 'API Capability', marker: '.impact-bar' },
    { template: 'industry-detail', slug: 'api-industry', title: 'API Industry', marker: '.priority-matrix' },
    { template: 'insight-article', slug: 'api-insight', title: 'API Insight', marker: '.article-page-hero' },
  ]
  for (const { template, slug, title, marker } of cases) {
    const page = (await sendOk('POST', '/api/admin/pages', { title, slug, template })).page
    const base = `/api/admin/pages/${page.id}`
    const draft = (await get(`${base}/draft`)).draft
    await sendOk('PUT', `${base}/draft`, { content: draft.content })
    await sendOk('POST', `${base}/publish`, {})
    const rendered = await renderedPage(site.cms, `/${slug}`, marker)
    assertEqual(rendered.h1, title, `${template} renders its heading`)
    assert(rendered.hasMarker, `${template} renders the existing Qlugen ${marker} design`)
  }

  // Coded routes are never replaced; with the runtime off, dynamic pages simply 404 (local JSON site).
  assertEqual((await renderedPage(site.cms, '/about')).isNotFound, false, 'coded /about still renders')
  await expectNotFound(site.local, '/api-product', 'runtime off: CMS pages unavailable, site falls back to local JSON')
  assertEqual((await renderedPage(site.local, '/about')).isNotFound, false, 'runtime off: coded pages render from local JSON')
  console.log('Template rendering passed: Product, Capability, Industry and Insight use the existing Qlugen designs.')
}

async function testAdminAddPageFlow() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  page.on('dialog', dialog => dialog.accept())
  await page.goto(`${site.cms}/admin`)
  await page.locator('.cms-ref__main[data-loaded-page="home"]').waitFor()

  await page.getByRole('button', { name: 'Add Page', exact: true }).click()
  let dialog = page.getByRole('dialog', { name: 'Create New Page' })
  const suffix = Date.now()
  const strategyTitle = `AI Strategy Visual ${suffix}`
  const strategySlug = `ai-strategy-visual-${suffix}`
  const productTitle = `Data Fabric Visual ${suffix}`
  const productSlug = `data-fabric-visual-${suffix}`
  await dialog.getByLabel('Page Name').fill('About')
  await dialog.getByText('/about is already used by the website').waitFor()
  assert(await dialog.getByRole('button', { name: 'Create Page' }).isDisabled(), 'reserved slug blocks Create Page')
  await dialog.getByLabel('Page Name').fill(strategyTitle)
  assertEqual(await dialog.getByLabel('URL').inputValue(), strategySlug, 'slug generated from page name')
  await dialog.getByRole('button', { name: 'Create Page' }).click()
  await page.getByRole('button', { name: strategyTitle }).waitFor()
  const created = (await get(`/api/admin/pages/custom-${strategySlug}`)).page
  assertEqual(created.route, `/${strategySlug}`, 'visual admin creates the CMS page record')
  assertEqual((await get(`/api/admin/pages/custom-${strategySlug}/draft`)).draft.status, 'draft', 'created page has initial draft')
  await expectNotFound(site.cms, `/${strategySlug}`, 'new visual admin page is not public before publish')

  await page.getByRole('button', { name: 'Media Library' }).click()
  await page.locator('.cms-media').waitFor()
  await page.locator('.cms-media').getByRole('button', { name: 'Close' }).click()

  await page.getByRole('button', { name: 'Add Page', exact: true }).click()
  dialog = page.getByRole('dialog', { name: 'Create New Page' })
  await dialog.getByLabel('Page Name').fill(productTitle)
  await dialog.getByLabel('Template').selectOption({ label: 'Product / Solution' })
  await dialog.getByRole('button', { name: 'Create Page' }).click()
  await page.getByRole('button', { name: productTitle }).waitFor()
  const product = (await get(`/api/admin/pages/custom-${productSlug}`)).page
  assertEqual(product.templateId, 'product-detail', 'visual admin creates product pages with the selected template')

  await page.close()
  console.log('Admin Add Page flow passed in the approved visual UI.')
}

// ---------------------------------------------------------------------------------------------

async function renderedPage(base, route, marker) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  try {
    await page.goto(`${base}${route}`)
    await page.locator('.site-header').waitFor()
    await page.waitForFunction(() => document.querySelector('h1')?.innerText.trim(), null, { timeout: 15000 })
    const h1 = (await page.locator('h1').first().innerText()).trim()
    const hero = await page.locator('.hero-image-bg, .product-hero').first().getAttribute('style').catch(() => '') || ''
    return {
      h1,
      hero,
      text: await page.locator('body').innerText(),
      isNotFound: h1 === NOT_FOUND,
      hasMarker: marker ? (await page.locator(marker).count()) > 0 : false,
    }
  } finally {
    await page.close()
  }
}

async function expectNotFound(base, route, message) {
  assertEqual((await renderedPage(base, route)).h1, NOT_FOUND, message)
}

async function upload(bytes, filename) {
  const form = new FormData()
  form.append('file', new Blob([bytes], { type: 'image/png' }), filename)
  const response = await fetch(`${api}/api/admin/media/upload`, { method: 'POST', body: form })
  const body = await response.json()
  if (!response.ok) throw new Error(`upload failed: ${body.error}`)
  return body
}

async function get(requestPath) {
  const response = await fetch(`${api}${requestPath}`)
  const body = await response.json()
  if (!response.ok) throw new Error(`GET ${requestPath} failed: ${body.error}`)
  return body
}

async function send(method, requestPath, body) {
  const response = await fetch(`${api}${requestPath}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: response.status, body: await response.json() }
}

async function sendOk(method, requestPath, body) {
  const result = await send(method, requestPath, body)
  if (result.status >= 300) throw new Error(`${method} ${requestPath} failed (${result.status}): ${JSON.stringify(result.body)}`)
  return result.body
}

function run(command, cwd) {
  const result = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', command], { cwd, encoding: 'utf8' })
    : spawnSync('sh', ['-c', command], { cwd, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`Command failed: ${command}\n${result.stdout}\n${result.stderr}`)
}

function spawnLogged(command, cwd, env, name) {
  const log = openSync(path.join(logDir, `${name}.log`), 'w')
  const options = { cwd, env: { ...process.env, ...env }, stdio: ['ignore', log, log] }
  return process.platform === 'win32' ? spawn('cmd.exe', ['/d', '/s', '/c', command], options) : spawn('sh', ['-c', command], options)
}

async function waitFor(url) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
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

// Secondary page actions live in the header's "⋯" menu.
async function menuAction(page, name) {
  await page.getByRole('button', { name: 'More actions' }).click()
  await page.getByRole('menuitem', { name, exact: true }).click()
}

async function backToEditor(page) {
  await page.getByRole('button', { name: 'Back to editor' }).click()
}

async function menuItems(page) {
  await page.getByRole('button', { name: 'More actions' }).click()
  const names = await page.getByRole('menuitem').allInnerTexts()
  await page.keyboard.press('Escape')
  return names
}
