// Page removal test (Delete / Archive / Restore Page), fully isolated: a throwaway local database
// is migrated and seeded for each run and deleted afterwards, so no pages or media are left behind.
// Nothing touches Cloudflare.
//
//   npm run cms:test:removal
//
// Covers: delete a never-published page; archive a published page (off the public site, listed
// under Archived, history + media kept); restore it (back in its group, NOT republished); system
// pages (Home, Global, coded pages) can be neither deleted nor archived; audit events recorded.
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, openSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as wait } from 'node:timers/promises'
import { chromium } from 'playwright'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const workerDir = path.join(root, 'worker')
const persistDir = '.wrangler/removal-test'
const logDir = path.join(workerDir, '.tmp')
const api = 'http://127.0.0.1:8803'
const site = 'http://127.0.0.1:5303'
const NOT_FOUND = "This path doesn't lead anywhere."

rmSync(path.join(workerDir, persistDir), { recursive: true, force: true })
mkdirSync(logDir, { recursive: true })
run(`npx wrangler d1 migrations apply qlugen-cms-local --local --persist-to ${persistDir}`, workerDir)
run('node worker/scripts/generate-seed-sql.mjs --out worker/.tmp/removal-seed.sql', root)
run(`npx wrangler d1 execute qlugen-cms-local --local --persist-to ${persistDir} --file .tmp/removal-seed.sql`, workerDir)

const processes = [
  spawnLogged(`npx wrangler dev --local --port 8803 --persist-to ${persistDir}`, workerDir, {}, 'removal-worker'),
  spawnLogged('npx vite --host 127.0.0.1 --port 5303 --strictPort', root, { VITE_CMS_RUNTIME_ENABLED: 'true', VITE_CMS_API_BASE: api }, 'removal-vite'),
]

const dbChecks = []
const dbCheck = (sqlText, check) => dbChecks.push({ sqlText, check })

let browser
try {
  await waitFor(`${api}/api/admin/me`)
  await waitFor(`${site}/`)
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1536, height: 1024 } })
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))
  page.on('dialog', dialog => dialog.accept())

  await testProtectedPages(page)
  await testDeleteDraftPage(page)
  const published = await testArchivePublishedPage(page)
  await testRestoreArchivedPage(page, published)

  assertEqual(pageErrors.length, 0, `no page errors (${pageErrors.join(' | ')})`)

  // Database checks run once the dev Worker has stopped: a second wrangler process reading the same
  // local database while it runs can reset the Worker's connections.
  await browser.close()
  processes.forEach(stopProcess)
  await wait(1000)
  for (const { sqlText, check } of dbChecks) check(d1(sqlText))
  console.log(`Database checks passed (${dbChecks.length}): drafts removed, page_deleted / page_archived / page_restored audited.`)
  console.log('Page removal tests passed (isolated database removed; no pages or media left behind).')
} finally {
  await browser?.close()
  processes.forEach(stopProcess)
  await wait(500)
  rmSync(path.join(workerDir, persistDir), { recursive: true, force: true })
}

// ---------------------------------------------------------------------------------------------

async function testProtectedPages(page) {
  for (const id of ['home', 'global-navigation', 'global-footer', 'company-about', 'capability-automation']) {
    assertStatus(await send('DELETE', `/api/admin/pages/${id}`), 400, `${id} cannot be deleted`)
    assertStatus(await send('POST', `/api/admin/pages/${id}/archive`), 400, `${id} cannot be archived`)
    assertStatus(await send('POST', `/api/admin/pages/${id}/unarchive`), 400, `${id} cannot be restored`)
    assert((await get(`/api/admin/pages/${id}`)).page.status !== 'archived', `${id} untouched`)
  }
  await page.goto(`${site}/admin`)
  for (const id of ['home', 'global-navigation', 'company-about']) {
    await openPage(page, id)
    assertEqual(await page.getByRole('button', { name: 'Page actions' }).count(), 0, `${id} has no Delete/Archive menu`)
  }
  console.log('System pages protected: Home, Global and coded pages cannot be deleted, archived or restored (API and UI).')
}

