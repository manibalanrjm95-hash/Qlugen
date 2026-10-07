// End-to-end test for the published-content runtime (VITE_CMS_RUNTIME_ENABLED).
// Frontends: "cms" (runtime on), "fallback" (runtime on, API unreachable), "local" (runtime off).
import { spawn, spawnSync } from 'node:child_process'
import { setTimeout as wait } from 'node:timers/promises'
import { chromium } from 'playwright'
import { contentRegistry } from './content-registry.mjs'
import { findDesignKeys, stripDesignKeys } from '../../src/lib/designLock.js'

const cmsPort = 8787
const cmsBase = `http://127.0.0.1:${cmsPort}`
const frontends = {
  cms: { port: 5274, env: { VITE_CMS_RUNTIME_ENABLED: 'true', VITE_CMS_API_BASE: cmsBase } },
  fallback: { port: 5275, env: { VITE_CMS_RUNTIME_ENABLED: 'true', VITE_CMS_API_BASE: 'http://127.0.0.1:9', VITE_CMS_RUNTIME_TIMEOUT_MS: '1500' } },
  local: { port: 5276, env: { VITE_CMS_RUNTIME_ENABLED: 'false' } },
}
const MARKER = '⟦cms⟧'

// Content edits that must appear on the normal frontend only after Publish.
const publishCases = [
  { id: 'home', route: '/', path: ['hero', 'titleLines', 0], selector: 'h1' },
  { id: 'product-ai-readiness-assessment', route: '/products/ai-readiness-assessment', path: ['hero', 'title'], selector: 'h1' },
  { id: 'capability-automation', route: '/capabilities/automation', path: ['hero', 'title'], selector: 'h1' },
  { id: 'industry-healthcare', route: '/industries/healthcare', path: ['hero', 'title'], selector: 'h1' },
  { id: 'company-leadership', route: '/leadership', path: ['intro', 'title'], selector: '#leadership-heading' },
]

const STYLE_PROPS = [
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing', 'textTransform', 'textAlign',
  'color', 'backgroundColor', 'backgroundImage', 'display', 'position', 'gridTemplateColumns', 'flexDirection',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'borderTopWidth', 'borderRadius', 'boxShadow', 'opacity',
]

testDesignLockUnit()

const processes = [spawnCommand(`npx wrangler dev --local --port ${cmsPort}`, 'worker')]
for (const frontend of Object.values(frontends)) {
  processes.push(spawnCommand(`npx vite --host 127.0.0.1 --port ${frontend.port} --strictPort`, '.', frontend.env))
}

let browser
try {
  await waitFor(`${cmsBase}/api/admin/pages`)
  for (const frontend of Object.values(frontends)) await waitFor(`http://127.0.0.1:${frontend.port}/`)

  await testPublicApi()

  browser = await chromium.launch()
  for (const testCase of publishCases) await testPublishShowsOnFrontend(testCase)
  await testFullSite()
  await testRuntimeDisabledAndFallback()

  console.log('Runtime tests passed.')
} finally {
  await browser?.close()
  processes.forEach(stopProcess)
}

function testDesignLockUnit() {
  const content = {
    grid: { items: [{ title: 'Card', style: { color: 'red' } }] },
    gap: { title: 'The gap' },
    hero: { title: 'Hi', color: '#f00', fontSize: '80px', className: 'x', backgroundColor: 'red', variant: 'dark', padding: 4 },
  }
  const stripped = stripDesignKeys(content)
  assertEqual(JSON.stringify(stripped), JSON.stringify({ grid: { items: [{ title: 'Card' }] }, gap: { title: 'The gap' }, hero: { title: 'Hi' } }), 'design keys stripped, content sections kept')
  assertEqual(findDesignKeys(content).length, 7, 'design keys detected')
  console.log('Design lock unit checks passed.')
}

