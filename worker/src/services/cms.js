import { auditStatement, cryptoRandomId, nowIso, parseContentRow, toPageDto, toVersionDto } from './records.js'
import { httpError } from './http.js'
import { getTemplate, initialContent } from '../../../src/cms/templateRegistry.js'
import { routeForSlug, slugError } from '../../../src/cms/routeRules.js'

// Version lifecycle:
// - A page has at most one draft. Saving a draft updates that row in place.
// - Publish copies the draft into a NEW published row, archives the previous published row,
//   moves cms_pages.published_version_id and deletes the draft, all in one atomic batch.
// - Published/archived rows are immutable (enforced by triggers in 0003_cms_publish_versions.sql).
// - Restore copies a released version into a new draft; publishing it is a separate step.

const DRAFT_SELECT = `SELECT d.*, b.version_number AS based_on_version_number
  FROM cms_versions d
  LEFT JOIN cms_versions b ON b.id = d.based_on_version_id`

export async function listPages(db) {
  const result = await db.prepare(
    `SELECT p.*,
      (SELECT version_number FROM cms_versions WHERE id = p.published_version_id) AS latest_version,
      EXISTS(SELECT 1 FROM cms_versions WHERE page_id = p.id AND status = 'draft') AS has_draft
     FROM cms_pages p
     ORDER BY route ASC`
  ).all()

  return result.results.map(toPageDto)
}

// "+ Add Page": creates the page record and its first DRAFT from the template defaults.
// New pages are never published automatically and never added to navigation.
export async function createPage(db, input, actor) {
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
  const existing = await db.prepare('SELECT id FROM cms_pages WHERE route = ? OR slug = ? OR id = ?').bind(route, slug, id).first()
  if (existing) throw httpError(409, `${route} is already used by another page. Choose another URL.`)

  const at = nowIso()
  const content = initialContent(template, { title, slug })
  await db.batch([
    db.prepare(
      `INSERT INTO cms_pages
       (id, route, slug, content_type, title, created_at, updated_at, published_version_id, template_id, page_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, 'draft')`
    ).bind(id, route, slug, template.contentType, title, at, at, template.key),
    insertDraftStatement(db, id, 1, JSON.stringify(content), at, null, actor),
    auditStatement(db, { pageId: id, action: 'page_created', after: { route, template: template.key, title }, actor }),
  ])

  return getPage(db, id)
}

// Pages created with "+ Add Page" (as opposed to the coded site's pages and global records).
export function isTemplatePage(page) {
  return Boolean(page && getTemplate(page.templateId) && page.id.startsWith('custom-'))
}

export async function getPage(db, pageId) {
  const page = await db.prepare('SELECT * FROM cms_pages WHERE id = ?').bind(pageId).first()
  if (!page) return null

  const version = await db.prepare(
    `SELECT * FROM cms_versions
     WHERE id = ? AND page_id = ? AND status = 'published'`
  ).bind(page.published_version_id, pageId).first()

  return {
    ...toPageDto(page),
    content: version ? parseContentRow(version.content_json) : null,
    version: version ? toVersionDto(version, false) : null,
  }
}

export async function getDraft(db, pageId) {
  const draft = await db.prepare(
    `${DRAFT_SELECT}
     WHERE d.page_id = ? AND d.status = 'draft'
     LIMIT 1`
  ).bind(pageId).first()

  return draft ? toVersionDto(draft, true) : null
}

export async function upsertDraft(db, page, content, actor) {
  const existing = await getDraft(db, page.id)
  const at = nowIso()
  const contentJson = JSON.stringify(content)

  if (existing) {
    await db.batch([
      db.prepare(
        `UPDATE cms_versions SET content_json = ?, created_at = ?, created_by = ?
         WHERE id = ? AND status = 'draft'`
      ).bind(contentJson, at, actor, existing.id),
      auditStatement(db, { pageId: page.id, action: 'draft_saved', before: existing.content, after: contentJson, actor }),
    ])
    return getDraft(db, page.id)
  }

  await db.batch([
    insertDraftStatement(db, page.id, await nextVersionNumber(db, page.id), contentJson, at, null, actor),
    auditStatement(db, { pageId: page.id, action: 'draft_saved', after: contentJson, actor }),
  ])
  return getDraft(db, page.id)
}

