// Public website in Firebase mode (VITE_CMS_CONTENT_SOURCE=storage): published content is read
// from snapshot files in Firebase Storage. A local stand-in serves the exact Storage download URL
// format (/v0/b/<bucket>/o/<encoded path>?alt=media), so this needs no Java and no Firebase project.
//   npm run cms:fb:test:runtime
import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as wait } from 'node:timers/promises'
import { chromium } from 'playwright'
import sharp from 'sharp'
import { contentRegistry } from '../../src/cms/contentRegistry.js'
import { getTemplate, initialContent } from '../../src/cms/templateRegistry.js'
import { pageSnapshot, pageSnapshotPath, routeSnapshot, routeSnapshotPath } from '../src/snapshots.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const BUCKET = 'test-bucket'
const storagePort = 9299
const storageBase = `http://127.0.0.1:${storagePort}/v0/b/${BUCKET}/o`
const site = 'http://127.0.0.1:5310'
const NOT_FOUND = "This path doesn't lead anywhere."
const SNAPSHOT_HEADING = 'Snapshot heading from Firebase Storage'
const MEDIA_PATH = `cms/2026/10/${'c'.repeat(32)}-storage-hero.png`

// Snapshot files exactly as the cmsAdminApi Publish writes them.
const objects = new Map()
for (const entry of contentRegistry) {
  const content = JSON.parse(await readFile(path.join(root, entry.file), 'utf8'))
  if (entry.id === 'home') content.hero.titleLines = [SNAPSHOT_HEADING]
  const page = { id: entry.id, slug: entry.slug, templateId: entry.contentType, status: 'published', version: { versionNumber: 1, publishedAt: 'now' } }
  objects.set(pageSnapshotPath(entry.id), JSON.stringify(pageSnapshot(page, JSON.stringify(content))))
}
const routeContent = initialContent(getTemplate('standard-page'), { title: 'Storage Route Page', slug: 'storage-route' })
routeContent.hero.image = { id: `media_${'c'.repeat(32)}`, url: `/media/${MEDIA_PATH}`, alt: 'Storage hero' }
const routePage = { id: 'custom-storage-route', slug: 'storage-route', templateId: 'standard-page', status: 'published', version: { versionNumber: 1 } }
objects.set(routeSnapshotPath('storage-route'), JSON.stringify(routeSnapshot(routePage, JSON.stringify(routeContent))))
objects.set(MEDIA_PATH, await sharp({ create: { width: 64, height: 40, channels: 3, background: '#0f62fe' } }).png().toBuffer())

let failing = false
const requested = []
const storage = createServer((request, response) => {
  const url = new URL(request.url, storageBase)
  const prefix = `/v0/b/${BUCKET}/o/`
  const objectPath = url.pathname.startsWith(prefix) ? decodeURIComponent(url.pathname.slice(prefix.length)) : ''
  requested.push(objectPath)
  const headers = { 'Access-Control-Allow-Origin': '*' }
  if (failing) return response.writeHead(500, headers).end('{"error":"unavailable"}')
  if (url.searchParams.get('alt') !== 'media' || !objects.has(objectPath)) return response.writeHead(404, headers).end('{"error":"not found"}')
  const body = objects.get(objectPath)
  response.writeHead(200, { ...headers, 'Content-Type': objectPath.endsWith('.png') ? 'image/png' : 'application/json' }).end(body)
})
await new Promise(resolve => storage.listen(storagePort, '127.0.0.1', resolve))

const vite = spawn('npx vite --host 127.0.0.1 --port 5310 --strictPort', {
  cwd: root,
  shell: true,
  stdio: 'ignore',
  env: { ...process.env, VITE_CMS_RUNTIME_ENABLED: 'true', VITE_CMS_CONTENT_SOURCE: 'storage', VITE_CMS_STORAGE_BASE: storageBase, VITE_CMS_API_BASE: 'http://127.0.0.1:1' },
})

