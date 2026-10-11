// Home live-editor COVERAGE test. Runs against an isolated, throwaway local database.
//
//   npm run cms:test:coverage
//
// Independently of how Home.jsx is tagged, it inventories what the rendered Home page shows from
// its CMS content (text, images, link destinations) and checks that:
//   1. every visible content value is reachable from a data-cms-field element's editor
//   2. every data-cms-field path resolves to real content and maps to an editor (no raw JSON)
//   3. no visible text in the page body sits outside an editable element (except decorative glyphs)
//   4. clicking each element selects exactly it and opens the matching panel; a few edits round-trip
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, openSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as wait } from 'node:timers/promises'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const workerDir = path.join(root, 'worker')
const persistDir = '.wrangler/coverage-test'
const logDir = path.join(workerDir, '.tmp')
const api = 'http://127.0.0.1:8799'
const site = 'http://127.0.0.1:5299'
const PREVIEW_IFRAME = '.cms-ref__canvas iframe.cms-ref__preview-iframe'
// Purely decorative glyphs rendered by the component (not content).
const DECORATIVE_TEXT = new Set(['→', '✦'])
// Content keys that are never shown as visible text (accessibility labels, icon names).
const NON_VISIBLE_KEY = /(ariaLabel|AriaLabel|^icon$)$/

rmSync(path.join(workerDir, persistDir), { recursive: true, force: true })
mkdirSync(logDir, { recursive: true })
run(`npx wrangler d1 migrations apply qlugen-cms-local --local --persist-to ${persistDir}`, workerDir)
run('node worker/scripts/generate-seed-sql.mjs --out worker/.tmp/coverage-seed.sql', root)
run(`npx wrangler d1 execute qlugen-cms-local --local --persist-to ${persistDir} --file .tmp/coverage-seed.sql`, workerDir)

const processes = [
  spawnLogged(`npx wrangler dev --local --port 8799 --persist-to ${persistDir}`, workerDir, {}, 'coverage-worker'),
  spawnLogged('npx vite --host 127.0.0.1 --port 5299 --strictPort', root, { VITE_CMS_API_BASE: api }, 'coverage-vite'),
]

