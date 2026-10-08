// Staging CMS helper. LOCAL subcommands are safe to run any time; REMOTE subcommands touch
// Cloudflare staging resources only and refuse to run without --yes.
//
//   node worker/scripts/staging.mjs check                 (local)  validate staging config + dry-run bundle
//   node worker/scripts/staging.mjs build                 (local)  build site into out-staging/ with CMS runtime on
//   node worker/scripts/staging.mjs migrate --yes         (REMOTE) apply D1 migrations to qlugen-cms-staging
//   node worker/scripts/staging.mjs seed --yes            (REMOTE) add src/content pages missing from staging D1
//   node worker/scripts/staging.mjs seed --yes --reset --confirm qlugen-cms-staging
//                                                         (REMOTE) WIPE staging pages/versions/audit, then seed
//   node worker/scripts/staging.mjs deploy --yes          (REMOTE) build, check, deploy Worker qlugen-cms-staging
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const workerDir = path.join(root, 'worker')
const STAGING = { env: 'staging', worker: 'qlugen-cms-staging', database: 'qlugen-cms-staging', bucket: 'qlugen-cms-media-staging' }
const [command, ...flags] = process.argv.slice(2)
const has = flag => flags.includes(flag)

const commands = { check, build, migrate, seed, deploy }
if (!commands[command]) {
  console.error(`Usage: node worker/scripts/staging.mjs <${Object.keys(commands).join('|')}> [--yes]`)
  process.exit(1)
}
await commands[command]()

function check({ quiet = false, needsBuild = true } = {}) {
  const config = readFileSync(path.join(workerDir, 'wrangler.toml'), 'utf8')
  const staging = config.slice(config.indexOf('[env.staging]'))
  const problems = []

  if (!config.includes('[env.staging]')) problems.push('wrangler.toml has no [env.staging] section')
  if (!staging.includes(`name = "${STAGING.worker}"`)) problems.push(`staging Worker name must be ${STAGING.worker}`)
  if (!staging.includes(`database_name = "${STAGING.database}"`)) problems.push(`staging D1 must be ${STAGING.database}`)
  if (!staging.includes(`bucket_name = "${STAGING.bucket}"`)) problems.push(`staging R2 must be ${STAGING.bucket}`)
  if (!staging.includes('CMS_ENV = "staging"')) problems.push('staging must set CMS_ENV = "staging" (Firebase sign-in required)')
  if (/qlugen-cms-local|qlugen-cms-media"|qlugen-cms-api"/.test(staging)) problems.push('staging must not reuse local/production resource names')
  if (staging.includes('REPLACE_WITH_STAGING_D1_DATABASE_ID')) {
    problems.push('set database_id for qlugen-cms-staging (from `npx wrangler d1 create qlugen-cms-staging`)')
  }
  if (!/FIREBASE_PROJECT_ID = "[a-z0-9-]+"/.test(staging)) problems.push('staging must set FIREBASE_PROJECT_ID (Firebase sign-in)')
  if (/CMS_ADMIN_(UIDS|EMAILS)\s*=/.test(config)) problems.push('CMS admin allow-lists must be secrets (wrangler secret put), not wrangler.toml vars')
  if (/FIREBASE_(JWKS_URL|AUTH_EMULATOR_HOST)\s*=/.test(config)) problems.push('test-only Firebase overrides must never be in wrangler.toml')

  const migrations = readdirSync(path.join(workerDir, 'migrations')).filter(file => file.endsWith('.sql')).sort()
  const built = existsSync(path.join(root, 'out-staging', 'index.html'))
  if (!built && needsBuild) problems.push('out-staging/ not built (run: npm run cms:staging:build)')

  if (built) {
    mkdirSync(path.join(workerDir, '.tmp', 'staging-dry-run'), { recursive: true })
    const dryRun = wrangler(['deploy', '--dry-run', '--env', STAGING.env, '--outdir', '.tmp/staging-dry-run'], { allowFailure: true })
    if (dryRun !== 0) problems.push('wrangler deploy --dry-run --env staging failed (see output above)')
  }

  console.log(`\nStaging config: Worker ${STAGING.worker}, D1 ${STAGING.database}, R2 ${STAGING.bucket}`)
  console.log(`Migrations to apply: ${migrations.join(', ')}`)
  if (problems.length) {
    console.log(`\nNOT READY:\n${problems.map(problem => `  - ${problem}`).join('\n')}`)
    if (!quiet) process.exit(1)
    return false
  }
  console.log('\nReady: staging configuration verified (dry run only, nothing uploaded).')
  return true
}

function build() {
  // Same-origin staging: the Worker serves this build, so the API base is the site root ("/").
  // Set explicitly so a developer's .env.local (e.g. a localhost API base) never leaks in.
  run('npx', ['vite', 'build', '--outDir', 'out-staging', '--emptyOutDir'], {
    cwd: root,
    env: { VITE_CMS_RUNTIME_ENABLED: 'true', VITE_CMS_API_BASE: '/' },
  })
}

function migrate() {
  requireApproval('apply D1 migrations to the REMOTE staging database')
  requireReady({ needsBuild: false })
  wrangler(['d1', 'migrations', 'apply', STAGING.database, '--remote', '--env', STAGING.env])
}

function seed() {
  const reset = has('--reset')
  if (reset && flags[flags.indexOf('--confirm') + 1] !== STAGING.database) {
    console.error(`--reset wipes staging CMS history. Re-run with: --reset --confirm ${STAGING.database}`)
    process.exit(1)
  }
  requireApproval(reset ? 'WIPE and re-seed the REMOTE staging database' : 'add missing pages to the REMOTE staging database')
  requireReady({ needsBuild: false })

  const file = '.tmp/staging-seed.sql'
  mkdirSync(path.join(workerDir, '.tmp'), { recursive: true })
  run('node', ['worker/scripts/generate-seed-sql.mjs', '--out', `worker/${file}`, '--mode', reset ? 'reset' : 'insert-missing', '--no-transaction'], { cwd: root })
  wrangler(['d1', 'execute', STAGING.database, '--remote', '--env', STAGING.env, '--file', file])
}

function deploy() {
  requireApproval(`deploy Worker ${STAGING.worker} (staging only)`)
  build()
  requireReady()
  wrangler(['deploy', '--env', STAGING.env])
}

function requireApproval(action) {
  if (has('--yes')) return
  console.error(`Refusing to ${action} without --yes.`)
  process.exit(1)
}

function requireReady({ needsBuild = true } = {}) {
  if (!check({ quiet: true, needsBuild })) {
    console.error('Staging configuration is not ready; nothing was changed remotely.')
    process.exit(1)
  }
}

function wrangler(args, options = {}) {
  return run('npx', ['wrangler', ...args], { cwd: workerDir, ...options })
}

function run(cmd, args, { cwd, env = {}, allowFailure = false } = {}) {
  console.log(`\n> ${cmd} ${args.join(' ')}`)
  const result = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', [cmd, ...args].join(' ')], { cwd, env: { ...process.env, ...env }, stdio: 'inherit' })
    : spawnSync(cmd, args, { cwd, env: { ...process.env, ...env }, stdio: 'inherit' })
  if (result.status !== 0 && !allowFailure) process.exit(result.status || 1)
  return result.status
}
