import { auditStatement, cryptoRandomId, nowIso } from './records.js'
import { httpError } from './http.js'

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const ALLOWED_MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

const MAX_ALT_LENGTH = 500
const MEDIA_KEY_PATTERN = /^cms\/\d{4}\/\d{2}\/[a-f0-9]{32}-[a-z0-9-]+\.(jpg|png|webp|avif)$/

export async function listMedia(db, { query, limit = 200 } = {}) {
  const term = query?.trim() ? `%${query.trim().replace(/[\\%_]/g, char => `\\${char}`)}%` : null
  const result = await db.prepare(
    `SELECT m.*, ${inUseSql('m')} AS in_use
     FROM cms_media m
     WHERE ?1 IS NULL
        OR m.filename LIKE ?1 ESCAPE '\\'
        OR m.original_filename LIKE ?1 ESCAPE '\\'
     ORDER BY m.created_at DESC
     LIMIT ?2`
  ).bind(term, Math.min(Math.max(Number(limit) || 200, 1), 500)).all()

  return result.results.map(toMediaDto)
}

export async function getMedia(db, id) {
  const row = await db.prepare(
    `SELECT m.*, ${inUseSql('m')} AS in_use FROM cms_media m WHERE m.id = ?`
  ).bind(id).first()
  if (!row) return null

  return { ...toMediaDto(row), usage: await findUsage(db, row) }
}

