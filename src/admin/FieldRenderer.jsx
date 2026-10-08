import { useState } from 'react'
import {
  addAtPath,
  inputKind,
  isEditableKey,
  moveAtPath,
  removeAtPath,
  updateAtPath,
} from './contentEditor'
import { BLOCK_TYPES, LINE_ARRAYS, isLineArray, itemNameFor, itemTitle, labelFor } from './fieldLabels'
import { altKeyFor, isImageKey, isMediaRef } from '../lib/media'
import ImageField from './ImageField'

// The page editor. Content is shown the way an editor thinks about it, not the way it is stored:
// page-level fields first, then collapsible sections; a sentence with an inline link is ONE field;
// link text + destination pairs are one "Button"/"Link" field; screen-reader labels, placeholders and
// small label text sit under "More options". The stored content shape never changes.
export default function FieldRenderer({ value, pageTitle = 'Overview', onChange }) {
  const entries = editableEntries(value)
  const hasHero = entries.some(([key, child]) => key === 'hero' && child && typeof child === 'object' && !Array.isArray(child))
  const pageFields = entries.filter(([key, child]) => !isSection(key, child) && key !== 'title')
  const titleEntry = entries.find(([key]) => key === 'title')
  const heroEntry = entries.find(([key]) => key === 'hero')
  const sections = entries.filter(([key, child]) => isSection(key, child) && key !== 'hero')

  return (
    <div className="cms-admin__sections">
      {hasHero ? (
        <div className="cms-admin__page-fields cms-admin__page-fields--primary" data-section="__details">
          <div className="cms-admin__field">
            <span>Page Title</span>
            {titleEntry
              ? <input type="text" value={titleEntry[1] || ''} onChange={event => onChange(root => updateAtPath(root, ['title'], event.target.value))} />
              : <input type="text" value={pageTitle} readOnly aria-label="Page Title" />}
          </div>
          <ObjectFields value={heroEntry[1]} path={['hero']} onChange={onChange} primaryHero />
          {pageFields.length > 0 && <ObjectFields value={value} entries={pageFields} path={[]} onChange={onChange} />}
        </div>
      ) : pageFields.length > 0 && (
        <div className="cms-admin__page-fields" data-section="__details">
          <ObjectFields value={value} entries={titleEntry ? [titleEntry, ...pageFields] : pageFields} path={[]} onChange={onChange} />
        </div>
      )}
      {sections.map(([key, child], index) => (
        <Collapsible
          key={key}
          className="cms-admin__panel--section"
          section={key}
          title={labelFor(key)}
          subtitle={Array.isArray(child) ? countLabel(child.length, itemNameFor(key)) : null}
          defaultOpen={!hasHero && index === 0}
        >
          {Array.isArray(child)
            ? <ListField listKey={key} value={child} path={[key]} onChange={onChange} />
            : <ObjectFields value={child} path={[key]} onChange={onChange} />}
        </Collapsible>
      ))}
    </div>
  )
}

// Rarely edited fields: screen-reader labels, form placeholders, breadcrumb labels and the small
// label shown above headings. Still editable, under "More options".
const isSecondaryKey = key => /AriaLabel$|^ariaLabel$|Placeholder$|BreadcrumbLabel$|^breadcrumbLabel$|^eyebrow$/.test(key)
  || key === 'accessibility'
  || /^bottomText/.test(key)

