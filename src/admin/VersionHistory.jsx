import { useEffect, useState } from 'react'
import { listVersions } from './cmsApi'

// Lists released (published/archived) versions. Ids and raw content are never shown.
export default function VersionHistory({ pageId, pageTitle, refreshKey, busy, onPreview, onRestore, onClose }) {
  const [versions, setVersions] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    listVersions(pageId)
      .then(data => {
        if (!cancelled) setVersions(data.versions)
      })
      .catch(loadError => {
        if (!cancelled) setError(loadError.message)
      })
    return () => { cancelled = true }
  }, [pageId, refreshKey])

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="cms-media cms-versions" role="presentation" onClick={event => event.target === event.currentTarget && onClose()}>
      <section className="cms-versions__panel" role="dialog" aria-modal="true" aria-labelledby="cms-versions-title">
        <header className="cms-media__head">
          <div>
            <h2 id="cms-versions-title">Version History</h2>
            <p>{pageTitle}. Restoring creates a new draft; the published page changes only when you Publish.</p>
          </div>
          <button type="button" onClick={onClose}>Close</button>
        </header>

        {error && <p className="cms-media__status" role="status">Could not load versions: {error}</p>}
        {!versions && !error && <p className="cms-media__status">Loading versions...</p>}

        <ol className="cms-versions__list">
          {(versions || []).map(version => (
            <li key={version.id} className={`cms-versions__item is-${version.status}`} data-version-number={version.versionNumber}>
              <div className="cms-versions__head">
                <strong>Version {version.versionNumber} — {version.status === 'published' ? 'Published' : 'Archived'}</strong>
                {version.status === 'published' && <span className="cms-versions__current">Current</span>}
              </div>
              <dl>
                <div><dt>{version.status === 'published' ? 'Published' : 'Was published'}</dt><dd>{formatDate(version.publishedAt)}</dd></div>
                {version.createdBy && <div><dt>By</dt><dd>{version.createdBy}</dd></div>}
                {version.restoredFromVersion && <div><dt>Restored from</dt><dd>Version {version.restoredFromVersion}</dd></div>}
              </dl>
              <div className="cms-media__actions">
                <button type="button" onClick={() => onPreview(version)} disabled={busy}>Preview</button>
                <button type="button" onClick={() => onRestore(version)} disabled={busy}>Restore</button>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}
