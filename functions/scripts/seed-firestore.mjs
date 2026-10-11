// Seeds the CMS in Firestore + Storage from the website's local content JSON (the Firebase
// equivalent of worker/scripts/generate-seed-sql.mjs): every registry page gets a published
// version 1, its URL/slug keys, a "seeded" audit entry, and its public snapshot in Storage.
//
//   node functions/scripts/seed-firestore.mjs            add missing pages only (never overwrites)
//   node functions/scripts/seed-firestore.mjs --reset    wipe CMS pages/versions/audit first
//   node functions/scripts/seed-firestore.mjs --project qlugen-enterprise --yes
//                                                        production: add missing pages only
//
// Production writes are guarded: they require --project and --yes, and only qlugen-enterprise is
// allowed by default. Set CMS_PRODUCTION_PROJECT_ALLOWLIST=project-a,project-b to explicitly allow
// another production project.
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp } from 'firebase-admin/app'
import { contentRegistry } from '../../src/cms/contentRegistry.js'
import { COLLECTIONS, db, mediaRefsIn, pageRef, routeKeyRef, routeKeysFor, versionRef } from '../src/records.js'
import { rebuildAllSnapshots } from '../src/snapshots.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const reset = process.argv.includes('--reset')
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

if (production) assertProductionAllowed({ projectId, yes, reset })
initializeApp({ projectId, storageBucket: process.env.CMS_STORAGE_BUCKET || defaultStorageBucket(projectId) })

console.log(`Target project: ${projectId}${production ? ' (production)' : ' (emulators)'}`)
console.log(`Pages in local registry: ${contentRegistry.length}`)
console.log(reset ? 'Existing CMS documents: reset first, then recreate missing pages.' : 'Existing CMS documents: skipped, never overwritten.')

if (reset) await wipe()

const now = new Date().toISOString()
let added = 0
for (const entry of contentRegistry) {
  const page = pageRef(entry.id)
  if ((await page.get()).exists) continue
  const contentJson = JSON.stringify(JSON.parse(await readFile(path.join(root, entry.file), 'utf8')))
  const versionId = `seed-${entry.id}-v1`
  const batch = db().batch()
  batch.create(page, {
    id: entry.id, route: entry.route, slug: entry.slug, contentType: entry.contentType, templateId: entry.contentType,
    title: entry.title, status: 'published', publishedVersionId: versionId, publishedVersionNumber: 1,
    latestVersionNumber: 1, hasDraft: false, createdAt: now, updatedAt: now,
  })
  batch.create(versionRef(entry.id, versionId), {
    id: versionId, pageId: entry.id, versionNumber: 1, status: 'published', contentJson, createdAt: now,
    createdBy: 'seed', publishedAt: now, basedOnVersionId: null, basedOnVersionNumber: null, mediaRefs: mediaRefsIn(contentJson),
  })
  for (const key of routeKeysFor(entry)) batch.set(routeKeyRef(key), { pageId: entry.id })
  batch.create(db().collection(COLLECTIONS.audit).doc(`seed-${entry.id}`), {
    id: `seed-${entry.id}`, pageId: entry.id, action: 'seeded', beforeJson: null, afterJson: contentJson, createdAt: now, actor: 'seed',
  })
  await batch.commit()
  added += 1
}

await rebuildAllSnapshots({ log: console.log, removeUnpublished: !production })
console.log(`Seeded ${added} pages into project ${projectId}${production ? ' (production)' : ' (emulators)'}${reset ? ' after reset' : ''}; ${contentRegistry.length - added} already present.`)

async function wipe() {
  for (const name of [COLLECTIONS.audit, COLLECTIONS.routeKeys, COLLECTIONS.pages]) {
    await db().recursiveDelete(db().collection(name))
  }
  console.log('Reset: CMS pages, versions, URL keys and audit log removed (media untouched).')
}

function argValue(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : ''
}

function assertProductionAllowed({ projectId, yes, reset }) {
  const allowlist = (process.env.CMS_PRODUCTION_PROJECT_ALLOWLIST || 'qlugen-enterprise')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
  if (!projectId || !yes || !process.argv.includes('--project')) {
    console.error('Refusing to seed production: pass both "--project qlugen-enterprise" and "--yes".')
    process.exit(1)
  }
  if (!allowlist.includes(projectId)) {
    console.error(`Refusing to seed production project "${projectId}". Add it to CMS_PRODUCTION_PROJECT_ALLOWLIST to allow it explicitly.`)
    process.exit(1)
  }
  if (reset) {
    console.error('Refusing to seed production with --reset. Production seed is non-destructive and only skips existing documents.')
    process.exit(1)
  }
}

function defaultStorageBucket(projectId) {
  return projectId === 'qlugen-enterprise' ? 'qlugen-enterprise.firebasestorage.app' : `${projectId}.appspot.com`
}
