import { useEffect, useRef } from 'react'

export default function PublishDialog({ title, onCancel, onConfirm }) {
  const confirmRef = useRef(null)

  useEffect(() => {
    confirmRef.current?.focus()
    const onKeyDown = event => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div className="cms-media" role="presentation" onClick={event => event.target === event.currentTarget && onCancel()}>
      <section className="cms-dialog" role="alertdialog" aria-modal="true" aria-labelledby="cms-publish-title" aria-describedby="cms-publish-body">
        <h2 id="cms-publish-title">Publish this page?</h2>
        <p className="cms-dialog__page">{title}</p>
        <p id="cms-publish-body">This will make the saved draft the latest CMS published version.</p>
        <div className="cms-dialog__actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="button" ref={confirmRef} className="is-primary" onClick={onConfirm}>Publish</button>
        </div>
      </section>
    </div>
  )
}