async function testDeleteDraftPage(page) {
  const { page: draftPage } = (await send('POST', '/api/admin/pages', { title: 'Removal Draft', slug: 'removal-draft', template: 'standard-page' })).body
  assertStatus(await send('POST', `/api/admin/pages/${draftPage.id}/archive`), 409, 'a never-published page is deleted, not archived')
  const mediaBefore = (await get('/api/admin/media?limit=500')).media.length

  await page.goto(`${site}/admin`)
  await openPage(page, draftPage.id)
  assertEqual(JSON.stringify(await menuItems(page)), JSON.stringify(['Delete Page']), 'draft-only page offers Delete Page only')
  await page.keyboard.press('Escape')

  // Cancel keeps the page.
  await chooseMenu(page, 'Delete Page')
  let dialog = page.getByRole('alertdialog', { name: 'Delete this page permanently?' })
  await dialog.getByText('Removal Draft').waitFor()
  await dialog.getByText('/removal-draft').waitFor()
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await dialog.waitFor({ state: 'detached' })
  assert((await get(`/api/admin/pages/${draftPage.id}`)).page, 'Cancel keeps the page')

  await chooseMenu(page, 'Delete Page')
  dialog = page.getByRole('alertdialog', { name: 'Delete this page permanently?' })
  await shot(page, 'delete-page-dialog')
  await dialog.getByRole('button', { name: 'Delete Page' }).click()
  await dialog.waitFor({ state: 'detached' })
  await page.locator('.cms-ref__main[data-loaded-page="home"]').waitFor()
  assertEqual(await page.locator(`[data-record-id="${draftPage.id}"]`).count(), 0, 'deleted page leaves the sidebar')
  assertStatus(await send('GET', `/api/admin/pages/${draftPage.id}`), 404, 'deleted page record removed')
  dbCheck(`SELECT COUNT(*) AS n FROM cms_versions WHERE page_id = '${draftPage.id}'`, rows => assertEqual(rows[0].n, 0, 'its draft removed'))
  dbCheck(`SELECT before_json FROM cms_audit_log WHERE action = 'page_deleted'`, rows => assert(rows.length === 1 && JSON.parse(rows[0].before_json).route === '/removal-draft', 'page_deleted audit event records the page'))
  assertEqual((await get('/api/admin/media?limit=500')).media.length, mediaBefore, 'no media deleted')
  console.log('Delete: never-published page removed permanently (confirmation shows name + URL), Home selected, page_deleted audited, media untouched.')
}

