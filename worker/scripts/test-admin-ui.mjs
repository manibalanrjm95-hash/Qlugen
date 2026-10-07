import { spawn, spawnSync } from 'node:child_process'
import { setTimeout as wait } from 'node:timers/promises'
import { chromium } from 'playwright'
import sharp from 'sharp'
import { adminGroups, supportedRecordIds } from '../../src/admin/contentRegistry.js'

const cmsPort = 8787
const vitePort = 5173
const structuredPreviewIds = new Set(['global-navigation', 'global-footer', 'global-seo'])
const cmsBase = `http://127.0.0.1:${cmsPort}`
const imageCases = [
  { id: 'home', field: 'hero.image', label: 'Home hero' },
  { id: 'product-ai-readiness-assessment', field: 'hero.image', label: 'Product banner' },
  { id: 'capability-automation', field: 'hero.image', label: 'Capability image' },
  { id: 'industry-healthcare', field: 'hero.image', label: 'Industry image' },
  { id: 'company-leadership', field: 'leader.portrait', label: 'Leadership portrait' },
  { id: 'insight-ai-pilots-to-enterprise-impact', field: 'heroImage', label: 'Insight hero image' },
]
const uploadedMediaIds = []
const editorCases = [
  { id: 'home', sections: ['Hero', 'Capabilities', 'Agentic AI', 'Industries', 'Leadership', 'About', 'Careers', 'SEO'], list: 'capabilities' },
  { id: 'product-ai-readiness-assessment' },
  { id: 'capability-automation' },
  { id: 'industry-healthcare' },
  { id: 'company-leadership' },
  { id: 'contact' },
]
const publishCases = [
  'home',
  'product-ai-readiness-assessment',
  'capability-automation',
  'industry-healthcare',
  'company-leadership',
  'insight-ai-pilots-to-enterprise-impact',
]
const technicalLabels = /^(Id|Slug|Route|Template|Schema|Schema Id|Content Type|Internal Key|Page Id)$/

const worker = spawnCommand(`npx wrangler dev --local --port ${cmsPort}`, 'worker')
const vite = spawnCommand(`npx vite --host 127.0.0.1 --port ${vitePort}`, '.', {
  VITE_CMS_API_BASE: `http://127.0.0.1:${cmsPort}`,
})

try {
  await waitFor(`http://127.0.0.1:${cmsPort}/api/admin/pages`)
  await waitFor(`http://127.0.0.1:${vitePort}/admin`)

  const browser = await chromium.launch()
  const page = await browser.newPage()
  page.on('pageerror', error => {
    throw error
  })
  await page.goto(`http://127.0.0.1:${vitePort}/admin`)
  await page.getByRole('button', { name: 'Overview' }).first().click()
  const heading = page.getByLabel('Main Heading')
  assertEqual(await heading.inputValue(), 'Powering the next\ngeneration of\nenterprise.', 'title lines shown as one field')
  await heading.fill('Powering the CMS preview\ngeneration of\nenterprise.')
  await page.getByText('Unsaved changes').waitFor()
  await page.getByRole('button', { name: 'Preview Draft', exact: true }).click()
  await page.locator('.cms-admin__preview-frame').getByText('Powering the CMS preview').waitFor()
  await page.getByRole('button', { name: 'Edit Draft', exact: true }).click()
  assertEqual(await heading.inputValue(), 'Powering the CMS preview\ngeneration of\nenterprise.', 'edit survives preview toggle')
  await page.getByRole('button', { name: 'Save Draft', exact: true }).click()
  await page.locator('.cms-admin__actions span', { hasText: /^Saved$/ }).waitFor()
  await page.locator('.cms-admin__state', { hasText: 'Draft' }).waitFor()
  const savedDraft = await (await fetch(`${cmsBase}/api/admin/pages/home/draft`)).json()
  assertEqual(JSON.stringify(savedDraft.draft.content.hero.titleLines), JSON.stringify(['Powering the CMS preview', 'generation of', 'enterprise.']), 'title lines saved as array')
  await page.reload()
  await page.waitForFunction(() => document.querySelector('#cms-hero-titleLines')?.value.startsWith('Powering the CMS preview'))

  page.on('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Reset Draft', exact: true }).click()
  await page.getByText('Draft reset').waitFor()
  await page.locator('.cms-admin__state', { hasText: 'Published' }).waitFor()

  for (const editorCase of editorCases) {
    await testEditorPage(page, editorCase)
  }

  for (const id of publishCases) {
    await testPublishWorkflow(page, id)
  }

  for (const [index, imageCase] of imageCases.entries()) {
    await testImageReplace(page, imageCase, index)
  }
  await testMediaLibrary(page)

  for (const entry of adminGroups.flatMap(group => group.items)) {
    console.log(`Checking preview: ${entry.id}`)
    await openRecord(page, entry.id)
    await page.getByRole('button', { name: 'Preview Draft', exact: true }).click()
    await page.locator('.cms-admin__preview-frame').waitFor()
    const previewText = await page.locator('.cms-admin__preview-frame').innerText()
    if (!structuredPreviewIds.has(entry.id) && /Preview shell ready|No public route preview/i.test(previewText)) {
      throw new Error(`Missing real page preview for ${entry.id}`)
    }
    await page.getByRole('button', { name: 'Edit Draft', exact: true }).click()
  }

  await browser.close()
  console.log(`Admin UI smoke test passed for ${supportedRecordIds.length} records.`)
} finally {
  await cleanupMedia()
  stopProcess(vite)
  stopProcess(worker)
}

