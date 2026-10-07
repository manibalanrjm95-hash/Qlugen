// Until Cloudflare Access supplies an authenticated identity, every write is attributed to this
// placeholder. Actor values sent by the browser are never trusted.
export const SYSTEM_ACTOR = 'local-admin'

export function nowIso() {
  return new Date().toISOString()
}

export function cryptoRandomId(prefix) {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const value = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')
  return `${prefix}_${value}`
}

export function parseContentRow(value) {
  return JSON.parse(value)
}

export function toPageDto(row) {
  return {
    id: row.id,
    route: row.route,
    slug: row.slug,
    contentType: row.content_type,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    latestVersion: row.latest_version ?? undefined,
    hasDraft: row.has_draft === 1 || row.has_draft === true,
  }
}

export function toVersionDto(row, includeContent = true) {
  const dto = {
    id: row.id,
    pageId: row.page_id,
    versionNumber: row.version_number,
    status: row.status,
    createdAt: row.created_at,
    createdBy: row.created_by,
    publishedAt: row.published_at,
  }
  if (row.based_on_version_id) dto.basedOnVersionId = row.based_on_version_id
  if (row.based_on_version_number != null) dto.restoredFromVersion = row.based_on_version_number

  if (includeContent) dto.content = parseContentRow(row.content_json)
  return dto
}

// Returns an unexecuted statement so audit rows can join the same atomic batch as the change they record.
export function auditStatement(db, { pageId = null, action, before = null, after = null }) {
  return db.prepare(
    `INSERT INTO cms_audit_log
     (id, page_id, action, before_json, after_json, created_at, actor)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(cryptoRandomId('audit'), pageId, action, toJson(before), toJson(after), nowIso(), SYSTEM_ACTOR)
}

function toJson(value) {
  if (value == null) return null
  return typeof value === 'string' ? value : JSON.stringify(value)
}
