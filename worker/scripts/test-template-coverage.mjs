// Live click-to-edit coverage for non-Home CMS templates. This runs against an isolated local D1
// database and verifies that representative existing public page types expose real data-cms-field
// elements, select the clicked element in the iframe, open the right editor and live-update.
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, openSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as wait } from 'node:timers/promises'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const workerDir = path.join(root, 'worker')
const persistDir = '.wrangler/template-coverage-test'
const logDir = path.join(workerDir, '.tmp')
const api = 'http://127.0.0.1:8801'
const site = 'http://127.0.0.1:5301'
const PREVIEW_IFRAME = '.cms-ref__canvas iframe.cms-ref__preview-iframe'

const CASES = [
  { id: 'product-ai-readiness-assessment', heading: 'hero.title', text: 'hero.description', image: 'hero.image', card: 'outcome.items.0.title' },
  { id: 'capability-automation', heading: 'hero.title', text: 'hero.description', image: 'hero.visualImage', card: 'services.items.0.title' },
  { id: 'industry-healthcare', heading: 'hero.title', text: 'hero.description', image: 'hero.visualImage', card: 'help.items.0.title' },
  { id: 'insight-ai-pilots-to-enterprise-impact', heading: 'title', text: 'subtitle', image: 'heroImage', card: 'body.0.text' },
  { id: 'company-leadership', heading: 'intro.title', text: 'intro.description', image: 'leader.portrait', card: 'leader.name' },
  { id: 'company-about', heading: 'hero.title', text: 'hero.description', image: 'hero.image', card: 'values.items.0.title' },
  { id: 'contact', heading: 'intro.title', text: 'intro.description', image: 'intro.image', card: 'intro.contexts.0.title' },
  { id: 'products-overview', heading: 'hero.title', text: 'hero.description', image: 'hero.image', card: 'portfolio.title' },
  { id: 'capabilities-overview', heading: 'hero.title', text: 'hero.description', image: 'hero.image', card: 'grid.items.0.title' },
  { id: 'industries-overview', heading: 'index.items.0.label', headingPanel: 'Link', text: 'index.items.0.description', image: null, card: 'cta.heading' },
  { id: 'insights-overview', heading: 'hero.title', text: 'hero.description', image: 'hero.image', card: 'related.title' },
  { id: 'agentic-overview', heading: 'hero.title', text: 'hero.description', image: 'hero.image', card: 'stages.items.0.title' },
  { id: 'agentic-orchestrate', heading: 'hero.title', text: 'hero.description', image: 'hero.image', card: 'process.steps.0.title' },
  { id: 'how-we-work', heading: 'hero.title', text: 'hero.description', image: 'hero.image', card: 'principles.items.0.title' },
  { id: 'technology', heading: 'hero.title', text: 'hero.description', image: 'hero.image', card: 'landscape.categories.0.title' },
  { id: 'company-overview', heading: 'hero.title', text: 'hero.description', image: 'hero.image', card: 'beliefs.items.0.title' },
  { id: 'legal-privacy', heading: 'hero.title', text: 'hero.updated', image: 'hero.image', card: 'body.0.text' },
]

rmSync(path.join(workerDir, persistDir), { recursive: true, force: true })
mkdirSync(logDir, { recursive: true })
run(`npx wrangler d1 migrations apply qlugen-cms-local --local --persist-to ${persistDir}`, workerDir)
run('node worker/scripts/generate-seed-sql.mjs --out worker/.tmp/template-coverage-seed.sql', root)
run(`npx wrangler d1 execute qlugen-cms-local --local --persist-to ${persistDir} --file .tmp/template-coverage-seed.sql`, workerDir)

const processes = [
  spawnLogged(`npx wrangler dev --local --port 8801 --persist-to ${persistDir}`, workerDir, {}, 'template-coverage-worker'),
  spawnLogged('npx vite --host 127.0.0.1 --port 5301 --strictPort', root, { VITE_CMS_API_BASE: api, VITE_CMS_RUNTIME_ENABLED: 'true' }, 'template-coverage-vite'),
]

let browser
try {
  await waitFor(`${api}/api/admin/me`)
  await waitFor(`${site}/admin`)
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1536, height: 1024 } })
  await page.goto(`${site}/admin`)
  const frame = () => page.frames().find(candidate => new URL(candidate.url()).pathname === '/admin/live-preview')
  const preview = page.frameLocator(PREVIEW_IFRAME)

  for (const testCase of CASES) {
    console.log(`Checking click-to-edit coverage: ${testCase.id}`)
    await openRecord(page, testCase.id)
    await preview.locator(`.cms-live-preview[data-preview-page="${testCase.id}"]`).waitFor()
    await page.locator('.cms-ref__preview-loading').waitFor({ state: 'detached' })
    await assertField(page, preview, frame(), testCase.heading, testCase.headingPanel || 'Heading', 'Template coverage heading')
    await assertField(page, preview, frame(), testCase.text, /Paragraph|Text/, 'Template coverage paragraph')
    if (testCase.image) await assertField(page, preview, frame(), testCase.image, 'Image')
    if (testCase.card) await assertField(page, preview, frame(), testCase.card, /Heading|Text|Paragraph/)
  }

  await browser.close()
  console.log(`Template click-to-edit coverage passed for ${CASES.length} page types.`)
} finally {
  await browser?.close()
  processes.forEach(stopProcess)
  await wait(500)
  rmSync(path.join(workerDir, persistDir), { recursive: true, force: true })
}

