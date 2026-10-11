// Bundles the CMS Functions (src/) together with the shared website modules they reuse
// (../src/cms/*, ../src/lib/*: templates, route rules, content validation, design lock, media
// helpers) into lib/index.js. Firebase deploys only this folder, so the shared code must be inside
// the bundle; firebase-admin / firebase-functions stay external (installed from package.json).
import { build } from 'esbuild'

await build({
  entryPoints: ['src/index.js'],
  outfile: 'lib/index.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  sourcemap: true,
  external: ['firebase-admin', 'firebase-admin/*', 'firebase-functions', 'firebase-functions/*'],
  logLevel: 'info',
})
