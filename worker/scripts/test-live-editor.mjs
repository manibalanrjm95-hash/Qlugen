// Live editor test (Home): iframe preview (/admin/live-preview), handshake, click-to-edit and the
// real responsive layouts. Runs against an isolated, throwaway local database, so it leaves nothing
// behind in the development database.
//
//   npm run cms:test:editor
//   CMS_EDITOR_SCREENSHOTS=<dir> npm run cms:test:editor   (also saves Home Desktop/Tablet/Mobile shots)
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, openSync, rmSync } from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as wait } from 'node:timers/promises'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const workerDir = path.join(root, 'worker')
const persistDir = '.wrangler/editor-test'
const logDir = path.join(workerDir, '.tmp')
const api = 'http://127.0.0.1:8794'
const site = 'http://127.0.0.1:5294'
const flakySite = 'http://127.0.0.1:5293'
const shotDir = process.env.CMS_EDITOR_SCREENSHOTS || ''
const WIDTHS = { desktop: 1440, tablet: 768, mobile: 390 }

rmSync(path.join(workerDir, persistDir), { recursive: true, force: true })
mkdirSync(logDir, { recursive: true })
run(`npx wrangler d1 migrations apply qlugen-cms-local --local --persist-to ${persistDir}`, workerDir)
run('node worker/scripts/generate-seed-sql.mjs --out worker/.tmp/editor-seed.sql', root)
run(`npx wrangler d1 execute qlugen-cms-local --local --persist-to ${persistDir} --file .tmp/editor-seed.sql`, workerDir)

// Stand-in for a CMS API that accepts connections but never answers (a hung local Worker).
// While `hung` is true requests are left open; afterwards they are forwarded to the real test Worker.
let hung = true
const stuck = []
const flakyApi = http.createServer((request, response) => {
  if (hung) {
    stuck.push(response)
    return
  }
  const upstream = http.request({ host: '127.0.0.1', port: 8794, path: request.url, method: request.method, headers: request.headers }, reply => {
    response.writeHead(reply.statusCode, reply.headers)
    reply.pipe(response)
  })
  upstream.on('error', () => response.destroy())
  request.pipe(upstream)
})
await new Promise(resolve => flakyApi.listen(8793, '127.0.0.1', resolve))

const processes = [
  spawnLogged(`npx wrangler dev --local --port 8794 --persist-to ${persistDir}`, workerDir, {}, 'editor-worker'),
  spawnLogged('npx vite --host 127.0.0.1 --port 5294 --strictPort', root, { VITE_CMS_RUNTIME_ENABLED: 'true', VITE_CMS_API_BASE: api }, 'editor-vite'),
  spawnLogged('npx vite --host 127.0.0.1 --port 5293 --strictPort', root, { VITE_CMS_API_BASE: 'http://127.0.0.1:8793' }, 'editor-vite-flaky'),
]