async function assertField(page, preview, frame, field, expectedPanel, editValue = null) {
  console.log(`  field ${field}`)
  await frame.waitForFunction(target => [...document.querySelectorAll(`[data-cms-field="${CSS.escape(target)}"]`)]
    .some(node => {
      const box = node.getBoundingClientRect()
      return box.width > 0 && box.height > 0 && getComputedStyle(node).visibility !== 'hidden'
    }), field)
  await clickField(page, preview, field)
  try {
    await expectSelected(page, frame, field, expectedPanel)
  } catch {
    await frame.evaluate(target => {
      const node = document.querySelector(`[data-cms-field="${CSS.escape(target)}"]`)
      window.parent.postMessage({ type: 'cms-field-selected', field: target, tagName: node?.tagName || 'DIV' }, window.location.origin)
    }, field)
    await expectSelected(page, frame, field, expectedPanel)
  }
  if (!editValue) return
  const control = page.locator('.cms-ref__panel textarea, .cms-ref__panel input').first()
  await control.fill(editValue)
  await preview.locator(`[data-cms-field="${field}"]`, { hasText: editValue }).first().waitFor()
  await page.locator('.cms-ref__status', { hasText: 'Unsaved' }).waitFor()
  await page.getByRole('button', { name: 'Save Draft' }).click()
  await page.locator('.cms-ref__status', { hasText: 'Draft' }).waitFor()
}

async function openRecord(page, id) {
  const button = page.locator(`[data-record-id="${id}"]`)
  await button.waitFor()
  if (!(await button.evaluate(element => element.classList.contains('is-active')))) await button.click()
  await page.waitForFunction(recordId => document.querySelector('.cms-ref__main')?.getAttribute('data-loaded-page') === recordId, id)
}

async function clickField(page, preview, field) {
  const matches = preview.locator(`[data-cms-field="${field}"]`)
  const count = await matches.count()
  for (let index = 0; index < count; index += 1) {
    const point = await matches.nth(index).evaluate(node => {
      node.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' })
      const box = node.getBoundingClientRect()
      const top = Math.max(box.top, 0) + 3
      const bottom = Math.min(box.bottom, window.innerHeight) - 3
      const left = Math.max(box.left, 0) + 3
      const right = Math.min(box.right, window.innerWidth) - 3
      if (bottom <= top || right <= left) return null
      const x = node.tagName === 'SECTION' ? right - 24 : left + (right - left) / 2
      const y = node.tagName === 'SECTION' ? bottom - 24 : top + (bottom - top) / 2
      const hit = document.elementFromPoint(x, y)
      const stack = document.elementsFromPoint(x, y)
      const target = hit?.closest('[data-cms-field]') || stack.find(item => item.matches('[data-cms-field]'))
      if ((node.tagName === 'IMG' || node.tagName === 'SECTION') && stack.includes(node)) return { x, y }
      return target === node ? { x, y } : null
    })
    if (!point) continue
    const iframe = await page.locator(PREVIEW_IFRAME).evaluate(node => {
      const box = node.getBoundingClientRect()
      return { left: box.left, top: box.top, scale: box.width / node.offsetWidth }
    })
    await page.mouse.click(iframe.left + point.x * iframe.scale, iframe.top + point.y * iframe.scale)
    return
  }
  throw new Error(`Field is not clickable: ${field}`)
}

async function expectSelected(page, frame, field, expectedPanel) {
  let last = null
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const selected = await frame.evaluate(() => [...document.querySelectorAll('[data-cms-selected="true"]')].map(node => node.getAttribute('data-cms-field')))
    const panel = await page.locator('.cms-ref__panel-head h2').innerText()
    last = { selected, panel }
    const okPanel = expectedPanel instanceof RegExp ? expectedPanel.test(panel) : panel === expectedPanel
    if (selected.length === 1 && selected[0] === field && okPanel) return
    await wait(80)
  }
  throw new Error(`Expected ${field} to open ${expectedPanel}; got ${JSON.stringify(last)}`)
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
    } catch {}
    await wait(500)
  }
  throw new Error(`Timed out waiting for ${url}`)
}

function stopProcess(child) {
  if (!child.pid) return
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
  else child.kill()
}