export async function uploadMedia(request, env, actor) {
  const bucket = requireBucket(env)
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
  const r2Key = `cms/${createdAt.slice(0, 4)}/${createdAt.slice(5, 7)}/${id.slice('media_'.length)}-${filename}`
  const { width, height } = readImageDimensions(bytes, detectedType)
  const publicUrl = buildPublicUrl(env, r2Key)

  if (await bucket.head(r2Key)) throw httpError(409, 'Media key already exists')

  await bucket.put(r2Key, bytes, {
    httpMetadata: { contentType: detectedType, cacheControl: 'public, max-age=31536000, immutable' },
    customMetadata: { mediaId: id },
  })

  try {
    await env.CMS_DB.batch([
      env.CMS_DB.prepare(
        `INSERT INTO cms_media
         (id, r2_key, filename, original_filename, mime_type, size_bytes, width, height, alt_text, public_url, created_at, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id, r2Key, filename, String(file.name || '').slice(0, 255) || null, detectedType, bytes.byteLength,
        width, height, altText, publicUrl, createdAt, actor,
      ),
      auditStatement(env.CMS_DB, { action: 'media_uploaded', after: { id, r2Key, filename, mimeType: detectedType }, actor }),
    ])
  } catch (error) {
    await bucket.delete(r2Key)
    throw error
  }

  return getMedia(env.CMS_DB, id)
}

export async function updateMediaAlt(db, id, altText, actor) {
  if (typeof altText !== 'string') throw httpError(400, '"altText" must be a string')
  const existing = await db.prepare('SELECT alt_text FROM cms_media WHERE id = ?').bind(id).first()
  if (!existing) return null

  const nextAlt = cleanAlt(altText)
  await db.batch([
    db.prepare('UPDATE cms_media SET alt_text = ? WHERE id = ?').bind(nextAlt, id),
    auditStatement(db, { action: 'media_alt_updated', before: { id, altText: existing.alt_text }, after: { id, altText: nextAlt }, actor }),
  ])
  return getMedia(db, id)
}

export async function deleteMedia(env, id, actor) {
  const media = await getMedia(env.CMS_DB, id)
  if (!media) return null
  if (media.usage.length > 0) {
    throw httpError(409, 'Media is used by CMS content and cannot be deleted', { usage: media.usage })
  }

  // Re-check usage inside the DELETE itself so a draft saved after the check above still protects the file.
  const result = await env.CMS_DB.prepare(
    `DELETE FROM cms_media WHERE id = ? AND NOT ${inUseSql('cms_media')}`
  ).bind(id).run()
  if (!result.meta?.changes) {
    const current = await getMedia(env.CMS_DB, id)
    throw httpError(409, 'Media is used by CMS content and cannot be deleted', { usage: current?.usage || [] })
  }

  await auditStatement(env.CMS_DB, {
    action: 'media_deleted',
    before: { id, r2Key: media.r2Key, filename: media.filename },
    actor,
  }).run()
  await requireBucket(env).delete(media.r2Key)
  return { deleted: true, id }
}

export async function serveMedia(request, env, key) {
  if (!MEDIA_KEY_PATTERN.test(key)) return new Response('Not found', { status: 404 })

  const object = await requireBucket(env).get(key)
  if (!object) return new Response('Not found', { status: 404 })

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('ETag', object.httpEtag)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Content-Security-Policy', "default-src 'none'")
  headers.set('Cross-Origin-Resource-Policy', 'cross-origin')
  headers.set('Access-Control-Allow-Origin', '*')

  return new Response(request.method === 'HEAD' ? null : object.body, { headers })
}

export function sniffImageType(bytes) {
  const ascii = (start, end) => String.fromCharCode(...bytes.subarray(start, end))

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte)) return 'image/png'
  if (bytes.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp'
  if (bytes.length >= 16 && ascii(4, 8) === 'ftyp') {
    const boxSize = Math.min(readUint32BE(bytes, 0), bytes.length, 64)
    const brands = [ascii(8, 12)]
    for (let offset = 16; offset + 4 <= boxSize; offset += 4) brands.push(ascii(offset, offset + 4))
    if (brands.includes('avif') || brands.includes('avis')) return 'image/avif'
  }
  return null
}

export function readImageDimensions(bytes, type) {
  try {
    if (type === 'image/png') return pngDimensions(bytes)
    if (type === 'image/jpeg') return jpegDimensions(bytes)
    if (type === 'image/webp') return webpDimensions(bytes)
    if (type === 'image/avif') return avifDimensions(bytes)
  } catch {
    // Dimensions are optional metadata; fall through.
  }
  return { width: null, height: null }
}

function pngDimensions(bytes) {
  return { width: readUint32BE(bytes, 16), height: readUint32BE(bytes, 20) }
}

function jpegDimensions(bytes) {
  let offset = 2
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1
      continue
    }
    const marker = bytes[offset + 1]
    if (marker === 0xff) {
      offset += 1
      continue
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      offset += 2
      continue
    }
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)
    if (isStartOfFrame) {
      return { height: readUint16BE(bytes, offset + 5), width: readUint16BE(bytes, offset + 7) }
    }
    offset += 2 + readUint16BE(bytes, offset + 2)
  }
  return { width: null, height: null }
}

function webpDimensions(bytes) {
  const chunk = String.fromCharCode(...bytes.subarray(12, 16))
  if (chunk === 'VP8 ') {
    return { width: readUint16LE(bytes, 26) & 0x3fff, height: readUint16LE(bytes, 28) & 0x3fff }
  }
  if (chunk === 'VP8L') {
    const [b0, b1, b2, b3] = bytes.subarray(21, 25)
    return {
      width: 1 + (((b1 & 0x3f) << 8) | b0),
      height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
    }
  }
  if (chunk === 'VP8X') {
    return { width: 1 + readUint24LE(bytes, 24), height: 1 + readUint24LE(bytes, 27) }
  }
  return { width: null, height: null }
}

function avifDimensions(bytes) {
  // Use the largest image spatial extent ("ispe") box; grid images also carry smaller tile extents.
  let best = { width: null, height: null }
  const limit = Math.min(bytes.length - 16, 256 * 1024)
  for (let offset = 4; offset < limit; offset += 1) {
    if (bytes[offset] === 0x69 && bytes[offset + 1] === 0x73 && bytes[offset + 2] === 0x70 && bytes[offset + 3] === 0x65) {
      const width = readUint32BE(bytes, offset + 8)
      const height = readUint32BE(bytes, offset + 12)
      if (width * height > (best.width || 0) * (best.height || 0)) best = { width, height }
    }
  }
  return best
}

function readUint16BE(bytes, offset) {
  return (bytes[offset] << 8) | bytes[offset + 1]
}

function readUint16LE(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8)
}

function readUint24LE(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16)
}

function readUint32BE(bytes, offset) {
  return ((bytes[offset] << 24) >>> 0) + ((bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3])
}

function inUseSql(alias) {
  return `EXISTS(SELECT 1 FROM cms_versions v WHERE instr(v.content_json, ${alias}.id) > 0 OR instr(v.content_json, ${alias}.r2_key) > 0)`
}

async function findUsage(db, row) {
  const result = await db.prepare(
    `SELECT p.id AS page_id, p.title, v.status, v.version_number
     FROM cms_versions v
     JOIN cms_pages p ON p.id = v.page_id
     WHERE instr(v.content_json, ?) > 0 OR instr(v.content_json, ?) > 0
     ORDER BY p.id, v.version_number DESC`
  ).bind(row.id, row.r2_key).all()

  return result.results.map(usage => ({
    pageId: usage.page_id,
    title: usage.title,
    status: usage.status,
    versionNumber: usage.version_number,
  }))
}

function toMediaDto(row) {
  return {
    id: row.id,
    r2Key: row.r2_key,
    filename: row.filename,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    width: row.width,
    height: row.height,
    altText: row.alt_text || '',
    publicUrl: row.public_url,
    createdAt: row.created_at,
    createdBy: row.created_by,
    inUse: row.in_use === 1 || row.in_use === true,
  }
}

function buildPublicUrl(env, key) {
  const base = String(env.MEDIA_PUBLIC_BASE_URL || '').trim().replace(/\/+$/, '')
  return `${base || '/media'}/${key}`
}

function requireBucket(env) {
  if (!env.CMS_MEDIA) throw httpError(500, 'Media storage (CMS_MEDIA R2 binding) is not configured')
  return env.CMS_MEDIA
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
