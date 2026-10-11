import { spawn, spawnSync } from 'node:child_process'
import { setTimeout as wait } from 'node:timers/promises'
import { chromium } from 'playwright'
import sharp from 'sharp'
import { cleanupTestPages } from './cleanup-test-media.mjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PREVIEW_IFRAME = '.cms-ref__canvas iframe.cms-ref__preview-iframe'

const cmsPort = 8797
const vitePort = 5197
const cmsBase = `http://127.0.0.1:${cmsPort}`
const uploadedMediaIds = []

const worker = spawnCommand(`npx wrangler dev --local --port ${cmsPort}`, 'worker')
const vite = spawnCommand(`npx vite --host 127.0.0.1 --port ${vitePort}`, '.', {
  VITE_CMS_API_BASE: `http://127.0.0.1:${cmsPort}`,
  VITE_CMS_RUNTIME_ENABLED: 'true',
})

try {
  await waitFor(`${cmsBase}/api/admin/pages`)
  await waitFor(`http://127.0.0.1:${vitePort}/admin`)
  await fetch(`${cmsBase}/api/admin/pages/home/draft`, { method: 'DELETE' })

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1536, height: 1024 } })
  page.on('pageerror', error => { throw error })

  await page.goto(`http://127.0.0.1:${vitePort}/admin`)
  await page.locator('.cms-ref__main[data-loaded-page="home"]').waitFor()
  await page.frameLocator(PREVIEW_IFRAME).getByText('Powering').first().waitFor()

  await testHomeEditSavePublish(page)
  await testImageReplace(page)
  await testVersions(page)
  await testResponsivePreview(page)
  await testAddPage(page)
  await testMediaLibraryOpens(page)
  for (const id of ['product-ai-readiness-assessment', 'capability-automation', 'industry-healthcare', 'company-leadership', 'insight-ai-pilots-to-enterprise-impact']) {
    await testOtherPagePreview(page, id)
  }

  await browser.close()
  console.log('Admin visual CMS smoke test passed.')
} finally {
  // The Home draft created by this run (any earlier draft was discarded at the start) is discarded
  // so the uploaded test image is no longer referenced and can be deleted.
  await fetch(`${cmsBase}/api/admin/pages/home/draft`, { method: 'DELETE' }).catch(() => {})
  await cleanupMedia()
  // Pages created by testAddPage ("Visual Test <timestamp>") are removed so repeated runs leave nothing behind.
  await cleanupTestPages(cmsBase, path.resolve(fileURLToPath(import.meta.url), '../..'), { log: () => {} }).catch(error => console.warn(`Test page cleanup skipped: ${error.message}`))
  stopProcess(vite)
  stopProcess(worker)
}

async function testHomeEditSavePublish(page) {
  console.log('Checking Home heading edit -> Save Draft -> Publish')
  await openRecord(page, 'home')
  await selectField(page, 'hero.titleLines')
  const textarea = page.locator('.cms-ref__property textarea').first()
  const original = await textarea.inputValue()
  await textarea.fill('Powering the visual CMS\ngeneration of\nenterprise.')
  await page.locator('.cms-ref__status', { hasText: /^Unsaved$/ }).waitFor()
  await page.frameLocator(PREVIEW_IFRAME).getByText('Powering the visual CMS').first().waitFor()
  await page.getByRole('button', { name: 'Save Draft' }).click()
  await page.locator('.cms-ref__status', { hasText: /^Draft$/ }).waitFor()
  const draft = await api('/api/admin/pages/home/draft')
  assertEqual(JSON.stringify(draft.draft.content.hero.titleLines), JSON.stringify(['Powering the visual CMS', 'generation of', 'enterprise.']), 'draft stores edited heading')
  await publishThroughDialog(page)
  await page.locator('.cms-ref__status', { hasText: /^Published$/ }).waitFor()
  const published = await api('/api/admin/pages/home')
  assertEqual(JSON.stringify(published.page.content.hero.titleLines), JSON.stringify(['Powering the visual CMS', 'generation of', 'enterprise.']), 'publish updates Home content')

  await selectField(page, 'hero.titleLines')
  await page.locator('.cms-ref__property textarea').first().fill(original)
  await page.getByRole('button', { name: 'Save Draft' }).click()
  await page.locator('.cms-ref__status', { hasText: /^Draft$/ }).waitFor()
  await publishThroughDialog(page)
}

async function testImageReplace(page) {
  console.log('Checking Home image replacement')
  await openRecord(page, 'home')
  await selectField(page, 'hero.image')
  const chooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Replace Image' }).click()
  const chooser = await chooserPromise
  const buffer = await sharp({ create: { width: 90, height: 60, channels: 3, background: '#0f62fe' } }).png().toBuffer()
  await chooser.setFiles({ name: 'cms-test-visual-admin-home.png', mimeType: 'image/png', buffer })
  await page.locator('.cms-ref__status', { hasText: /^Unsaved$/ }).waitFor()
  await page.waitForFunction(() => document.querySelector('.cms-ref__property--image img')?.src.includes('/media/cms/'))
  const src = await page.locator('.cms-ref__property--image img').getAttribute('src')
  uploadedMediaIds.push(await mediaIdForPath(new URL(src).pathname))
  await page.getByRole('button', { name: 'Save Draft' }).click()
  await page.locator('.cms-ref__status', { hasText: /^Draft$/ }).waitFor()
}

