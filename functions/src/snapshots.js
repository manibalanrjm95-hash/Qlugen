import { getStorage } from 'firebase-admin/storage'
import { stripDesignKeys } from '../../src/lib/designLock.js'
import { getTemplate } from '../../src/cms/templateRegistry.js'
import { db, COLLECTIONS, versionRef } from './records.js'

// Published snapshots: the public website reads published content straight from Firebase Storage
// (no Function call, no cold start), and falls back to its local JSON if a file cannot be loaded.
//
//   cms-public/pages/{pageId}.json     { id, version, publishedAt, content }    every published page
//   cms-public/routes/{slug}.json      { page: { template, content } }          pages made with + Add Page
//
// Only the CURRENT published version is ever written (never drafts, archived versions or admin
// metadata), design keys are stripped, and Storage rules make these files read-only for everyone.
// Snapshots are written after the Firestore transaction commits; a failed write is retried, and
// `rebuildAllSnapshots()` (npm run cms:snapshots:rebuild) regenerates everything from Firestore.

export const SNAPSHOT_PREFIX = 'cms-public'
const CACHE_CONTROL = 'no-cache' // browsers revalidate each load: a Publish shows on the next page view

export const pageSnapshotPath = pageId => `${SNAPSHOT_PREFIX}/pages/${pageId}.json`
export const routeSnapshotPath = slug => `${SNAPSHOT_PREFIX}/routes/${slug}.json`

const bucket = () => getStorage().bucket()

export function isPublicTemplatePage(page) {
  return Boolean(page?.id?.startsWith('custom-') && getTemplate(page.templateId) && page.status === 'published')
}

export function pageSnapshot(page, contentJson) {
  return {
    id: page.id,
    version: page.version?.versionNumber ?? null,
    publishedAt: page.version?.publishedAt ?? null,
    content: stripDesignKeys(JSON.parse(contentJson)),
  }
}

export function routeSnapshot(page, contentJson) {
  return { page: { template: page.templateId, content: stripDesignKeys(JSON.parse(contentJson)) } }
}

export async function writePageSnapshot(page, contentJson) {
  await saveJson(pageSnapshotPath(page.id), pageSnapshot(page, contentJson))
  if (isPublicTemplatePage(page)) await saveJson(routeSnapshotPath(page.slug), routeSnapshot(page, contentJson))
}

// Archived (or otherwise unpublished) pages disappear from the public site.
export async function removePageSnapshots(page) {
  await deleteIfExists(pageSnapshotPath(page.id))
  if (page.id?.startsWith('custom-') && page.slug) await deleteIfExists(routeSnapshotPath(page.slug))
}

// Regenerates every snapshot from Firestore (seeding, recovery after a failed write).
export async function rebuildAllSnapshots({ log = () => {}, removeUnpublished = true } = {}) {
  const pages = await db().collection(COLLECTIONS.pages).get()
  let written = 0
  let removed = 0
  let skippedRemoval = 0
  for (const doc of pages.docs) {
    const page = doc.data()
    const version = page.publishedVersionId ? await versionRef(page.id, page.publishedVersionId).get() : null
    // status must be "published": an archived page restored to the admin keeps its old
    // publishedVersionId but stays off the public site until it is published again.
    if (page.status !== 'published' || !version?.exists || version.data().status !== 'published') {
      if (removeUnpublished) {
        await removePageSnapshots(page)
        removed += 1
      } else {
        skippedRemoval += 1
      }
      continue
    }
    const data = version.data()
    await writePageSnapshot({ ...page, version: { versionNumber: data.versionNumber, publishedAt: data.publishedAt } }, data.contentJson)
    written += 1
  }
  log(`Snapshots: ${written} written, ${removed} removed${skippedRemoval ? `, ${skippedRemoval} removals skipped` : ''}.`)
  return { written, removed, skippedRemoval }
}

async function saveJson(path, data) {
  const body = JSON.stringify(data)
  await retry(() => bucket().file(path).save(body, {
    resumable: false,
    contentType: 'application/json; charset=utf-8',
    metadata: { cacheControl: CACHE_CONTROL },
  }))
}

async function deleteIfExists(path) {
  await retry(() => bucket().file(path).delete({ ignoreNotFound: true }))
}

async function retry(task, attempts = 3) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await task()
    } catch (error) {
      if (attempt >= attempts) throw error
      await new Promise(resolve => setTimeout(resolve, 300 * attempt))
    }
  }
}