export async function deleteDraft(db, page, actor) {
  const draft = await getDraft(db, page.id)
  if (!draft) return { deleted: false }
  if (!page.version) throw httpError(409, 'This page has not been published yet, so its draft cannot be discarded.')

  await db.batch([
    db.prepare(`DELETE FROM cms_versions WHERE id = ? AND status = 'draft'`).bind(draft.id),
    auditStatement(db, { pageId: page.id, action: 'draft_deleted', before: draft.content, actor }),
  ])
  return { deleted: true }
}

export async function publishDraft(db, page, validate, { expectedDraftSavedAt, actor } = {}) {
  if (page.status === 'archived') throw httpError(409, 'This page is archived. Restore it before publishing.')
  const draft = await getDraft(db, page.id)
  if (!draft) throw httpError(409, 'There is no saved draft to publish. Save your changes first.')
  if (expectedDraftSavedAt && expectedDraftSavedAt !== draft.createdAt) {
    throw httpError(409, 'The draft changed since it was loaded. Reload the page before publishing.')
  }

  const validation = validate(page.contentType, draft.content)
  if (!validation.ok) throw httpError(400, 'Draft content is invalid', { details: validation.errors })

  const previous = page.version
  const versionNumber = await nextVersionNumber(db, page.id)
  const id = cryptoRandomId('ver')
  const at = nowIso()
  const contentJson = JSON.stringify(draft.content)

  await db.batch([
    db.prepare(`UPDATE cms_versions SET status = 'archived' WHERE page_id = ? AND status = 'published'`).bind(page.id),
    db.prepare(
      `INSERT INTO cms_versions
       (id, page_id, version_number, status, content_json, created_at, created_by, published_at, based_on_version_id)
       VALUES (?, ?, ?, 'published', ?, ?, ?, ?, ?)`
    ).bind(id, page.id, versionNumber, contentJson, draft.createdAt, actor, at, draft.basedOnVersionId ?? null),
    db.prepare(`UPDATE cms_pages SET published_version_id = ?, updated_at = ?, page_status = 'published' WHERE id = ?`).bind(id, at, page.id),
    db.prepare(`DELETE FROM cms_versions WHERE id = ? AND status = 'draft'`).bind(draft.id),
    auditStatement(db, {
      pageId: page.id,
      action: 'published',
      before: previous ? { versionNumber: previous.versionNumber } : null,
      after: { versionNumber, archivedVersion: previous?.versionNumber ?? null },
      actor,
    }),
  ])

  return getPage(db, page.id)
}

// Archive takes a CMS-created page off the public site. The page, its versions and its media
// references are kept. Coded pages and global records (Home, Navigation, Footer, SEO...) cannot be archived.
export async function archivePage(db, page, actor) {
  if (!isTemplatePage(page)) throw httpError(400, 'Only pages created with Add Page can be archived.')
  if (page.status === 'archived') return getPage(db, page.id)
  if (!(await hasBeenPublished(db, page.id))) {
    throw httpError(409, 'This page has never been published. Delete it instead of archiving it.')
  }
  const at = nowIso()
  await db.batch([
    db.prepare(`UPDATE cms_pages SET page_status = 'archived', updated_at = ? WHERE id = ?`).bind(at, page.id),
    auditStatement(db, { pageId: page.id, action: 'page_archived', after: { route: page.route }, actor }),
  ])
  return getPage(db, page.id)
}

// Restore brings an archived page back to the admin as an unpublished page: it stays off the
// public site until someone publishes it again. A draft of the last published content is created
// (unless a draft already exists) so it can be reviewed and re-published in one step.
export async function restorePage(db, page, actor) {
  if (!isTemplatePage(page)) throw httpError(400, 'Only pages created with Add Page can be restored.')
  if (page.status !== 'archived') throw httpError(409, 'Only archived pages can be restored.')
  const at = nowIso()
  const statements = [
    db.prepare(`UPDATE cms_pages SET page_status = 'draft', updated_at = ? WHERE id = ?`).bind(at, page.id),
    auditStatement(db, { pageId: page.id, action: 'page_restored', after: { route: page.route, status: 'draft' }, actor }),
  ]
  if (!(await getDraft(db, page.id)) && page.version) {
    const source = await db.prepare('SELECT content_json FROM cms_versions WHERE id = ?').bind(page.version.id).first()
    statements.push(insertDraftStatement(db, page.id, await nextVersionNumber(db, page.id), source.content_json, at, page.version.id, actor))
  }
  await db.batch(statements)
  return getPage(db, page.id)
}

