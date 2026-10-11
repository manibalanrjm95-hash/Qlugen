const hiddenKeys = new Set([
  '_id',
  '_meta',
  'contentType',
  'content_type',
  'createdAt',
  'created_at',
  'id',
  // Icons are picked from code-defined icon sets (design-controlled), so editors never change them.
  'icon',
  'internalKey',
  'key',
  'uuid',
  'pageId',
  'page_id',
  'route',
  'schema',
  'schemaId',
  'schema_id',
  'slug',
  'template',
  'updatedAt',
  'updated_at',
])

export function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function updateAtPath(value, path, nextValue) {
  const copy = clone(value)
  let current = copy
  for (let index = 0; index < path.length - 1; index += 1) {
    current = current[path[index]]
  }
  current[path.at(-1)] = nextValue
  return copy
}

export function removeAtPath(value, path) {
  const copy = clone(value)
  const index = path.at(-1)
  const parent = getAtPath(copy, path.slice(0, -1))
  parent.splice(index, 1)
  return copy
}

export function addAtPath(value, path) {
  const copy = clone(value)
  const list = getAtPath(copy, path)
  const sample = list[0]
  list.push(createEmptyLike(sample))
  return copy
}

export function moveAtPath(value, path, direction) {
  const copy = clone(value)
  const index = path.at(-1)
  const list = getAtPath(copy, path.slice(0, -1))
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= list.length) return value
  const [item] = list.splice(index, 1)
  list.splice(nextIndex, 0, item)
  return copy
}

export function getAtPath(value, path) {
  return path.reduce((current, key) => current?.[key], value)
}

export function friendlyLabel(key) {
  return String(key)
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
    .trim()
}

export function isEditableKey(key) {
  return !hiddenKeys.has(key) && !String(key).startsWith('_')
}

export function inputKind(key, value) {
  if (typeof value === 'boolean') return 'checkbox'
  if (typeof value === 'number') return 'number'
  if (/alt/i.test(key)) return 'text'
  if (/url|link|image|portrait|logo|ogImage|mapEmbed/i.test(key)) return 'url'
  if (/paragraph|description|body|bio|message|text|subheading|subtitle|lede|summary|copy/i.test(key) || String(value).length > 90) return 'textarea'
  return 'text'
}

function createEmptyLike(sample) {
  if (Array.isArray(sample)) return []
  if (sample && typeof sample === 'object') {
    return Object.fromEntries(Object.entries(sample).map(([key, value]) => [key, createEmptyLike(value)]))
  }
  if (typeof sample === 'number') return 0
  if (typeof sample === 'boolean') return false
  return ''
}
