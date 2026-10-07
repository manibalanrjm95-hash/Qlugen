import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { contentRegistry } from './content-registry.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const outputArgIndex = process.argv.indexOf('--out')
const outputPath = outputArgIndex >= 0 ? process.argv[outputArgIndex + 1] : null
const now = new Date().toISOString()

// Seeding is a full local reset, so the history-protection trigger is dropped for the wipe and
// recreated at the end (same definition as migrations/0003_cms_publish_versions.sql).
const statements = [
  'BEGIN TRANSACTION;',
  'DROP TRIGGER IF EXISTS trg_cms_versions_no_delete;',
  'DELETE FROM cms_audit_log;',
  'DELETE FROM cms_versions;',
  'DELETE FROM cms_pages;',
]

for (const entry of contentRegistry) {
  const absolutePath = path.join(root, entry.file)
  const raw = await readFile(absolutePath, 'utf8')
  const content = JSON.stringify(JSON.parse(raw))

  statements.push(
    `INSERT INTO cms_pages (id, route, slug, content_type, title, created_at, updated_at, published_version_id) VALUES (${sql(entry.id)}, ${sql(entry.route)}, ${sql(entry.slug)}, ${sql(entry.contentType)}, ${sql(entry.title)}, ${sql(now)}, ${sql(now)}, ${sql(`seed-${entry.id}-v1`)});`
  )

  statements.push(
    `INSERT INTO cms_versions (id, page_id, version_number, status, content_json, created_at, created_by, published_at) VALUES (${sql(`seed-${entry.id}-v1`)}, ${sql(entry.id)}, 1, 'published', ${sql(content)}, ${sql(now)}, 'seed', ${sql(now)});`
  )

  statements.push(
    `INSERT INTO cms_audit_log (id, page_id, action, before_json, after_json, created_at, actor) VALUES (${sql(`seed-${entry.id}`)}, ${sql(entry.id)}, 'seeded', NULL, ${sql(content)}, ${sql(now)}, 'seed');`
  )
}

statements.push(
  `CREATE TRIGGER trg_cms_versions_no_delete BEFORE DELETE ON cms_versions WHEN OLD.status != 'draft' BEGIN SELECT RAISE(ABORT, 'cms_versions: published and archived versions cannot be deleted'); END;`,
  'COMMIT;',
)

const sqlText = `${statements.join('\n')}\n`

if (outputPath) {
  await writeFile(path.resolve(root, outputPath), sqlText)
} else {
  process.stdout.write(sqlText)
}

function sql(value) {
  return `'${String(value).replaceAll("'", "''")}'`
}