async function testVersions(page) {
  console.log('Checking version history opens')
  await openRecord(page, 'home')
  await page.getByRole('button', { name: /Versions/ }).click()
  await page.locator('.cms-versions__panel').waitFor()
  await page.locator('.cms-versions__item').first().waitFor()
  const text = await page.locator('.cms-versions__panel').innerText()
  assert(!/ver_|seed-|\{"/.test(text), 'versions hide ids and raw JSON')
  await page.locator('.cms-versions__panel').getByRole('button', { name: 'Close' }).click()
}

async function testResponsivePreview(page) {
  console.log('Checking desktop-only preview (no device switcher)')
  await openRecord(page, 'home')
  assertEqual(await page.locator('.cms-ref__device').count(), 0, 'no device switcher')
  assertEqual(await page.locator(PREVIEW_IFRAME).evaluate(node => node.offsetWidth), 1440, 'preview renders the desktop width')
}

async function testAddPage(page) {
  console.log('Checking Add Page flow')
  const name = `Visual Test ${Date.now()}`
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  await page.getByRole('button', { name: 'Add Page', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Create New Page' })
  await dialog.getByLabel('Page Name').fill(name)
  await dialog.getByLabel('URL').fill(slug)
  await dialog.getByRole('button', { name: 'Create Page' }).click()
  await page.getByRole('button', { name }).waitFor()
  const pages = await api('/api/admin/pages')
  assert(pages.pages.some(item => item.title === name && item.route === `/${slug}`), 'created page appears in CMS pages')
}

async function testMediaLibraryOpens(page) {
  console.log('Checking media library opens')
  await page.getByRole('button', { name: 'Media Library' }).click()
  await page.locator('.cms-media').waitFor()
  await page.locator('.cms-media').getByRole('button', { name: 'Close' }).click()
}

async function testOtherPagePreview(page, id) {
  console.log(`Checking real preview for ${id}`)
  await openRecord(page, id)
  const preview = page.frameLocator(PREVIEW_IFRAME)
  await preview.locator(`.cms-live-preview[data-preview-page="${id}"] .cms-admin__preview-frame`).waitFor()
  await page.locator('.cms-ref__preview-loading').waitFor({ state: 'detached' })
  const text = await preview.locator('.cms-admin__preview-frame').innerText()
  assert(!/No public route preview|Loading page/i.test(text), `${id} renders real preview`)
}

async function openRecord(page, id) {
  const button = page.locator(`[data-record-id="${id}"]`)
  await button.waitFor()
  if (await button.evaluate(element => element.classList.contains('is-active'))) return
  await button.click()
  await page.waitForFunction(recordId => document.querySelector('.cms-ref__main')?.getAttribute('data-loaded-page') === recordId, id)
}

async function publishThroughDialog(page) {
  await page.getByRole('button', { name: /Publish/ }).first().click()
  const dialog = page.getByRole('alertdialog')
  await dialog.getByText('Publish this page?').waitFor()
  await dialog.getByRole('button', { name: 'Publish', exact: true }).click()
  await dialog.waitFor({ state: 'detached' })
}

async function api(path, options) {
  const response = await fetch(`${cmsBase}${path}`, options)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || `Request failed ${response.status}`)
  return data
}

async function mediaIdForPath(mediaPath) {
  const { media } = await api('/api/admin/media')
  const match = media.find(item => item.publicUrl === mediaPath)
  assert(match, `uploaded media recorded for ${mediaPath}`)
  return match.id
}

async function cleanupMedia() {
  for (const id of uploadedMediaIds) {
    await fetch(`${cmsBase}/api/admin/media/${id}`, { method: 'DELETE' }).catch(() => {})
  }
}

function assert(value, message) {
  if (!value) throw new Error(`Assertion failed: ${message}`)
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`Assertion failed: ${message}. Expected ${expected}, got ${actual}`)
}

function spawnCommand(command, cwd, env = {}) {
  return spawn(process.platform === 'win32' ? 'cmd.exe' : 'sh', process.platform === 'win32' ? ['/d', '/s', '/c', command] : ['-c', command], {
    cwd,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

async function waitFor(url) {
  for (let index = 0; index < 60; index += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {}
    await wait(500)
  }
  throw new Error(`Timed out waiting for ${url}`)
}

function stopProcess(child) {
  if (!child.pid) return
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    return
  }
  child.kill()
}

// Click-to-edit: clicks the REAL element inside the preview iframe (a visible point inside it) with a
// real mouse click and waits until exactly that element is selected. Full-bleed images are clicked
// through their banner area.
async function selectField(page, field) {
  const frame = page.frameLocator(PREVIEW_IFRAME)
  const element = frame.locator(`[data-cms-field="${field}"]`).first()
  await element.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await page.waitForTimeout(80)
  const point = await element.evaluate(node => {
    const box = node.getBoundingClientRect()
    const top = Math.max(box.top, 0) + 2
    const bottom = Math.min(box.bottom, window.innerHeight) - 2
    const left = Math.max(box.left, 0) + 2
    const right = Math.min(box.right, window.innerWidth) - 2
    if (node.tagName === 'IMG') return { x: right - 40, y: top + (bottom - top) * 0.45 }
    return { x: left + Math.min(12, (right - left) / 2), y: top + Math.min(10, (bottom - top) / 2) }
  })
  const iframe = await page.locator(PREVIEW_IFRAME).evaluate(node => {
    const box = node.getBoundingClientRect()
    return { left: box.left, top: box.top, scale: box.width / node.offsetWidth }
  })
  await page.mouse.click(iframe.left + point.x * iframe.scale, iframe.top + point.y * iframe.scale)
  await frame.locator(`[data-cms-selected="true"][data-cms-field="${field}"]`).waitFor()
  assertEqual(await frame.locator('[data-cms-selected="true"]').count(), 1, `only ${field} is selected`)
}
