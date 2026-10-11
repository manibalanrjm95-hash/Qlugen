import { FieldPath } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { httpError } from './http.js'
import { readImageDimensions, sniffImageType } from './imageInfo.js'
import { COLLECTIONS, auditEntry, cryptoRandomId, db, mediaRef, nowIso } from './records.js'

// CMS media: files in Firebase Storage (was R2), metadata in Firestore cms_media (was D1).
// - Storage path is the same as the R2 key: cms/YYYY/MM/<32 hex>-<name>.<ext>; files are immutable
//   (a replacement image is a new file) and publicly readable (Storage rules: read-only cms/**).
// - Content keeps referencing images as "/media/<path>" exactly as before, so no published version
//   ever needs rewriting; the website resolves that to the Storage URL (src/cms/storageUrls.js).
// - A file used by ANY draft, published or archived version can never be deleted.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const ALLOWED_MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}
const MAX_ALT_LENGTH = 500
const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable'

const bucket = () => getStorage().bucket()

export async function listMedia({ query, limit = 200 } = {}) {
  const max = Math.min(Math.max(Number(limit) || 200, 1), 500)
  const term = query?.trim().toLowerCase() || ''
  const snapshot = await db().collection(COLLECTIONS.media).orderBy('createdAt', 'desc').limit(500).get()
  const items = snapshot.docs
    .map(doc => doc.data())
    .filter(item => !term || item.filename?.toLowerCase().includes(term) || item.originalFilename?.toLowerCase().includes(term))
    .slice(0, max)
  const inUse = await Promise.all(items.map(item => isInUse(item)))
  return items.map((item, index) => toMediaDto(item, inUse[index]))
}

export async function getMedia(id) {
  const doc = await mediaRef(id).get()
  if (!doc.exists) return null
  const usage = await findUsage(doc.data())
  return { ...toMediaDto(doc.data(), usage.length > 0), usage }
}