let browser
try {
  await waitFor(`${api}/api/admin/me`)
  await waitFor(`${site}/`)
  const content = (await (await fetch(`${api}/api/admin/pages/home/draft`)).json()).draft?.content
    || (await (await fetch(`${api}/api/public/pages?ids=home`)).json()).pages.home

  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1536, height: 1024 } })
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.goto(`${site}/admin`)
  await page.locator('[data-loaded-page="home"]').waitFor()
  const preview = page.frameLocator(PREVIEW_IFRAME)
  await preview.locator('.cms-live-preview[data-preview-page="home"] [data-cms-field="hero.titleLines"]').waitFor()
  const frame = page.frames().find(candidate => new URL(candidate.url()).pathname === '/admin/live-preview')
  await page.locator('.cms-ref__preview-loading').waitFor({ state: 'detached' })
  await frame.waitForFunction(() => document.fonts.status === 'loaded' && [...document.images].every(img => img.loading === 'lazy' || img.complete))

  // ── Inventory ──────────────────────────────────────────────────────────────
  // In the preview document: every tagged element, its editor descriptor (computed by the real
  // admin module), and what the page body visibly renders.
  const scan = await frame.evaluate(async content => {
    const { describeField } = await import('/src/admin/liveSelection.js')
    const main = document.querySelector('.cms-live-preview main')
    const tagged = [...main.querySelectorAll('[data-cms-field]')].map(element => {
      const field = element.getAttribute('data-cms-field')
      const textField = element.getAttribute('data-cms-text-field')
      return { field, textField, tagName: element.tagName, descriptor: describeField(field, content, element.tagName, { textField }) }
    })
    const rendered = {
      text: main.textContent.replace(/\s+/g, ' '),
      placeholders: [...main.querySelectorAll('input[placeholder]')].map(input => input.placeholder),
      images: [...main.querySelectorAll('img')].map(img => img.getAttribute('src')),
      links: [...main.querySelectorAll('a[href]')].map(link => link.getAttribute('href')),
    }
    // Visible text outside any editable element (aria-hidden decoration excluded).
    const untagged = []
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const node = walker.currentNode
      const text = node.textContent.trim()
      if (!text || node.parentElement.closest('[data-cms-field], [aria-hidden="true"], script, style')) continue
      untagged.push(text)
    }
    return { tagged, rendered, untagged }
  }, content)

  // 2. Every tag resolves to content and maps to an editor.
  const unresolved = scan.tagged.filter(item => !item.descriptor)
  assert(unresolved.length === 0, `every data-cms-field resolves to an editor: ${JSON.stringify(unresolved.map(item => item.field))}`)
  for (const { field, descriptor } of scan.tagged) {
    for (const contentPath of coveredPaths(descriptor)) {
      assert(getAt(content, contentPath) !== undefined, `${field}: ${contentPath.join('.')} exists in the Home content`)
    }
  }

  // 1. Every visible CMS value is editable.
  const covered = scan.tagged.flatMap(item => coveredPaths(item.descriptor).map(contentPath => contentPath.join('.')))
  const isCovered = leaf => covered.some(prefix => leaf === prefix || leaf.startsWith(`${prefix}.`))
  const visible = visibleLeaves(content, scan.rendered)
  const missing = visible.filter(leaf => !isCovered(leaf))
  assert(missing.length === 0, `visible Home content without an editor: ${JSON.stringify(missing)}`)

  // 3. No visible page text outside editable elements, except decorative glyphs.
  const stray = scan.untagged.filter(text => !DECORATIVE_TEXT.has(text))
  assert(stray.length === 0, `visible text outside editable elements: ${JSON.stringify(stray)}`)

  const fields = [...new Set(scan.tagged.map(item => item.field))]
  console.log(`Inventory: ${visible.length} visible content values, ${scan.tagged.length} editable elements (${fields.length} distinct fields), all covered.`)
  console.log(`Decorative text left untagged: ${JSON.stringify([...new Set(scan.untagged)])}`)

  // ── Selection ─────────────────────────────────────────────────────────────
  // 4. Click every element that can be clicked where it is; elements that are not hit-testable
  //    where they are (inactive card details, off-screen carousel slides, images under overlays)
  //    are selected through the iframe's own selection message and must still open their editor.
  let clicked = 0
  let viaMessage = 0
  const count = await preview.locator('main [data-cms-field]').count()
  for (let index = 0; index < count; index += 1) {
    const element = preview.locator('main [data-cms-field]').nth(index)
    const { textField } = scan.tagged[index]
    const expected = scan.tagged[index].descriptor.label
    // Scroll to the element and move the pointer onto it first, so hover states (capability cards
    // reveal their details on hover) settle exactly as for a user; then click only if the element
    // is still what is under the pointer.
    let point = await element.evaluate(hitPoint, true)
    if (point) {
      await movePointerInPreview(page, point)
      await wait(350)
      point = await element.evaluate(hitPoint, false)
    }
    // The live field (the industries image's path follows the hovered industry).
    const field = await element.getAttribute('data-cms-field')
    if (point) {
      await clickInPreview(page, point)
      clicked += 1
    } else {
      await frame.evaluate(({ field, textField }) => {
        const node = [...document.querySelectorAll('[data-cms-field]')].find(item => item.getAttribute('data-cms-field') === field)
        window.parent.postMessage({ type: 'cms-field-selected', field, tagName: node.tagName, textField: textField || undefined }, window.location.origin)
      }, { field, textField })
      viaMessage += 1
    }
    await expectPanel(page, frame, field, expected)
  }
  console.log(`Selection: ${clicked} elements selected by real clicks, ${viaMessage} hidden/covered elements via the selection message; every one opened its editor.`)

  // Click priority: the most specific field wins over its card.
  await selectByClick(page, preview, 'capabilities.items.0.title')
  await expectPanel(page, frame, 'capabilities.items.0.title', 'Heading')
  await selectByClick(page, preview, 'blogs.items.1.title')
  await expectPanel(page, frame, 'blogs.items.1.title', 'Heading')
  await selectByClick(page, preview, 'blogs.items.1.tag')
  await expectPanel(page, frame, 'blogs.items.1.tag', 'Text')
  await selectByClick(page, preview, 'industries.items.2.label')
  await expectPanel(page, frame, 'industries.items.2.label', 'Text')

  // Hover feedback marks only the most specific editable element, never its card or a container.
  const blogTitle = await preview.locator('main [data-cms-field="blogs.items.2.title"]').evaluate(node => {
    node.scrollIntoView({ block: 'center', behavior: 'instant' })
    const box = node.getBoundingClientRect()
    return { x: box.left + 10, y: box.top + box.height / 2 }
  })
  await movePointerInPreview(page, blogTitle)
  await frame.waitForFunction(() => document.querySelector('[data-cms-hover="true"]')?.getAttribute('data-cms-field') === 'blogs.items.2.title')
  assert(await frame.evaluate(() => document.querySelectorAll('[data-cms-hover]').length) === 1, 'exactly one element shows hover feedback')
  assert(await frame.evaluate(() => getComputedStyle(document.querySelector('[data-cms-hover="true"]')).outlineStyle) === 'dashed', 'hover outline is shown')
  await shot(page, 'home-hover-blog-title')
  const blank = await preview.locator('.partners-section').evaluate(node => {
    node.scrollIntoView({ block: 'start', behavior: 'instant' })
    const box = node.getBoundingClientRect()
    return { x: box.left + 8, y: Math.max(box.top, 80) + 8 }
  })
  await movePointerInPreview(page, blank)
  await frame.waitForFunction(() => !document.querySelector('[data-cms-hover]'))

  // Card editors show title / description / image / link, never raw JSON.
  await selectByMessage(frame, 'approach.cards.1')
  await expectPanel(page, frame, 'approach.cards.1', 'Card')
  for (const label of ['Title', 'Description', 'Alt Text']) await page.locator('.cms-ref__panel label', { hasText: label }).first().waitFor()
  await page.locator('.cms-ref__panel').getByRole('button', { name: 'Replace Image' }).waitFor()
  await selectByMessage(frame, 'blogs.items.0')
  await expectPanel(page, frame, 'blogs.items.0', 'Card')
  for (const label of ['Title', 'Link', 'Alt Text']) await page.locator('.cms-ref__panel label', { hasText: label }).first().waitFor()

  // Edits round-trip into the iframe for newly covered sections.
  await editAndExpect(page, preview, frame, 'agenticAi.slides.0.heading', 'Heading', 'textarea', 'Edited agent heading')
  await editAndExpect(page, preview, frame, 'partners.items.2.name', 'Text', 'input', 'Edited partner')
  await editAndExpect(page, preview, frame, 'leadership.statValue', 'Text', 'input', '24+ Years')
  await selectByClick(page, preview, 'capabilities.items.3.url')
  await expectPanel(page, frame, 'capabilities.items.3.url', 'Link')
  await page.locator('.cms-ref__panel label', { hasText: 'Link URL' }).locator('input').fill('/capabilities/cybersecurity-edited')
  await frame.waitForFunction(() => document.querySelector('[data-cms-field="capabilities.items.3.url"]')?.getAttribute('href') === '/capabilities/cybersecurity-edited')
  await selectByMessage(frame, 'approach.cards.0')
  await expectPanel(page, frame, 'approach.cards.0', 'Card')
  await page.locator('.cms-ref__panel label', { hasText: 'Title' }).locator('input').fill('Edited approach card')
  await preview.locator('[data-cms-field="approach.cards.0.title"]', { hasText: 'Edited approach card' }).waitFor()
  await page.locator('.cms-ref__status', { hasText: 'Unsaved' }).waitFor()
  assert(new URL(page.url()).pathname === '/admin' && new URL(frame.url()).pathname === '/admin/live-preview', 'nothing navigated')
  assert(pageErrors.length === 0, `no page errors (${pageErrors.join(' | ')})`)

  console.log('Home editor coverage test passed.')
} finally {
  await browser?.close()
  processes.forEach(stopProcess)
  await wait(500)
  rmSync(path.join(workerDir, persistDir), { recursive: true, force: true })
}