async function testImageReplace(page, { id, field, label }, index) {
  console.log(`Checking image replace: ${label} (${id} ${field})`)
  await openRecord(page, id)
  await openSectionFor(page, field)
  const fieldImage = page.locator(`[data-image-field="${field}"] .cms-admin__image-thumb img`)
  const originalSrc = await fieldImage.getAttribute('src')

  const buffer = await sharp({ create: { width: 80 + index, height: 50, channels: 3, background: '#08bdba' } }).png().toBuffer()
  await page.locator(`[data-image-upload="${field}"]`).setInputFiles({ name: `ui-test-${id}.png`, mimeType: 'image/png', buffer })
  await page.waitForFunction(
    ({ selector, original }) => {
      const src = document.querySelector(selector)?.getAttribute('src') || ''
      return src !== original && src.includes('/media/cms/')
    },
    { selector: `[data-image-field="${field}"] .cms-admin__image-thumb img`, original: originalSrc },
  )
  const uploadedSrc = await fieldImage.getAttribute('src')
  const mediaPath = new URL(uploadedSrc).pathname
  uploadedMediaIds.push(await mediaIdForPath(mediaPath))
  assert(await fieldImage.evaluate(img => img.complete && img.naturalWidth > 0), `${label} uploaded image renders`)
  await page.getByText('Unsaved changes').waitFor()

  await page.getByRole('button', { name: 'Preview Draft', exact: true }).click()
  await page.waitForFunction(
    path => document.querySelector('.cms-admin__preview-frame')?.innerHTML.includes(path),
    mediaPath,
  )
  await page.getByRole('button', { name: 'Edit Draft', exact: true }).click()

  await page.getByRole('button', { name: 'Save Draft', exact: true }).click()
  await page.locator('.cms-admin__actions span', { hasText: /^Saved$/ }).waitFor()

  await page.reload()
  await openRecord(page, id)
  await openSectionFor(page, field)
  await page.waitForFunction(
    ({ selector, expected }) => document.querySelector(selector)?.getAttribute('src') === expected,
    { selector: `[data-image-field="${field}"] .cms-admin__image-thumb img`, expected: uploadedSrc },
  )

  await page.getByRole('button', { name: 'Reset Draft', exact: true }).click()
  await page.getByText('Draft reset').waitFor()
  assertEqual(await fieldImage.getAttribute('src'), originalSrc, `${label} reset restores published image`)
}

