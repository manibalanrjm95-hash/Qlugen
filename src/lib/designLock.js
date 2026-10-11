// Design lock: CMS content may only carry content (text, links, images, alt text, lists).
// Anything that could control presentation is rejected when drafts are saved/published and
// stripped again before published content reaches the public site. Colors, typography, spacing,
// layout, breakpoints, animation and component structure stay in code (components + CSS).
//
// Shared by the CMS Worker (validation, public API) and the public frontend (runtime loader).

const DESIGN_KEYS = new Set([
  'animation', 'animations', 'align', 'alignment', 'background', 'backgroundcolor', 'backgroundimage',
  'bg', 'border', 'borderradius', 'breakpoint', 'breakpoints', 'class', 'classname', 'color', 'colors',
  'colour', 'colours', 'component', 'componentname', 'css', 'display', 'font', 'fontfamily', 'fontsize',
  'fontstyle', 'fontweight', 'gap', 'grid', 'height', 'layout', 'letterspacing', 'lineheight', 'margin',
  'maxheight', 'maxwidth', 'minheight', 'minwidth', 'opacity', 'padding', 'position', 'responsive',
  'shadow', 'size', 'spacing', 'style', 'styles', 'textalign', 'textcolor', 'texttransform', 'theme',
  'token', 'tokens', 'transition', 'variant', 'width', 'zindex',
])

const DESIGN_SUFFIX = /(color|colour|fontsize|fontweight|fontfamily|classname|padding|margin|spacing|breakpoint|animation)$/i

// Existing top-level content sections whose names collide with design words. They hold cards/text
// rendered by code-controlled layouts; only that top-level section object is exempt, its children are checked.
const CONTENT_SECTION_NAMES = new Set(['grid', 'gap'])

export function isDesignKey(key, depth = 0, value) {
  if (depth === 0 && CONTENT_SECTION_NAMES.has(key) && isPlainObject(value)) return false
  const normalized = String(key).toLowerCase()
  return DESIGN_KEYS.has(normalized) || DESIGN_SUFFIX.test(normalized)
}

export function findDesignKeys(content) {
  const paths = []
  walk(content, [], (key, value, path) => {
    if (isDesignKey(key, path.length, value)) {
      paths.push([...path, key].join('.'))
      return false
    }
    return true
  })
  return paths
}

export function stripDesignKeys(content, depth = 0) {
  if (Array.isArray(content)) return content.map(item => stripDesignKeys(item, depth + 1))
  if (!isPlainObject(content)) return content

  const output = {}
  for (const [key, value] of Object.entries(content)) {
    if (!isDesignKey(key, depth, value)) output[key] = stripDesignKeys(value, depth + 1)
  }
  return output
}

function walk(value, path, visit) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, [...path, String(index)], visit))
    return
  }
  if (!isPlainObject(value)) return
  for (const [key, child] of Object.entries(value)) {
    if (visit(key, child, path)) walk(child, [...path, key], visit)
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