let browser
let previewPage
try {
  await waitFor(`${api}/api/admin/me`)
  await waitFor(`${site}/`)
  await waitFor(`${flakySite}/`)
  browser = await chromium.launch()

  await testPublicHasNoEditMetadata()
  await testPreviewRouteStandsAlone()
  await testUnresponsiveApiShowsRetry()
  await testIframeThatNeverStartsShowsRetry()

  const page = await browser.newPage({ viewport: { width: 1536, height: 1024 } })
  previewPage = page
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))
  page.on('dialog', dialog => dialog.accept())
  await page.goto(`${site}/admin`)
  await page.locator('[data-loaded-page="home"]').waitFor()

  // 1. The centre preview is a same-origin iframe on the internal preview route.
  const iframe = page.locator('.cms-ref__canvas iframe.cms-ref__preview-iframe')
  await iframe.waitFor()
  assertEqual(new URL(await iframe.getAttribute('src'), site).pathname, '/admin/live-preview', 'preview iframe uses /admin/live-preview')
  assertEqual(await page.locator('.cms-ref__canvas [data-cms-field]').count(), 0, 'the page is rendered only inside the iframe')

  // 2. Handshake: the iframe reports ready, the parent answers with the page content.
  const preview = page.frameLocator('.cms-ref__canvas iframe.cms-ref__preview-iframe')
  await preview.locator('.cms-live-preview[data-preview-page="home"]').waitFor()
  await preview.locator('[data-cms-field="hero.titleLines"]').waitFor()
  const seededTitle = (await (await fetch(`${api}/api/public/pages?ids=home`)).json()).pages.home.hero.titleLines[0]
  assert((await preview.locator('[data-cms-field="hero.titleLines"]').textContent()).includes(seededTitle), 'iframe renders the content sent by the parent')
  await page.locator('.cms-ref__preview-loading').waitFor({ state: 'detached' })
  const frame = page.frames().find(candidate => new URL(candidate.url()).pathname === '/admin/live-preview')
  assert(frame, 'preview frame found')
  await expectViewport(frame, 'desktop')

  // 3. Each click selects exactly the clicked CMS element inside the iframe; the parent opens its editor.
  for (const [field, panel] of [
    ['hero.titleLines', 'Heading'],
    ['hero.description', 'Paragraph'],
    ['hero.button', 'Button'],
    ['capabilities.title', 'Heading'],
    ['capabilities.description', 'Paragraph'],
    ['capabilities.items.2', 'Card'],
  ]) {
    await clickField(preview, field)
    await expectSelected(page, frame, field, panel)
  }
  await clickHeroImage(preview)
  await expectSelected(page, frame, 'hero.image', 'Image')
  for (const control of ['Replace Image', 'Choose Media']) await page.locator('.cms-ref__panel').getByRole('button', { name: control }).waitFor()

  // 4. Messages are accepted only from the right window.
  await clickField(preview, 'hero.titleLines')
  await expectSelected(page, frame, 'hero.titleLines', 'Heading')
  await page.evaluate(() => window.postMessage({ type: 'cms-field-selected', field: 'capabilities.title', tagName: 'H2' }, window.location.origin))
  await frame.evaluate(() => window.postMessage({ type: 'cms-preview-content', pageId: 'home', content: {}, selectedField: null }, window.location.origin))
  await page.waitForTimeout(250)
  await expectSelected(page, frame, 'hero.titleLines', 'Heading')
  await preview.locator('[data-cms-field="hero.titleLines"]').waitFor()

  // 5. Blank layout containers are never selectable.
  await clickBlank(preview, '.capabilities-section')
  await page.waitForTimeout(150)
  await expectSelected(page, frame, 'hero.titleLines', 'Heading')
  assertEqual(await frame.evaluate(() => [...document.querySelectorAll('[data-cms-selected]')].filter(node => !node.hasAttribute('data-cms-field')).length), 0, 'only CMS fields carry the selection')

  // 6. Scrolling the iframe keeps the outline and label on the same element.
  await clickField(preview, 'capabilities.items.2')
  await expectSelected(page, frame, 'capabilities.items.2', 'Card')
  for (const delta of [180, 420, -250]) {
    await frame.evaluate(amount => window.scrollBy(0, amount), delta)
    await page.waitForTimeout(120)
    await expectAttached(frame, 'capabilities.items.2')
  }

  // 7. Desktop only: no device switcher; the iframe is a real desktop viewport with the desktop layout.
  assertEqual(await page.getByRole('button', { name: /^W*(Desktop|Tablet|Mobile)$/ }).count(), 0, 'no device switcher in the editor')
  await clickField(preview, 'hero.titleLines')
  await expectSelected(page, frame, 'hero.titleLines', 'Heading')
  await expectViewport(frame, 'desktop')
  assertEqual(await iframe.evaluate(node => node.offsetWidth), WIDTHS.desktop, 'iframe has the desktop width')
  const desktopLayout = await readLayout(frame)
  assert(desktopLayout.desktopNav && !desktopLayout.mobileToggle, `preview shows the desktop layout ${JSON.stringify(desktopLayout)}`)
  await frame.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(200)
  await expectAttached(frame, 'hero.titleLines')
  await shot(page, 'home-desktop-only-selected')

  // 8. Editing in the right panel updates the iframe immediately; the field stays selected.
  await page.locator('.cms-ref__panel textarea').fill('Live edited heading\nsecond line')
  await preview.locator('[data-cms-field="hero.titleLines"]', { hasText: 'Live edited heading' }).waitFor()
  await expectSelected(page, frame, 'hero.titleLines', 'Heading')
  await expectAttached(frame, 'hero.titleLines')
  await page.locator('.cms-ref__status', { hasText: 'Unsaved' }).waitFor()

  // 9. Links select, never navigate (neither the iframe nor the admin).
  await clickField(preview, 'hero.button')
  await expectSelected(page, frame, 'hero.button', 'Button')
  await clickField(preview, 'about.button')
  await expectSelected(page, frame, 'about.button', 'Button')
  await page.waitForTimeout(250)
  assertEqual(new URL(frame.url()).pathname, '/admin/live-preview', 'iframe did not navigate')
  assertEqual(new URL(page.url()).pathname, '/admin', 'admin did not navigate')

  // 10. Save Draft still works and does not change the published content.
  await page.locator('.cms-ref__actions').getByRole('button', { name: 'Save Draft' }).click()
  await page.locator('.cms-ref__status', { hasText: 'Draft' }).waitFor()
  const draft = await (await fetch(`${api}/api/admin/pages/home/draft`)).json()
  assertEqual(draft.draft.content.hero.titleLines.join('|'), 'Live edited heading|second line', 'draft saved')
  const published = await (await fetch(`${api}/api/public/pages?ids=home`)).json()
  assert(!JSON.stringify(published).includes('Live edited heading'), 'public content unchanged by Save Draft')

  // 11. One edit, every screen size: after Publish, the public site shows the edit on desktop, tablet
  //     and mobile, each in the site's own responsive layout.
  await page.locator('.cms-ref__actions').getByRole('button', { name: /Publish/ }).click()
  const dialog = page.getByRole('alertdialog')
  await dialog.getByRole('button', { name: 'Publish', exact: true }).click()
  await dialog.waitFor({ state: 'detached' })
  await page.locator('.cms-ref__status', { hasText: /^Published$/ }).waitFor()
  const layouts = {}
  for (const [device, width] of Object.entries(WIDTHS)) {
    const publicPage = await browser.newPage({ viewport: { width, height: 900 } })
    await publicPage.goto(`${site}/`)
    await publicPage.locator('h1', { hasText: 'Live edited heading' }).waitFor()
    layouts[device] = await readLayout(publicPage.mainFrame(), 'h1')
    await publicPage.close()
  }
  assert(layouts.desktop.desktopNav && !layouts.desktop.mobileToggle, `desktop layout ${JSON.stringify(layouts.desktop)}`)
  assert(!layouts.tablet.desktopNav && layouts.tablet.mobileToggle, `tablet layout ${JSON.stringify(layouts.tablet)}`)
  assert(!layouts.mobile.desktopNav && layouts.mobile.mobileToggle, `mobile layout ${JSON.stringify(layouts.mobile)}`)
  assert(layouts.mobile.heroFontSize < layouts.desktop.heroFontSize, 'mobile uses its own heading size')
  assert(layouts.mobile.scrollWidth <= WIDTHS.mobile + 1, `mobile fits its width (${layouts.mobile.scrollWidth})`)

  assertEqual(pageErrors.length, 0, `no page errors (${pageErrors.join(' | ')})`)
  console.log('Live editor iframe tests passed (Home): handshake, click-to-edit, desktop-only preview, live edits, links, Save Draft, published on every screen size.')
} finally {
  await browser?.close()
  flakyApi.closeAllConnections?.()
  flakyApi.close()
  processes.forEach(stopProcess)
  await wait(500)
  rmSync(path.join(workerDir, persistDir), { recursive: true, force: true })
}