async function testEditorPage(page, { id, sections = [], list }) {
  console.log(`Checking editor UX: ${id}`)
  await openRecord(page, id)
  const panels = page.locator('.cms-admin__panel--section')
  assert(await panels.count() > 0, `${id} shows section panels`)
  assert((await panels.first().getAttribute('class')).includes('is-open'), `${id} first panel open`)
  assertEqual(await page.locator('.cms-admin__panel--section.is-open').count(), 1, `${id} other panels collapsed`)
  for (const title of sections) {
    await page.locator('.cms-admin__panel--section > .cms-admin__panel-head .cms-admin__panel-title', { hasText: new RegExp(`^${title}$`) }).waitFor()
  }

  const closed = page.locator('.cms-admin__panel--section > .cms-admin__panel-head .cms-admin__panel-toggle[aria-expanded="false"]')
  while (await closed.count()) await closed.first().click()
  const labels = await page.locator('.cms-admin__editor .cms-admin__field > span, .cms-admin__editor legend, .cms-admin__editor h4').allInnerTexts()
  const technical = labels.filter(label => technicalLabels.test(label.trim()))
  assertEqual(technical.length, 0, `${id} hides technical fields (${technical.join(', ')})`)
  const unfriendly = labels.filter(label => /Title Lines|Before Link|\bCta\b|\bUrl\b/.test(label))
  assertEqual(unfriendly.length, 0, `${id} uses friendly labels (${unfriendly.join(', ')})`)
  assert(!/[a-z][A-Z]/.test(await page.locator('.cms-admin__title p').innerText()), `${id} toolbar hides content type`)

  if (list) {
    const listPanel = page.locator(`[data-section="${list}"]`)
    const countSelector = `[data-section="${list}"] .cms-admin__list-title span`
    const waitForCount = expected => page.waitForFunction(
      ({ selector, value }) => parseInt(document.querySelector(selector)?.textContent, 10) === value,
      { selector: countSelector, value: expected },
    )
    const before = parseInt(await listPanel.locator('.cms-admin__list-title span').first().innerText(), 10)
    const items = listPanel.locator('.cms-admin__items').first().locator(':scope > .cms-admin__panel--item')
    await listPanel.locator('.cms-admin__add').first().click()
    await waitForCount(before + 1)
    assert((await items.last().getAttribute('class')).includes('is-open'), 'new item opens for editing')
    await items.last().getByRole('button', { name: 'Remove' }).click()
    await waitForCount(before)
    const firstTitle = await items.nth(0).locator('.cms-admin__panel-subtitle').innerText()
    await items.nth(0).getByRole('button', { name: 'Move Down' }).click()
    assertEqual(await items.nth(1).locator('.cms-admin__panel-subtitle').innerText(), firstTitle, 'move down reorders items')
    await page.getByRole('button', { name: 'Reset Draft', exact: true }).click()
    await page.getByText('Draft reset').waitFor()
    assertEqual(await items.nth(0).locator('.cms-admin__panel-subtitle').innerText(), firstTitle, 'reset restores item order')
  }
}

