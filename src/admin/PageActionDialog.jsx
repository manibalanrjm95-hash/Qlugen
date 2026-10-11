import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Confirmation for page-level actions (Delete Page / Archive Page). Same centred modal as
// "+ Add Page": rendered into <body>, background scroll locked, Cancel / Esc / backdrop close.
export default function PageActionDialog({ title, body, page, confirmLabel, danger = false, onCancel, onConfirm }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const cancelRef = useRef(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const onKeyDown = event => {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [busy, onCancel])

  useEffect(() => {
    const { documentElement, body: documentBody } = document
    const previous = [documentElement.style.overflow, documentBody.style.overflow]
    documentElement.style.overflow = 'hidden'
    documentBody.style.overflow = 'hidden'
    return () => {
      documentElement.style.overflow = previous[0]
      documentBody.style.overflow = previous[1]
    }
  }, [])

  const confirm = async () => {
    setBusy(true)
    setError('')
    try {
      await onConfirm()
    } catch (actionError) {
      setError(actionError.message)
      setBusy(false)
    }
  }

  return createPortal(
    <div className="cms-modal" role="presentation" onMouseDown={event => event.target === event.currentTarget && !busy && onCancel()}>
      <section className="cms-modal__dialog" role="alertdialog" aria-modal="true" aria-labelledby="cms-page-action-title" aria-describedby="cms-page-action-body">
        <h2 id="cms-page-action-title">{title}</h2>
        <dl className="cms-modal__page">
          <div><dt>Page</dt><dd>{page.title || page.route}</dd></div>
          <div><dt>URL</dt><dd>{page.route}</dd></div>
        </dl>
        <p id="cms-page-action-body" className="cms-modal__help">{body}</p>
        {error && <p className="cms-modal__error cms-modal__error--block" role="alert">{error}</p>}
        <div className="cms-modal__actions">
          <button type="button" ref={cancelRef} onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className={danger ? 'is-danger' : 'is-primary'} onClick={confirm} disabled={busy}>
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  )
}
