// "+ Add Page" end-to-end test in the visual admin, for all five templates, fully isolated: a
// throwaway local database is migrated and seeded for each run and deleted afterwards, so no pages
// or media are ever left behind. Nothing touches Cloudflare.
//
//   npm run cms:test:addpage
//
// For each template: modal (Name -> auto URL -> Template) -> Create -> listed in the right sidebar
// group, auto-selected and opened in the live editor iframe -> click-to-edit the page heading ->
// Save Draft (public URL still 404) -> Publish (public URL renders the edit through the dynamic route).
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, openSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as wait } from 'node:timers/promises'
import { chromium } from 'playwright'
import { slugify } from '../../src/cms/routeRules.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const workerDir = path.join(root, 'worker')
const persistDir = '.wrangler/add-page-test'
const logDir = path.join(workerDir, '.tmp')
const api = 'http://127.0.0.1:8802'
const site = 'http://127.0.0.1:5302'
const PREVIEW_IFRAME = '.cms-ref__canvas iframe.cms-ref__preview-iframe'
const NOT_FOUND = "This path doesn't lead anywhere."

const TEMPLATES = [
  { label: 'Standard Page', key: 'standard-page', group: 'Custom Pages', name: 'Flow Standard' },
  { label: 'Product / Solution', key: 'product-detail', group: 'Products & Platforms', name: 'Flow Product' },
  { label: 'Capability', key: 'capability-detail', group: 'Capabilities', name: 'Flow Capability' },
  { label: 'Industry', key: 'industry-detail', group: 'Industries', name: 'Flow Industry' },
  { label: 'Insight / Article', key: 'insight-article', group: 'Insights', name: 'Flow Insight' },
]

rmSync(path.join(workerDir, persistDir), { recursive: true, force: true })
mkdirSync(logDir, { recursive: true })
run(`npx wrangler d1 migrations apply qlugen-cms-local --local --persist-to ${persistDir}`, workerDir)
run('node worker/scripts/generate-seed-sql.mjs --out worker/.tmp/add-page-seed.sql', root)
run(`npx wrangler d1 execute qlugen-cms-local --local --persist-to ${persistDir} --file .tmp/add-page-seed.sql`, workerDir)

const processes = [
  spawnLogged(`npx wrangler dev --local --port 8802 --persist-to ${persistDir}`, workerDir, {}, 'add-page-worker'),
  spawnLogged('npx vite --host 127.0.0.1 --port 5302 --strictPort', root, { VITE_CMS_RUNTIME_ENABLED: 'true', VITE_CMS_API_BASE: api }, 'add-page-vite'),
]

