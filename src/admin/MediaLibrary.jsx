import { useCallback, useEffect, useRef, useState } from 'react'
import { deleteMedia, listMedia, mediaSrc, updateMediaAlt, uploadMedia } from './cmsApi'
import { ACCEPTED_IMAGE_TYPES, checkImageFile } from './mediaContext'

// mode "select": pick an image for a field. mode "manage": browse, edit alt text, delete unused.
export default function MediaLibrary({ mode, onSelect, onClose, protectedRefs = new Set() }) {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Loading...')
  const [altDrafts, setAltDrafts] = useState({})
  const uploadRef = useRef(null)

  const load = useCallback(async search => {
    try {
      const data = await listMedia(search)
      setItems(data.media)
      setStatus(data.media.length ? '' : search ? 'No images match this search.' : 'No images uploaded yet.')
    } catch (error) {
      setStatus(`Could not load media: ${error.message}`)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => load(query), 200)
    return () => clearTimeout(timer)
  }, [query, load])

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const altFor = media => altDrafts[media.id] ?? media.altText
  const inEditor = media => protectedRefs.has(media.id) || protectedRefs.has(media.publicUrl)

  const handleUpload = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const problem = checkImageFile(file)
    if (problem) {
      setStatus(problem)
      return
    }
    setStatus(`Uploading ${file.name}...`)
    try {
      await uploadMedia(file)
      setQuery('')
      await load('')
    } catch (error) {
      setStatus(`Upload failed: ${error.message}`)
    }
  }

  const saveAlt = async media => {
    try {
      const { media: updated } = await updateMediaAlt(media.id, altFor(media))
      setItems(current => current.map(item => (item.id === updated.id ? updated : item)))
      setAltDrafts(({ [media.id]: _saved, ...rest }) => rest)
      setStatus(`Alt text saved for ${updated.filename}`)
    } catch (error) {
      setStatus(`Alt text save failed: ${error.message}`)
    }
  }

  const remove = async media => {
    if (!window.confirm(`Delete ${media.filename}? This cannot be undone.`)) return
    try {
      await deleteMedia(media.id)
      setItems(current => current.filter(item => item.id !== media.id))
      setStatus(`Deleted ${media.filename}`)
    } catch (error) {
      setStatus(`Delete failed: ${error.message}`)
    }
  }

  return (
    <div className="cms-media" role="presentation" onClick={event => event.target === event.currentTarget && onClose()}>
      <section className="cms-media__dialog" role="dialog" aria-modal="true" aria-labelledby="cms-media-title">
        <header className="cms-media__head">
          <div>
            <h2 id="cms-media-title">Media Library</h2>
            <p>{mode === 'select' ? 'Choose an image for this field.' : 'Uploaded CMS images. Images used by any draft, published or archived version cannot be deleted.'}</p>
          </div>
          <button type="button" onClick={onClose}>Close</button>
        </header>

        <div className="cms-media__toolbar">
          <input
            type="search"
            value={query}
            placeholder="Search by filename"
            aria-label="Search by filename"
            onChange={event => setQuery(event.target.value)}
          />
          <button type="button" onClick={() => uploadRef.current?.click()}>Upload Image</button>
          <input ref={uploadRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} hidden data-media-upload onChange={handleUpload} />
        </div>

        {status && <p className="cms-media__status" role="status">{status}</p>}

        <ul className="cms-media__grid">
          {items.map(media => (
            <li key={media.id} className="cms-media__item" data-media-id={media.id}>
              <div className="cms-media__thumb">
                <img src={mediaSrc(media.publicUrl)} alt={media.altText} loading="lazy" />
              </div>
              <div className="cms-media__meta">
                <strong title={media.originalFilename || media.filename}>{media.filename}</strong>
                <small>
                  {media.width && media.height ? `${media.width} × ${media.height}` : 'Size unknown'}
                  {' · '}
                  {new Date(media.createdAt).toLocaleDateString()}
                  {media.inUse ? ' · In use' : inEditor(media) ? ' · In your unsaved changes' : ''}
                </small>
                <label>
                  <span>Alt text</span>
                  <input
                    type="text"
                    value={altFor(media)}
                    onChange={event => setAltDrafts(current => ({ ...current, [media.id]: event.target.value }))}
                  />
                </label>
                <div className="cms-media__actions">
                  {mode === 'select' && (
                    <button type="button" className="is-primary" onClick={() => onSelect({ ...media, altText: altFor(media) })}>Select</button>
                  )}
                  <button type="button" onClick={() => saveAlt(media)} disabled={altFor(media) === media.altText}>Save Alt</button>
                  <button
                    type="button"
                    onClick={() => remove(media)}
                    disabled={media.inUse || inEditor(media)}
                    title={media.inUse
                      ? 'Used by a saved draft, published or archived version'
                      : inEditor(media) ? 'Used in your unsaved changes' : 'Delete this image'}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