// Content paths an editor descriptor lets the user change.
function coveredPaths(descriptor) {
  if (!descriptor) return []
  const paths = []
  const add = value => value && paths.push(value)
  add(descriptor.path)
  add(descriptor.textPath)
  add(descriptor.urlPath)
  add(descriptor.altPath)
  add(descriptor.titlePath)
  add(descriptor.descriptionPath)
  add(descriptor.image?.path)
  add(descriptor.image?.altPath)
  if (descriptor.sentence) {
    const parent = descriptor.sentence.slice(0, -1)
    const key = descriptor.sentence.at(-1)
    for (const part of ['BeforeLink', 'LinkLabel', 'AfterLink']) paths.push([...parent, `${key}${part}`])
  }
  return paths.filter(Boolean)
}

// Content leaves the page visibly renders: text shown, image sources, link destinations.
function visibleLeaves(content, rendered) {
  const text = rendered.text
  const leaves = []
  const walk = (value, at) => {
    if (Array.isArray(value)) return value.forEach((item, index) => walk(item, [...at, index]))
    if (value && typeof value === 'object') return Object.entries(value).forEach(([key, item]) => walk(item, [...at, key]))
    if (typeof value !== 'string' || !value.trim() || at[0] === 'seo') return
    const key = String(at.at(-1))
    if (NON_VISIBLE_KEY.test(key)) return
    const shown = text.includes(value.replace(/\s+/g, ' ').trim())
      || rendered.placeholders.includes(value)
      || rendered.images.includes(value)
      || rendered.links.includes(value)
    // Paragraph text split into several <p> (about.description): every paragraph must be shown.
    const paragraphs = value.includes('\n\n') && value.split('\n\n').every(part => text.includes(part.replace(/\s+/g, ' ').trim()))
    if (shown || paragraphs) leaves.push(at.join('.'))
  }
  walk(content, [])
  return leaves
}

