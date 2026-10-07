import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clone } from './contentEditor'
import { adminGroups, supportedRecordIds } from './contentRegistry'
import {
  getDraft,
  getPage,
  getVersion,
  listPages,
  publishDraft,
  resetDraft,
  restoreVersion,
  saveDraft,
} from './cmsApi'
import FieldRenderer from './FieldRenderer'
import AdminPreview from './AdminPreview'
import MediaLibrary from './MediaLibrary'
import PublishDialog from './PublishDialog'
import VersionHistory from './VersionHistory'
import { MediaLibraryContext, collectMediaRefs } from './mediaContext'
import './admin.css'

const VIEWS = [
  { id: 'edit', label: 'Edit Draft' },
  { id: 'preview', label: 'Preview Draft' },
  { id: 'published', label: 'View Published' },
]

const PHASE_LABELS = {
  saving: 'Saving...',
  publishing: 'Publishing...',
  publishSuccess: 'Publish successful',
  publishFailed: 'Publish failed',
}

export default function Admin() {
  const [pages, setPages] = useState([])
  const [selectedId, setSelectedId] = useState('home')
  const [selectedPage, setSelectedPage] = useState(null)
  const [publishedContent, setPublishedContent] = useState(null)
  const [draftContent, setDraftContent] = useState(null)
  const [savedDraft, setSavedDraft] = useState(null)
  const [status, setStatus] = useState('Loading...')
  const [phase, setPhase] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [view, setView] = useState('edit')
  const [library, setLibrary] = useState(null)
  const [versionsOpen, setVersionsOpen] = useState(false)
  const [versionsKey, setVersionsKey] = useState(0)
  const [versionPreview, setVersionPreview] = useState(null)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const viewScroll = useRef({})

  const mediaContext = useMemo(() => ({
    openLibrary: onSelect => setLibrary({ mode: 'select', onSelect }),
  }), [])
  const closeLibrary = useCallback(() => setLibrary(null), [])
  const closeVersions = useCallback(() => setVersionsOpen(false), [])
  const closePublishDialog = useCallback(() => setPublishDialogOpen(false), [])
  const protectedMediaRefs = useMemo(() => collectMediaRefs(draftContent), [draftContent])

  const pageMap = useMemo(() => new Map(pages.map(page => [page.id, page])), [pages])
  const loadedGroup = adminGroups.find(group => group.items.some(entry => entry.id === selectedPage?.id))
  const loadedLabel = loadedGroup?.items.find(entry => entry.id === selectedPage?.id)?.label
  const pageTitle = loadedLabel ? `${loadedGroup.label} — ${loadedLabel}` : selectedPage?.title || ''
  const busy = phase === 'saving' || phase === 'publishing'
  const baseState = dirty ? 'unsaved' : savedDraft ? 'draft' : 'published'
  const stateLabel = PHASE_LABELS[phase] || { unsaved: 'Unsaved', draft: 'Draft', published: 'Published' }[baseState]
  const canPublish = Boolean(savedDraft) && !dirty && !busy
  const publishHint = dirty
    ? 'Save your changes before publishing.'
    : !savedDraft ? 'Save a draft to enable Publish.' : ''

  // The editor stays mounted while other views are shown, so open panels and typed text survive;
  // each view also keeps its own scroll position.
  const switchView = next => {
    if (next === view) return
    viewScroll.current[view] = window.scrollY
    setView(next)
    requestAnimationFrame(() => window.scrollTo(0, viewScroll.current[next] || 0))
  }

  const refreshPages = async () => {
    const refreshed = await listPages()
    setPages(refreshed.pages.filter(page => supportedRecordIds.includes(page.id)))
  }

  useEffect(() => {
    listPages()
      .then(data => {
        setPages(data.pages.filter(page => supportedRecordIds.includes(page.id)))
        setStatus('Ready')
      })
      .catch(error => setStatus(error.message))
  }, [])

  useEffect(() => {
    let cancelled = false
    setStatus('Loading page...')
    Promise.all([getPage(selectedId), getDraft(selectedId)])
      .then(([pageData, draftData]) => {
        if (cancelled) return
        setSelectedPage(pageData.page)
        setPublishedContent(pageData.page.content)
        setSavedDraft(draftData.draft)
        setDraftContent(clone(draftData.draft?.content || pageData.page.content))
        setVersionPreview(null)
        setView(current => (current === 'version' ? 'edit' : current))
        setDirty(false)
        setPhase(null)
        setStatus(draftData.draft ? 'Draft loaded' : 'Published content loaded')
      })
      .catch(error => {
        if (!cancelled) setStatus(error.message)
      })
    return () => { cancelled = true }
  }, [selectedId])

  useEffect(() => {
    const onBeforeUnload = event => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const selectPage = id => {
    if (dirty && !window.confirm('You have unsaved changes. Leave this page?')) return
    setSelectedId(id)
  }

  const updateContent = updater => {
    setDraftContent(current => updater(current))
    setDirty(true)
    setPhase(null)
    setStatus('Unsaved changes')
  }

  const handleSave = async () => {
    setPhase('saving')
    setStatus('Saving...')
    try {
      const { draft } = await saveDraft(selectedId, draftContent)
      setSavedDraft(draft)
      setDirty(false)
      setPhase(null)
      setStatus('Saved')
      await refreshPages()
    } catch (error) {
      setPhase(null)
      setStatus(`Save failed: ${error.message}`)
    }
  }

  const handleReset = async () => {
    if (!window.confirm('Reset this draft and restore published content?')) return
    setStatus('Resetting...')
    try {
      await resetDraft(selectedId)
      setDraftContent(clone(publishedContent))
      setSavedDraft(null)
      setDirty(false)
      setPhase(null)
      setStatus('Draft reset')
      await refreshPages()
    } catch (error) {
      setStatus(`Reset failed: ${error.message}`)
    }
  }

  const handlePublish = async () => {
    setPublishDialogOpen(false)
    setPhase('publishing')
    setStatus('Publishing...')
    try {
      const { page } = await publishDraft(selectedId, savedDraft.createdAt)
      setSelectedPage(page)
      setPublishedContent(page.content)
      setDraftContent(clone(page.content))
      setSavedDraft(null)
      setDirty(false)
      setPhase('publishSuccess')
      setStatus(`Version ${page.version.versionNumber} published`)
      setVersionsKey(key => key + 1)
      await refreshPages()
    } catch (error) {
      setPhase('publishFailed')
      setStatus(`Publish failed: ${error.message}`)
    }
  }

  const previewVersion = async version => {
    setStatus(`Loading Version ${version.versionNumber}...`)
    try {
      const data = await getVersion(selectedId, version.id)
      setVersionPreview(data.version)
      setVersionsOpen(false)
      switchView('version')
      setStatus(`Previewing Version ${version.versionNumber}`)
    } catch (error) {
      setStatus(`Could not load version: ${error.message}`)
    }
  }

  const handleRestore = async version => {
    const replaces = dirty
      ? '\n\nYour current draft and unsaved changes will be replaced.'
      : savedDraft ? '\n\nYour current saved draft will be replaced.' : ''
    const message = `Restore Version ${version.versionNumber} as a new draft?\n\nThe published page will not change until you Publish.${replaces}`
    if (!window.confirm(message)) return

    setStatus(`Restoring Version ${version.versionNumber}...`)
    try {
      const { draft } = await restoreVersion(selectedId, version.id)
      setDraftContent(clone(draft.content))
      setSavedDraft(draft)
      setDirty(false)
      setPhase(null)
      setVersionsOpen(false)
      setVersionPreview(null)
      switchView('preview')
      setStatus(`Version ${version.versionNumber} restored as a draft`)
      await refreshPages()
    } catch (error) {
      setStatus(`Restore failed: ${error.message}`)
    }
  }

  return (
    <MediaLibraryContext.Provider value={mediaContext}>
      <div className="cms-admin">
        <aside className="cms-admin__sidebar">
          <div className="cms-admin__brand">
            <span>Qlugen CMS</span>
            <small>Draft workspace</small>
          </div>
          <button type="button" className="cms-admin__library-button" onClick={() => setLibrary({ mode: 'manage' })}>
            Media Library
          </button>
          <nav aria-label="CMS pages">
            {adminGroups.map(group => (
              <details key={group.label} open className="cms-admin__nav-group">
                <summary>{group.label}</summary>
                {group.items.map(entry => {
                  const page = pageMap.get(entry.id)
                  return (
                    <button
                      key={entry.id}
                      className={entry.id === selectedId ? 'is-active' : ''}
                      data-record-id={entry.id}
                      type="button"
                      onClick={() => selectPage(entry.id)}
                    >
                      <span>{entry.label}</span>
                      {page?.hasDraft && <em>Draft</em>}
                    </button>
                  )
                })}
              </details>
            ))}
          </nav>
        </aside>

        <main className="cms-admin__main">
          <header className="cms-admin__toolbar">
            <div className="cms-admin__title">
              <p>
                {loadedGroup?.label || 'Content'}
                {selectedPage?.version && ` · Published version ${selectedPage.version.versionNumber}`}
              </p>
              <h1>{loadedLabel || selectedPage?.title || 'Loading...'}</h1>
            </div>
            <div className="cms-admin__actions">
              <strong className={`cms-admin__state is-${phase || baseState}`}>{stateLabel}</strong>
              <span className={dirty ? 'is-dirty' : ''} role="status">{status}</span>
              <button type="button" onClick={handleReset} disabled={!draftContent || busy}>Reset Draft</button>
              <button type="button" onClick={handleSave} disabled={!dirty || !draftContent || busy}>Save Draft</button>
              <button
                type="button"
                className="cms-admin__publish"
                onClick={() => setPublishDialogOpen(true)}
                disabled={!canPublish}
                title={publishHint || 'Publish the saved draft as a new CMS version'}
              >
                Publish
              </button>
            </div>
            <div className="cms-admin__viewbar">
              <div className="cms-admin__tabs" role="group" aria-label="View">
                {VIEWS.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    className={view === option.id ? 'is-active' : ''}
                    aria-pressed={view === option.id}
                    onClick={() => switchView(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <button type="button" className="cms-admin__versions-button" onClick={() => setVersionsOpen(true)} disabled={!selectedPage}>
                Versions
              </button>
              {publishHint && <p className="cms-admin__publish-hint">{publishHint}</p>}
            </div>
          </header>

          <div className="cms-admin__editor" hidden={view !== 'edit'}>
            {savedDraft?.restoredFromVersion && (
              <p className="cms-admin__banner">This draft was restored from Version {savedDraft.restoredFromVersion}. Review it, then Publish.</p>
            )}
            {draftContent ? (
              <FieldRenderer key={selectedPage?.id} value={draftContent} onChange={updateContent} />
            ) : (
              <div className="cms-admin__empty">Start the Worker API and select a page.</div>
            )}
          </div>

          {view === 'preview' && (
            <>
              <p className="cms-admin__banner cms-admin__banner--view">
                Draft preview{dirty ? ' (includes unsaved changes)' : ''}
                {savedDraft?.restoredFromVersion ? ` · restored from Version ${savedDraft.restoredFromVersion}` : ''}
              </p>
              <AdminPreview page={selectedPage} content={draftContent} />
            </>
          )}

          {view === 'published' && (
            <>
              <p className="cms-admin__banner cms-admin__banner--view">
                {selectedPage?.version
                  ? `Published version ${selectedPage.version.versionNumber} · published ${new Date(selectedPage.version.publishedAt).toLocaleString()}`
                  : 'No published version'}
              </p>
              <AdminPreview page={selectedPage} content={publishedContent} />
            </>
          )}

          {view === 'version' && versionPreview && (
            <>
              <div className="cms-admin__banner cms-admin__banner--view cms-admin__banner--version">
                <span>
                  Previewing Version {versionPreview.versionNumber} — {versionPreview.status === 'published' ? 'Published' : 'Archived'}
                </span>
                <button type="button" onClick={() => handleRestore(versionPreview)}>Restore this version</button>
                <button type="button" onClick={() => switchView('edit')}>Close preview</button>
              </div>
              <AdminPreview page={selectedPage} content={versionPreview.content} />
            </>
          )}
        </main>

        {library && (
          <MediaLibrary
            mode={library.mode}
            protectedRefs={protectedMediaRefs}
            onClose={closeLibrary}
            onSelect={media => {
              library.onSelect?.(media)
              setLibrary(null)
            }}
          />
        )}

        {versionsOpen && selectedPage && (
          <VersionHistory
            pageId={selectedPage.id}
            pageTitle={pageTitle}
            refreshKey={versionsKey}
            busy={busy}
            onPreview={previewVersion}
            onRestore={handleRestore}
            onClose={closeVersions}
          />
        )}

        {publishDialogOpen && (
          <PublishDialog title={pageTitle} onCancel={closePublishDialog} onConfirm={handlePublish} />
        )}
      </div>
    </MediaLibraryContext.Provider>
  )
}
