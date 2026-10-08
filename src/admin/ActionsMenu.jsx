import { useEffect, useRef, useState } from 'react'

// The header's "⋯" menu: secondary page actions (Preview, View Published, Versions, Reset Draft,
// Archive Page) kept out of the way of the main Save Draft / Publish workflow.
export default function ActionsMenu({ items }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointer = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKey = event => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="cms-admin__menu" ref={rootRef}>
      <button
        type="button"
        className="cms-admin__menu-button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(current => !current)}
      >
        <span aria-hidden="true">⋯</span>
      </button>
      {open && (
        <div className="cms-admin__menu-list" role="menu">
          {items.filter(Boolean).map(item => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={item.danger ? 'is-danger' : ''}
              disabled={item.disabled}
              title={item.hint}
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
