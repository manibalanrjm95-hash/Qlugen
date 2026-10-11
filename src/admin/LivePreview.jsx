import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import AdminPreview from './AdminPreview'
import { imageUrl, isMediaRef } from '../lib/media'
import { fieldElementFromClick } from './liveSelection'
import { FIELD_SELECTED, PREVIEW_CONTENT, PREVIEW_READY } from './previewMessages'

// /admin/live-preview: the public page, rendered alone inside the admin's same-origin preview
// iframe so the site's real media queries respond to the iframe's own viewport width.
//
// Protocol: see previewMessages.js.
const fromAdmin = event => event.origin === window.location.origin && event.source === window.parent && window.parent !== window

export default function LivePreview() {
  const [preview, setPreview] = useState(null) // { pageId, templateId, content }
  const [selectedField, setSelectedField] = useState(null)
  const [selectedLabel, setSelectedLabel] = useState(null) // the editor name the admin panel shows
  const rootRef = useRef(null)
  const clickedRef = useRef(null) // the exact element clicked (a field can be rendered more than once)

  useEffect(() => {
    const onMessage = event => {
      if (!fromAdmin(event) || event.data?.type !== PREVIEW_CONTENT) return
      const { pageId, templateId, content, selectedField: field, selectedLabel: label } = event.data
      setPreview({ pageId, templateId, content })
      setSelectedField(field || null)
      setSelectedLabel(typeof label === 'string' ? label : null)
    }
    window.addEventListener('message', onMessage)
    // Announce readiness only after the listener exists, so the first content message is never missed.
    if (window.parent !== window) window.parent.postMessage({ type: PREVIEW_READY }, window.location.origin)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Click-to-edit on the real DOM: the clicked CMS element is selected; nothing navigates.
  useEffect(() => {
    const onClick = event => {
      if (event.target.closest('a, button[type="submit"], form')) event.preventDefault()
      const root = rootRef.current
      if (!root) return
      const element = fieldElementFromClick(event, root)
      if (!element) return
      const field = element.getAttribute('data-cms-field')
      clickedRef.current = element
      setSelectedField(field)
      setSelectedLabel(null)
      window.parent.postMessage({
        type: FIELD_SELECTED,
        field,
        tagName: element.tagName,
        textField: element.getAttribute('data-cms-text-field') || undefined,
      }, window.location.origin)
    }
    const onSubmit = event => event.preventDefault()
    // Hover feedback on the single most specific editable element under the pointer (never on its
    // tagged ancestors or on layout containers).
    let hovered = null
    const onPointerMove = event => {
      const element = rootRef.current ? fieldElementFromClick(event, rootRef.current) : null
      if (element === hovered) return
      hovered?.removeAttribute('data-cms-hover')
      hovered = element
      hovered?.setAttribute('data-cms-hover', 'true')
    }
    const onPointerLeave = () => {
      hovered?.removeAttribute('data-cms-hover')
      hovered = null
    }
    document.addEventListener('click', onClick, true)
    document.addEventListener('submit', onSubmit, true)
    document.addEventListener('pointermove', onPointerMove, true)
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('submit', onSubmit, true)
      document.removeEventListener('pointermove', onPointerMove, true)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  useAutoTagFields(rootRef, preview)
  const tag = useSelectedElement(rootRef, clickedRef, selectedField, selectedLabel, preview)

  return (
    <div ref={rootRef} className="cms-live-preview" data-preview-page={preview?.pageId || ''}>
      <style>{EDIT_STYLES}</style>
      {preview && (
        <AdminPreview
          page={{ id: preview.pageId, templateId: preview.templateId }}
          content={preview.content}
          editMode
        />
      )}
      {tag && <span className="cms-live-preview__tag" style={{ top: tag.top, left: tag.left }} aria-hidden="true">{tag.label}</span>}
    </div>
  )
}

// Preview-only coverage for pages that have not been hand-tagged like Home. It maps rendered
// CMS-backed text/images back to paths in the current content object and adds the same
// data-cms-field metadata the live editor already understands. The normal public site never runs
// this code because it lives only in /admin/live-preview.
function useAutoTagFields(rootRef, preview) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || !preview?.content) return undefined
    const frame = root.querySelector('.cms-admin__preview-frame')
    if (!frame) return undefined

    frame.querySelectorAll('[data-cms-auto-field]').forEach(element => {
      element.removeAttribute('data-cms-field')
      element.removeAttribute('data-cms-auto-field')
      element.removeAttribute('data-cms-text-field')
    })

    const fields = collectFields(preview.content)
    tagImages(frame, fields.images)
    tagBackgroundImages(frame, fields.images)
    tagText(frame, fields.text)

    return () => {
      frame.querySelectorAll('[data-cms-auto-field]').forEach(element => {
        element.removeAttribute('data-cms-field')
        element.removeAttribute('data-cms-auto-field')
        element.removeAttribute('data-cms-text-field')
      })
    }
  }, [rootRef, preview])
}

