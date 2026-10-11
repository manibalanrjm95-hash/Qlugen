import { getTemplate, initialContent } from '../../src/cms/templateRegistry.js'
import { routeForSlug, slugError } from '../../src/cms/routeRules.js'
import { httpError } from './http.js'
import {
  COLLECTIONS,
  auditEntry,
  cryptoRandomId,
  db,
  draftRef,
  mediaRefsIn,
  nowIso,
  pageRef,
  routeKeyRef,
  routeKeysFor,
  toPageDto,
  toVersionDto,
  versionRef,
  versionsRef,
} from './records.js'
import { removePageSnapshots, writePageSnapshot } from './snapshots.js'

// Version lifecycle (identical to the Cloudflare Worker / D1 version):
// - A page has at most one draft (cms_versions/draft). Saving a draft updates it in place.
// - Publish copies the draft into a NEW published version, archives the previous published one,
//   moves the page's publishedVersionId and deletes the draft, all in one transaction. The public
//   snapshot in Storage is then refreshed (public site reads it directly).
// - Published/archived versions are immutable: this module only ever creates them and changes
//   published -> archived. (D1 enforced this with triggers; in Firebase only these Functions can
//   write, through the Admin SDK, and the Firestore rules deny all client access.)
// - Restore copies a released version into a new draft; publishing it is a separate step.
// - pages.latestVersionNumber is the highest released version number (next = +1), and
//   pages.hasDraft / publishedVersionNumber are kept in step for the page list.

export async function listPages() {
  const snapshot = await db().collection(COLLECTIONS.pages).orderBy('route').get()
  return snapshot.docs.map(doc => toPageDto(doc.data()))
}

// "+ Add Page": creates the page record and its first DRAFT from the template defaults.
// New pages are never published automatically and never added to navigation.
export async function createPage(input, actor) {
  const title = normalizeTitle(input?.title)
  const slug = typeof input?.slug === 'string' ? input.slug.trim() : ''
  const template = getTemplate(input?.template)

  if (!title) throw httpError(400, 'Enter a page name.')
  if (title.length > 120) throw httpError(400, 'Keep the page name under 120 characters.')
  if (!template) throw httpError(400, 'Choose one of the available templates.')
  const problem = slugError(slug)
  if (problem) throw httpError(400, problem)

  const route = routeForSlug(slug)
  const id = `custom-${slug}`
  const at = nowIso()
  const contentJson = JSON.stringify(initialContent(template, { title, slug }))
  const keyRefs = routeKeysFor({ route, slug }).map(routeKeyRef)

  await db().runTransaction(async tx => {
    const [existing, ...keys] = await Promise.all([tx.get(pageRef(id)), ...keyRefs.map(ref => tx.get(ref))])
    if (existing.exists || keys.some(key => key.exists)) {
      throw httpError(409, `${route} is already used by another page. Choose another URL.`)
    }
    tx.create(pageRef(id), {
      id, route, slug, contentType: template.contentType, title, templateId: template.key, status: 'draft',
      publishedVersionId: null, publishedVersionNumber: null, latestVersionNumber: 0, hasDraft: true,
      createdAt: at, updatedAt: at,
    })
    tx.create(draftRef(id), draftData(id, { versionNumber: 1, contentJson, at, actor }))
    for (const ref of keyRefs) tx.create(ref, { pageId: id })
    write(tx, auditEntry({ pageId: id, action: 'page_created', after: { route, template: template.key, title }, actor }))
  })

  return getPage(id)
}

// Pages created with "+ Add Page" (as opposed to the coded site's pages and global records).
export function isTemplatePage(page) {
  return Boolean(page && getTemplate(page.templateId) && page.id.startsWith('custom-'))
}

export async function getPage(pageId) {
  const page = await pageRef(pageId).get()
  if (!page.exists) return null
  const data = page.data()
  const version = data.publishedVersionId ? await versionRef(pageId, data.publishedVersionId).get() : null
  const published = version?.exists && version.data().status === 'published' ? version.data() : null
  return {
    ...toPageDto(data),
    content: published ? JSON.parse(published.contentJson) : null,
    version: published ? toVersionDto(published, false) : null,
  }
}

export async function getDraft(pageId) {
  const draft = await draftRef(pageId).get()
  return draft.exists ? toVersionDto(draft.data(), true) : null
}

export async function upsertDraft(page, content, actor) {
  const at = nowIso()
  const contentJson = JSON.stringify(content)
  await db().runTransaction(async tx => {
    const [pageDoc, existing] = await Promise.all([tx.get(pageRef(page.id)), tx.get(draftRef(page.id))])
    if (!pageDoc.exists) throw httpError(404, 'Page not found')
    if (existing.exists) {
      tx.update(draftRef(page.id), { contentJson, createdAt: at, createdBy: actor, mediaRefs: mediaRefsIn(contentJson) })
      write(tx, auditEntry({ pageId: page.id, action: 'draft_saved', before: existing.data().contentJson, after: contentJson, actor }))
    } else {
      const versionNumber = (pageDoc.data().latestVersionNumber || 0) + 1
      tx.create(draftRef(page.id), draftData(page.id, { versionNumber, contentJson, at, actor }))
      write(tx, auditEntry({ pageId: page.id, action: 'draft_saved', after: contentJson, actor }))
    }
    tx.update(pageRef(page.id), { hasDraft: true })
  })
  return getDraft(page.id)
}

