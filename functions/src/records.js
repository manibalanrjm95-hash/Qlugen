import { getFirestore } from 'firebase-admin/firestore'

// Firestore layout (replaces the D1 tables; see docs in cms.js):
//   cms_pages/{pageId}                         page record (was cms_pages)
//   cms_pages/{pageId}/cms_versions/draft      the page's single DRAFT (one per page by construction)
//   cms_pages/{pageId}/cms_versions/{verId}    published / archived versions (immutable)
//   cms_route_keys/{key}                       URL + slug uniqueness (was UNIQUE(route) / slug check)
//   cms_audit_log/{auditId}                    audit trail (was cms_audit_log)
//   cms_media/{mediaId}                        media metadata (was cms_media); files in Storage
export const COLLECTIONS = {
  pages: 'cms_pages',
  versions: 'cms_versions', // subcollection of cms_pages (also queried as a collection group)
  routeKeys: 'cms_route_keys',
  audit: 'cms_audit_log',
  media: 'cms_media',
}
export const DRAFT_DOC = 'draft'

// Actor for local development (emulator bypass only). Everywhere else the actor is the verified
// Firebase identity (see auth.js). Actor values sent by the browser are never trusted.
export const SYSTEM_ACTOR = 'local-admin'

export const db = () => getFirestore()
export const pageRef = pageId => db().collection(COLLECTIONS.pages).doc(pageId)
export const versionsRef = pageId => pageRef(pageId).collection(COLLECTIONS.versions)
export const draftRef = pageId => versionsRef(pageId).doc(DRAFT_DOC)
export const versionRef = (pageId, versionId) => versionsRef(pageId).doc(versionId)
export const mediaRef = mediaId => db().collection(COLLECTIONS.media).doc(mediaId)
export const routeKeyRef = key => db().collection(COLLECTIONS.routeKeys).doc(key)

// One uniqueness document per URL and per slug (Firestore has no unique constraints).
export const routeKeysFor = ({ route, slug }) => [`route~${encodeURIComponent(route)}`, `slug~${encodeURIComponent(slug)}`]

export function nowIso() {
  return new Date().toISOString()
}

export function cryptoRandomId(prefix) {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return `${prefix}_${[...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')}`
}

export function parseContent(contentJson) {
  return JSON.parse(contentJson)
}

// Same response shapes as the Cloudflare Worker, so the admin UI is unchanged.
export function toPageDto(page) {
  return {
    id: page.id,
    route: page.route,
    slug: page.slug,
    contentType: page.contentType,
    templateId: page.templateId,
    title: page.title,
    status: page.status || (page.publishedVersionId ? 'published' : 'draft'),
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    latestVersion: page.publishedVersionNumber ?? undefined,
    hasDraft: page.hasDraft === true,
  }
}

export function toVersionDto(version, includeContent = true) {
  const dto = {
    id: version.id,
    pageId: version.pageId,
    versionNumber: version.versionNumber,
    status: version.status,
    createdAt: version.createdAt,
    createdBy: version.createdBy ?? null,
    publishedAt: version.publishedAt ?? null,
  }
  if (version.basedOnVersionId) dto.basedOnVersionId = version.basedOnVersionId
  if (version.basedOnVersionNumber != null) dto.restoredFromVersion = version.basedOnVersionNumber
  if (includeContent) dto.content = parseContent(version.contentJson)
  return dto
}

// Audit entry written in the same transaction / batch as the change it records.
export function auditEntry({ pageId = null, action, before = null, after = null, actor = SYSTEM_ACTOR }) {
  const id = cryptoRandomId('audit')
  return {
    ref: db().collection(COLLECTIONS.audit).doc(id),
    data: { id, pageId, action, beforeJson: toJson(before), afterJson: toJson(after), createdAt: nowIso(), actor },
  }
}

// Media ids and storage paths referenced anywhere in a page's content (the Worker searched the raw
// JSON text; Firestore cannot, so every version stores this list for "media in use" queries).
const MEDIA_ID = /media_[a-f0-9]{32}/g
const MEDIA_PATH = /cms\/\d{4}\/\d{2}\/[a-f0-9]{32}-[a-z0-9-]+\.(?:jpg|png|webp|avif)/g

export function mediaRefsIn(contentJson) {
  const text = String(contentJson || '')
  return [...new Set([...(text.match(MEDIA_ID) || []), ...(text.match(MEDIA_PATH) || [])])].slice(0, 200)
}

function toJson(value) {
  if (value == null) return null
  return typeof value === 'string' ? value : JSON.stringify(value)
}