function ObjectFields({ value, entries = editableEntries(value), path, onChange, primaryHero = false }) {
  const keys = new Set(entries.map(([key]) => key))
  const isText = key => keys.has(key) && typeof value[key] === 'string'
  const consumed = new Set()
  const groups = new Map()
  const claim = (parts, render) => {
    parts.forEach(part => consumed.add(part))
    groups.set(parts[0], render)
  }

  for (const [key] of entries) {
    if (consumed.has(key)) continue
    const sentence = key.match(/^(.*)BeforeLink$/)
    if (sentence) {
      const prefix = sentence[1]
      const parts = [key, `${prefix}LinkLabel`, `${prefix}LinkUrl`, `${prefix}AfterLink`]
      if (parts.every(isText)) {
        claim(parts, () => <LinkSentenceField key={key} label={labelFor(prefix || 'description')} parts={parts} value={value} path={path} onChange={onChange} />)
        continue
      }
    }
    const accent = key.match(/^(.*)BeforeAccent$/)
    if (accent && !key.startsWith('bottomText') && isText(`${accent[1]}Accent`) && isText(key)) {
      const parts = [key, `${accent[1]}Accent`]
      claim(parts, () => <AccentField key={key} label={labelFor(accent[1])} parts={parts} value={value} path={path} onChange={onChange} />)
      continue
    }
    const pair = key.match(/^(.*)Label$/)
    if (pair && pair[1] && isText(key) && isText(`${pair[1]}Url`)) {
      const parts = [key, `${pair[1]}Url`]
      const isButton = pair[1] === 'cta'
      claim(parts, () => <LinkField key={key} title={isButton ? 'Button' : labelFor(pair[1])} removable={isButton} parts={parts} value={value} path={path} onChange={onChange} />)
      continue
    }
    if (key === 'label' && isText('label') && isText('url')) {
      const owner = String(path.filter(segment => typeof segment === 'string').at(-1) || '')
      const isButton = /cta|Link$/i.test(owner)
      claim(['label', 'url'], () => <LinkField key="label" title={isButton ? 'Button' : 'Link'} removable={isButton} parts={['label', 'url']} value={value} path={path} onChange={onChange} />)
    }
  }

  const imageKeys = new Set(entries
    .filter(([key, child]) => isImageKey(key) && (typeof child === 'string' || isMediaRef(child)))
    .map(([key]) => key))
  const pairedAltKeys = new Set([...imageKeys].map(altKeyFor).filter(key => key in value))

  const renderEntry = ([key, child]) => {
    if (groups.has(key)) return groups.get(key)()
    if (consumed.has(key) || pairedAltKeys.has(key)) return null
    const childPath = [...path, key]
    if (imageKeys.has(key)) {
      const altKey = altKeyFor(key)
      return (
        <ImageField
          key={key}
          label={labelFor(key, parentKeyOf(childPath))}
          path={childPath}
          value={child}
          altKey={pairedAltKeys.has(altKey) ? altKey : null}
          altValue={value[altKey]}
          onChange={onChange}
        />
      )
    }
    return <Field key={key} fieldKey={key} value={child} path={childPath} onChange={onChange} />
  }

  const primary = primaryHero
    ? heroOrder(entries.filter(([key]) => !isSecondaryKey(key) || groups.has(key) || consumed.has(key)))
    : entries.filter(([key]) => !isSecondaryKey(key) || groups.has(key) || consumed.has(key))
  const secondary = entries.filter(([key]) => isSecondaryKey(key) && !groups.has(key) && !consumed.has(key))

  return (
    <div className="cms-admin__fields">
      {primary.map(renderEntry)}
      {secondary.length > 0 && (
        <details className="cms-admin__advanced cms-admin__more">
          <summary>More options</summary>
          {secondary.map(renderEntry)}
        </details>
      )}
    </div>
  )
}

function Field({ fieldKey, value, path, onChange }) {
  if (isLineArray(fieldKey, value)) {
    return <LinesField fieldKey={fieldKey} value={value} path={path} onChange={onChange} />
  }

  if (Array.isArray(value)) {
    return (
      <div className="cms-admin__list">
        {/* A generic "items" list is already named by its section (e.g. Capabilities), so it gets no extra heading. */}
        {fieldKey !== 'items' && (
          <div className="cms-admin__list-title">
            <h4>{labelFor(fieldKey, parentKeyOf(path))}</h4>
            <span className="cms-admin__count" title={countLabel(value.length, itemNameFor(fieldKey, parentKeyOf(path)))}>{value.length}</span>
          </div>
        )}
        <ListField listKey={fieldKey} value={value} path={path} onChange={onChange} />
      </div>
    )
  }

  if (value && typeof value === 'object') {
    // A group that is only a button/link (text + destination) is titled by the link field itself.
    const onlyLink = Object.keys(value).filter(isEditableKey).sort().join() === 'label,url'
    return (
      <div className="cms-admin__subgroup">
        {!onlyLink && <h4>{labelFor(fieldKey, parentKeyOf(path))}</h4>}
        <ObjectFields value={value} path={path} onChange={onChange} />
      </div>
    )
  }

  return <ScalarField fieldKey={fieldKey} value={value} path={path} onChange={onChange} />
}

function ScalarField({ fieldKey, value, path, onChange, label = labelFor(fieldKey, parentKeyOf(path)), hideLabel = false }) {
  const kind = inputKind(fieldKey, value ?? '')
  const id = `cms-${path.join('-')}`
  const set = nextValue => onChange(root => updateAtPath(root, path, nextValue))

  if (fieldKey === 'type' && BLOCK_TYPES.includes(value)) {
    return (
      <label className="cms-admin__field" htmlFor={id}>
        <span>{label}</span>
        <select id={id} value={value} onChange={event => set(event.target.value)}>
          {BLOCK_TYPES.map(type => <option key={type} value={type}>{labelFor(type)}</option>)}
        </select>
      </label>
    )
  }

  return (
    <label className={`cms-admin__field${kind === 'checkbox' ? ' cms-admin__field--inline' : ''}`} htmlFor={id}>
      {!hideLabel && <span>{label}</span>}
      {kind === 'textarea' ? (
        <textarea id={id} rows={3} value={value || ''} onChange={event => set(event.target.value)} />
      ) : kind === 'checkbox' ? (
        <input id={id} type="checkbox" checked={Boolean(value)} onChange={event => set(event.target.checked)} />
      ) : (
        <input
          id={id}
          type={kind === 'url' ? 'text' : kind}
          value={value ?? ''}
          onChange={event => set(kind === 'number' ? Number(event.target.value) : event.target.value)}
        />
      )}
    </label>
  )
}