async function testArchivePublishedPage(page) {
  const created = (await send('POST', '/api/admin/pages', { title: 'Removal Live', slug: 'removal-live', template: 'standard-page' })).body.page
  const id = created.id
  const draft = (await get(`/api/admin/pages/${id}/draft`)).draft
  const { media } = await upload(await sharp({ create: { width: 24, height: 16, channels: 3, background: '#2266cc' } }).png().toBuffer(), 'cms-test-removal.png')
  const content = { ...draft.content, hero: { ...draft.content.hero, image: { id: media.id, url: media.publicUrl, alt: '' } } }
  assertOk(await send('PUT', `/api/admin/pages/${id}/draft`, { content }), 'draft with media saved')
  assertOk(await send('POST', `/api/admin/pages/${id}/publish`, {}), 'published')
  await expectPublic('/removal-live', true, 'published page is public')
  assertStatus(await send('DELETE', `/api/admin/pages/${id}`), 409, 'a published page cannot be deleted')

  await page.goto(`${site}/admin`)
  await openPage(page, id)
  assertEqual(JSON.stringify(await menuItems(page)), JSON.stringify(['Archive Page']), 'published page offers Archive Page only')
  await page.keyboard.press('Escape')
  await chooseMenu(page, 'Archive Page')
  const dialog = page.getByRole('alertdialog', { name: 'Archive this page?' })
  await dialog.getByText('/removal-live').waitFor()
  await dialog.getByRole('button', { name: 'Archive Page' }).click()
  await dialog.waitFor({ state: 'detached' })
  await page.locator('.cms-ref__main[data-loaded-page="home"]').waitFor()

  // Gone from its normal group and the public site; listed under Archived; history and media kept.
  const customGroup = page.locator('.cms-ref__nav-group', { has: page.locator('.cms-ref__group-toggle', { hasText: 'Custom Pages' }) })
  assertEqual(await customGroup.locator(`[data-record-id="${id}"]`).count(), 0, 'archived page leaves Custom Pages')
  const archivedGroup = page.locator('.cms-ref__nav-group', { has: page.locator('.cms-ref__group-toggle', { hasText: 'Archived' }) })
  await archivedGroup.locator('.cms-ref__group-toggle').click()
  await archivedGroup.locator(`[data-record-id="${id}"]`, { hasText: 'Removal Live' }).waitFor()
  await expectPublic('/removal-live', false, 'archived page is off the public site')
  assertEqual((await get(`/api/admin/pages/${id}`)).page.status, 'archived', 'page archived')
  assert((await get(`/api/admin/pages/${id}/versions`)).versions.length >= 1, 'version history kept')
  assertStatus(await send('DELETE', `/api/admin/media/${media.id}`), 409, 'media used by the archived page stays protected')
  assertStatus(await send('DELETE', `/api/admin/pages/${id}`), 409, 'an archived page still cannot be deleted')

  // Archived page in the editor: Restore only, cannot be published.
  await archivedGroup.locator(`[data-record-id="${id}"]`).click()
  await page.locator(`.cms-ref__main[data-loaded-page="${id}"]`).waitFor()
  await page.locator('.cms-ref__status', { hasText: /^Archived$/ }).waitFor()
  assert(await page.locator('.cms-ref__actions').getByRole('button', { name: /Publish/ }).isDisabled(), 'archived page cannot be published')
  assertEqual(JSON.stringify(await menuItems(page)), JSON.stringify(['Restore Page']), 'archived page offers Restore Page only')
  await page.keyboard.press('Escape')
  assertOk(await send('PUT', `/api/admin/pages/${id}/draft`, { content }), 'draft saved on archived page')
  assertStatus(await send('POST', `/api/admin/pages/${id}/publish`, {}), 409, 'Worker refuses to publish an archived page')
  dbCheck(`SELECT COUNT(*) AS n FROM cms_audit_log WHERE action = 'page_archived' AND page_id = '${id}'`, rows => assertEqual(rows[0].n, 1, 'page_archived audited'))
  await shot(page, 'archived-page')
  console.log('Archive: published page removed from the public site and its group, listed under Archived, history + media protected, page_archived audited.')
  return { id, media }
}

async function testRestoreArchivedPage(page, { id, media }) {
  await chooseMenu(page, 'Restore Page')
  await page.locator('.cms-ref__status', { hasText: /^Draft$/ }).waitFor()
  const customGroup = page.locator('.cms-ref__nav-group', { has: page.locator('.cms-ref__group-toggle', { hasText: 'Custom Pages' }) })
  await customGroup.locator(`[data-record-id="${id}"].is-active`).waitFor()
  assertEqual(await page.locator('.cms-ref__group-toggle', { hasText: 'Archived' }).count(), 0, 'Archived section empty again')
  const restored = (await get(`/api/admin/pages/${id}`)).page
  assertEqual(restored.status, 'draft', 'restored page is unpublished')
  await expectPublic('/removal-live', false, 'restore does not auto-publish')
  dbCheck(`SELECT COUNT(*) AS n FROM cms_audit_log WHERE action = 'page_restored' AND page_id = '${id}'`, rows => assertEqual(rows[0].n, 1, 'page_restored audited'))
  assertEqual(JSON.stringify(await menuItems(page)), JSON.stringify(['Archive Page']), 'restored page (with history) can be archived again, not deleted')
  await page.keyboard.press('Escape')

  // Publishing it again is an explicit editor action.
  await page.locator('.cms-ref__actions').getByRole('button', { name: /Publish/ }).click()
  const dialog = page.getByRole('alertdialog')
  await dialog.getByRole('button', { name: 'Publish', exact: true }).click()
  await dialog.waitFor({ state: 'detached' })
  await page.locator('.cms-ref__status', { hasText: /^Published$/ }).waitFor()
  await expectPublic('/removal-live', true, 'republished page is public again')
  assertStatus(await send('DELETE', `/api/admin/media/${media.id}`), 409, 'media still protected')
  console.log('Restore: page back in Custom Pages as an unpublished draft (not auto-published), page_restored audited; Publish makes it live again.')
}

