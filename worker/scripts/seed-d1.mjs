import { spawnSync } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { contentRegistry } from './content-registry.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const seedFile = 'worker/.tmp/seed.sql'
const workerSeedFile = '.tmp/seed.sql'

await mkdir(path.join(root, 'worker/.tmp'), { recursive: true })
run('node', ['worker/scripts/generate-seed-sql.mjs', '--out', seedFile])
const wranglerCommand = process.platform === 'win32'
  ? ['cmd.exe', ['/d', '/s', '/c', `npx wrangler d1 execute qlugen-cms-local --local --file ${workerSeedFile}`]]
  : ['npx', ['wrangler', 'd1', 'execute', 'qlugen-cms-local', '--local', '--file', workerSeedFile]]
run(wranglerCommand[0], wranglerCommand[1], { cwd: path.join(root, 'worker') })

console.log(`Seeded ${contentRegistry.length} CMS content records.`)

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || root,
    shell: false,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status || 1)
  }
}