// A sentence stored in three parts around an inline link (text before, link, text after).
function LinkSentenceField({ label, parts, value, path, onChange }) {
  const [before, linkText, linkUrl, after] = parts
  const fullText = [value[before], value[linkText], value[after]].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
  const setFullText = text => onChange(root => {
    const link = value[linkText] || ''
    const index = link ? text.indexOf(link) : -1
    const nextBefore = index >= 0 ? text.slice(0, index).trim() : text.trim()
    const nextAfter = index >= 0 ? text.slice(index + link.length).trim() : ''
    return updateAtPath(updateAtPath(root, [...path, before], nextBefore), [...path, after], nextAfter)
  })
  const field = (key, fieldLabel) => <ScalarField fieldKey={key} value={value[key]} path={[...path, key]} onChange={onChange} label={fieldLabel} />
  return (
    <div className="cms-admin__group" data-field-group="sentence">
      <span className="cms-admin__group-title">{label}</span>
      <textarea
        className="cms-admin__description-area"
        rows={4}
        value={fullText}
        onChange={event => setFullText(event.target.value)}
      />
      {(value[linkText] || value[linkUrl]) && <div className="cms-admin__inline-link">
        <span className="cms-admin__group-subtitle">Inline link</span>
        <div className="cms-admin__pair">
          {field(linkText, 'Text')}
          {field(linkUrl, 'Destination')}
        </div>
      </div>}
    </div>
  )
}

// Text with a highlighted ending, stored as two parts.
function AccentField({ label, parts, value, path, onChange }) {
  const [text, accent] = parts
  return (
    <div className="cms-admin__group" data-field-group="accent">
      <span className="cms-admin__group-title">{label}</span>
      <p className="cms-admin__sentence-preview">{value[text]} <strong>{value[accent]}</strong></p>
      <ScalarField fieldKey={text} value={value[text]} path={[...path, text]} onChange={onChange} label="Text" />
      <ScalarField fieldKey={accent} value={value[accent]} path={[...path, accent]} onChange={onChange} label="Highlighted words" />
    </div>
  )
}

// Link text + destination, shown as one "Button" or "Link".
function LinkField({ title, removable, parts, value, path, onChange }) {
  const [textKey, urlKey] = parts
  const hasContent = Boolean(value[textKey] || value[urlKey])
  const clear = () => onChange(root => updateAtPath(updateAtPath(root, [...path, textKey], ''), [...path, urlKey], ''))
  return (
    <div className="cms-admin__group" data-field-group="link">
      <div className="cms-admin__group-head">
        <span className="cms-admin__group-title">{title}</span>
        {removable && hasContent && <button type="button" className="cms-admin__quiet" onClick={clear}>Remove button</button>}
      </div>
      <div className="cms-admin__pair">
        <ScalarField fieldKey={textKey} value={value[textKey]} path={[...path, textKey]} onChange={onChange} label="Text" />
        <ScalarField fieldKey={urlKey} value={value[urlKey]} path={[...path, urlKey]} onChange={onChange} label="Destination" />
      </div>
    </div>
  )
}

// One text box for an array of display lines; saved back as the original array of strings.
function LinesField({ fieldKey, value, path, onChange }) {
  const { separator, hint } = LINE_ARRAYS[fieldKey]
  const join = lines => lines.join(separator)
  const split = text => (separator === '\n'
    ? text.split('\n').map(line => line.trim())
    : text.split(/\n\s*\n/).map(part => part.trim())
  ).filter(Boolean)

  const [text, setText] = useState(() => join(value))
  const [lastValue, setLastValue] = useState(value)
  if (lastValue !== value) {
    setLastValue(value)
    if (join(split(text)) !== join(value)) setText(join(value))
  }

  const id = `cms-${path.join('-')}`
  return (
    <label className="cms-admin__field" htmlFor={id}>
      <span>{labelFor(fieldKey, parentKeyOf(path))}</span>
      <textarea
        id={id}
        className={separator === '\n' ? 'cms-admin__lines' : ''}
        rows={Math.max(3, text.split('\n').length)}
        value={text}
        onChange={event => {
          setText(event.target.value)
          onChange(root => updateAtPath(root, path, split(event.target.value)))
        }}
      />
      <small className="cms-admin__hint">{hint}</small>
    </label>
  )
}

