// Image field helpers shared by the public site, the /admin CMS and the CMS Worker.
//
// Image fields accept two shapes while content migrates to the media library:
//   legacy: "image": "/uploads/example.webp"
//   new:    "image": { "id": "media_xxx", "url": "/media/cms/...", "alt": "..." }
// Public components expect plain URL strings, so content holding media references
// must pass through normalizeMediaContent() before it is rendered.

const IMAGE_KEY = /^(image|portrait|logo)$|Image$/

export function isImageKey(key) {
  return typeof key === 'string' && IMAGE_KEY.test(key)
}

export function altKeyFor(key) {
  return `${key}Alt`
}

export function isMediaRef(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && typeof value.url === 'string'
}

export function imageUrl(value) {
  if (typeof value === 'string') return value
  return isMediaRef(value) ? value.url : ''
}

export function imageAlt(value, fallback = '') {
  return isMediaRef(value) && value.alt ? value.alt : fallback
}

export function toMediaRef(media, alt) {
  return { id: media.id, url: media.publicUrl, alt: alt ?? media.altText ?? '' }
}

// Deep-copies content, replacing media references in image fields with their URL
// and copying a non-empty reference alt into the sibling `<key>Alt` field.
export function normalizeMediaContent(content, { resolveUrl = url => url } = {}) {
  if (Array.isArray(content)) return content.map(item => normalizeMediaContent(item, { resolveUrl }))
  if (!content || typeof content !== 'object') return content

  const output = {}
  const altOverrides = {}
  for (const [key, child] of Object.entries(content)) {
    if (isImageKey(key) && isMediaRef(child)) {
      output[key] = resolveUrl(child.url)
      if (child.alt) altOverrides[altKeyFor(key)] = child.alt
    } else if (isImageKey(key) && typeof child === 'string') {
      output[key] = resolveUrl(child)
    } else {
      output[key] = normalizeMediaContent(child, { resolveUrl })
    }
  }
  return Object.assign(output, altOverrides)
}