// ---------------------------------------------------------------------------------------------

async function openPage(page, id) {
  const item = page.locator(`[data-record-id="${id}"]`)
  if (!(await item.count())) {
    const group = await page.evaluate(recordId => {
      for (const section of document.querySelectorAll('.cms-ref__nav-group')) {
        if (section.querySelector('[aria-expanded="false"]')) section.querySelector('.cms-ref__group-toggle').click()
      }
      return recordId
    }, id)
    assert(group, 'groups opened')
  }
  await item.click()
  await page.locator(`.cms-ref__main[data-loaded-page="${id}"]`).waitFor()
}

async function menuItems(page) {
  await page.getByRole('button', { name: 'Page actions' }).click()
  return page.getByRole('menuitem').allTextContents()
}

async function chooseMenu(page, label) {
  await page.getByRole('button', { name: 'Page actions' }).click()
  await page.getByRole('menuitem', { name: label }).click()
}

async function expectPublic(route, live, message) {
  const publicPage = await browser.newPage()
  await publicPage.goto(`${site}${route}`)
  if (live) await publicPage.locator('h1').waitFor()
  else await publicPage.getByText(NOT_FOUND).waitFor({ timeout: 15000 }).catch(() => { throw new Error(`Assertion failed: ${message}`) })
  assertEqual(await publicPage.getByText(NOT_FOUND).count(), live ? 0 : 1, message)
  await publicPage.close()
}

async function upload(bytes, filename) {
  const form = new FormData()
  form.append('file', new Blob([bytes], { type: 'image/png' }), filename)
  const response = await fetch(`${api}/api/admin/media/upload`, { method: 'POST', body: form })
  const body = await response.json()
  if (!response.ok) throw new Error(`upload failed: ${body.error}`)
  return body
}

// Read-only checks straight from the isolated database. The SQL is passed inline (no file written
// under worker/, which the running dev Worker could treat as a change).
function d1(sqlText) {
  if (sqlText.includes('"')) throw new Error('d1(): use single quotes in SQL')
  const command = `npx wrangler d1 execute qlugen-cms-local --local --persist-to ${persistDir} --json --command "${sqlText}"`
  // shell: true quotes the whole command line correctly for cmd.exe / sh.
  const result = spawnSync(command, { cwd: workerDir, encoding: 'utf8', shell: true })
  const json = result.stdout.slice(result.stdout.indexOf('['))
  return JSON.parse(json)[0].results
}

async function get(requestPath) {
  const response = await fetch(`${api}${requestPath}`)
  const body = await response.json()
  if (!response.ok) throw new Error(`GET ${requestPath} failed: ${body.error || response.status}`)
  return body
}

async function send(method, requestPath, body) {
  const response = await fetch(`${api}${requestPath}`, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return { status: response.status, body: await response.json().catch(() => ({})) }
}

async function shot(page, name) {
  if (process.env.CMS_EDITOR_SCREENSHOTS) await page.screenshot({ path: path.join(process.env.CMS_EDITOR_SCREENSHOTS, `${name}.png`) })
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

function assertStatus(response, expected, message) {
  if (response.status !== expected) throw new Error(`Assertion failed: ${message}. Expected HTTP ${expected}, got ${response.status} ${JSON.stringify(response.body)}`)
}

function assertOk(response, message) {
  if (response.status >= 400) throw new Error(`Assertion failed: ${message}. HTTP ${response.status} ${JSON.stringify(response.body)}`)
}