// Permanent delete is only for Add Page pages that were NEVER published: their only content is the
// draft. Anything with published or archived history must be archived instead (that history is
// immutable and protected by trg_cms_versions_no_delete). Media files are never deleted here.
export async function deletePage(db, page, actor) {
  if (!isTemplatePage(page)) throw httpError(400, 'Only pages created with Add Page can be deleted.')
  if (await hasBeenPublished(db, page.id)) {
    throw httpError(409, 'This page has been published. Archive it instead; published pages cannot be deleted.')
  }
  await db.batch([
    // Recorded without a page link (the page row is removed); the deleted page is described in before_json.
    auditStatement(db, {
      action: 'page_deleted',
      before: { id: page.id, route: page.route, title: page.title, template: page.templateId },
      actor,
    }),
    db.prepare(`DELETE FROM cms_versions WHERE page_id = ? AND status = 'draft'`).bind(page.id),
    db.prepare(`DELETE FROM cms_pages WHERE id = ? AND published_version_id IS NULL`).bind(page.id),
  ])
  return { deleted: true, id: page.id }
}

async function hasBeenPublished(db, pageId) {
  const row = await db.prepare(
    `SELECT (SELECT published_version_id FROM cms_pages WHERE id = ?) AS published,
            EXISTS(SELECT 1 FROM cms_versions WHERE page_id = ? AND status != 'draft') AS history`
  ).bind(pageId, pageId).first()
  return Boolean(row?.published || row?.history)
}

export async function restoreVersion(db, page, versionId, actor) {
  const source = await db.prepare(
    `SELECT * FROM cms_versions WHERE id = ? AND page_id = ? AND status != 'draft'`
  ).bind(versionId, page.id).first()
  if (!source) throw httpError(404, 'Version not found')

  const existing = await getDraft(db, page.id)
  const statements = []
  if (existing) {
    statements.push(db.prepare(`DELETE FROM cms_versions WHERE id = ? AND status = 'draft'`).bind(existing.id))
  }
  statements.push(
    insertDraftStatement(db, page.id, await nextVersionNumber(db, page.id), source.content_json, nowIso(), source.id, actor),
    auditStatement(db, {
      pageId: page.id,
      action: 'version_restored',
      before: existing ? existing.content : null,
      after: { restoredFromVersion: source.version_number },
      actor,
    }),
  )
  await db.batch(statements)
  return getDraft(db, page.id)
}

export async function listVersions(db, pageId) {
  const result = await db.prepare(
    `SELECT v.*, b.version_number AS based_on_version_number
     FROM cms_versions v
     LEFT JOIN cms_versions b ON b.id = v.based_on_version_id
     WHERE v.page_id = ? AND v.status != 'draft'
     ORDER BY v.version_number DESC`
  ).bind(pageId).all()

  return result.results.map(row => toVersionDto(row, false))
}

export async function getVersion(db, pageId, versionId) {
  const row = await db.prepare(
    `SELECT v.*, b.version_number AS based_on_version_number
     FROM cms_versions v
     LEFT JOIN cms_versions b ON b.id = v.based_on_version_id
     WHERE v.id = ? AND v.page_id = ? AND v.status != 'draft'`
  ).bind(versionId, pageId).first()

  return row ? toVersionDto(row, true) : null
}

async function nextVersionNumber(db, pageId) {
  const latest = await db.prepare(
    `SELECT COALESCE(MAX(version_number), 0) AS value FROM cms_versions WHERE page_id = ? AND status != 'draft'`
  ).bind(pageId).first()
  return Number(latest?.value || 0) + 1
}

function insertDraftStatement(db, pageId, versionNumber, contentJson, at, basedOnVersionId, actor) {
  return db.prepare(
    `INSERT INTO cms_versions
     (id, page_id, version_number, status, content_json, created_at, created_by, published_at, based_on_version_id)
     VALUES (?, ?, ?, 'draft', ?, ?, ?, NULL, ?)`
  ).bind(cryptoRandomId('ver'), pageId, versionNumber, contentJson, at, actor, basedOnVersionId)
}

function normalizeTitle(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
}

