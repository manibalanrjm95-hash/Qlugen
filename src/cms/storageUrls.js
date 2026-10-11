// Where the website loads CMS data from (public site and admin preview):
//
//   VITE_CMS_CONTENT_SOURCE=storage + VITE_CMS_STORAGE_BASE   (Firebase, the target setup)
//     published content = snapshots in Firebase Storage (cms-public/...), media = Storage files
//   otherwise                                                  rollback API origin
//     published content = <VITE_CMS_API_BASE>/api/public/..., media = <VITE_CMS_API_BASE>/media/...
//
// VITE_CMS_STORAGE_BASE is the bucket's download base, without a trailing slash, e.g.
//   https://firebasestorage.googleapis.com/v0/b/<bucket>/o          (Firebase)
//   http://127.0.0.1:9199/v0/b/<bucket>/o                           (Storage emulator)
// CMS content always references images as "/media/<path>"; they are resolved here at render time.
const useFirebaseEmulators = import.meta.env.VITE_FIREBASE_USE_EMULATORS === 'true' && import.meta.env.PROD !== true
const defaultEmulatorStorageBase = useFirebaseEmulators ? '/v0/b/demo-qlugen-cms.appspot.com/o' : ''
const defaultFirebaseStorageBase = import.meta.env.VITE_CMS_RUNTIME_ENABLED === 'true'
  ? 'https://firebasestorage.googleapis.com/v0/b/qlugen-enterprise.firebasestorage.app/o'
  : ''
const rawStorageBase = (import.meta.env.VITE_CMS_STORAGE_BASE || defaultEmulatorStorageBase || defaultFirebaseStorageBase).replace(/\/+$/, '')
// In dev, strip the Firebase Storage hostname so requests go through the Vite proxy (/v0/...)
// as same-origin — no CORS required. Production keeps the absolute URL.
const storageBase = !import.meta.env.PROD && rawStorageBase.startsWith('https://firebasestorage.googleapis.com')
  ? rawStorageBase.slice('https://firebasestorage.googleapis.com'.length)
  : rawStorageBase

export const contentFromStorage = (import.meta.env.VITE_CMS_CONTENT_SOURCE === 'storage' || import.meta.env.VITE_CMS_RUNTIME_ENABLED === 'true') && Boolean(storageBase)

// Public download URL of a Storage object (object paths are URL-encoded as one segment).
export function storageObjectUrl(objectPath) {
  return `${storageBase}/${encodeURIComponent(objectPath)}?alt=media`
}

export const pageSnapshotUrl = pageId => storageObjectUrl(`cms-public/pages/${pageId}.json`)
export const routeSnapshotUrl = slug => storageObjectUrl(`cms-public/routes/${slug}.json`)

// "/media/cms/2026/10/<id>-name.png" -> Storage download URL (or rollback API URL).
export function resolveCmsMediaUrl(url, apiBase = '') {
  if (typeof url !== 'string' || !url.startsWith('/media/')) return url
  return storageBase ? storageObjectUrl(url.slice('/media/'.length)) : `${apiBase}${url}`
}
