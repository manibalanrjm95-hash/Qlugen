// Removes data left in the LOCAL development database by automated CMS tests:
//   1. pages created by earlier page-builder test runs (exact test-generated ids only)
//   2. media uploaded by tests that is no longer referenced by any version
//
//   npm run cms:test:cleanup              clean up, report anything still protected
//   npm run cms:test:cleanup -- --dry-run list what would be removed, change nothing
//
// (Page-builder tests now run in an isolated database, so new test pages are no longer created.)
//
// Safety:
// - Local only: starts its own `wrangler dev --local` (top-level, local config) on a loopback port
//   and refuses to delete anything unless that Worker reports mode "local". There is no option to
//   point it at staging/production, and it never passes --env or --remote.
// - Only filenames produced by the test suites (TEST_MEDIA_PATTERN) are considered. Real uploads
//   are never matched.
// - Deletion goes through the normal DELETE /api/admin/media/:id endpoint, which re-checks every
//   draft/published/archived version server-side. Media still referenced by any version is never
//   deleted; it is reported as protected instead.
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as wait } from 'node:timers/promises'
import { NO_DELETE_TRIGGER_SQL } from './sql-snippets.mjs'

// Stored filenames (lower-cased, slugified by the Worker) of every image the test suites upload.
export const TEST_MEDIA_PATTERN = /^(phase3-test-(png|jpeg|webp|avif)|phase4-(historical|draft-only)|ui-test-[a-z0-9-]+|staging-test|visual-admin-home|cms-test-[a-z0-9-]+)\.(png|jpg|webp|avif)$/

export const isTestMediaFilename = filename => TEST_MEDIA_PATTERN.test(String(filename))

// Page ids created by earlier page-builder test runs (they ended in a 13-digit run timestamp).
export const TEST_PAGE_PATTERN = /^custom-(phase6a-(digital-engineering|product|article)|ui-digital-engineering|visual-test)-\d{13}$/

export const isTestPageId = id => TEST_PAGE_PATTERN.test(String(id))

// Deletes test-generated pages (with their versions and audit rows) from the LOCAL database.
// Published/archived versions are normally undeletable; the guard trigger is lifted only inside
// this one local transaction and recreated before it commits.
export async function cleanupTestPages(baseUrl, workerDir, { dryRun = false, log = console.log } = {}) {
  await assertLocalWorker(baseUrl)
  const { pages } = await getJson(baseUrl, '/api/admin/pages')
  const testPages = pages.filter(page => isTestPageId(page.id))
  log(`${dryRun ? 'Would delete' : 'Deleted'} ${testPages.length} test pages; ${pages.length - testPages.length} other pages untouched.`)
  if (dryRun || testPages.length === 0) return testPages

  const ids = testPages.map(page => `'${page.id.replace(/'/g, "''")}'`).join(', ')
  const sqlText = [
    'BEGIN TRANSACTION;',
    'DROP TRIGGER IF EXISTS trg_cms_versions_no_delete;',
    `DELETE FROM cms_audit_log WHERE page_id IN (${ids});`,
    `DELETE FROM cms_versions WHERE page_id IN (${ids});`,
    `DELETE FROM cms_pages WHERE id IN (${ids});`,
    NO_DELETE_TRIGGER_SQL,
    'COMMIT;',
  ].join('\n')
  mkdirSync(path.join(workerDir, '.tmp'), { recursive: true })
  writeFileSync(path.join(workerDir, '.tmp', 'cleanup-test-pages.sql'), sqlText)
  const command = 'npx wrangler d1 execute qlugen-cms-local --local --file .tmp/cleanup-test-pages.sql'
  const result = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', command], { cwd: workerDir, encoding: 'utf8' })
    : spawnSync('sh', ['-c', command], { cwd: workerDir, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`Test page cleanup failed:\n${result.stdout}\n${result.stderr}`)
  return testPages
}

async function assertLocalWorker(baseUrl) {
  const apiUrl = new URL(baseUrl)
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(apiUrl.hostname)) {
    throw new Error(`Refusing to clean up on non-local host ${apiUrl.hostname}`)
  }
  const me = await getJson(baseUrl, '/api/admin/me')
  if (me.mode !== 'local') throw new Error(`Refusing to clean up: CMS Worker is in "${me.mode}" mode, not local development`)
}

// Deletes unused test media through the given LOCAL CMS Worker. Returns { deleted, protected }.
export async function cleanupTestMedia(baseUrl, { dryRun = false, log = console.log } = {}) {
  await assertLocalWorker(baseUrl)

  const { media } = await getJson(baseUrl, '/api/admin/media?limit=500')
  const candidates = media.filter(item => isTestMediaFilename(item.filename))
  const result = { deleted: [], protected: [], skippedReal: media.length - candidates.length }

  for (const item of candidates) {
    const { media: detail } = await getJson(baseUrl, `/api/admin/media/${encodeURIComponent(item.id)}`)
    if (detail.usage.length > 0) {
      result.protected.push({ ...item, usage: detail.usage })
      continue
    }
    if (dryRun) {
      result.deleted.push(item)
      continue
    }
    const response = await fetch(`${baseUrl}/api/admin/media/${encodeURIComponent(item.id)}`, { method: 'DELETE' })
    const body = await response.json()
    if (response.status === 409) {
      result.protected.push({ ...item, usage: body.usage || [] }) // became referenced since the check
    } else if (!response.ok) {
      throw new Error(`Delete ${item.filename} failed: ${body.error || response.status}`)
    } else {
      result.deleted.push(item)
    }
  }

  log(`${dryRun ? 'Would delete' : 'Deleted'} ${result.deleted.length} unused test media; ${result.protected.length} protected; ${result.skippedReal} real uploads untouched.`)
  for (const item of result.protected) {
    const refs = item.usage.map(usage => `${usage.pageId} v${usage.versionNumber} (${usage.status})`).join(', ')
    log(`  protected: ${item.filename} [${item.id}] referenced by ${refs}`)
  }
  return result
}

async function getJson(baseUrl, requestPath) {
  const response = await fetch(`${baseUrl}${requestPath}`)
  const body = await response.json()
  if (!response.ok) throw new Error(`GET ${requestPath} failed: ${body.error || response.status}`)
  return body
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const unknown = process.argv.slice(2).filter(arg => arg !== '--dry-run')
  if (unknown.length) {
    console.error(`Unknown option(s): ${unknown.join(' ')}. Only --dry-run is supported (local database only).`)
    process.exit(1)
  }

  const port = 8798
  const baseUrl = `http://127.0.0.1:${port}`
  const workerDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const command = `npx wrangler dev --local --port ${port}`
  const worker = process.platform === 'win32'
    ? spawn('cmd.exe', ['/d', '/s', '/c', command], { cwd: workerDir, stdio: 'ignore' })
    : spawn('sh', ['-c', command], { cwd: workerDir, stdio: 'ignore' })

  try {
    for (let attempt = 0; ; attempt += 1) {
      try {
        if ((await fetch(`${baseUrl}/api/admin/me`)).ok) break
      } catch {
        // keep polling
      }
      if (attempt > 80) throw new Error('Local CMS Worker did not start')
      await wait(500)
    }
    await cleanupTestPages(baseUrl, workerDir, { dryRun })
    await cleanupTestMedia(baseUrl, { dryRun })
  } finally {
    if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(worker.pid), '/T', '/F'], { stdio: 'ignore' })
    else worker.kill()
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