function ListField({ listKey, value, path, onChange }) {
  const itemName = itemNameFor(listKey, parentKeyOf(path))
  const isStringList = value.length > 0 && value.every(item => typeof item === 'string')
  const move = (index, direction) => onChange(root => moveAtPath(root, [...path, index], direction))
  const remove = index => {
    const name = itemTitle(value[index]) || `${itemName} ${index + 1}`
    if (window.confirm(`Remove "${name}"?`)) onChange(root => removeAtPath(root, [...path, index]))
  }
  const controls = index => (
    <ItemControls index={index} count={value.length} onMove={direction => move(index, direction)} onRemove={() => remove(index)} />
  )

  return (
    <div className="cms-admin__items">
      {isStringList ? (
        value.map((item, index) => {
          const id = `cms-${[...path, index].join('-')}`
          const set = event => onChange(root => updateAtPath(root, [...path, index], event.target.value))
          return (
            <div className="cms-admin__string-row" key={index}>
              {item.length > 90
                ? <textarea id={id} rows={2} aria-label={`${itemName} ${index + 1}`} value={item} onChange={set} />
                : <input id={id} type="text" aria-label={`${itemName} ${index + 1}`} value={item} onChange={set} />}
              {controls(index)}
            </div>
          )
        })
      ) : (
        value.map((item, index) => (
          <Collapsible
            key={index}
            className="cms-admin__panel--item"
            title={`${itemName} ${index + 1}`}
            subtitle={itemTitle(item)}
            defaultOpen={isEmptyItem(item)}
            footer={controls(index)}
          >
            {item && typeof item === 'object' && !Array.isArray(item)
              ? <ObjectFields value={item} path={[...path, index]} onChange={onChange} />
              : <Field fieldKey={index} value={item} path={[...path, index]} onChange={onChange} />}
          </Collapsible>
        ))
      )}
      <button type="button" className="cms-admin__add" onClick={() => onChange(root => addAtPath(root, path))}>
        + Add {itemName}
      </button>
    </div>
  )
}

function ItemControls({ index, count, onMove, onRemove }) {
  return (
    <div className="cms-admin__item-controls">
      <button type="button" className="cms-admin__quiet" aria-label="Move Up" title="Move up" onClick={() => onMove(-1)} disabled={index === 0}>↑ Move up</button>
      <button type="button" className="cms-admin__quiet" aria-label="Move Down" title="Move down" onClick={() => onMove(1)} disabled={index === count - 1}>↓ Move down</button>
      <button type="button" className="cms-admin__quiet cms-admin__remove" aria-label="Remove" onClick={onRemove}>Remove</button>
    </div>
  )
}

function Collapsible({ title, subtitle, defaultOpen = false, footer, className = '', section, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className={`cms-admin__panel ${className}${open ? ' is-open' : ''}`} data-section={section}>
      <div className="cms-admin__panel-head">
        <button type="button" className="cms-admin__panel-toggle" aria-expanded={open} onClick={() => setOpen(current => !current)}>
          <span className="cms-admin__panel-title">{title}</span>
          {subtitle && <span className="cms-admin__panel-subtitle">{subtitle}</span>}
          <span className="cms-admin__chevron" aria-hidden="true" />
        </button>
      </div>
      {open && (
        <div className="cms-admin__panel-body">
          {children}
          {footer}
        </div>
      )}
    </section>
  )
}

// Key of the group that holds the field at `path` ('' for the page's top level; list positions skipped).
function parentKeyOf(path) {
  const parents = path.slice(0, -1).filter(segment => typeof segment === 'string')
  return parents.length ? parents.at(-1) : ''
}

function editableEntries(value) {
  return Object.entries(value).filter(([key]) => isEditableKey(key))
}

function isSection(key, value) {
  if (isImageKey(key) && isMediaRef(value)) return false
  if (isLineArray(key, value)) return false
  return Boolean(value) && typeof value === 'object'
}

function isEmptyItem(item) {
  if (item === '' || item == null) return true
  if (typeof item !== 'object') return false
  return Object.values(item).every(isEmptyItem)
}

function countLabel(count, itemName) {
  const name = itemName.toLowerCase()
  if (count === 1) return `1 ${name}`
  return `${count} ${/[^aeiou]y$/.test(name) ? name.replace(/y$/, 'ies') : `${name}s`}`
}

function heroOrder(entries) {
  const rank = key => {
    if (key === 'title' || key === 'titleLines') return 1
    if (/description|BeforeLink/.test(key)) return 2
    if (/cta|label|url/i.test(key)) return 3
    if (isImageKey(key)) return 4
    if (/Alt$/.test(key)) return 5
    return 10
  }
  return [...entries].sort(([a], [b]) => rank(a) - rank(b))
}