let browser
try {
  await until(async () => (await fetch(`${site}/`).catch(() => null))?.ok, 'Vite')
  browser = await chromium.launch()
  // Warm-up: a fresh Vite dev server optimises dependencies on the first page load and then reloads
  // it; let that settle before measuring anything.
  const warmup = await browser.newPage()
  await warmup.goto(`${site}/`)
  await warmup.locator('h1').first().waitFor({ timeout: 60000 }).catch(async () => {
    await warmup.reload()
    await warmup.locator('h1').first().waitFor({ timeout: 60000 })
  })
  await warmup.close()

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const apiCalls = []
  page.on('request', request => request.url().includes('/api/') && apiCalls.push(request.url()))

  // 1. Home renders the published snapshot; only the needed snapshot files are read.
  requested.length = 0
  await page.goto(`${site}/`)
  await page.locator('h1', { hasText: SNAPSHOT_HEADING }).waitFor()
  const homeStyles = await headingStyles(page)
  assertEqual(JSON.stringify([...new Set(requested)].sort()), JSON.stringify(['cms-public/pages/global-footer.json', 'cms-public/pages/global-navigation.json', 'cms-public/pages/home.json']), 'home reads only home + navigation + footer snapshots')
  assertEqual(apiCalls.length, 0, 'no CMS API calls from the public site')
  console.log('PASS home renders its published snapshot from Storage (3 files, no API calls)')

  // 2. A page created with + Add Page, served from its route snapshot; media from Storage.
  await page.goto(`${site}/storage-route`)
  await page.locator('h1', { hasText: 'Storage Route Page' }).waitFor()
  // The Standard Page hero image is a CSS background (--hero-image), as in the existing design.
  const mediaUrl = `${storageBase}/${encodeURIComponent(MEDIA_PATH)}?alt=media`
  const background = await page.locator('.split-hero').first().evaluate(node => node.style.getPropertyValue('--hero-image'))
  assertEqual(background, `url(${mediaUrl})`, 'CMS media resolves to the Storage download URL')
  const loaded = await page.evaluate(url => new Promise(resolve => {
    const image = new Image()
    image.onload = () => resolve(image.naturalWidth > 0)
    image.onerror = () => resolve(false)
    image.src = url
  }), mediaUrl)
  assert(loaded, 'CMS media loads from Storage')
  console.log('PASS dynamic page from its route snapshot; "/media/..." image loads from Storage')

  // 3. No snapshot (unknown, unpublished or archived page) -> not found.
  await page.goto(`${site}/not-a-published-page`)
  await page.getByText(NOT_FOUND).waitFor()
  objects.delete(routeSnapshotPath('storage-route'))
  await page.goto(`${site}/storage-route`)
  await page.getByText(NOT_FOUND).waitFor()
  console.log('PASS pages without a snapshot (unpublished / archived) show not found')

  // 4. A missing page snapshot falls back to that page's local JSON.
  objects.delete(pageSnapshotPath('company-about'))
  const about = await browser.newPage()
  await about.goto(`${site}/about`)
  await about.locator('h1').first().waitFor()
  assertEqual(await about.getByText(NOT_FOUND).count(), 0, 'page without snapshot renders its local content')
  await about.close()
  console.log('PASS a page without a snapshot renders its local JSON')

  // 5. Storage unavailable -> the whole site falls back to local JSON (same design).
  failing = true
  const offline = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await offline.goto(`${site}/`)
  const localHome = JSON.parse(await readFile(path.join(root, 'src/content/home.json'), 'utf8'))
  await offline.locator('h1', { hasText: localHome.hero.titleLines[0] }).waitFor()
  const fallbackStyles = await headingStyles(offline)
  for (const key of ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color']) {
    assertEqual(fallbackStyles[key], homeStyles[key], `same heading design from Storage and local JSON (${key})`)
  }
  console.log('PASS Storage unavailable -> local JSON fallback, identical design')
  console.log('Firebase Storage runtime tests passed.')
} finally {
  await browser?.close()
  storage.close()
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(vite.pid), '/T', '/F'], { stdio: 'ignore' })
  else vite.kill()
}

async function headingStyles(page) {
  await page.evaluate(() => document.fonts.ready)
  return page.locator('h1').first().evaluate(element => {
    const style = getComputedStyle(element)
    return { fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight, lineHeight: style.lineHeight, color: style.color }
  })
}

async function until(probe, label) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
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