export async function deleteDraft(page, actor) {
  const draft = await getDraft(page.id)
  if (!draft) return { deleted: false }
  if (!page.version) throw httpError(409, 'This page has not been published yet, so its draft cannot be discarded.')

  await db().runTransaction(async tx => {
    const current = await tx.get(draftRef(page.id))
    if (!current.exists) return
    tx.delete(draftRef(page.id))
    tx.update(pageRef(page.id), { hasDraft: false })
    write(tx, auditEntry({ pageId: page.id, action: 'draft_deleted', before: current.data().contentJson, actor }))
  })
  return { deleted: true }
}

export async function publishDraft(page, validate, { expectedDraftSavedAt, actor } = {}) {
  if (page.status === 'archived') throw httpError(409, 'This page is archived. Restore it before publishing.')
  const draft = await getDraft(page.id)
  if (!draft) throw httpError(409, 'There is no saved draft to publish. Save your changes first.')
  if (expectedDraftSavedAt && expectedDraftSavedAt !== draft.createdAt) {
    throw httpError(409, 'The draft changed since it was loaded. Reload the page before publishing.')
  }
  const validation = validate(page.contentType, draft.content)
  if (!validation.ok) throw httpError(400, 'Draft content is invalid', { details: validation.errors })

  const id = cryptoRandomId('ver')
  const at = nowIso()
  let published
  await db().runTransaction(async tx => {
    const [pageDoc, draftDoc] = await Promise.all([tx.get(pageRef(page.id)), tx.get(draftRef(page.id))])
    if (!draftDoc.exists || draftDoc.data().createdAt !== draft.createdAt) {
      throw httpError(409, 'The draft changed since it was loaded. Reload the page before publishing.')
    }
    const pageData = pageDoc.data()
    if (pageData.status === 'archived') throw httpError(409, 'This page is archived. Restore it before publishing.')
    const previousId = pageData.publishedVersionId
    const previous = previousId ? await tx.get(versionRef(page.id, previousId)) : null
    const versionNumber = (pageData.latestVersionNumber || 0) + 1
    const source = draftDoc.data()

    if (previous?.exists && previous.data().status === 'published') {
      tx.update(versionRef(page.id, previousId), { status: 'archived' }) // the only allowed change
    }
    published = {
      id, pageId: page.id, versionNumber, status: 'published', contentJson: source.contentJson,
      createdAt: source.createdAt, createdBy: actor, publishedAt: at,
      basedOnVersionId: source.basedOnVersionId ?? null, basedOnVersionNumber: source.basedOnVersionNumber ?? null,
      mediaRefs: mediaRefsIn(source.contentJson),
    }
    tx.create(versionRef(page.id, id), published)
    tx.update(pageRef(page.id), {
      publishedVersionId: id, publishedVersionNumber: versionNumber, latestVersionNumber: versionNumber,
      status: 'published', hasDraft: false, updatedAt: at,
    })
    tx.delete(draftRef(page.id))
    write(tx, auditEntry({
      pageId: page.id,
      action: 'published',
      before: previous?.exists ? { versionNumber: previous.data().versionNumber } : null,
      after: { versionNumber, archivedVersion: previous?.exists ? previous.data().versionNumber : null },
      actor,
    }))
  })

  const result = await getPage(page.id)
  const warning = await snapshotStep(() => writePageSnapshot(result, published.contentJson), page.id)
  return warning ? { ...result, warning } : result
}

// The Firestore change is already committed when the public snapshot is written, so a failed
// Storage write must not report the publish/archive itself as failed (a retry would then fail with
// "no saved draft"). It is logged and returned as a warning; POST /api/admin/snapshots/rebuild
// (or the next publish of the page) brings the public site back in step.
async function snapshotStep(task, pageId) {
  try {
    await task()
    return null
  } catch (error) {
    console.error(`Snapshot update failed for ${pageId}`, error)
    return 'Saved, but the public website could not be updated yet. Rebuild the public snapshots to retry.'
  }
}

// Archive takes a CMS-created page off the public site. The page, its versions and its media
// references are kept. Coded pages and global records (Home, Navigation, Footer, SEO...) cannot be archived.
export async function archivePage(page, actor) {
  if (!isTemplatePage(page)) throw httpError(400, 'Only pages created with Add Page can be archived.')
  if (page.status === 'archived') return getPage(page.id)
  if (!(await hasBeenPublished(page.id))) {
    throw httpError(409, 'This page has never been published. Delete it instead of archiving it.')
  }
  await db().runTransaction(async tx => {
    tx.update(pageRef(page.id), { status: 'archived', updatedAt: nowIso() })
    write(tx, auditEntry({ pageId: page.id, action: 'page_archived', after: { route: page.route }, actor }))
  })
  const warning = await snapshotStep(() => removePageSnapshots(page), page.id)
  const result = await getPage(page.id)
  return warning ? { ...result, warning } : result
}

