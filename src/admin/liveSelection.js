// Click-to-edit for the live preview. Page components rendered with cmsEditMode tag their
// CMS-backed elements with data-cms-field="<content path>". Selection always works on those REAL
// DOM elements: no stored coordinates, no separately positioned hit areas.
import { getAtPath } from './contentEditor'
import { isImageKey, isMediaRef } from '../lib/media'

// The CMS element for a click inside the preview, or null for layout/empty areas.
// Background images sit under decorative overlays and layout containers, so when nothing tagged
// is under the pointer directly, the topmost tagged IMAGE under the pointer is used.
export function fieldElementFromClick(event, root) {
  const direct = event.target.closest?.('[data-cms-field]')
  const under = document.elementsFromPoint(event.clientX, event.clientY)
  const image = under.find(element => root.contains(element) && element.matches('img[data-cms-field]')) || null
  if (image && (!direct || direct.tagName === 'SECTION')) return image
  if (direct && root.contains(direct)) return direct
  return image
}

// What a data-cms-field refers to in the content, and which property editor it needs.
// Every field is a path into the page's own content object. Conventions (Home):
// - "<group>.button": that group's button (ctaLabel/ctaUrl or label/url)
// - "<group>.<name>" where the group has <name>Label + <name>Url: a link (e.g. hero.descriptionLink)
// - "<group>.<name>" where the group has <name>BeforeLink/...: a sentence with an inline link
// - a url field tagged with data-cms-text-field: a link whose text is a shared label
export const toPath = field => String(field).split('.').map(segment => (/^\d+$/.test(segment) ? Number(segment) : segment))

export function describeField(field, content, tagName = '', { textField = null } = {}) {
  const path = toPath(field)
  const last = path.at(-1)
  const parentPath = path.slice(0, -1)
  const parent = getAtPath(content, parentPath)
  const value = getAtPath(content, path)

  if (last === 'button' && parent && typeof parent === 'object') {
    if (typeof parent.ctaLabel === 'string') {
      return { field, kind: 'button', label: 'Button', textPath: [...parentPath, 'ctaLabel'], urlPath: [...parentPath, 'ctaUrl'] }
    }
    if (typeof parent.label === 'string' && typeof parent.url === 'string') {
      return { field, kind: 'button', label: 'Button', textPath: [...parentPath, 'label'], urlPath: [...parentPath, 'url'] }
    }
    return null
  }

  if (parent && typeof parent[`${last}Label`] === 'string' && typeof parent[`${last}Url`] === 'string') {
    return { field, kind: 'button', label: 'Link', textPath: [...parentPath, `${last}Label`], urlPath: [...parentPath, `${last}Url`] }
  }

  if (textField && typeof value === 'string' && typeof getAtPath(content, toPath(textField)) === 'string') {
    return { field, kind: 'button', label: 'Link', textPath: toPath(textField), urlPath: path }
  }

  if (parent && last === 'label' && /^A$/i.test(tagName) && typeof value === 'string' && typeof parent.url === 'string') {
    return { field, kind: 'button', label: 'Link', textPath: path, urlPath: [...parentPath, 'url'] }
  }

  if (parent && typeof parent[`${last}BeforeLink`] === 'string') {
    return { field, kind: 'paragraph', label: 'Paragraph', sentence: [...parentPath, last] }
  }

  if (Array.isArray(value) && value.every(line => typeof line === 'string')) {
    return { field, kind: 'heading', label: 'Heading', path, lines: true }
  }
  if (isImageKey(String(last)) && (typeof value === 'string' || isMediaRef(value))) {
    return { field, kind: 'image', label: 'Image', path, altPath: altPathFor(content, path) }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return describeCard(field, value, path, content)
  }
  if (typeof value === 'string') {
    // A title is a heading wherever it renders (a card title also appears in a styled <span>).
    if (/^H[1-6]$/i.test(tagName) || last === 'title' || last === 'heading') return { field, kind: 'heading', label: 'Heading', path }
    if (value.length > 80 || value.includes('\n')) return { field, kind: 'paragraph', label: 'Paragraph', path }
    return { field, kind: 'text', label: 'Text', path }
  }
  return null
}

const CARD_TITLE_KEYS = ['title', 'heading', 'label', 'name']
const CARD_DESCRIPTION_KEYS = ['body', 'description']

// A card/list item: its title, description, image and link, each edited in place (no raw JSON).
function describeCard(field, card, path, content) {
  const key = keys => keys.find(name => typeof card[name] === 'string')
  const titleKey = key(CARD_TITLE_KEYS)
  const descriptionKey = key(CARD_DESCRIPTION_KEYS)
  const imageKey = Object.keys(card).find(name => isImageKey(name) && (typeof card[name] === 'string' || isMediaRef(card[name])))
  return {
    field,
    kind: 'card',
    label: 'Card',
    path,
    titlePath: titleKey ? [...path, titleKey] : null,
    descriptionPath: descriptionKey ? [...path, descriptionKey] : null,
    image: imageKey ? { path: [...path, imageKey], altPath: altPathFor(content, [...path, imageKey]) } : null,
    urlPath: typeof card.url === 'string' ? [...path, 'url'] : null,
  }
}

function altPathFor(content, path) {
  const parent = getAtPath(content, path.slice(0, -1))
  const altKey = `${path.at(-1)}Alt`
  return parent && typeof parent === 'object' && altKey in parent ? [...path.slice(0, -1), altKey] : null
}

// A sentence stored as <prefix>BeforeLink + <prefix>LinkLabel (the linked phrase) + <prefix>AfterLink,
// edited as one paragraph. The linked phrase stays linked; text around it is split back on save.
export function sentenceText(content, prefixPath) {
  const parent = getAtPath(content, prefixPath.slice(0, -1)) || {}
  const key = prefixPath.at(-1)
  return [parent[`${key}BeforeLink`], parent[`${key}LinkLabel`], parent[`${key}AfterLink`]]
    .filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}

export function sentenceParts(content, prefixPath, text) {
  const parent = getAtPath(content, prefixPath.slice(0, -1)) || {}
  const key = prefixPath.at(-1)
  const phrase = parent[`${key}LinkLabel`] || ''
  const index = phrase ? text.indexOf(phrase) : -1
  if (index < 0) return { [`${key}BeforeLink`]: text.trim(), [`${key}AfterLink`]: '' }
  return {
    [`${key}BeforeLink`]: text.slice(0, index).trim(),
    [`${key}AfterLink`]: text.slice(index + phrase.length).trim(),
  }
}