async function testPublicApi() {
  const { pages } = await getJson('/api/public/content')
  assertEqual(Object.keys(pages).length, contentRegistry.length, 'public API returns every page')
  const home = (await getJson('/api/admin/pages/home')).page
  assertEqual(JSON.stringify(pages.home), JSON.stringify(home.content), 'public API returns the current published version')
  assert(!('version' in pages.home) && !('id' in pages.home && pages.home.id?.startsWith?.('ver_')), 'no admin metadata')

  // A saved draft is never exposed.
  const draft = structuredClone(home.content)
  draft.hero.titleLines[0] = 'Draft only text'
  await sendJson('PUT', '/api/admin/pages/home/draft', { content: draft })
  assert(!JSON.stringify(await getJson('/api/public/content')).includes('Draft only text'), 'public API never returns drafts')
  assert(!JSON.stringify(await getJson('/api/public/pages/home/content')).includes('Draft only text'), 'single-page API never returns drafts')
  await sendJson('DELETE', '/api/admin/pages/home/draft')

  // Archived versions are never exposed.
  const versions = (await getJson('/api/admin/pages/home/versions')).versions
  assert(versions.some(version => version.status === 'archived'), 'home has archived versions')
  assertEqual((await fetch(`${cmsBase}/api/public/content`, { method: 'POST' })).status, 405, 'public API is read-only')
  assertEqual((await fetch(`${cmsBase}/api/public/pages/home/draft`)).status, 404, 'no draft route on public API')
  assertEqual((await fetch(`${cmsBase}/api/public/content`)).headers.get('cache-control'), 'no-store', 'public API is not cached')

  // Design fields cannot be saved into content.
  const styled = structuredClone(home.content)
  styled.hero.color = 'red'
  styled.hero.fontSize = '90px'
  assertEqual((await sendJson('PUT', '/api/admin/pages/home/draft', { content: styled })).status, 400, 'design fields rejected on save')
  console.log('Public API checks passed (published only, read-only, design-locked).')
}

async function testPublishShowsOnFrontend({ id, route, path, selector }) {
  const page = await newPage()
  const initial = (await getJson(`/api/admin/pages/${id}`)).page
  const versionA = initial.version
  const textA = getAt(initial.content, path)
  const textB = sameWidthEdit(textA)

  await page.goto(url('cms', route))
  await expectText(page, selector, textA, `${id}: frontend shows published A`)
  const stylesA = await captureStyles(page, selector)

  // Edit to B -> Save Draft -> normal frontend still shows A
  const draft = structuredClone(initial.content)
  setAt(draft, path, textB)
  await sendJson('PUT', `/api/admin/pages/${id}/draft`, { content: draft })
  await page.goto(url('cms', route))
  await expectText(page, selector, textA, `${id}: Save Draft does not change frontend`)
  assert(!(await page.locator('body').innerText()).includes(textB), `${id}: draft text not visible`)

  // Publish -> normal frontend shows B
  const savedDraft = (await getJson(`/api/admin/pages/${id}/draft`)).draft
  const publish = await sendJson('POST', `/api/admin/pages/${id}/publish`, { expectedDraftSavedAt: savedDraft.createdAt })
  assertEqual(publish.status, 200, `${id}: publish succeeded`)
  try {
    await page.goto(url('cms', route))
    await expectText(page, selector, textB, `${id}: Publish changes frontend`)
    const stylesB = await captureStyles(page, selector)
    assertSameStyles(stylesA, stylesB, `${id}: design unchanged after publish`)
  } finally {
    // Restore A (as a new version) so the site is left as it was, even if an assertion failed.
    const restore = await sendJson('POST', `/api/admin/pages/${id}/versions/${versionA.id}/restore`)
    await sendJson('POST', `/api/admin/pages/${id}/publish`, { expectedDraftSavedAt: restore.body.draft.createdAt })
  }
  await page.goto(url('cms', route))
  await expectText(page, selector, textA, `${id}: restored A back on frontend`)
  await page.close()
  console.log(`Publish runtime passed: ${id} "${textA}" -> draft (unchanged) -> publish "${textB}" (styles identical)`)
}

