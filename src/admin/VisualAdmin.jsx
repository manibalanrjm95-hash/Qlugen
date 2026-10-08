import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Add,
  Archive,
  Blog,
  Bot,
  Catalog,
  ChevronDown,
  Close,
  DocumentBlank,
  Earth,
  Enterprise,
  Folder,
  Home,
  Image,
  Industry,
  Launch,
  Policy,
  Product,
  RecentlyViewed,
  Save,
  Search,
  Upload,
} from '@carbon/icons-react'
import { getTemplate } from '../cms/templateRegistry'
import { imageAlt, imageUrl, isMediaRef, toMediaRef } from '../lib/media'
import CreatePageDialog from './CreatePageDialog'
import MediaLibrary from './MediaLibrary'
import PageActionDialog from './PageActionDialog'
import PageMenu from './PageMenu'
import PublishDialog from './PublishDialog'
import VersionHistory from './VersionHistory'
import { clone, getAtPath, updateAtPath } from './contentEditor'
import { adminGroups } from './contentRegistry'
import {
  SESSION_EXPIRED_EVENT,
  archivePage,
  deletePage,
  getDraft,
  getIdentity,
  getPage,
  listPages,
  mediaSrc,
  publishDraft,
  restorePage,
  restoreVersion,
  saveDraft,
  uploadMedia,
} from './cmsApi'
import { collectMediaRefs } from './mediaContext'
import { describeField, sentenceParts, sentenceText } from './liveSelection'
import { FIELD_SELECTED, PREVIEW_CONTENT, PREVIEW_READY, PREVIEW_ROUTE, PREVIEW_WIDTH } from './previewMessages'
import './reference/cms-reference.css'

const PHASE_LABELS = {
  saving: 'Saving...',
  publishing: 'Publishing...',
  publishSuccess: 'Published',
}

