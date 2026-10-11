// `npm run cms:dev:auth`: the local CMS Worker (port 8787 and the same local database as
// `npm run cms:dev`) but with sign-in REQUIRED, exactly like staging: every /api/admin/* request
// needs a Firebase ID token that the Worker verifies (Google signing keys, project, expiry,
// email/password sign-in) for an approved admin. Use it with VITE_CMS_REQUIRE_AUTH=true to test the
// real Firebase Email/Password login on localhost. Nothing is deployed; nothing remote is changed.
//
// The override: `--var CMS_ENV:local-auth` replaces CMS_ENV="local" from wrangler.toml, so the
// Worker's no-sign-in bypass (which needs CMS_ENV === "local") never applies.
//
// Safety checks: on Windows several Workers can listen on the same port at once and requests keep
// going to the OLDEST one, so an old `npm run cms:dev` would silently keep answering as
// "local-admin". This script therefore refuses to start while anything answers on the port, and
// after start-up confirms that /api/admin/me without a token is refused (401).
//
// Settings (environment variables, or the same names in .env.local):
//   FIREBASE_PROJECT_ID  (falls back to VITE_FIREBASE_PROJECT_ID)
//   CMS_ADMIN_UIDS       comma-separated Firebase UIDs allowed into the CMS (recommended)
//   CMS_ADMIN_EMAILS     comma-separated emails allowed into the CMS (the email must be verified)
//   CMS_DEV_PORT         optional, default 8787 (also set CMS_DEV_API_TARGET for `npm run dev`)
// Tests only: FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:<port> (honoured by the Worker for loopback only).
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as wait } from 'node:timers/promises'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const fileEnv = readEnvFile(path.join(root, '.env.local'))
const setting = name => (process.env[name] ?? fileEnv[name] ?? '').trim()

const projectId = setting('FIREBASE_PROJECT_ID') || setting('VITE_FIREBASE_PROJECT_ID')
const adminUids = setting('CMS_ADMIN_UIDS')
const adminEmails = setting('CMS_ADMIN_EMAILS')
const emulatorHost = setting('FIREBASE_AUTH_EMULATOR_HOST')
const port = Number(setting('CMS_DEV_PORT') || 8787)
const base = `http://127.0.0.1:${port}`

const missing = []
if (!projectId) missing.push('FIREBASE_PROJECT_ID (or VITE_FIREBASE_PROJECT_ID)')
if (!adminUids && !adminEmails) missing.push('CMS_ADMIN_UIDS and/or CMS_ADMIN_EMAILS')
if (!Number.isInteger(port) || port < 1024 || port > 65535) missing.push('a valid CMS_DEV_PORT')
if (missing.length) fail(`cms:dev:auth needs: ${missing.join(', ')}.\nSet them in .env.local or the environment (see .env.example).`)
for (const [name, value] of [['FIREBASE_PROJECT_ID', projectId], ['CMS_ADMIN_UIDS', adminUids], ['CMS_ADMIN_EMAILS', adminEmails], ['FIREBASE_AUTH_EMULATOR_HOST', emulatorHost]]) {
  if (/[\s"'&|<>^]/.test(value)) fail(`${name} contains spaces or shell characters; use plain comma-separated values.`)
}

// 1. Nothing may already be answering on the port (e.g. an old `npm run cms:dev`).
const existing = await probe()
if (existing) {
  fail(`Port ${port} is already in use${existing.mode ? ` by a CMS Worker in "${existing.mode}" mode` : ''} (${existing.summary}).\n`
    + 'Stop it first (Ctrl+C in the terminal running `npm run cms:dev` / `npm run cms:dev:auth`, or close that terminal), then run this again.')
}

// 2. Start the Worker. CMS_ENV is anything but "local", so the no-sign-in bypass never applies.
const vars = ['CMS_ENV:local-auth', `FIREBASE_PROJECT_ID:${projectId}`]
if (adminUids) vars.push(`CMS_ADMIN_UIDS:${adminUids}`)
if (adminEmails) vars.push(`CMS_ADMIN_EMAILS:${adminEmails}`)
if (emulatorHost) vars.push(`FIREBASE_AUTH_EMULATOR_HOST:${emulatorHost}`)
const command = [`npx wrangler dev --local --config worker/wrangler.toml --port ${port}`, ...vars.map(value => `--var ${value}`)].join(' ')

console.log(`Starting the local CMS Worker on ${base} with Firebase sign-in REQUIRED (project ${projectId}; admins: ${[adminUids && `UIDs ${adminUids}`, adminEmails && `emails ${adminEmails}`].filter(Boolean).join(', ')}${emulatorHost ? `; Auth emulator ${emulatorHost}` : ''})`)
const child = spawn(command, { cwd: root, stdio: 'inherit', shell: true })
child.on('exit', code => process.exit(code ?? 0))
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stopChild())

// 3. Confirm that THIS Worker answers, in sign-in-required mode.
for (let attempt = 0; attempt < 120; attempt += 1) {
  await wait(500)
  const answer = await probe()
  if (!answer) continue
  if (answer.status === 401) {
    console.log(`\ncms:dev:auth ready: GET ${base}/api/admin/me without a token -> 401 (sign-in required, no local-admin bypass).\n`)
    break
  }
  stopChild()
  fail(`Expected ${base}/api/admin/me without a token to be refused (401), got ${answer.summary}. Another Worker may be answering on port ${port}; stop it and run again.`)
}

async function probe() {
  try {
    const response = await fetch(`${base}/api/admin/me`, { signal: AbortSignal.timeout(1500) })
    const body = await response.json().catch(() => ({}))
    return { status: response.status, mode: body.mode || '', summary: `HTTP ${response.status}${body.mode ? ` ${body.mode}/${body.actor}` : body.error ? ` "${body.error}"` : ''}` }
  } catch (error) {
    if (error?.name === 'TimeoutError') return { status: 0, mode: '', summary: 'connection open but not answering' }
    return null // nothing listening
  }
}

function stopChild() {
  if (!child?.pid) return
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
  else child.kill()
}

function fail(message) {
  console.error(`\n${message}`)
  process.exit(1)
}

function readEnvFile(file) {
  if (!existsSync(file)) return {}
  const values = {}
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (match) values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
  }
  return values
}