async function testFullSite() {
  const routes = contentRegistry.filter(entry => !entry.route.startsWith('/__global') && entry.id !== 'global-not-found')
    .map(entry => ({ id: entry.id, route: entry.route }))
  routes.push({ id: 'global-not-found', route: '/this-page-does-not-exist' })

  const page = await newPage()
  // Mark every title/heading/label in the published payload; each page must render CMS-provided text.
  await page.route('**/api/public/content', async routeRequest => {
    const response = await routeRequest.fetch()
    const data = await response.json()
    for (const content of Object.values(data.pages)) markText(content)
    await routeRequest.fulfill({ response, json: data })
  })

  for (const { id, route } of routes) {
    await page.goto(url('cms', route))
    await page.locator('.site-header').waitFor()
    await page.waitForFunction(marker => document.body.innerText.includes(marker), MARKER, { timeout: 10000 })
      .catch(() => { throw new Error(`${id} (${route}) did not render published CMS content`) })
  }
  assert((await page.locator('.site-header').innerText()).includes(MARKER), 'navigation renders published content')
  assert((await page.locator('.site-footer').innerText()).includes(MARKER), 'footer renders published content')

  // Design fields smuggled into a published payload must have no visual effect.
  await page.unroute('**/api/public/content')
  await page.route('**/api/public/content', async routeRequest => {
    const response = await routeRequest.fetch()
    const data = await response.json()
    Object.assign(data.pages.home.hero, {
      style: { color: 'rgb(255, 0, 0)', fontSize: '99px' },
      className: 'injected-class',
      color: 'red',
      fontSize: '99px',
      padding: '200px',
      variant: 'dark',
    })
    await routeRequest.fulfill({ response, json: data })
  })
  await page.goto(url('cms', '/'))
  await page.locator('h1').waitFor()
  assertEqual(await page.locator('.injected-class').count(), 0, 'injected className ignored')
  const injected = await captureStyles(page, 'h1')
  await page.unroute('**/api/public/content')
  await page.goto(url('local', '/'))
  await page.locator('h1').waitFor()
  assertSameStyles(await captureStyles(page, 'h1'), injected, 'injected style/color fields have no visual effect')
  await page.close()
  console.log(`Full-site runtime passed: ${routes.length} routes + navigation + footer render published CMS content.`)
}

async function testRuntimeDisabledAndFallback() {
  for (const { id, route, path, selector } of publishCases) {
    const local = contentRegistry.find(entry => entry.id === id)
    const localText = getAt(JSON.parse(await (await import('node:fs/promises')).readFile(local.file, 'utf8')), path)

    const disabled = await newPage()
    const publicRequests = []
    disabled.on('request', request => request.url().includes('/api/public/') && publicRequests.push(request.url()))
    await disabled.goto(url('local', route))
    await expectText(disabled, selector, localText, `${id}: runtime off uses local JSON`)
    assertEqual(publicRequests.length, 0, `${id}: runtime off makes no CMS request`)
    const disabledStyles = await captureStyles(disabled, selector)
    await disabled.close()

    const fallback = await newPage()
    await fallback.goto(url('fallback', route))
    await expectText(fallback, selector, localText, `${id}: API failure falls back to local JSON`)
    assertSameStyles(await captureStyles(fallback, selector), disabledStyles, `${id}: fallback layout identical`)
    await fallback.close()

    const runtime = await newPage()
    await runtime.goto(url('cms', route))
    await expectText(runtime, selector, localText, `${id}: published content matches`)
    assertSameStyles(await captureStyles(runtime, selector), disabledStyles, `${id}: CMS runtime layout identical to local`)
    await runtime.close()
  }
  console.log('Runtime off / fallback passed: local JSON used, no CMS requests when off, identical styles in all modes.')
}

