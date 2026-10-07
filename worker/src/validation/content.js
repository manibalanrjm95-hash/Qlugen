import { isImageKey, isMediaRef } from '../../../src/lib/media.js'
import { findDesignKeys } from '../../../src/lib/designLock.js'

const CONTENT_TYPES = new Set([
  'home',
  'globalNavigation',
  'globalFooter',
  'globalSeo',
  'globalNotFound',
  'capabilitiesOverview',
  'capabilityDetail',
  'productsOverview',
  'productDetail',
  'industriesOverview',
  'industryDetail',
  'agenticOverview',
  'agenticDetail',
  'howWeWork',
  'technology',
  'insightsOverview',
  'insightArticle',
  'company',
  'about',
  'leadership',
  'careers',
  'contact',
  'legal',
])


export function validateContent(contentType, content) {
  const errors = []

  if (!CONTENT_TYPES.has(contentType)) {
    errors.push(`Unsupported content type: ${contentType}`)
  }

  if (!isPlainObject(content)) {
    errors.push('Content must be a JSON object')
    return { ok: false, errors }
  }

  for (const path of findDesignKeys(content)) {
    errors.push(`Design/layout field is not allowed (design is code-controlled): ${path}`)
  }
  findInvalidImages(content, [], errors)
  findInvalidIcons(content, [], errors)
  return { ok: errors.length === 0, errors }
}

function findInvalidImages(value, path, errors) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => findInvalidImages(item, [...path, String(index)], errors))
    return
  }

  if (!isPlainObject(value)) return

  for (const [key, child] of Object.entries(value)) {
    const childPath = [...path, key]
    if (isImageKey(key) && (typeof child === 'string' || isPlainObject(child))) {
      validateImageValue(child, childPath.join('.'), errors)
    } else {
      findInvalidImages(child, childPath, errors)
    }
  }
}

function validateImageValue(value, path, errors) {
  if (typeof value === 'string') {
    if (!isSafeImageUrl(value)) errors.push(`Image URL is not allowed: ${path}`)
    return
  }

  if (!isMediaRef(value)) {
    errors.push(`Image reference must have a string "url": ${path}`)
    return
  }
  if (!isSafeImageUrl(value.url)) errors.push(`Image URL is not allowed: ${path}.url`)
  if (value.id != null && typeof value.id !== 'string') errors.push(`Image reference "id" must be a string: ${path}.id`)
  if (value.alt != null && typeof value.alt !== 'string') errors.push(`Image reference "alt" must be a string: ${path}.alt`)
}

// Image URLs end up inside CSS url(...) values, so quotes, parentheses, whitespace and other
// characters that could escape that context are rejected along with non-http(s) schemes.
function isSafeImageUrl(url) {
  const trimmed = url.trim()
  if (trimmed === '') return true
  return /^(https?:\/\/|\/(?!\/))/i.test(trimmed) && !/[\s"'()\\;{}<>`]/.test(trimmed)
}

// Icons are chosen from code-defined icon sets; content may only name one, never supply markup or URLs.
function findInvalidIcons(value, path, errors) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => findInvalidIcons(item, [...path, String(index)], errors))
    return
  }
  if (!isPlainObject(value)) return
  for (const [key, child] of Object.entries(value)) {
    if (key === 'icon' && !(typeof child === 'string' && /^[A-Za-z0-9_]{0,64}$/.test(child))) {
      errors.push(`Icon must be a code-defined icon name: ${[...path, key].join('.')}`)
    }
    findInvalidIcons(child, [...path, key], errors)
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