// A visible point inside the element where a click reaches the element itself, or null.
function hitPoint(node, scroll) {
  if (scroll) node.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' })
  const box = node.getBoundingClientRect()
  const top = Math.max(box.top, 0) + 2
  const bottom = Math.min(box.bottom, window.innerHeight) - 2
  const left = Math.max(box.left, 0) + 2
  const right = Math.min(box.right, window.innerWidth) - 2
  if (bottom - top < 2 || right - left < 2) return null
  const x = node.tagName === 'IMG' ? right - Math.min(40, (right - left) / 2) : left + Math.min(12, (right - left) / 2)
  const y = node.tagName === 'IMG' ? top + (bottom - top) * 0.45 : top + Math.min(10, (bottom - top) / 2)
  const hit = document.elementFromPoint(x, y)
  const target = hit?.closest('[data-cms-field]') || document.elementsFromPoint(x, y).find(item => item.matches('img[data-cms-field]'))
  return target === node ? { x, y } : null
}

async function shot(page, name) {
  if (process.env.CMS_EDITOR_SCREENSHOTS) await page.screenshot({ path: path.join(process.env.CMS_EDITOR_SCREENSHOTS, `${name}.png`) })
}

function getAt(value, at) {
  return at.reduce((current, key) => (current == null ? undefined : current[key]), value)
}

async function movePointerInPreview(page, point) {
  const iframe = await page.locator(PREVIEW_IFRAME).evaluate(node => {
    const box = node.getBoundingClientRect()
    return { left: box.left, top: box.top, scale: box.width / node.offsetWidth }
  })
  await page.mouse.move(iframe.left + point.x * iframe.scale, iframe.top + point.y * iframe.scale)
}

async function clickInPreview(page, point) {
  const iframe = await page.locator(PREVIEW_IFRAME).evaluate(node => {
    const box = node.getBoundingClientRect()
    return { left: box.left, top: box.top, scale: box.width / node.offsetWidth }
  })
  await page.mouse.click(iframe.left + point.x * iframe.scale, iframe.top + point.y * iframe.scale)
}

// Clicks the rendering of the field the user can actually see (a field such as a card title can be
// rendered twice, once in a hidden state). The pointer hovers first, so hover states (capability
// cards reveal their details on hover) have settled exactly as they would for a user.
async function selectByClick(page, preview, field) {
  const matches = preview.locator(`main [data-cms-field="${field}"]`)
  const first = await matches.first().evaluate(node => {
    node.scrollIntoView({ block: 'center', behavior: 'instant' })
    const box = node.getBoundingClientRect()
    return { x: Math.max(box.left, 0) + Math.min(12, box.width / 2), y: Math.max(box.top, 0) + Math.min(10, box.height / 2) }
  })
  await movePointerInPreview(page, first)
  await wait(800)
  for (let index = 0; index < await matches.count(); index += 1) {
    const point = await matches.nth(index).evaluate(node => {
      node.scrollIntoView({ block: 'center', behavior: 'instant' })
      const box = node.getBoundingClientRect()
      const x = Math.max(box.left, 0) + Math.min(12, box.width / 2)
      const y = Math.max(box.top, 0) + Math.min(10, box.height / 2)
      return document.elementFromPoint(x, y)?.closest('[data-cms-field]') === node ? { x, y } : null
    })
    if (point) return clickInPreview(page, point)
  }
  throw new Error(`Assertion failed: ${field} is not clickable anywhere`)
}

async function selectByMessage(frame, field) {
  await frame.evaluate(field => window.parent.postMessage({ type: 'cms-field-selected', field, tagName: document.querySelector(`[data-cms-field="${field}"]`).tagName }, window.location.origin), field)
}

async function expectPanel(page, frame, field, label) {
  let actual
  for (let attempt = 0; attempt < 40; attempt += 1) {
    actual = {
      selected: await frame.evaluate(() => [...document.querySelectorAll('[data-cms-selected="true"]')].map(node => node.getAttribute('data-cms-field'))),
      panel: await page.locator('.cms-ref__panel-head h2').innerText(),
    }
    if (actual.selected.length === 1 && actual.selected[0] === field && actual.panel === label) {
      const panelText = await page.locator('.cms-ref__panel').innerText()
      assert(!/[{[]\s*"/.test(panelText) && !panelText.includes('dedicated content panel'), `${field} opens a real editor, not raw data`)
      return
    }
    await wait(50)
  }
  throw new Error(`Assertion failed: ${field} should be selected with the ${label} editor, got ${JSON.stringify(actual)}`)
}

async function editAndExpect(page, preview, frame, field, label, control, value) {
  await selectByMessage(frame, field)
  await expectPanel(page, frame, field, label)
  await page.locator(`.cms-ref__panel ${control}`).first().fill(value)
  await preview.locator(`[data-cms-field="${field}"]`, { hasText: value }).first().waitFor()
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