export async function uploadMedia(request, actor) {
  const declaredLength = Number(request.headers.get('content-length') || 0)
  if (declaredLength > MAX_UPLOAD_BYTES + 64 * 1024) {
    throw httpError(413, `File is too large. Maximum size is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`)
  }

  let form
  try {
    form = await request.formData()
  } catch {
    throw httpError(400, 'Upload must be multipart/form-data with a "file" field')
  }

  const file = form.get('file')
  if (!file || typeof file === 'string') throw httpError(400, 'Missing "file" field')
  if (file.size === 0) throw httpError(400, 'File is empty')
  if (file.size > MAX_UPLOAD_BYTES) {
    throw httpError(413, `File is too large. Maximum size is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`)
  }

  const declaredType = String(file.type || '').toLowerCase()
  if (!ALLOWED_MIME_TYPES[declaredType]) {
    throw httpError(415, 'Unsupported file type. Allowed: JPEG, PNG, WebP, AVIF.')
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const detectedType = sniffImageType(bytes)
  if (detectedType !== declaredType) {
    throw httpError(415, 'File contents do not match a supported image type.')
  }

  const altText = cleanAlt(form.get('alt'))
  const extension = ALLOWED_MIME_TYPES[detectedType]
  const id = cryptoRandomId('media')
  const createdAt = nowIso()
  const filename = `${safeBaseName(file.name)}.${extension}`
  const storagePath = `cms/${createdAt.slice(0, 4)}/${createdAt.slice(5, 7)}/${id.slice('media_'.length)}-${filename}`
  const { width, height } = readImageDimensions(bytes, detectedType)

  const object = bucket().file(storagePath)
  try {
    // ifGenerationMatch: 0 -> never overwrite an existing file.
    await object.save(Buffer.from(bytes), {
      resumable: false,
      contentType: detectedType,
      preconditionOpts: { ifGenerationMatch: 0 },
      metadata: { cacheControl: IMMUTABLE_CACHE, metadata: { mediaId: id } },
    })
  } catch (error) {
    if (error?.code === 412) throw httpError(409, 'Media key already exists')
    throw error
  }

  try {
    const batch = db().batch()
    batch.create(mediaRef(id), {
      id, storagePath, filename, originalFilename: String(file.name || '').slice(0, 255) || null, mimeType: detectedType,
      sizeBytes: bytes.byteLength, width, height, altText, publicUrl: `/media/${storagePath}`, createdAt, createdBy: actor,
    })
    const audit = auditEntry({ action: 'media_uploaded', after: { id, r2Key: storagePath, filename, mimeType: detectedType }, actor })
    batch.create(audit.ref, audit.data)
    await batch.commit()
  } catch (error) {
    await object.delete({ ignoreNotFound: true })
    throw error
  }

  return getMedia(id)
}

export async function updateMediaAlt(id, altText, actor) {
  if (typeof altText !== 'string') throw httpError(400, '"altText" must be a string')
  const nextAlt = cleanAlt(altText)
  const found = await db().runTransaction(async tx => {
    const doc = await tx.get(mediaRef(id))
    if (!doc.exists) return false
    tx.update(mediaRef(id), { altText: nextAlt })
    const audit = auditEntry({ action: 'media_alt_updated', before: { id, altText: doc.data().altText }, after: { id, altText: nextAlt }, actor })
    tx.create(audit.ref, audit.data)
    return true
  })
  return found ? getMedia(id) : null
}

export async function deleteMedia(id, actor) {
  const media = await getMedia(id)
  if (!media) return null
  if (media.usage.length > 0) {
    throw httpError(409, 'Media is used by CMS content and cannot be deleted', { usage: media.usage })
  }

  // Re-check usage inside the delete transaction so a draft saved after the check above still
  // protects the file.
  await db().runTransaction(async tx => {
    const [doc, used] = await Promise.all([tx.get(mediaRef(id)), tx.get(usageQuery(media).limit(1))])
    if (!doc.exists) throw httpError(404, 'Media not found')
    if (!used.empty) throw httpError(409, 'Media is used by CMS content and cannot be deleted', { usage: await findUsage(doc.data()) })
    tx.delete(mediaRef(id))
    const audit = auditEntry({ action: 'media_deleted', before: { id, r2Key: media.r2Key, filename: media.filename }, actor })
    tx.create(audit.ref, audit.data)
  })
  await bucket().file(media.r2Key).delete({ ignoreNotFound: true })
  return { deleted: true, id }
}

// Every draft / published / archived version that references the file (by media id or path).
function usageQuery(item) {
  return db().collectionGroup(COLLECTIONS.versions).where('mediaRefs', 'array-contains-any', [item.id, item.storagePath || item.r2Key])
}

async function isInUse(item) {
  return !(await usageQuery(item).limit(1).get()).empty
}

async function findUsage(item) {
  const snapshot = await usageQuery(item).get()
  const versions = snapshot.docs.map(doc => doc.data())
  const pageIds = [...new Set(versions.map(version => version.pageId))]
  const pages = new Map()
  for (let index = 0; index < pageIds.length; index += 30) {
    const chunk = pageIds.slice(index, index + 30)
    const result = await db().collection(COLLECTIONS.pages).where(FieldPath.documentId(), 'in', chunk).get()
    result.docs.forEach(doc => pages.set(doc.id, doc.data()))
  }
  return versions
    .map(version => ({
      pageId: version.pageId,
      title: pages.get(version.pageId)?.title ?? null,
      status: version.status,
      versionNumber: version.versionNumber,
    }))
    .sort((a, b) => a.pageId.localeCompare(b.pageId) || b.versionNumber - a.versionNumber)
}

// Same shape as the Worker (r2Key kept as the field name the admin UI already uses).
function toMediaDto(item, inUse) {
  return {
    id: item.id,
    r2Key: item.storagePath,
    filename: item.filename,
    originalFilename: item.originalFilename ?? null,
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
    width: item.width ?? null,
    height: item.height ?? null,
    altText: item.altText || '',
    publicUrl: item.publicUrl,
    createdAt: item.createdAt,
    createdBy: item.createdBy ?? null,
    inUse: Boolean(inUse),
  }
}

function safeBaseName(name) {
  const base = String(name || '')
    .split(/[\\/]/)
    .pop()
    .replace(/\.[^.]*$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
  return base || 'image'
}

function cleanAlt(value) {
  return typeof value === 'string' ? value.trim().slice(0, MAX_ALT_LENGTH) : ''
}