async function testPublishWorkflow(page, id) {
  console.log(`Checking publish workflow: ${id}`)
  const api = path => fetch(`${cmsBase}/api/admin/pages/${id}${path}`).then(response => response.json())
  await openRecord(page, id)
  const publish = page.getByRole('button', { name: 'Publish', exact: true })
  const state = page.locator('.cms-admin__state')
  const v0 = (await api('')).page.version.versionNumber
  const originalContent = (await api('')).page.content

  const input = page.locator('.cms-admin__panel--section.is-open .cms-admin__field > input[type="text"]').first()
  const field = page.locator(`[id="${await input.getAttribute('id')}"]`)
  const original = await field.inputValue()
  assert(await publish.isDisabled(), `${id} publish disabled without a draft`)

  // edit -> unsaved blocks publish -> Save Draft -> published unchanged
  await field.fill(`${original} [ui 1]`)
  await page.getByText('Save your changes before publishing.').waitFor()
  assert(await publish.isDisabled(), `${id} publish disabled with unsaved edits`)
  await state.filter({ hasText: /^Unsaved$/ }).waitFor()
  await page.getByRole('button', { name: 'Save Draft', exact: true }).click()
  await page.locator('.cms-admin__actions span', { hasText: /^Saved$/ }).waitFor()
  await state.filter({ hasText: /^Draft$/ }).waitFor()
  assert(await publish.isEnabled(), `${id} publish enabled after save`)
  assertEqual(JSON.stringify((await api('')).page.content), JSON.stringify(originalContent), `${id} save draft leaves published unchanged`)

  await page.getByRole('button', { name: 'View Published', exact: true }).click()
  await page.locator('.cms-admin__banner--view', { hasText: `Published version ${v0}` }).waitFor()
  await page.locator('.cms-admin__preview-frame').waitFor()
  await page.getByRole('button', { name: 'Edit Draft', exact: true }).click()

  // Publish (confirm dialog) -> new version, draft cleared
  await publishThroughDialog(page)
  await page.locator('.cms-admin__actions span', { hasText: `Version ${v0 + 1} published` }).waitFor()
  assertEqual((await api('')).page.version.versionNumber, v0 + 1, `${id} new published version`)
  assertEqual((await api('/draft')).draft, null, `${id} draft cleared after publish`)
  assertEqual(await field.inputValue(), `${original} [ui 1]`, `${id} editor shows published content`)
  await state.filter({ hasText: /^Publish successful$/ }).waitFor()

  // edit again -> Save Draft -> Versions -> preview + restore the older version
  await field.fill(`${original} [ui 2]`)
  await page.getByRole('button', { name: 'Save Draft', exact: true }).click()
  await page.locator('.cms-admin__actions span', { hasText: /^Saved$/ }).waitFor()

  await page.getByRole('button', { name: 'Versions', exact: true }).click()
  const history = page.locator('.cms-versions__panel')
  await history.locator('.cms-versions__item').first().waitFor()
  const historyText = await history.innerText()
  assert(historyText.includes(`Version ${v0 + 1} — Published`), `${id} history shows published version`)
  assert(historyText.includes(`Version ${v0} — Archived`), `${id} history shows archived version`)
  assert(!/ver_|seed-|\{"/.test(historyText), `${id} history hides ids and raw JSON`)
  const olderRow = history.locator(`[data-version-number="${v0}"]`)
  await olderRow.getByRole('button', { name: 'Preview' }).click()
  await page.locator('.cms-admin__banner--version', { hasText: `Previewing Version ${v0} — Archived` }).waitFor()
  await page.locator('.cms-admin__preview-frame').waitFor()

  await page.getByRole('button', { name: 'Versions', exact: true }).click()
  await history.locator(`[data-version-number="${v0}"]`).getByRole('button', { name: 'Restore' }).click()
  await page.locator('.cms-admin__actions span', { hasText: `Version ${v0} restored as a draft` }).waitFor()
  await page.locator('.cms-admin__banner--view', { hasText: `restored from Version ${v0}` }).waitFor()
  await page.locator('.cms-admin__preview-frame').waitFor()
  assertEqual(JSON.stringify((await api('/draft')).draft.content), JSON.stringify(originalContent), `${id} restored draft matches old version`)
  assertEqual((await api('')).page.version.versionNumber, v0 + 1, `${id} restore leaves published untouched`)
  await page.getByRole('button', { name: 'Edit Draft', exact: true }).click()
  assertEqual(await field.inputValue(), original, `${id} editor shows restored content`)

  // Publish restored draft -> another new version
  await publishThroughDialog(page)
  await page.locator('.cms-admin__actions span', { hasText: `Version ${v0 + 2} published` }).waitFor()
  const finalPage = (await api('')).page
  assertEqual(finalPage.version.versionNumber, v0 + 2, `${id} restored publish creates new version`)
  assertEqual(JSON.stringify(finalPage.content), JSON.stringify(originalContent), `${id} restored content is live in CMS`)
}

async function publishThroughDialog(page) {
  await page.getByRole('button', { name: 'Publish', exact: true }).click()
  const dialog = page.getByRole('alertdialog')
  await dialog.getByText('Publish this page?').waitFor()
  await dialog.getByText('This will make the saved draft the latest CMS published version.').waitFor()
  await dialog.getByRole('button', { name: 'Publish', exact: true }).click()
  await dialog.waitFor({ state: 'detached' })
}

async function openSectionFor(page, field) {
  const section = field.includes('.') ? field.split('.')[0] : '__details'
  const toggle = page.locator(`[data-section="${section}"] > .cms-admin__panel-head .cms-admin__panel-toggle`)
  if (await toggle.getAttribute('aria-expanded') === 'false') await toggle.click()
}

async function testMediaLibrary(page) {
  console.log('Checking media library select, alt edit and delete')
  await openRecord(page, 'home')
  await openSectionFor(page, 'hero.image')
  const field = page.locator('[data-image-field="hero.image"]')
  const originalSrc = await field.locator('.cms-admin__image-thumb img').getAttribute('src')
  const targetId = uploadedMediaIds[0]

  await field.getByRole('button', { name: 'Choose from Media Library' }).click()
  const item = page.locator(`.cms-media [data-media-id="${targetId}"]`)
  await item.waitFor()
  await item.getByRole('button', { name: 'Select' }).click()
  await page.locator('.cms-media').waitFor({ state: 'detached' })
  const selectedSrc = await field.locator('.cms-admin__image-thumb img').getAttribute('src')
  assert(selectedSrc.includes('/media/cms/') && selectedSrc !== originalSrc, 'library selection updates preview')
  await field.locator('input[id$="-alt"]').fill('Library alt text')
  await page.getByRole('button', { name: 'Media Library', exact: true }).click()
  const unsavedItem = page.locator(`.cms-media [data-media-id="${targetId}"]`)
  await unsavedItem.getByText('In your unsaved changes').waitFor()
  assert(await unsavedItem.getByRole('button', { name: 'Delete' }).isDisabled(), 'unsaved editor image cannot be deleted')
  await page.locator('.cms-media').getByRole('button', { name: 'Close' }).click()
  await page.getByRole('button', { name: 'Reset Draft', exact: true }).click()
  await page.getByText('Draft reset').waitFor()
  assertEqual(await field.locator('.cms-admin__image-thumb img').getAttribute('src'), originalSrc, 'reset discards library selection')

  await page.getByRole('button', { name: 'Media Library', exact: true }).click()
  const managed = page.locator(`.cms-media [data-media-id="${targetId}"]`)
  await managed.waitFor()
  await managed.locator('input[type="text"]').fill('Edited in library')
  await managed.getByRole('button', { name: 'Save Alt' }).click()
  await page.getByText('Alt text saved').waitFor()
  await page.locator('.cms-media input[type="search"]').fill('ui-test-company-leadership')
  await page.waitForFunction(() => document.querySelectorAll('.cms-media__item').length === 1)
  assert((await page.locator('.cms-media__item strong').innerText()).includes('ui-test-company-leadership'), 'filename search filters library')
  await page.locator('.cms-media input[type="search"]').fill('')
  await managed.waitFor()
  await managed.getByRole('button', { name: 'Delete' }).click()
  await managed.waitFor({ state: 'detached' })
  uploadedMediaIds.shift()
  await page.locator('.cms-media').getByRole('button', { name: 'Close' }).click()
}

async function mediaIdForPath(mediaPath) {
  const response = await fetch(`${cmsBase}/api/admin/media`)
  const { media } = await response.json()
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

async function openRecord(page, id) {
  const button = page.locator(`[data-record-id="${id}"]`)
  if (await button.evaluate(element => element.classList.contains('is-active'))) return
  await button.click()
  await page.waitForFunction(recordId => {
    const active = document.querySelector(`[data-record-id="${recordId}"]`)
    return active?.classList.contains('is-active')
  }, id)
  const title = adminGroups.flatMap(group => group.items).find(entry => entry.id === id)?.label
  await page.waitForFunction(expected => {
    const heading = document.querySelector('.cms-admin__toolbar h1')?.textContent
    const status = document.querySelector('.cms-admin__actions span')?.textContent || ''
    return heading === expected && /loaded$/.test(status)
  }, title)
}

function spawnCommand(command, cwd, env = {}) {
  if (process.platform === 'win32') {
    return spawn('cmd.exe', ['/d', '/s', '/c', command], {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  }

  return spawn('sh', ['-c', command], {
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
    } catch {
      // keep polling
    }
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
