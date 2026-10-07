import { auditStatement, cryptoRandomId, nowIso, parseContentRow, SYSTEM_ACTOR, toPageDto, toVersionDto } from './records.js'
import { httpError } from './http.js'

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

export async function upsertDraft(db, page, content) {
  const existing = await getDraft(db, page.id)
  const at = nowIso()
  const contentJson = JSON.stringify(content)

  if (existing) {
    await db.batch([
      db.prepare(
        `UPDATE cms_versions SET content_json = ?, created_at = ?, created_by = ?
         WHERE id = ? AND status = 'draft'`
      ).bind(contentJson, at, SYSTEM_ACTOR, existing.id),
      auditStatement(db, { pageId: page.id, action: 'draft_saved', before: existing.content, after: contentJson }),
    ])
    return getDraft(db, page.id)
  }

  await db.batch([
    insertDraftStatement(db, page.id, await nextVersionNumber(db, page.id), contentJson, at, null),
    auditStatement(db, { pageId: page.id, action: 'draft_saved', after: contentJson }),
  ])
  return getDraft(db, page.id)
}

export async function deleteDraft(db, page) {
  const draft = await getDraft(db, page.id)
  if (!draft) return { deleted: false }

  await db.batch([
    db.prepare(`DELETE FROM cms_versions WHERE id = ? AND status = 'draft'`).bind(draft.id),
    auditStatement(db, { pageId: page.id, action: 'draft_deleted', before: draft.content }),
  ])
  return { deleted: true }
}

export async function publishDraft(db, page, validate, { expectedDraftSavedAt } = {}) {
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
    ).bind(id, page.id, versionNumber, contentJson, draft.createdAt, SYSTEM_ACTOR, at, draft.basedOnVersionId ?? null),
    db.prepare('UPDATE cms_pages SET published_version_id = ?, updated_at = ? WHERE id = ?').bind(id, at, page.id),
    db.prepare(`DELETE FROM cms_versions WHERE id = ? AND status = 'draft'`).bind(draft.id),
    auditStatement(db, {
      pageId: page.id,
      action: 'published',
      before: previous ? { versionNumber: previous.versionNumber } : null,
      after: { versionNumber, archivedVersion: previous?.versionNumber ?? null },
    }),
  ])

  return getPage(db, page.id)
}

export async function restoreVersion(db, page, versionId) {
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
    insertDraftStatement(db, page.id, await nextVersionNumber(db, page.id), source.content_json, nowIso(), source.id),
    auditStatement(db, {
      pageId: page.id,
      action: 'version_restored',
      before: existing ? existing.content : null,
      after: { restoredFromVersion: source.version_number },
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

function insertDraftStatement(db, pageId, versionNumber, contentJson, at, basedOnVersionId) {
  return db.prepare(
    `INSERT INTO cms_versions
     (id, page_id, version_number, status, content_json, created_at, created_by, published_at, based_on_version_id)
     VALUES (?, ?, ?, 'draft', ?, ?, ?, NULL, ?)`
  ).bind(cryptoRandomId('ver'), pageId, versionNumber, contentJson, at, SYSTEM_ACTOR, basedOnVersionId)
}
