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

// Renders a page's content as collapsible section panels. Top-level simple fields are grouped
// into a leading "Page Details" panel; each top-level object or list becomes its own panel.
export default function FieldRenderer({ value, onChange }) {
  const entries = editableEntries(value)
  const simple = entries.filter(([key, child]) => !isSection(key, child))
  const sections = entries.filter(([key, child]) => isSection(key, child))
  const panels = []

  if (simple.length) {
    panels.push({
      key: '__details',
      title: 'Page Details',
      body: <ObjectFields value={value} entries={simple} path={[]} onChange={onChange} />,
    })
  }

  for (const [key, child] of sections) {
    panels.push({
      key,
      title: labelFor(key),
      subtitle: Array.isArray(child) ? countLabel(child.length, itemNameFor(key)) : null,
      body: Array.isArray(child)
        ? <ListField listKey={key} value={child} path={[key]} onChange={onChange} />
        : <ObjectFields value={child} path={[key]} onChange={onChange} />,
    })
  }

  return (
    <div className="cms-admin__sections">
      {panels.map((panel, index) => (
        <Collapsible
          key={panel.key}
          className="cms-admin__panel--section"
          section={panel.key}
          title={panel.title}
          subtitle={panel.subtitle}
          defaultOpen={index === 0}
        >
          {panel.body}
        </Collapsible>
      ))}
    </div>
  )
}

function ObjectFields({ value, entries = editableEntries(value), path, onChange }) {
  const imageKeys = new Set(entries
    .filter(([key, child]) => isImageKey(key) && (typeof child === 'string' || isMediaRef(child)))
    .map(([key]) => key))
  const pairedAltKeys = new Set([...imageKeys].map(altKeyFor).filter(key => key in value))

  return (
    <div className="cms-admin__fields">
      {entries.map(([key, child]) => {
        if (pairedAltKeys.has(key)) return null
        const childPath = [...path, key]
        if (imageKeys.has(key)) {
          const altKey = altKeyFor(key)
          return (
            <ImageField
              key={key}
              label={labelFor(key)}
              path={childPath}
              value={child}
              altKey={pairedAltKeys.has(altKey) ? altKey : null}
              altValue={value[altKey]}
              onChange={onChange}
            />
          )
        }
        return <Field key={key} fieldKey={key} value={child} path={childPath} onChange={onChange} />
      })}
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
        <div className="cms-admin__list-title">
          <h4>{labelFor(fieldKey)}</h4>
          <span className="cms-admin__count" title={countLabel(value.length, itemNameFor(fieldKey))}>{value.length}</span>
        </div>
        <ListField listKey={fieldKey} value={value} path={path} onChange={onChange} />
      </div>
    )
  }

  if (value && typeof value === 'object') {
    return (
      <fieldset className="cms-admin__subgroup">
        <legend>{labelFor(fieldKey)}</legend>
        <ObjectFields value={value} path={path} onChange={onChange} />
      </fieldset>
    )
  }

  return <ScalarField fieldKey={fieldKey} value={value} path={path} onChange={onChange} />
}

function ScalarField({ fieldKey, value, path, onChange }) {
  const kind = inputKind(fieldKey, value ?? '')
  const id = `cms-${path.join('-')}`
  const set = nextValue => onChange(root => updateAtPath(root, path, nextValue))
  const label = labelFor(fieldKey)

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
      <span>{label}</span>
      {kind === 'textarea' ? (
        <textarea id={id} value={value || ''} onChange={event => set(event.target.value)} />
      ) : kind === 'checkbox' ? (
        <input id={id} type="checkbox" checked={Boolean(value)} onChange={event => set(event.target.checked)} />
      ) : (
        <input
          id={id}
          type={kind}
          value={value ?? ''}
          onChange={event => set(kind === 'number' ? Number(event.target.value) : event.target.value)}
        />
      )}
    </label>
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
      <span>{labelFor(fieldKey)}</span>
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
  const itemName = itemNameFor(listKey)
  const isStringList = value.length > 0 && value.every(item => typeof item === 'string')
  const move = (index, direction) => onChange(root => moveAtPath(root, [...path, index], direction))
  const remove = index => {
    const name = itemTitle(value[index]) || `${itemName} ${index + 1}`
    if (window.confirm(`Remove "${name}"?`)) onChange(root => removeAtPath(root, [...path, index]))
  }
  const controls = index => (
    <ItemControls
      index={index}
      count={value.length}
      onMove={direction => move(index, direction)}
      onRemove={() => remove(index)}
    />
  )

  return (
    <div className="cms-admin__items">
      {isStringList ? (
        value.map((item, index) => {
          const id = `cms-${[...path, index].join('-')}`
          const set = event => onChange(root => updateAtPath(root, [...path, index], event.target.value))
          return (
            <div className="cms-admin__string-row" key={index}>
              <span className="cms-admin__row-number">{index + 1}</span>
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
            actions={controls(index)}
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
      <button type="button" aria-label="Move Up" title="Move up" onClick={() => onMove(-1)} disabled={index === 0}>↑</button>
      <button type="button" aria-label="Move Down" title="Move down" onClick={() => onMove(1)} disabled={index === count - 1}>↓</button>
      <button type="button" className="cms-admin__remove" onClick={onRemove}>Remove</button>
    </div>
  )
}

function Collapsible({ title, subtitle, defaultOpen = false, actions, className = '', section, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className={`cms-admin__panel ${className}${open ? ' is-open' : ''}`} data-section={section}>
      <div className="cms-admin__panel-head">
        <button type="button" className="cms-admin__panel-toggle" aria-expanded={open} onClick={() => setOpen(current => !current)}>
          <span className="cms-admin__chevron" aria-hidden="true" />
          <span className="cms-admin__panel-title">{title}</span>
          {subtitle && <span className="cms-admin__panel-subtitle">{subtitle}</span>}
        </button>
        {actions}
      </div>
      {open && <div className="cms-admin__panel-body">{children}</div>}
    </section>
  )
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
