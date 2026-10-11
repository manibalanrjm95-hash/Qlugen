# Qlugen CMS on Firebase

Target setup: **Hostinger** (static website + /admin) + **Firebase** (Auth, Cloud Functions, Firestore, Storage).
Firebase project: `qlugen-enterprise` (Blaze). Local development uses the emulators with the
`demo-qlugen-cms` project, which never contacts real Firebase. The Cloudflare Worker (`worker/`) is
kept unchanged for rollback until Firebase is verified.

## How it fits together

| Piece | Where | Notes |
| --- | --- | --- |
| Admin API `/api/admin/*` | Cloud Function `cmsAdminApi` (2nd gen, `asia-south1`) | Same routes/responses as the Worker. Verifies the Firebase ID token, approved admins only, CORS for `CMS_ALLOWED_ORIGINS` only. 256 MiB, max 3 instances, no min instances. |
| CMS data | Firestore (`cms_pages`, `cms_pages/*/cms_versions`, `cms_route_keys`, `cms_audit_log`, `cms_media`) | Rules deny all browser access; only the function (Admin SDK) reads/writes. |
| Media | Storage `cms/YYYY/MM/<id>-<name>.<ext>` | Immutable, publicly downloadable, uploaded only through the function. Content keeps `/media/<path>`; the site resolves it to Storage. |
| Published snapshots | Storage `cms-public/pages/<id>.json`, `cms-public/routes/<slug>.json` | Written on Publish, removed on Archive. The public site reads these directly (no function call). |
| Public site fallback | Local JSON in the build | Used whenever a snapshot is missing or Storage is unreachable. |

Recovery: if a Publish reports *"the public website could not be updated yet"*, call
`POST /api/admin/snapshots/rebuild` as an admin (rewrites every snapshot from Firestore).

## Website environment (`.env.production` for the Hostinger build)

```
VITE_CMS_RUNTIME_ENABLED=true
VITE_CMS_CONTENT_SOURCE=storage
VITE_CMS_STORAGE_BASE=https://firebasestorage.googleapis.com/v0/b/qlugen-enterprise.firebasestorage.app/o
VITE_CMS_API_BASE=https://asia-south1-qlugen-enterprise.cloudfunctions.net/cmsAdminApi
VITE_FIREBASE_API_KEY=...            (Project settings > Your apps > Web app)
VITE_FIREBASE_AUTH_DOMAIN=qlugen-enterprise.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=qlugen-enterprise
VITE_FIREBASE_APP_ID=...
```

Use the bucket name shown in Console > Storage (new projects: `qlugen-enterprise.firebasestorage.app`).
Unset `VITE_CMS_CONTENT_SOURCE` to roll back to the Worker.

## Function parameters (`functions/.env.qlugen-enterprise`, not secrets)

```
CMS_ADMIN_UIDS=<uid1>,<uid2>
CMS_ADMIN_EMAILS=
CMS_ALLOWED_ORIGINS=https://qlugen.in,https://www.qlugen.in
CMS_LOCAL_BYPASS=false
```

`CMS_LOCAL_BYPASS` only ever applies inside the Functions emulator on a loopback host.

## Manual Firebase Console setup (before the first deploy)

1. **Billing safety** (Google Cloud Console > Billing > Budgets & alerts): create a budget for the
   project (e.g. ₹500/month) with email alerts at 50% / 90% / 100%. Budgets alert, they do not stop
   spending; the function's `maxInstances: 3` and the 10 MB upload cap are the hard limits in code.
2. **Firestore**: Build > Firestore Database > Create database, *Native mode*, location
   **asia-south1 (Mumbai)**, production rules. The location cannot be changed later.
3. **Storage**: Build > Storage > Get started, location **asia-south1**. Note: the Always Free
   Storage quota applies only to US-CENTRAL1/US-EAST1/US-WEST1; asia-south1 is billed at standard
   rates from the first byte (a few MB of snapshots and images costs cents per month).
4. **Storage CORS** (needed so the website can `fetch()` snapshots), from this folder:
   `gcloud storage buckets update gs://qlugen-enterprise.firebasestorage.app --cors-file=storage.cors.json`
5. **Authentication**: Sign-in method > enable *Email/Password* only; Settings > Authorized domains >
   add `qlugen.in` and `www.qlugen.in`. Create the admin users, copy their UIDs into `CMS_ADMIN_UIDS`.
6. **Web app**: Project settings > Your apps > add a Web app (if none) for the `VITE_FIREBASE_*` values.

Regions: Functions, Firestore and Storage all support asia-south1; nothing in this setup needs a
US-only service.

## Commands

| Command | What it does | Needs |
| --- | --- | --- |
| `npm run cms:fb:build` | Bundle the function into `functions/lib` | — |
| `npm run cms:fb:test` | Unit tests (auth, CORS, records, snapshots, image sniffing) | — |
| `npm run cms:fb:test:auth` | Sign-in gate in the real Functions + Auth emulators | — |
| `npm run cms:fb:test:runtime` | Public site reading snapshots/media from Storage, local-JSON fallback | Playwright |
| `npm run cms:fb:test:data` | Full data flow + Firestore/Storage rules in the emulators | **Java 11+** |
| `npm run cms:fb:emulators` | Run all emulators for local CMS work | Java 11+ |
| `npm run cms:fb:seed` / `cms:fb:snapshots` | Seed Firestore / rebuild snapshots (emulators only) | Java 11+ |

Nothing in this repo deploys the CMS; deployment is a separate, explicit step.