const SKIPPED_KEYS = new Set(['id', 'slug', 'route', 'template', 'templateId', 'contentType', 'createdAt', 'updatedAt'])

function collectFields(content) {
  const text = []
  const images = []
  const visit = (value, path, parent = null) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, [...path, index], value))
      return
    }
    if (value && typeof value === 'object') {
      if (isMediaRef(value) && path.length) images.push({ path: path.join('.'), value: imageUrl(value) })
      Object.entries(value).forEach(([key, child]) => {
        if (SKIPPED_KEYS.has(key)) return
        if (path[0] === 'seo' && key !== 'ogImage') return
        visit(child, [...path, key], value)
      })
      return
    }
    if (typeof value !== 'string' || !value.trim() || !path.length) return
    const key = String(path.at(-1))
    if (/url|href|link$/i.test(key) && key !== 'linkLabel') return
    if (/image|photo|portrait|ogImage/i.test(key)) {
      images.push({ path: path.join('.'), value })
      return
    }
    text.push({
      path: path.join('.'),
      value: normalizeText(value),
      raw: value,
      textField: parent && key === 'url' && typeof parent.label === 'string' ? [...path.slice(0, -1), 'label'].join('.') : null,
    })
  }
  visit(content, [])
  text.sort((a, b) => (b.value.length - a.value.length) || (fieldPriority(b.path) - fieldPriority(a.path)) || (b.path.split('.').length - a.path.split('.').length))
  return { text, images }
}

function fieldPriority(path) {
  if (/^(hero|intro|body|leader|partner|values|approach|portfolio|grid|model|cta)\b/.test(path)) return 3
  if (/^card\b/.test(path)) return 1
  return 2
}

function tagImages(root, images) {
  const imgFields = images.filter(field => field.value)
  root.querySelectorAll('img:not([data-cms-field])').forEach(img => {
    const src = img.currentSrc || img.src || img.getAttribute('src') || ''
    const match = imgFields.find(field => imageMatches(src, field.value))
    if (match) tagElement(img, match.path)
  })
}

function tagBackgroundImages(root, images) {
  const imgFields = images.filter(field => field.value)
  root.querySelectorAll('*:not([data-cms-field])').forEach(element => {
    const inline = element.getAttribute('style') || ''
    const custom = inline.includes('--hero-image') || inline.includes('background')
    if (!custom) return
    const style = getComputedStyle(element)
    const background = `${style.backgroundImage || ''} ${inline}`
    const match = imgFields.find(field => imageMatches(background, field.value))
    if (match) tagElement(element, match.path)
  })
}

function tagText(root, textFields) {
  const elements = [...root.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,blockquote,strong,em,small,button,div')]
    .filter(element => !element.matches('[data-cms-field]'))
    .sort((a, b) => (a.textContent || '').length - (b.textContent || '').length)

  for (const element of elements) {
    if (element.matches('svg, path') || element.children.length > 4) continue
    const directText = [...element.childNodes]
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent)
      .join(' ')
    const text = normalizeText(directText || (element.children.length ? '' : element.textContent || ''))
    if (!text || text.length < 2) continue
    const match = textFields.find(field => field.value && (text === field.value || text.includes(field.value)))
    if (match) tagElement(element, match.path, match.textField)
  }
}

