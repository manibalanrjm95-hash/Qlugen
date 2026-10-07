import { useContext, useRef, useState } from 'react'
import { imageAlt, imageUrl, isMediaRef, toMediaRef } from '../lib/media'
import { mediaSrc, uploadMedia } from './cmsApi'
import { getAtPath, updateAtPath } from './contentEditor'
import { ACCEPTED_IMAGE_TYPES, MediaLibraryContext, checkImageFile } from './mediaContext'

// Edits one image field. `altKey` names the sibling `<key>Alt` field when the content has one;
// otherwise alt text lives on the media reference itself.
export default function ImageField({ label, path, value, altKey, altValue, onChange }) {
  const { openLibrary } = useContext(MediaLibraryContext)
  const inputRef = useRef(null)
  const [notice, setNotice] = useState(null)
  const url = imageUrl(value)
  const alt = imageAlt(value, altValue ?? '')
  const altPath = altKey ? [...path.slice(0, -1), altKey] : null
  const id = `cms-${path.join('-')}`

  const applyMedia = media => {
    const nextAlt = media.altText || alt
    onChange(root => {
      const next = updateAtPath(root, path, toMediaRef(media, nextAlt))
      return altPath ? updateAtPath(next, altPath, nextAlt) : next
    })
    setNotice({ kind: 'ok', text: `Using ${media.filename}` })
  }

  const setAlt = text => onChange(root => {
    const current = getAtPath(root, path)
    let next = root
    if (isMediaRef(current) || !altPath) {
      next = updateAtPath(next, path, { ...(isMediaRef(current) ? current : { url: imageUrl(current) }), alt: text })
    }
    return altPath ? updateAtPath(next, altPath, text) : next
  })

  const setUrl = text => onChange(root => {
    const nextValue = !altPath && alt ? { url: text, alt } : text
    return updateAtPath(root, path, nextValue)
  })

  const removeImage = () => {
    onChange(root => {
      const next = updateAtPath(root, path, '')
      return altPath ? updateAtPath(next, altPath, '') : next
    })
    setNotice(null)
  }

  const handleFile = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const problem = checkImageFile(file)
    if (problem) {
      setNotice({ kind: 'error', text: problem })
      return
    }

    setNotice({ kind: 'busy', text: `Uploading ${file.name}...` })
    try {
      const { media } = await uploadMedia(file, alt)
      applyMedia(media)
    } catch (error) {
      setNotice({ kind: 'error', text: `Upload failed: ${error.message}` })
    }
  }

  return (
    <div className="cms-admin__image-field" data-image-field={path.join('.')}>
      <span className="cms-admin__image-label">{label}</span>
      <div className="cms-admin__image-body">
        <div className="cms-admin__image-thumb">
          {url ? <img src={mediaSrc(url)} alt={alt} /> : <span>No image</span>}
        </div>
        <div className="cms-admin__image-controls">
          <p className="cms-admin__image-source">
            {isMediaRef(value) && value.id ? 'Media library image' : url ? 'Existing image URL' : 'No image selected'}
          </p>
          <div className="cms-admin__image-actions">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={notice?.kind === 'busy'}>Replace Image</button>
            <button type="button" onClick={() => openLibrary(applyMedia)}>Choose from Media Library</button>
            {url && <button type="button" onClick={removeImage}>Remove Image</button>}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            hidden
            data-image-upload={path.join('.')}
            onChange={handleFile}
          />
          {notice && <p className={`cms-admin__image-notice is-${notice.kind}`} role="status">{notice.text}</p>}
          <label className="cms-admin__field" htmlFor={`${id}-alt`}>
            <span>Alt Text</span>
            <input id={`${id}-alt`} type="text" value={alt} onChange={event => setAlt(event.target.value)} />
          </label>
          <details className="cms-admin__image-advanced">
            <summary>Advanced: edit image URL</summary>
            <input id={id} type="text" value={url} onChange={event => setUrl(event.target.value)} aria-label={`${label} URL`} />
          </details>
        </div>
      </div>
    </div>
  )
}
