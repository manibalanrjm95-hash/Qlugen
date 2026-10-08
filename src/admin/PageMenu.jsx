import { useEffect, useRef, useState } from 'react'

// The top bar's "⋯" menu for pages created with "+ Add Page" (Delete / Archive / Restore Page).
export default function PageMenu({ items }) {
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
    <div className="cms-ref__page-menu" ref={rootRef}>
      <button
        type="button"
        className="cms-ref__page-menu-button"
        aria-label="Page actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(current => !current)}
      >
        <span aria-hidden="true">⋯</span>
      </button>
      {open && (
        <div className="cms-ref__page-menu-list" role="menu">
          {items.map(item => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={item.danger ? 'is-danger' : ''}
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
