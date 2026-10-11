import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { contentRegistry } from './content-registry.mjs'
import { NO_DELETE_TRIGGER_SQL } from './sql-snippets.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const outputArgIndex = process.argv.indexOf('--out')
const outputPath = outputArgIndex >= 0 ? process.argv[outputArgIndex + 1] : null
const now = new Date().toISOString()
// --mode reset (default): wipe all CMS pages/versions/audit, then seed. Destructive.
// --mode insert-missing: only add pages that do not exist yet; never deletes or overwrites.
const modeArgIndex = process.argv.indexOf('--mode')
const mode = modeArgIndex >= 0 ? process.argv[modeArgIndex + 1] : 'reset'
if (!['reset', 'insert-missing'].includes(mode)) throw new Error(`Unknown --mode ${mode}`)
// Remote D1 imports reject explicit transactions (the import itself is applied as one unit).
const useTransaction = !process.argv.includes('--no-transaction')
const insert = mode === 'reset' ? 'INSERT' : 'INSERT OR IGNORE'

// A reset drops the history-protection trigger for the wipe and recreates it at the end
// (same definition as migrations/0003_cms_publish_versions.sql).
const statements = [
  ...(useTransaction ? ['BEGIN TRANSACTION;'] : []),
  ...(mode === 'reset'
    ? [
        'DROP TRIGGER IF EXISTS trg_cms_versions_no_delete;',
        'DELETE FROM cms_audit_log;',
        'DELETE FROM cms_versions;',
        'DELETE FROM cms_pages;',
      ]
    : []),
]

for (const entry of contentRegistry) {
  const absolutePath = path.join(root, entry.file)
  const raw = await readFile(absolutePath, 'utf8')
  const content = JSON.stringify(JSON.parse(raw))

  statements.push(
    `${insert} INTO cms_pages (id, route, slug, content_type, title, created_at, updated_at, published_version_id) VALUES (${sql(entry.id)}, ${sql(entry.route)}, ${sql(entry.slug)}, ${sql(entry.contentType)}, ${sql(entry.title)}, ${sql(now)}, ${sql(now)}, ${sql(`seed-${entry.id}-v1`)});`
  )

  statements.push(
    `${insert} INTO cms_versions (id, page_id, version_number, status, content_json, created_at, created_by, published_at) VALUES (${sql(`seed-${entry.id}-v1`)}, ${sql(entry.id)}, 1, 'published', ${sql(content)}, ${sql(now)}, 'seed', ${sql(now)});`
  )

  statements.push(
    `${insert} INTO cms_audit_log (id, page_id, action, before_json, after_json, created_at, actor) VALUES (${sql(`seed-${entry.id}`)}, ${sql(entry.id)}, 'seeded', NULL, ${sql(content)}, ${sql(now)}, 'seed');`
  )
}

if (mode === 'reset') {
  statements.push(
    NO_DELETE_TRIGGER_SQL,
  )
}
if (useTransaction) statements.push('COMMIT;')

const sqlText = `${statements.join('\n')}\n`

if (outputPath) {
  await writeFile(path.resolve(root, outputPath), sqlText)
} else {
  process.stdout.write(sqlText)
}

function sql(value) {
  return `'${String(value).replaceAll("'", "''")}'`
}