// Restore brings an archived page back to the admin as an unpublished page: it stays off the
// public site until someone publishes it again. A draft of the last published content is created
// (unless a draft already exists) so it can be reviewed and re-published in one step.
export async function restorePage(page, actor) {
  if (!isTemplatePage(page)) throw httpError(400, 'Only pages created with Add Page can be restored.')
  if (page.status !== 'archived') throw httpError(409, 'Only archived pages can be restored.')
  const at = nowIso()
  await db().runTransaction(async tx => {
    const [pageDoc, existingDraft] = await Promise.all([tx.get(pageRef(page.id)), tx.get(draftRef(page.id))])
    const pageData = pageDoc.data()
    const source = pageData.publishedVersionId ? await tx.get(versionRef(page.id, pageData.publishedVersionId)) : null
    const update = { status: 'draft', updatedAt: at }
    if (!existingDraft.exists && source?.exists) {
      tx.create(draftRef(page.id), draftData(page.id, {
        versionNumber: (pageData.latestVersionNumber || 0) + 1,
        contentJson: source.data().contentJson,
        at,
        actor,
        basedOn: source.data(),
      }))
      update.hasDraft = true
    }
    tx.update(pageRef(page.id), update)
    write(tx, auditEntry({ pageId: page.id, action: 'page_restored', after: { route: page.route, status: 'draft' }, actor }))
  })
  return getPage(page.id)
}

// Permanent delete is only for Add Page pages that were NEVER published: their only content is the
// draft. Anything with published or archived history must be archived instead (that history is
// immutable). Media files are never deleted here.
export async function deletePage(page, actor) {
  if (!isTemplatePage(page)) throw httpError(400, 'Only pages created with Add Page can be deleted.')
  await db().runTransaction(async tx => {
    const [pageDoc, released] = await Promise.all([
      tx.get(pageRef(page.id)),
      tx.get(versionsRef(page.id).where('status', 'in', ['published', 'archived']).limit(1)),
    ])
    if (!pageDoc.exists) throw httpError(404, 'Page not found')
    if (pageDoc.data().publishedVersionId || !released.empty) {
      throw httpError(409, 'This page has been published. Archive it instead; published pages cannot be deleted.')
    }
    // Recorded without a page link (the page is removed); the deleted page is described in beforeJson.
    write(tx, auditEntry({ action: 'page_deleted', before: { id: page.id, route: page.route, title: page.title, template: page.templateId }, actor }))
    tx.delete(draftRef(page.id))
    for (const key of routeKeysFor(pageDoc.data())) tx.delete(routeKeyRef(key))
    tx.delete(pageRef(page.id))
  })
  return { deleted: true, id: page.id }
}

export async function restoreVersion(page, versionId, actor) {
  const at = nowIso()
  await db().runTransaction(async tx => {
    const [source, existing, pageDoc] = await Promise.all([
      tx.get(versionRef(page.id, versionId)),
      tx.get(draftRef(page.id)),
      tx.get(pageRef(page.id)),
    ])
    if (!source.exists || source.data().status === 'draft' || versionId === 'draft') throw httpError(404, 'Version not found')
    const sourceData = source.data()
    tx.set(draftRef(page.id), draftData(page.id, {
      versionNumber: (pageDoc.data().latestVersionNumber || 0) + 1,
      contentJson: sourceData.contentJson,
      at,
      actor,
      basedOn: sourceData,
    }))
    tx.update(pageRef(page.id), { hasDraft: true })
    write(tx, auditEntry({
      pageId: page.id,
      action: 'version_restored',
      before: existing.exists ? existing.data().contentJson : null,
      after: { restoredFromVersion: sourceData.versionNumber },
      actor,
    }))
  })
  return getDraft(page.id)
}

export async function listVersions(pageId) {
  const snapshot = await versionsRef(pageId).orderBy('versionNumber', 'desc').get()
  return snapshot.docs.map(doc => doc.data()).filter(version => version.status !== 'draft').map(version => toVersionDto(version, false))
}

export async function getVersion(pageId, versionId) {
  if (versionId === 'draft') return null
  const doc = await versionRef(pageId, versionId).get()
  return doc.exists && doc.data().status !== 'draft' ? toVersionDto(doc.data(), true) : null
}

async function hasBeenPublished(pageId) {
  const [page, released] = await Promise.all([
    pageRef(pageId).get(),
    versionsRef(pageId).where('status', 'in', ['published', 'archived']).limit(1).get(),
  ])
  return Boolean(page.data()?.publishedVersionId) || !released.empty
}

function draftData(pageId, { versionNumber, contentJson, at, actor, basedOn = null }) {
  return {
    id: cryptoRandomId('ver'),
    pageId,
    versionNumber,
    status: 'draft',
    contentJson,
    createdAt: at,
    createdBy: actor,
    publishedAt: null,
    basedOnVersionId: basedOn?.id ?? null,
    basedOnVersionNumber: basedOn?.versionNumber ?? null,
    mediaRefs: mediaRefsIn(contentJson),
  }
}

function write(tx, { ref, data }) {
  tx.create(ref, data)
}

function normalizeTitle(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
}