// identity: as verified by the CMS Worker (passed in by Admin's sign-in gate).
// onSignOut: present for Firebase sessions only (local development has no sign-in).
export default function VisualAdmin({ identity: verifiedIdentity = null, onSignOut = null }) {
  const [pages, setPages] = useState([])
  const [selectedId, setSelectedId] = useState('home')
  const [selectedPage, setSelectedPage] = useState(null)
  const [draftContent, setDraftContent] = useState(null)
  const [savedDraft, setSavedDraft] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [phase, setPhase] = useState(null)
  const [status, setStatus] = useState('Loading...')
  const [selection, setSelection] = useState(null) // { field, kind, label, path... } from describeField
  const [library, setLibrary] = useState(null)
  const [versionsOpen, setVersionsOpen] = useState(false)
  const [versionsKey, setVersionsKey] = useState(0)
  const [versionPreview, setVersionPreview] = useState(null)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const revealIdRef = useRef(null) // a newly created page to scroll into view in the sidebar
  const [pageAction, setPageAction] = useState(null) // 'delete' | 'archive' confirmation
  const [identity, setIdentity] = useState(verifiedIdentity)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [pageSearch, setPageSearch] = useState('')
  const [openGroups, setOpenGroups] = useState(() => new Set([
    'Home',
    'Capabilities',
    'Products & Platforms',
    'Industries',
    'Agentic AI',
    'Insights',
    'Company',
    'Legal',
    'Global',
    'Custom Pages',
  ]))
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const iframeRef = useRef(null)
  const contentRef = useRef(null)
  const [frameKey, setFrameKey] = useState(0)
  const [previewReady, setPreviewReady] = useState(false)
  const [previewFailed, setPreviewFailed] = useState(false)
  const canvasSize = useElementSize(canvasRef)

  const pageMap = useMemo(() => new Map(pages.map(page => [page.id, page])), [pages])
  const selectedItem = selection
  const protectedMediaRefs = useMemo(() => collectMediaRefs(draftContent), [draftContent])
  const isArchived = selectedPage?.status === 'archived'
  const baseState = dirty ? 'unsaved' : isArchived ? 'archived' : savedDraft ? 'draft' : 'published'
  const stateLabel = PHASE_LABELS[phase] || { unsaved: 'Unsaved', archived: 'Archived', draft: 'Draft', published: 'Published' }[baseState]
  const busy = phase === 'saving' || phase === 'publishing'
  const canPublish = Boolean(savedDraft) && !dirty && !busy && !isArchived
  const publishedVersion = selectedPage?.version?.versionNumber
  // Preview opens the page as the public sees it, so it needs a published, public route.
  const livePageUrl = publishedVersion && !isArchived && selectedPage?.status !== 'draft' && selectedPage?.route?.startsWith('/') && !selectedPage.route.startsWith('/__')
    ? selectedPage.route
    : null
  // Only pages created with "+ Add Page" can be deleted/archived (Home, Global, coded pages cannot).
  const isUserPage = Boolean(selectedPage?.id?.startsWith('custom-') && getTemplate(selectedPage.templateId))

  const displayGroups = useMemo(() => {
    const groups = adminGroups.map(group => ({ ...group, items: [...group.items] }))
    for (const page of pages) {
      const template = page.id.startsWith('custom-') ? getTemplate(page.templateId) : null
      if (!template) continue
      // Archived pages leave their normal group and are listed under "Archived" only.
      const label = page.status === 'archived' ? ARCHIVED_GROUP : template.group
      let group = groups.find(candidate => candidate.label === label)
      if (!group) {
        group = { label, items: [] }
        if (label === ARCHIVED_GROUP) groups.push(group)
        else groups.splice(groups.findIndex(candidate => candidate.label === 'Legal'), 0, group)
      }
      group.items.push({ id: page.id, label: page.title || page.route, custom: true })
    }
    return groups
  }, [pages])

  const loadedGroup = displayGroups.find(group => group.items.some(entry => entry.id === selectedPage?.id))
  const loadedLabel = loadedGroup?.items.find(entry => entry.id === selectedPage?.id)?.label || selectedPage?.title || 'Overview'
  const currentContent = versionPreview?.content || draftContent
  const sidebarGroups = useMemo(() => buildSidebarGroups(displayGroups, pages, pageSearch), [displayGroups, pages, pageSearch])
  useEffect(() => { contentRef.current = currentContent }, [currentContent])

  // Live preview iframe (/admin/live-preview). Messages are accepted only from this origin AND from
  // this iframe's window; only page content and the selected field are sent to it.
  useEffect(() => {
    const onMessage = event => {
      const frameWindow = iframeRef.current?.contentWindow
      if (event.origin !== window.location.origin || !frameWindow || event.source !== frameWindow) return
      if (event.data?.type === PREVIEW_READY) {
        setPreviewReady(true)
        setPreviewFailed(false)
      } else if (event.data?.type === FIELD_SELECTED && typeof event.data.field === 'string') {
        const described = describeField(event.data.field, contentRef.current, event.data.tagName, {
          textField: typeof event.data.textField === 'string' ? event.data.textField : null,
        })
        if (described) setSelection(described)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Send the current (possibly unsaved) content whenever it, the page or the selection changes.
  useEffect(() => {
    if (!previewReady || !currentContent || !selectedPage) return
    iframeRef.current?.contentWindow?.postMessage({
      type: PREVIEW_CONTENT,
      pageId: selectedPage.id,
      templateId: selectedPage.templateId ?? null,
      content: currentContent,
      selectedField: selection?.field || null,
      selectedLabel: selection?.label || null,
    }, window.location.origin)
  }, [previewReady, currentContent, selectedPage, selection])

  // Initialisation is driven by the ready message; this only detects an iframe that never starts.
  useEffect(() => {
    if (previewReady) return undefined
    const timer = setTimeout(() => setPreviewFailed(true), 15000)
    return () => clearTimeout(timer)
  }, [previewReady, frameKey])

  // Retry reloads the page data if that failed, and always starts a fresh iframe + handshake (the
  // iframe is unmounted while the error is shown, so its earlier "ready" no longer applies).
  const retryPreview = () => {
    if (loadError) setLoadAttempt(attempt => attempt + 1)
    setPreviewReady(false)
    setPreviewFailed(false)
    setFrameKey(key => key + 1)
  }

  // The editor previews the desktop layout only: the page renders at a real desktop width and is
  // shrunk to fit the canvas. Content is shared by every screen size, so an edit made here also
  // appears on tablet and mobile, laid out by the site's own responsive CSS.
  const logicalWidth = PREVIEW_WIDTH
  const previewScale = canvasSize.width ? Math.min(1, canvasSize.width / logicalWidth) : 1

  const refreshPages = useCallback(async () => {
    const refreshed = await listPages()
    setPages(refreshed.pages)
  }, [])

  useEffect(() => {
    listPages().then(data => {
      setPages(data.pages)
      setStatus('Ready')
    }).catch(error => setStatus(error.message))
  }, [])

  // Used on its own (no sign-in gate): ask the Worker who we are.
  useEffect(() => {
    if (verifiedIdentity) return
    getIdentity().then(setIdentity).catch(error => setIdentity({ error: error.message }))
  }, [verifiedIdentity])

  useEffect(() => {
    const onExpired = () => setSessionExpired(true)
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [])

  useEffect(() => {
    let cancelled = false
    setStatus('Loading...')
    setLoadError(null)
    Promise.all([getPage(selectedId), getDraft(selectedId)])
      .then(([pageData, draftData]) => {
        if (cancelled) return
        setSelectedPage(pageData.page)
        setSavedDraft(draftData.draft)
        setDraftContent(clone(draftData.draft?.content || pageData.page.content || {}))
        setVersionPreview(null)
        setDirty(false)
        setPhase(null)
        setSelection(null)
        setStatus(draftData.draft ? 'Draft loaded' : 'Published content loaded')
      })
      .catch(error => {
        if (cancelled) return
        if (import.meta.env.DEV) console.error('[cms] Preview could not load', error)
        setStatus(error.message)
        setLoadError(error.message)
      })
    return () => { cancelled = true }
  }, [selectedId, loadAttempt])

  const updateContent = updater => {
    setDraftContent(current => updater(current))
    setDirty(true)
    setPhase(null)
    setVersionPreview(null)
    setStatus('Unsaved')
  }

  const selectPage = id => {
    if (dirty && !window.confirm('You have unsaved changes. Leave this page?')) return
    setSelectedId(id)
  }

  const toggleGroup = label => {
    setOpenGroups(current => {
      const next = new Set(current)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const handleSave = async () => {
    setPhase('saving')
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

  const handlePublish = async () => {
    setPublishDialogOpen(false)
    setPhase('publishing')
    try {
      const { page } = await publishDraft(selectedId, savedDraft.createdAt)
      setSelectedPage(page)
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

  const handleCreatedPage = async page => {
    setCreateDialogOpen(false)
    await refreshPages()
    revealIdRef.current = page.id
    setSelectedId(page.id)
  }

  // Once the new page is listed (its group opens because it is selected), bring it into view.
  useEffect(() => {
    const id = revealIdRef.current
    const item = id && document.querySelector(`.cms-ref__nav [data-record-id="${CSS.escape(id)}"]`)
    if (!item) return
    revealIdRef.current = null
    item.scrollIntoView({ block: 'nearest' })
  }, [sidebarGroups, selectedId])

  // Page removal. Never-published pages are deleted permanently; pages with publish history are
  // archived (history and media kept); archived pages are restored as unpublished pages.
  const pageMenuItems = !isUserPage ? [] : isArchived
    ? [{ label: 'Restore Page', onSelect: () => handleRestorePage() }]
    : selectedPage.version
      ? [{ label: 'Archive Page', danger: true, onSelect: () => setPageAction('archive') }]
      : [{ label: 'Delete Page', danger: true, onSelect: () => setPageAction('delete') }]

  // After a page leaves the normal sidebar, fall back to a page that always exists.
  const leavePage = async () => {
    setPageAction(null)
    setDirty(false)
    await refreshPages()
    setSelectedId('home')
  }

  const handleDeletePage = async () => {
    await deletePage(selectedPage.id)
    await leavePage()
    setStatus('Page deleted')
  }

  const handleArchivePage = async () => {
    await archivePage(selectedPage.id)
    await leavePage()
    setStatus('Page archived')
  }

  const handleRestorePage = async () => {
    try {
      await restorePage(selectedPage.id)
      await refreshPages()
      setLoadAttempt(attempt => attempt + 1) // reload the restored page and its new draft
    } catch (error) {
      setStatus(`Restore failed: ${error.message}`)
    }
  }

  const previewVersion = async version => {
    const data = await import('./cmsApi').then(api => api.getVersion(selectedId, version.id))
    setVersionPreview(data.version)
    setVersionsOpen(false)
  }

  const handleRestore = async version => {
    if (!window.confirm(`Restore Version ${version.versionNumber} as a new draft?`)) return
    const { draft } = await restoreVersion(selectedId, version.id)
    setDraftContent(clone(draft.content))
    setSavedDraft(draft)
    setDirty(false)
    setVersionPreview(null)
    setVersionsOpen(false)
    setStatus(`Version ${version.versionNumber} restored as a draft`)
    await refreshPages()
  }

  const setField = (path, value) => updateContent(content => updateAtPath(content, path, value))
  const setSentence = (prefixPath, value) => updateContent(content => {
    let next = content
    for (const [key, part] of Object.entries(sentenceParts(content, prefixPath, value))) {
      next = updateAtPath(next, [...prefixPath.slice(0, -1), key], part)
    }
    return next
  })
  const setLines = (path, value) => setField(path, value.split('\n').map(line => line.trim()).filter(Boolean))
  const setImageAlt = (item, value) => {
    if (item.altPath) return setField(item.altPath, value)
    return updateContent(content => {
      const current = getAtPath(content, item.path)
      return updateAtPath(content, item.path, { ...(isMediaRef(current) ? current : { url: imageUrl(current) }), alt: value })
    })
  }

  const openLibrary = onSelect => setLibrary({ mode: 'select', onSelect })
  // The image being edited: the selected image itself, or the image of the selected card.
  const imageTarget = selectedItem?.kind === 'card' ? selectedItem.image : selectedItem
  const replaceImageWithMedia = media => {
    if (!imageTarget?.path) return
    updateContent(content => {
      const next = updateAtPath(content, imageTarget.path, toMediaRef(media, media.altText || imageAlt(getAtPath(content, imageTarget.path), '')))
      return imageTarget.altPath ? updateAtPath(next, imageTarget.altPath, media.altText || '') : next
    })
  }

  const uploadSelectedImage = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const { media } = await uploadMedia(file, imageTarget?.altPath ? getAtPath(draftContent, imageTarget.altPath) || '' : '')
    replaceImageWithMedia(media)
  }

  return (
    <div className="cms-ref cms-ref--admin">
      <aside className="cms-ref__sidebar">
        <div className="cms-ref__sidebar-top">
          <div className="cms-ref__brand">
            <strong>Qlugen CMS</strong>
            <span>Content workspace</span>
          </div>
          <label className="cms-ref__search">
            <Search size={16} aria-hidden="true" />
            <input type="search" placeholder="Search pages..." aria-label="Search pages" value={pageSearch} onChange={event => setPageSearch(event.target.value)} />
            {pageSearch && <button type="button" aria-label="Clear search" onClick={() => setPageSearch('')}><Close size={16} aria-hidden="true" /></button>}
          </label>
          <button className="cms-ref__add" type="button" onClick={() => setCreateDialogOpen(true)}><Add size={20} aria-hidden="true" />Add Page</button>
        </div>

        <nav className="cms-ref__nav" aria-label="CMS pages">
          <div className="cms-ref__nav-scroll">
            {sidebarGroups.map(group => {
              const selectedInGroup = group.items.some(entry => entry.id === selectedId)
              const isOpen = selectedInGroup || openGroups.has(group.label)
              const GroupIcon = GROUP_ICONS[group.label] || Folder
              return (
                <section className="cms-ref__nav-group" key={group.label}>
                  <button className="cms-ref__group-toggle" type="button" aria-expanded={isOpen} onClick={() => toggleGroup(group.label)}>
                    <GroupIcon className="cms-ref__group-icon" size={16} aria-hidden="true" />
                    <span className="cms-ref__group-label">{group.label}</span>
                    <ChevronDown className={`cms-ref__group-chevron${isOpen ? ' is-open' : ''}`} size={16} aria-hidden="true" />
                  </button>
                  {isOpen && (
                    <div className="cms-ref__nav-items">
                      {group.items.map(entry => {
                        const page = pageMap.get(entry.id)
                        return (
                          <button className={entry.id === selectedId ? 'is-active' : ''} type="button" key={entry.id} data-record-id={entry.id} onClick={() => selectPage(entry.id)}>
                            <span>{entry.label}</span>
                            {page?.hasDraft && <em>{page.latestVersion ? 'Draft' : 'New'}</em>}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </nav>

        <div className="cms-ref__sidebar-foot">
          <button className="cms-ref__media" type="button" onClick={() => setLibrary({ mode: 'manage' })}><Image size={18} aria-hidden="true" />Media Library</button>
          <small className="cms-ref__identity" data-identity={identity?.actor || ''}>
            {identity?.actor ? (identity.mode === 'firebase' ? `Signed in as ${identity.actor}` : 'Local development (no sign-in)') : identity?.error || 'Checking sign-in...'}
            {onSignOut && <button className="cms-ref__signout" type="button" onClick={onSignOut}>Sign out</button>}
          </small>
        </div>
      </aside>

      <main className="cms-ref__main" data-loaded-page={selectedPage?.id || ''}>
        {sessionExpired && <div className="cms-ref__session">Your sign-in session has ended. Reload to sign in again.</div>}
        <header className="cms-ref__topbar">
          <div className="cms-ref__crumbs">{loadedGroup?.label || 'Home'} <span>›</span> {loadedLabel}</div>
          <div className={`cms-ref__status is-${baseState}`}><span />{stateLabel}</div>
          <p>{statusLabel({ baseState, phase, status, version: publishedVersion })}</p>
          <div className="cms-ref__actions">
            <button
              type="button"
              disabled={!livePageUrl}
              title={livePageUrl ? 'Open the published page in a new tab' : 'This page has no published version on the website'}
              onClick={() => window.open(livePageUrl, '_blank', 'noopener')}
            >
              <Launch size={16} aria-hidden="true" />Preview
            </button>
            <button type="button" onClick={() => setVersionsOpen(true)}><RecentlyViewed size={16} aria-hidden="true" />Versions</button>
            <span className="cms-ref__actions-divider" aria-hidden="true" />
            <button type="button" onClick={handleSave} disabled={!dirty || busy}><Save size={16} aria-hidden="true" />Save Draft</button>
            <button className="is-primary" type="button" disabled={!canPublish} onClick={() => setPublishDialogOpen(true)}><Upload size={16} aria-hidden="true" />Publish</button>
            {pageMenuItems.length > 0 && <PageMenu items={pageMenuItems} />}
          </div>
        </header>

        <div className="cms-ref__workbench">
          <section
            ref={canvasRef}
            className="cms-ref__canvas cms-ref__canvas--live is-desktop"
            aria-label="Live page preview"
          >
            {loadError || previewFailed ? (
              <div className="cms-ref__empty cms-ref__load-error" role="alert">
                <p>Preview couldn&apos;t load.</p>
                <small>{loadError || 'The preview did not start.'}</small>
                <button type="button" onClick={retryPreview}>Retry</button>
              </div>
            ) : (
              <div
                className="cms-ref__preview-stage"
                style={{ width: Math.round(logicalWidth * previewScale), height: canvasSize.height || '100%' }}
              >
                <iframe
                  key={frameKey}
                  ref={iframeRef}
                  className="cms-ref__preview-iframe"
                  src={PREVIEW_ROUTE}
                  title="Live page preview"
                  style={{
                    width: logicalWidth,
                    height: canvasSize.height ? Math.round(canvasSize.height / previewScale) : '100%',
                    transform: previewScale < 1 ? `scale(${previewScale})` : undefined,
                  }}
                />
                {!(previewReady && currentContent && selectedPage) && <div className="cms-ref__empty cms-ref__preview-loading">Loading page...</div>}
              </div>
            )}
          </section>
          <aside className="cms-ref__panel" aria-label="Contextual properties">
            <Panel
              item={selectedItem}
              content={draftContent}
              setField={setField}
              setLines={setLines}
              setSentence={setSentence}
              setImageAlt={setImageAlt}
              openLibrary={() => openLibrary(replaceImageWithMedia)}
              fileInputRef={fileInputRef}
            />
            <input ref={fileInputRef} type="file" hidden accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={uploadSelectedImage} />
          </aside>
        </div>
      </main>

      {library && (
        <MediaLibrary
          mode={library.mode}
          protectedRefs={protectedMediaRefs}
          onClose={() => setLibrary(null)}
          onSelect={media => {
            library.onSelect?.(media)
            setLibrary(null)
          }}
        />
      )}
      {versionsOpen && selectedPage && (
        <VersionHistory
          pageId={selectedPage.id}
          pageTitle={loadedLabel}
          refreshKey={versionsKey}
          busy={busy}
          onPreview={previewVersion}
          onRestore={handleRestore}
          onClose={() => setVersionsOpen(false)}
        />
      )}
      {publishDialogOpen && <PublishDialog title={loadedLabel} onCancel={() => setPublishDialogOpen(false)} onConfirm={handlePublish} />}
      {pageAction === 'delete' && selectedPage && (
        <PageActionDialog
          title="Delete this page permanently?"
          body="This page has never been published. Its draft will be removed and cannot be recovered. Media files stay in the Media Library."
          page={selectedPage}
          confirmLabel="Delete Page"
          danger
          onCancel={() => setPageAction(null)}
          onConfirm={handleDeletePage}
        />
      )}
      {pageAction === 'archive' && selectedPage && (
        <PageActionDialog
          title="Archive this page?"
          body="The page is removed from the public website and moved to Archived. Its version history and media are kept, and you can restore it later."
          page={selectedPage}
          confirmLabel="Archive Page"
          danger
          onCancel={() => setPageAction(null)}
          onConfirm={handleArchivePage}
        />
      )}
      {createDialogOpen &&<CreatePageDialog existingRoutes={new Set(pages.map(page => page.route))} onCancel={() => setCreateDialogOpen(false)} onCreated={handleCreatedPage} />}
    </div>
  )
}

function Panel({ item, content, setField, setLines, setSentence, setImageAlt, openLibrary, fileInputRef }) {
  if (!item || !content) {
    return (
      <>
        <PanelHead title="Content" />
        <div className="cms-ref__property"><p>Select content in the preview.</p></div>
      </>
    )
  }
  const title = item.label
  if (item.kind === 'heading') {
    return (
      <>
        <PanelHead title="Heading" />
        <Tabs />
        <div className="cms-ref__property">
          <h3>☼ Text</h3>
          {item.lines
            ? <textarea value={(getAtPath(content, item.path) || []).join('\n')} onChange={event => setLines(item.path, event.target.value)} />
            : <textarea value={getAtPath(content, item.path) || ''} onChange={event => setField(item.path, event.target.value)} />}
        </div>
      </>
    )
  }
  if (item.kind === 'paragraph') {
    return (
      <>
        <PanelHead title="Paragraph" />
        <Tabs />
        <div className="cms-ref__property">
          <h3>☼ Text</h3>
          {item.sentence
            ? <textarea value={sentenceText(content, item.sentence)} onChange={event => setSentence(item.sentence, event.target.value)} />
            : <textarea value={getAtPath(content, item.path) || ''} onChange={event => setField(item.path, event.target.value)} />}
        </div>
      </>
    )
  }
  if (item.kind === 'text') {
    return (
      <>
        <PanelHead title="Text" />
        <Tabs />
        <div className="cms-ref__property">
          <h3>☼ Text</h3>
          <input value={getAtPath(content, item.path) || ''} onChange={event => setField(item.path, event.target.value)} />
        </div>
      </>
    )
  }
  if (item.kind === 'image') {
    return (
      <>
        <PanelHead title="Image" />
        <Tabs />
        <ImageControls image={item} content={content} setImageAlt={setImageAlt} openLibrary={openLibrary} fileInputRef={fileInputRef} />
      </>
    )
  }
  if (item.kind === 'button') {
    return (
      <>
        <PanelHead title={item.label} />
        <Tabs />
        <div className="cms-ref__property">
          <h3>⌕ Link</h3>
          <label>Button Text<input value={getAtPath(content, item.textPath) || ''} onChange={event => setField(item.textPath, event.target.value)} /></label>
          <label>Link URL<input value={getAtPath(content, item.urlPath) || ''} onChange={event => setField(item.urlPath, event.target.value)} /></label>
          <div className="cms-ref__toggle-row">Open in new tab <i /></div>
        </div>
      </>
    )
  }
  if (item.kind === 'card') {
    return (
      <>
        <PanelHead title="Card" />
        <Tabs />
        <div className="cms-ref__property">
          {item.titlePath && <label>Title<input value={getAtPath(content, item.titlePath) || ''} onChange={event => setField(item.titlePath, event.target.value)} /></label>}
          {item.descriptionPath && <label>Description<textarea value={getAtPath(content, item.descriptionPath) || ''} onChange={event => setField(item.descriptionPath, event.target.value)} /></label>}
          {item.urlPath && <label>Link<input value={getAtPath(content, item.urlPath) || ''} onChange={event => setField(item.urlPath, event.target.value)} /></label>}
        </div>
        {item.image && <ImageControls image={item.image} content={content} setImageAlt={setImageAlt} openLibrary={openLibrary} fileInputRef={fileInputRef} />}
      </>
    )
  }
  return (
    <>
      <PanelHead title={title} />
      <div className="cms-ref__property"><p>This record can be edited in a dedicated content panel.</p></div>
    </>
  )
}

// Replace Image + Media Library + Alt Text for one image field ({ path, altPath }).
function ImageControls({ image, content, setImageAlt, openLibrary, fileInputRef }) {
  const value = getAtPath(content, image.path)
  const src = mediaSrc(imageUrl(value))
  return (
    <div className="cms-ref__property cms-ref__property--image">
      {src && <img src={src} alt="" />}
      <div className="cms-ref__image-actions">
        <button type="button" onClick={() => fileInputRef.current?.click()}>Replace Image</button>
        <button type="button" onClick={openLibrary}>Choose Media</button>
      </div>
      <label>Alt Text<input value={(image.altPath && getAtPath(content, image.altPath)) || imageAlt(value, '')} onChange={event => setImageAlt(image, event.target.value)} /></label>
    </div>
  )
}

function PanelHead({ title }) {
  return (
    <div className="cms-ref__panel-head">
      <h2>{title}</h2>
      <button type="button">×</button>
    </div>
  )
}

function Tabs() {
  return (
    <div className="cms-ref__tabs">
      <button className="is-active" type="button">Content</button>
      <button type="button">Settings</button>
    </div>
  )
}

// Live size of an element (used to fit the preview iframe into the canvas).
function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize(current => (current.width === width && current.height === height ? current : { width, height }))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return size
}

const ARCHIVED_GROUP = 'Archived'

// Sidebar section icons (Carbon, outline). Unknown sections fall back to a folder.
const GROUP_ICONS = {
  Home,
  Capabilities: Catalog,
  'Products & Platforms': Product,
  Industries: Industry,
  'Agentic AI': Bot,
  Insights: Blog,
  Company: Enterprise,
  Legal: Policy,
  Global: Earth,
  'Custom Pages': DocumentBlank,
  [ARCHIVED_GROUP]: Archive,
}

const SIDEBAR_ORDER = [
  'Home',
  'Capabilities',
  'Products & Platforms',
  'Industries',
  'Agentic AI',
  'Insights',
  'Company',
  'Legal',
  'Global',
  'Custom Pages',
  ARCHIVED_GROUP,
]

function buildSidebarGroups(groups, pages, query) {
  const pageIds = new Set(pages.map(page => page.id))
  const search = query.trim().toLowerCase()
  const visibleGroups = []

  for (const group of groups) {
    const label = group.label === 'Pages' ? 'Custom Pages' : group.label
    const items = group.items
      .filter(entry => pageIds.has(entry.id))
      .map(entry => ({
        ...entry,
        label: entry.id === 'company-overview' ? 'Company Overview' : entry.label,
      }))
      .filter(entry => !search || entry.label.toLowerCase().includes(search))

    if (items.length) visibleGroups.push({ label, items })
  }

  return visibleGroups.sort((a, b) => {
    const aIndex = SIDEBAR_ORDER.indexOf(a.label)
    const bIndex = SIDEBAR_ORDER.indexOf(b.label)
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
  })
}

// The short line next to the status chip: what is live and what is pending, never a guessed time.
function statusLabel({ baseState, phase, status, version }) {
  if (phase === 'saving') return 'Saving draft...'
  if (phase === 'publishing') return 'Publishing...'
  if (/failed/i.test(status)) return status // e.g. "Publish failed: ..." / "Save failed: ..."
  const live = version ? `Live: version ${version}` : 'Not published yet'
  if (baseState === 'unsaved') return `Unsaved changes · ${live}`
  if (baseState === 'draft') return `Draft saved · ${live}`
  if (baseState === 'archived') return 'Not on the website · Restore to edit and publish'
  return version ? `Published version ${version}` : 'Not published yet'
}

