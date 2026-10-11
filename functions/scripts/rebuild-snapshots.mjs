// Regenerates every public snapshot (cms-public/**) from the current published versions in
// Firestore, and removes snapshots of archived/unpublished pages. Safe to run any time.
//
//   node functions/scripts/rebuild-snapshots.mjs
//   node functions/scripts/rebuild-snapshots.mjs --project qlugen-enterprise --yes
//
// Production writes are guarded: they require --project and --yes, and only qlugen-enterprise is
// allowed by default. Production mode does not delete existing Storage snapshots.
import { initializeApp } from 'firebase-admin/app'
import { COLLECTIONS, db } from '../src/records.js'
import { rebuildAllSnapshots } from '../src/snapshots.js'

const yes = process.argv.includes('--yes')
const projectArg = argValue('--project')

// --emulators: use the local emulator ports from firebase.json.
if (process.argv.includes('--emulators')) {
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080'
  process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= '127.0.0.1:9199'
}
const usingEmulators = Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_STORAGE_EMULATOR_HOST)
const projectId = projectArg || process.env.GCLOUD_PROJECT || process.env.CMS_FIREBASE_PROJECT || 'demo-qlugen-cms'
const production = !usingEmulators

if (production) assertProductionAllowed({ projectId, yes })
initializeApp({ projectId, storageBucket: process.env.CMS_STORAGE_BUCKET || defaultStorageBucket(projectId) })
const pages = await db().collection(COLLECTIONS.pages).get()
console.log(`Target project: ${projectId}${production ? ' (production)' : ' (emulators)'}`)
console.log(`Pages in Firestore: ${pages.size}`)
console.log(production
  ? 'Existing snapshots: updated for published pages; deletes are skipped in production.'
  : 'Existing snapshots: updated for published pages; unpublished/archived snapshots may be removed.')
await rebuildAllSnapshots({ log: console.log, removeUnpublished: !production })

function argValue(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : ''
}

function assertProductionAllowed({ projectId, yes }) {
  const allowlist = (process.env.CMS_PRODUCTION_PROJECT_ALLOWLIST || 'qlugen-enterprise')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
  if (!projectId || !yes || !process.argv.includes('--project')) {
    console.error('Refusing to rebuild production snapshots: pass both "--project qlugen-enterprise" and "--yes".')
    process.exit(1)
  }
  if (!allowlist.includes(projectId)) {
    console.error(`Refusing to rebuild snapshots for production project "${projectId}". Add it to CMS_PRODUCTION_PROJECT_ALLOWLIST to allow it explicitly.`)
    process.exit(1)
  }
}

function defaultStorageBucket(projectId) {
  return projectId === 'qlugen-enterprise' ? 'qlugen-enterprise.firebasestorage.app' : `${projectId}.appspot.com`
}
