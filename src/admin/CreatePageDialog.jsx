import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createPage, listTemplates } from './cmsApi'
import { routeForSlug, slugError, slugify } from '../cms/routeRules'

// "+ Add Page": Page Name -> URL (auto-filled from the name, editable) -> Template -> Create Page.
// Rendered into <body> as a fixed, centred modal so it sits above the admin and never affects the
// page or preview layout; the background does not scroll while it is open.
export default function CreatePageDialog({ existingRoutes, onCancel, onCreated }) {
  const [templates, setTemplates] = useState([])
  const [template, setTemplate] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const nameRef = useRef(null)

  useEffect(() => {
    nameRef.current?.focus()
    listTemplates()
      .then(data => {
        setTemplates(data.templates)
        setTemplate(data.templates[0]?.key || '')
      })
      .catch(loadError => setError(loadError.message))
  }, [])

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  // Lock background scrolling while the modal is open.
  useEffect(() => {
    const { documentElement, body } = document
    const previous = [documentElement.style.overflow, body.style.overflow]
    documentElement.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return () => {
      documentElement.style.overflow = previous[0]
      body.style.overflow = previous[1]
    }
  }, [])

  const route = routeForSlug(slug)
  const slugProblem = slug ? slugError(slug) || (existingRoutes.has(route) ? `${route} is already used by another page.` : '') : ''
  const canCreate = title.trim() && slug && !slugProblem && template && !creating
  const selected = templates.find(option => option.key === template)

  const changeTitle = value => {
    setTitle(value)
    if (!slugEdited) setSlug(slugify(value))
  }

  const changeSlug = value => {
    setSlugEdited(true)
    setSlug(slugify(value.replace(/^\/+/, '')))
  }

  const submit = async event => {
    event.preventDefault()
    if (!canCreate) return
    setCreating(true)
    setError('')
    try {
      const { page } = await createPage({ title: title.trim(), slug, template })
      onCreated(page)
    } catch (createError) {
      setError(createError.message)
      setCreating(false)
    }
  }

  return createPortal(
    <div className="cms-modal" role="presentation" onMouseDown={event => event.target === event.currentTarget && onCancel()}>
      <form className="cms-modal__dialog" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="cms-create-title" aria-describedby="cms-create-help">
        <h2 id="cms-create-title">Create New Page</h2>
        <p id="cms-create-help" className="cms-modal__help">Name the page, check its URL and pick a template. It is saved as a draft until you publish it.</p>

        <label className="cms-modal__field" htmlFor="cms-create-name">
          <span>Page Name</span>
          <input id="cms-create-name" ref={nameRef} value={title} onChange={event => changeTitle(event.target.value)} placeholder="AI Strategy" maxLength={120} />
        </label>

        <label className="cms-modal__field" htmlFor="cms-create-slug">
          <span>URL</span>
          <input id="cms-create-slug" value={slug} onChange={event => changeSlug(event.target.value)} placeholder="ai-strategy" aria-invalid={Boolean(slugProblem)} />
          {slugProblem
            ? <small className="cms-modal__error" role="alert">{slugProblem}</small>
            : <small className="cms-modal__hint">Preview: <strong>{slug ? route : '/ai-strategy'}</strong></small>}
        </label>

        <label className="cms-modal__field" htmlFor="cms-create-template">
          <span>Template</span>
          <select id="cms-create-template" value={template} onChange={event => setTemplate(event.target.value)}>
            {templates.map(option => <option key={option.key} value={option.key}>{option.name}</option>)}
          </select>
          {selected && <small className="cms-modal__hint">{selected.description}</small>}
        </label>

        {error && <p className="cms-modal__error cms-modal__error--block" role="alert">{error}</p>}

        <div className="cms-modal__actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit" className="is-primary" disabled={!canCreate}>{creating ? 'Creating...' : 'Create Page'}</button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