async function testPublicHasNoEditMetadata() {
  const page = await browser.newPage({ viewport: { width: 1536, height: 1024 } })
  await page.goto(`${site}/`)
  await page.locator('h1').waitFor()
  assertEqual(await page.locator('[data-cms-field], [data-cms-selected], .cms-live-preview').count(), 0, 'public site renders no edit metadata')
  await page.close()
}

// /admin/live-preview renders only the page area (no admin sidebar, toolbar or panel) and, opened
// outside the admin, waits for content instead of loading anything itself.
async function testPreviewRouteStandsAlone() {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${site}/admin/live-preview`)
  await page.locator('.cms-live-preview').waitFor({ state: 'attached' })
  assertEqual(await page.locator('.cms-ref__sidebar, .cms-ref__topbar, .cms-ref__panel, .cms-ref__canvas').count(), 0, 'preview route has no admin chrome')
  assertEqual(await page.locator('[data-cms-field]').count(), 0, 'preview route renders nothing until the admin sends content')
  assertEqual(errors.length, 0, `preview route mounts without errors (${errors.join(' | ')})`)
  await page.close()
}

// A CMS API that never answers must not leave the preview on "Loading page..." forever:
// the admin shows "Preview couldn't load." with Retry, and Retry recovers once the API answers.
async function testUnresponsiveApiShowsRetry() {
  const page = await browser.newPage({ viewport: { width: 1536, height: 1024 } })
  hung = true
  await page.goto(`${flakySite}/admin`)
  await page.getByText("Preview couldn't load.").waitFor({ timeout: 30000 })
  assert((await page.locator('.cms-ref__load-error small').innerText()).includes('not responding'), 'error explains the API is not responding')
  // "Restart" the API: it answers again and its stuck connections are dropped, as a restarted
  // Worker would (the browser only allows a few connections per host).
  hung = false
  stuck.splice(0).forEach(response => response.socket?.destroy())
  await page.getByRole('button', { name: 'Retry' }).click()
  await page.frameLocator('.cms-ref__preview-iframe').locator('[data-cms-field="hero.titleLines"]').waitFor({ timeout: 30000 })
  assertEqual(await page.getByText("Preview couldn't load.").count(), 0, 'Retry loads the Home preview')
  await page.close()
  console.log('Unresponsive API: "Preview couldn\'t load." with Retry; Retry recovers.')
}

// An iframe that never sends "cms-preview-ready" ends in the same error state, not endless loading.
async function testIframeThatNeverStartsShowsRetry() {
  const page = await browser.newPage({ viewport: { width: 1536, height: 1024 } })
  await page.route('**/admin/live-preview', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><p>no preview</p>' }))
  await page.goto(`${site}/admin`)
  await page.locator('[data-loaded-page="home"]').waitFor()
  await page.locator('.cms-ref__preview-loading').waitFor()
  await page.getByText("Preview couldn't load.").waitFor({ timeout: 30000 })
  await page.unroute('**/admin/live-preview')
  await page.getByRole('button', { name: 'Retry' }).click()
  await page.frameLocator('.cms-ref__preview-iframe').locator('[data-cms-field="hero.titleLines"]').waitFor({ timeout: 30000 })
  await page.close()
  console.log('Iframe that never starts: "Preview couldn\'t load." with Retry; Retry recovers.')
}

// Real mouse clicks: a point inside the iframe document (CSS px of the iframe viewport) is mapped to
// the admin page through the iframe's on-screen box, exactly as the browser maps a user's click.
async function clickInPreview(point) {
  const iframe = await previewPage.locator('.cms-ref__canvas iframe.cms-ref__preview-iframe').evaluate(node => {
    const box = node.getBoundingClientRect()
    return { left: box.left, top: box.top, scale: box.width / node.offsetWidth }
  })
  await previewPage.mouse.click(iframe.left + point.x * iframe.scale, iframe.top + point.y * iframe.scale)
  await wait(80)
}

// Clicks a visible point inside the element.
async function clickField(preview, field) {
  const element = preview.locator(`[data-cms-field="${field}"]`).first()
  await element.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await wait(60)
  await clickInPreview(await element.evaluate(node => {
    const box = node.getBoundingClientRect()
    const top = Math.max(box.top, 0) + 2
    const bottom = Math.min(box.bottom, window.innerHeight) - 2
    const left = Math.max(box.left, 0) + 2
    const right = Math.min(box.right, window.innerWidth) - 2
    return { x: left + Math.min(12, (right - left) / 2), y: top + Math.min(10, (bottom - top) / 2) }
  }))
}

// Hero image: clicking the banner area (not on text) selects the image underneath the overlay.
async function clickHeroImage(preview) {
  const hero = preview.locator('.hero-section')
  await hero.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await wait(60)
  await clickInPreview(await hero.evaluate(node => {
    const box = node.getBoundingClientRect()
    return { x: box.right - 40, y: Math.min(box.top + box.height * 0.45, window.innerHeight - 40) }
  }))
}

// A blank point of a layout container (its top-left padding).
async function clickBlank(preview, selector) {
  const container = preview.locator(selector)
  await container.evaluate(node => node.scrollIntoView({ block: 'start', behavior: 'instant' }))
  await wait(60)
  await clickInPreview(await container.evaluate(node => {
    const box = node.getBoundingClientRect()
    return { x: box.left + 6, y: Math.max(box.top, 70) + 6 }
  }))
}

async function selectedFields(frame) {
  return frame.evaluate(() => [...document.querySelectorAll('[data-cms-selected="true"]')].map(node => node.getAttribute('data-cms-field')))
}

async function expectSelected(page, frame, field, panel) {
  let actual
  for (let attempt = 0; attempt < 50; attempt += 1) {
    actual = { selected: await selectedFields(frame), panel: await page.locator('.cms-ref__panel-head h2').innerText() }
    if (actual.selected.length === 1 && actual.selected[0] === field && actual.panel === panel) return
    await wait(100)
  }
  throw new Error(`Assertion failed: expected ${field} selected with the ${panel} editor, got ${JSON.stringify(actual)}`)
}

// The outline is on the element itself; the label sits directly above it (or just inside it at the
// very top of the page), aligned left, in the iframe's own document.
async function expectAttached(frame, field) {
  const gap = await frame.evaluate(expected => {
    const element = document.querySelector('[data-cms-selected="true"]')
    const tag = document.querySelector('.cms-live-preview__tag')
    if (!element || element.getAttribute('data-cms-field') !== expected || !tag) {
      return { selected: element?.getAttribute('data-cms-field') || null, tag: Boolean(tag) }
    }
    const e = element.getBoundingClientRect()
    const t = tag.getBoundingClientRect()
    return {
      vertical: Math.min(Math.abs(e.top - t.bottom), Math.abs(e.top + 4 - t.top)),
      horizontal: Math.abs(Math.max(0, e.left + window.scrollX) - (t.left + window.scrollX)),
      outline: getComputedStyle(element).outlineStyle,
    }
  }, field)
  assert(gap.vertical <= 1.5 && gap.horizontal <= 1.5 && gap.outline === 'solid', `${field} selection attached (${JSON.stringify(gap)})`)
}

// The iframe document itself has the device's viewport width, so the site's media queries apply.
async function expectViewport(frame, device) {
  let width
  for (let attempt = 0; attempt < 50; attempt += 1) {
    width = await frame.evaluate(() => window.innerWidth)
    if (width === WIDTHS[device]) return
    await wait(100)
  }
  throw new Error(`Assertion failed: ${device} iframe viewport should be ${WIDTHS[device]}px, got ${width}`)
}

async function readLayout(frame, heading = '[data-cms-field="hero.titleLines"]') {
  return frame.evaluate(heading => {
    const visible = selector => {
      const node = document.querySelector(selector)
      return Boolean(node) && getComputedStyle(node).display !== 'none' && node.getBoundingClientRect().width > 0
    }
    const cards = [...document.querySelectorAll('[data-cms-field^="capabilities.items."]')]
    return {
      desktopNav: visible('.site-nav'),
      mobileToggle: visible('.mobile-toggle'),
      heroFontSize: parseFloat(getComputedStyle(document.querySelector(heading)).fontSize),
      cardColumns: cards.filter(card => Math.abs(card.getBoundingClientRect().top - cards[0].getBoundingClientRect().top) < 2).length,
      scrollWidth: document.documentElement.scrollWidth,
    }
  }, heading)
}

async function shot(page, name) {
  if (shotDir) await page.screenshot({ path: path.join(shotDir, `${name}.png`) })
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