async function captureStyles(page, selector) {
  await page.evaluate(() => document.fonts.ready)
  return page.locator(selector).first().evaluate((element, props) => {
    const read = node => {
      const style = getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      return {
        ...Object.fromEntries(props.map(prop => [prop, style[prop]])),
        rect: [rect.x, rect.y, rect.width, rect.height].map(value => Math.round(value)),
      }
    }
    const section = element.closest('section') || element.parentElement
    return {
      heading: read(element),
      section: read(section),
      header: read(document.querySelector('.site-header')),
      footer: read(document.querySelector('.site-footer')),
      body: read(document.body),
    }
  }, STYLE_PROPS)
}

function assertSameStyles(before, after, message) {
  for (const part of Object.keys(before)) {
    for (const key of Object.keys(before[part])) {
      const a = JSON.stringify(before[part][key])
      const b = JSON.stringify(after[part][key])
      if (a !== b) throw new Error(`Assertion failed: ${message}. ${part}.${key} changed: ${a} -> ${b}`)
    }
  }
}

async function expectText(page, selector, text, message) {
  await page.locator(selector).first().waitFor()
  await page.waitForFunction(({ selector: target, expected }) => document.querySelector(target)?.innerText.replace(/\s+/g, ' ').includes(expected), { selector, expected: text }, { timeout: 10000 })
    .catch(async () => {
      throw new Error(`Assertion failed: ${message}. "${text}" not in "${await page.locator(selector).first().innerText()}"`)
    })
}

// Swap one vowel for another so the text changes while keeping line breaks/layout stable.
function sameWidthEdit(text) {
  const swaps = { a: 'o', o: 'a', e: 'o', i: 'u', u: 'i' }
  const index = text.search(/[aeiou]/)
  assert(index >= 0, `editable text "${text}"`)
  return `${text.slice(0, index)}${swaps[text[index]]}${text.slice(index + 1)}`
}

function markText(value) {
  if (Array.isArray(value)) return value.forEach(markText)
  if (!value || typeof value !== 'object') return
  for (const [key, child] of Object.entries(value)) {
    if (['title', 'heading', 'label'].includes(key) && typeof child === 'string' && child) value[key] = `${child} ${MARKER}`
    else if (key === 'titleLines' && Array.isArray(child)) value[key] = child.map(line => `${line} ${MARKER}`)
    else markText(child)
  }
}

async function newPage() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  page.on('pageerror', error => console.error(`Page error: ${error.message}`))
  return page
}

function url(frontend, route) {
  return `http://127.0.0.1:${frontends[frontend].port}${route}`
}

function getAt(value, path) {
  return path.reduce((current, key) => current?.[key], value)
}

function setAt(value, path, next) {
  getAt(value, path.slice(0, -1))[path.at(-1)] = next
}

async function getJson(path) {
  const response = await fetch(`${cmsBase}${path}`)
  if (!response.ok) throw new Error(`GET ${path} failed: ${response.status}`)
  return response.json()
}

async function sendJson(method, path, body) {
  const response = await fetch(`${cmsBase}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: response.status, body: await response.json() }
}

function spawnCommand(command, cwd, env = {}) {
  const options = { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] }
  return process.platform === 'win32'
    ? spawn('cmd.exe', ['/d', '/s', '/c', command], options)
    : spawn('sh', ['-c', command], options)
}

async function waitFor(target) {
  for (let index = 0; index < 80; index += 1) {
    try {
      if ((await fetch(target)).ok) return
    } catch {
      // keep polling
    }
    await wait(500)
  }
  throw new Error(`Timed out waiting for ${target}`)
}

function stopProcess(child) {
  if (!child.pid) return
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    return
  }
  child.kill()
}

function assert(value, message) {
  if (!value) throw new Error(`Assertion failed: ${message}`)
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`Assertion failed: ${message}. Expected ${expected}, got ${actual}`)
}