function tagElement(element, field, textField = null) {
  element.setAttribute('data-cms-field', field)
  element.setAttribute('data-cms-auto-field', 'true')
  if (textField) element.setAttribute('data-cms-text-field', textField)
}

function normalizeText(value) {
  return String(value).replace(/\s+/g, ' ').trim()
}

function imageMatches(rendered, source) {
  if (!rendered || !source) return false
  const cleanSource = String(source).replace(/^url\(["']?|["']?\)$/g, '')
  if (rendered.includes(cleanSource)) return true
  try {
    const file = new URL(cleanSource, window.location.origin).pathname.split('/').pop()
    return file ? rendered.includes(file) : false
  } catch {
    const file = cleanSource.split('/').pop()
    return file ? rendered.includes(file) : false
  }
}

// Marks the selected element (the outline is drawn on the element itself) and places the small
// label at document coordinates so it scrolls with the page. Re-measured on any size change.
function useSelectedElement(rootRef, clickedRef, field, selectedLabel, preview) {
  const [tag, setTag] = useState(null)
  useLayoutEffect(() => {
    const root = rootRef.current
    root?.querySelectorAll('[data-cms-selected]').forEach(node => node.removeAttribute('data-cms-selected'))
    const element = field && root ? pickElement(root, field, clickedRef.current) : null
    if (!element) {
      setTag(null)
      return undefined
    }
    element.setAttribute('data-cms-selected', 'true')
    const label = selectedLabel || labelFor(element)
    const measure = () => {
      const box = element.getBoundingClientRect()
      const top = box.top + window.scrollY
      setTag({ label, top: top >= 26 ? top - 26 : top + 4, left: Math.max(0, box.left + window.scrollX) })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    observer.observe(document.body)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      element.removeAttribute('data-cms-selected')
    }
  }, [rootRef, clickedRef, field, selectedLabel, preview])
  return tag
}

// The element to outline for a field: the one the user clicked, else the first visible rendering.
function pickElement(root, field, clicked) {
  const candidates = [...root.querySelectorAll(`[data-cms-field="${CSS.escape(field)}"]`)]
  if (clicked && candidates.includes(clicked)) return clicked
  return candidates.find(node => {
    const box = node.getBoundingClientRect()
    return box.width > 0 && box.height > 0 && getComputedStyle(node).visibility !== 'hidden'
  }) || candidates[0] || null
}

// Shown only until the admin answers with the editor's own name (selectedLabel).
function labelFor(element) {
  if (element.tagName === 'IMG') return 'Image'
  if (/^H[1-6]$/.test(element.tagName)) return 'Heading'
  if (element.querySelector('[data-cms-field]')) return 'Card'
  if (element.tagName === 'A') return 'Link'
  return 'Text'
}

// Editor-only styles inside the preview document. They only target CMS edit metadata, which the
// public site never renders, and add outlines/labels only (no layout or design changes).
const EDIT_STYLES = `
[data-cms-field] { cursor: pointer; }
[data-cms-hover="true"] { outline: 1px dashed rgba(18, 109, 255, .55); outline-offset: 2px; }
[data-cms-selected="true"], [data-cms-selected="true"]:hover { outline: 1.5px solid #126dff; outline-offset: 2px; }
img[data-cms-hover="true"], img[data-cms-selected="true"] { outline-offset: -3px; }
.cms-live-preview__tag {
  position: absolute; z-index: 2147483000; height: 25px; padding: 3px 10px;
  border-radius: 5px 5px 0 0; background: #0963e5; color: #fff;
  font: 650 13px/19px Inter, "IBM Plex Sans", system-ui, sans-serif; white-space: nowrap; pointer-events: none;
}
`
