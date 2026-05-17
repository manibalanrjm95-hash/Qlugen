import { spawn } from 'node:child_process'
import path from 'node:path'

const command = process.argv[2] ?? 'dev'
const args = process.argv.slice(3)
const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next')
const extraArgs = command === 'dev' ? ['--webpack'] : []

const child = spawn(process.execPath, [nextBin, command, ...extraArgs, ...args], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NAPI_RS_FORCE_WASI: '1',
  },
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})