let browser
try {
  await waitFor(`${api}/api/admin/me`)
  await waitFor(`${site}/`)
  const mediaBefore = (await get('/api/admin/media?limit=500')).media.length
  const pagesBefore = (await get('/api/admin/pages')).pages.length

  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1536, height: 1024 } })
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))
  page.on('dialog', dialog => dialog.accept())
  await page.goto(`${site}/admin`)
  await page.locator('.cms-ref__main[data-loaded-page="home"]').waitFor()

  await testModal(page)

  const suffix = Date.now().toString(36)
  const created = []
  for (const template of TEMPLATES) {
    const title = `${template.name} ${suffix}`
    const slug = slugify(title)
    const id = `custom-${slug}`

    // Modal: Name -> URL auto-generated -> Template -> Create.
    await page.getByRole('button', { name: 'Add Page', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Create New Page' })
    await dialog.getByLabel('Page Name').fill(title)
    assertEqual(await dialog.getByLabel('URL').inputValue(), slug, `${template.label}: URL generated from the name`)
    await dialog.getByLabel('Template').selectOption({ label: template.label })
    await dialog.getByRole('button', { name: 'Create Page' }).click()
    await dialog.waitFor({ state: 'detached' })

    // Record + initial draft, never published.
    const record = (await get(`/api/admin/pages/${id}`)).page
    assertEqual(record.route, `/${slug}`, `${template.label}: page record created`)
    assertEqual(record.templateId, template.key, `${template.label}: selected template stored`)
    assertEqual((await get(`/api/admin/pages/${id}/draft`)).draft.status, 'draft', `${template.label}: initial draft from template defaults`)
    assert(!record.latestVersion && !record.publishedVersion, `${template.label}: not auto-published`)
    await expectNotFound(`/${slug}`, `${template.label}: not public before Publish`)

    // Listed in its sidebar group, auto-selected, opened in the live editor.
    const group = page.locator('.cms-ref__nav-group', { has: page.locator('.cms-ref__group-toggle', { hasText: template.group }) })
    await group.locator(`[data-record-id="${id}"].is-active`, { hasText: title }).waitFor()
    await page.waitForFunction(recordId => {
      const item = document.querySelector(`.cms-ref__nav [data-record-id="${recordId}"]`).getBoundingClientRect()
      const nav = document.querySelector('.cms-ref__nav-scroll').getBoundingClientRect()
      return item.top >= nav.top - 1 && item.bottom <= nav.bottom + 1
    }, id)
    await page.locator(`.cms-ref__main[data-loaded-page="${id}"]`).waitFor()
    const preview = page.frameLocator(PREVIEW_IFRAME)
    await preview.locator(`.cms-live-preview[data-preview-page="${id}"] h1`, { hasText: title }).waitFor()
    await page.locator('.cms-ref__preview-loading').waitFor({ state: 'detached' })
    const frame = page.frames().find(candidate => new URL(candidate.url()).pathname === '/admin/live-preview')

    // Click-to-edit the page heading in the iframe; the edit shows live and marks the page Unsaved.
    const field = await clickHeading(page, frame)
    await page.locator('.cms-ref__panel-head h2', { hasText: 'Heading' }).waitFor()
    const edited = `Edited ${title}`
    await page.locator('.cms-ref__panel textarea, .cms-ref__panel input').first().fill(edited)
    await preview.locator('h1', { hasText: edited }).waitFor()
    assert(await frame.evaluate(expected => document.querySelector('[data-cms-selected="true"]')?.getAttribute('data-cms-field') === expected, field), `${template.label}: heading stays selected after edit`)
    await page.locator('.cms-ref__status', { hasText: /^Unsaved$/ }).waitFor()

    // Save Draft: stored as draft, public URL unchanged (still not published).
    await page.locator('.cms-ref__actions').getByRole('button', { name: 'Save Draft' }).click()
    await page.locator('.cms-ref__status', { hasText: /^Draft$/ }).waitFor()
    assert(JSON.stringify((await get(`/api/admin/pages/${id}/draft`)).draft.content).includes(edited), `${template.label}: draft saved`)
    await expectNotFound(`/${slug}`, `${template.label}: Save Draft does not publish`)

    // Publish: the dynamic route serves the edited page (no React route added).
    await page.locator('.cms-ref__actions').getByRole('button', { name: /Publish/ }).click()
    const publishDialog = page.getByRole('alertdialog')
    await publishDialog.getByRole('button', { name: 'Publish', exact: true }).click()
    await publishDialog.waitFor({ state: 'detached' })
    await page.locator('.cms-ref__status', { hasText: /^Published$/ }).waitFor()
    const publicPage = await browser.newPage()
    await publicPage.goto(`${site}/${slug}`)
    await publicPage.locator('h1', { hasText: edited }).waitFor()
    assertEqual(await publicPage.getByText(NOT_FOUND).count(), 0, `${template.label}: published URL works`)
    await publicPage.close()

    if (!created.length) await shot(page, 'add-page-created-in-editor')
    created.push({ title, slug, id })
    console.log(`${template.label}: created -> ${template.group} -> live edit -> Save Draft (public unchanged) -> Publish (/${slug} live).`)
  }

  // Duplicate and reserved URLs are rejected in the modal and by the Worker.
  await page.getByRole('button', { name: 'Add Page', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Create New Page' })
  await dialog.getByLabel('Page Name').fill(created[0].title)
  await dialog.getByText(`/${created[0].slug} is already used by another page.`).waitFor()
  assert(await dialog.getByRole('button', { name: 'Create Page' }).isDisabled(), 'duplicate URL blocks Create Page')
  for (const reserved of ['About', 'Admin', 'Capabilities']) {
    await dialog.getByLabel('Page Name').fill(reserved)
    await dialog.getByText('is already used by the website').waitFor()
    assert(await dialog.getByRole('button', { name: 'Create Page' }).isDisabled(), `reserved URL /${slugify(reserved)} blocks Create Page`)
  }
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  const duplicate = await send('POST', '/api/admin/pages', { title: 'Dup', slug: created[0].slug, template: 'standard-page' })
  assert(duplicate.status >= 400 && duplicate.status < 500, `Worker rejects duplicate slug (${duplicate.status})`)
  const reserved = await send('POST', '/api/admin/pages', { title: 'About', slug: 'about', template: 'standard-page' })
  assert(reserved.status >= 400 && reserved.status < 500, `Worker rejects reserved slug (${reserved.status})`)
  console.log('Duplicate and reserved URLs rejected (modal and Worker).')

  // Only the five pages were added; no media was uploaded.
  assertEqual((await get('/api/admin/pages')).pages.length, pagesBefore + TEMPLATES.length, 'exactly one page per template created')
  assertEqual((await get('/api/admin/media?limit=500')).media.length, mediaBefore, 'no media created')
  assertEqual(pageErrors.length, 0, `no page errors (${pageErrors.join(' | ')})`)
  console.log('Add Page flow tests passed (isolated database removed; no pages or media left behind).')
} finally {
  await browser?.close()
  processes.forEach(stopProcess)
  await wait(500)
  rmSync(path.join(workerDir, persistDir), { recursive: true, force: true })
}

// The modal is a centred ~480px dialog over a fixed full-screen backdrop, above the preview iframe;
// it does not move the admin layout, locks background scrolling, and Cancel / Esc / backdrop close it.
async function testModal(page) {
  // Baseline only once the preview has loaded and been fitted to the canvas.
  await page.frameLocator(PREVIEW_IFRAME).locator('.cms-live-preview h1').first().waitFor()
  await page.locator('.cms-ref__preview-loading').waitFor({ state: 'detached' })
  await page.waitForFunction(() => {
    const iframe = document.querySelector('iframe.cms-ref__preview-iframe')
    return iframe && Math.round(iframe.getBoundingClientRect().width) <= Math.round(document.querySelector('.cms-ref__canvas').getBoundingClientRect().width)
  })
  const layoutBefore = await adminLayout(page)
  const openModal = async () => {
    await page.getByRole('button', { name: 'Add Page', exact: true }).click()
    await page.getByRole('dialog', { name: 'Create New Page' }).waitFor()
  }
  await openModal()
  const dialog = page.getByRole('dialog', { name: 'Create New Page' })
  await dialog.getByLabel('Page Name').fill('AI Strategy')
  assertEqual(await dialog.getByLabel('URL').inputValue(), 'ai-strategy', 'slug generated from Page Name')
  await dialog.getByText('Preview: /ai-strategy').waitFor()
  const options = await dialog.getByLabel('Template').locator('option').allTextContents()
  assertEqual(options.join('|'), 'Standard Page|Product / Solution|Capability|Industry|Insight / Article', 'template choices')

  const geometry = await page.evaluate(() => {
    const backdrop = document.querySelector('.cms-modal')
    const box = document.querySelector('.cms-modal__dialog').getBoundingClientRect()
    const iframe = document.querySelector('iframe.cms-ref__preview-iframe').getBoundingClientRect()
    const style = getComputedStyle(backdrop)
    const atIframe = document.elementFromPoint(iframe.left + 20, iframe.top + 20)
    return {
      parent: backdrop.parentElement === document.body,
      position: style.position,
      cover: backdrop.getBoundingClientRect().width === window.innerWidth && backdrop.getBoundingClientRect().height === window.innerHeight,
      width: Math.round(box.width),
      centreX: Math.abs(box.left + box.width / 2 - window.innerWidth / 2),
      centreY: Math.abs(box.top + box.height / 2 - window.innerHeight / 2),
      aboveIframe: atIframe === backdrop,
      scrollLocked: getComputedStyle(document.body).overflow === 'hidden' && getComputedStyle(document.documentElement).overflow === 'hidden',
    }
  })
  assert(geometry.parent && geometry.position === 'fixed' && geometry.cover, `fixed full-screen backdrop on <body> ${JSON.stringify(geometry)}`)
  assert(geometry.width === 480 && geometry.centreX <= 1 && geometry.centreY <= 1, `centred 480px modal ${JSON.stringify(geometry)}`)
  assert(geometry.aboveIframe, 'backdrop is above the preview iframe')
  assert(geometry.scrollLocked, 'background scroll locked')
  assertEqual(JSON.stringify(await adminLayout(page)), JSON.stringify(layoutBefore), 'opening the modal does not change the admin/iframe layout')
  await shot(page, 'add-page-modal')

  // Validation shown inside the modal.
  await dialog.getByLabel('Page Name').fill('About')
  await dialog.locator('.cms-modal__error', { hasText: '/about is already used by the website' }).waitFor()
  assert(await dialog.getByRole('button', { name: 'Create Page' }).isDisabled(), 'invalid URL blocks Create Page')
  await shot(page, 'add-page-modal-error')

  // Cancel, Esc and backdrop close it and restore scrolling.
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await dialog.waitFor({ state: 'detached' })
  await openModal()
  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'detached' })
  await openModal()
  await page.mouse.click(20, 20)
  await dialog.waitFor({ state: 'detached' })
  assert(await page.evaluate(() => getComputedStyle(document.body).overflow !== 'hidden'), 'scrolling restored after close')
  assertEqual(JSON.stringify(await adminLayout(page)), JSON.stringify(layoutBefore), 'layout unchanged after close')
  console.log('Modal: centred 480px over a fixed backdrop above the iframe, layout untouched, scroll locked, Cancel/Esc/backdrop close.')
}

async function adminLayout(page) {
  return page.evaluate(() => ['.cms-ref__sidebar', '.cms-ref__canvas', 'iframe.cms-ref__preview-iframe', '.cms-ref__panel'].map(selector => {
    const box = document.querySelector(selector).getBoundingClientRect()
    return [selector, Math.round(box.left), Math.round(box.top), Math.round(box.width), Math.round(box.height)]
  }))
}

async function shot(page, name) {
  if (process.env.CMS_EDITOR_SCREENSHOTS) await page.screenshot({ path: path.join(process.env.CMS_EDITOR_SCREENSHOTS, `${name}.png`) })
}

// Clicks the page's main heading in the preview iframe with a real mouse click; returns its field.
async function clickHeading(page, frame) {
  const target = await frame.evaluate(() => {
    const heading = document.querySelector('.cms-live-preview main h1')
    const element = heading?.closest('[data-cms-field]') || heading?.querySelector('[data-cms-field]')
    if (!element) return null
    element.scrollIntoView({ block: 'center', behavior: 'instant' })
    const box = element.getBoundingClientRect()
    return { field: element.getAttribute('data-cms-field'), x: box.left + Math.min(12, box.width / 2), y: box.top + Math.min(10, box.height / 2) }
  })
  assert(target, 'page heading is editable (has data-cms-field)')
  const iframe = await page.locator(PREVIEW_IFRAME).evaluate(node => {
    const box = node.getBoundingClientRect()
    return { left: box.left, top: box.top, scale: box.width / node.offsetWidth }
  })
  await page.mouse.click(iframe.left + target.x * iframe.scale, iframe.top + target.y * iframe.scale)
  await frame.waitForFunction(field => document.querySelector('[data-cms-selected="true"]')?.getAttribute('data-cms-field') === field, target.field)
  return target.field
}

async function expectNotFound(route, message) {
  const publicPage = await browser.newPage()
  await publicPage.goto(`${site}${route}`)
  await publicPage.getByText(NOT_FOUND).waitFor({ timeout: 15000 }).catch(() => {
    throw new Error(`Assertion failed: ${message} (${route} should show the not-found page)`)
  })
  await publicPage.close()
}

async function get(requestPath) {
  const response = await fetch(`${api}${requestPath}`)
  const body = await response.json()
  if (!response.ok) throw new Error(`GET ${requestPath} failed: ${body.error || response.status}`)
  return body
}

async function send(method, requestPath, body) {
  const response = await fetch(`${api}${requestPath}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return { status: response.status, body: await response.json().catch(() => ({})) }
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
