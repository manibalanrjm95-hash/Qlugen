// Content validation shared by the CMS Worker (rollback) and the Firebase CMS Functions.
// (Moved from worker/src/validation/content.js; behaviour unchanged.)
import { isImageKey, isMediaRef } from '../lib/media.js'
import { findDesignKeys } from '../lib/designLock.js'
import { getTemplate, templateContentErrors, templateContentTypes } from './templateRegistry.js'

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
  ...templateContentTypes(),
])


// Validation for a page's draft: the general content rules, plus the template schema for pages
// created with "+ Add Page" (only the template's fields, with the template's field types).
export function validatePageContent(page, content) {
  const result = validateContent(page.contentType, content)
  const template = page.id.startsWith('custom-') ? getTemplate(page.templateId) : null
  if (template && result.ok) result.errors.push(...templateContentErrors(template, content))
  return { ok: result.errors.length === 0, errors: result.errors }
}

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
  findInvalidLinks(content, [], errors)
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

// Link fields (url, linkUrl, ctaUrl, ...) may only point to a site path, an anchor, a web page,
// an email address or a phone number - never javascript:, data: or other executable schemes.
const LINK_KEY = /^(url|href|link)$|(Url|Href)$/
const SAFE_LINK = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i

function findInvalidLinks(value, path, errors) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => findInvalidLinks(item, [...path, String(index)], errors))
    return
  }
  if (!isPlainObject(value)) return
  for (const [key, child] of Object.entries(value)) {
    if (LINK_KEY.test(key) && typeof child === 'string') {
      const link = child.trim()
      if (link && (!SAFE_LINK.test(link) || /[\s"'<>`\\]/.test(link))) errors.push(`Link is not allowed: ${[...path, key].join('.')}`)
    } else {
      findInvalidLinks(child, [...path, key], errors)
    }
  }
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
