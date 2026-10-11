CREATE TABLE IF NOT EXISTS cms_pages (
  id TEXT PRIMARY KEY,
  route TEXT UNIQUE NOT NULL,
  slug TEXT NOT NULL,
  content_type TEXT NOT NULL,
  title TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_versions (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  content_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_by TEXT,
  published_at TEXT,
  FOREIGN KEY (page_id) REFERENCES cms_pages(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cms_versions_page_status_draft
ON cms_versions(page_id, status)
WHERE status = 'draft';

CREATE INDEX IF NOT EXISTS idx_cms_versions_page_created
ON cms_versions(page_id, created_at DESC);

CREATE TABLE IF NOT EXISTS cms_audit_log (
  id TEXT PRIMARY KEY,
  page_id TEXT,
  action TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  created_at TEXT NOT NULL,
  actor TEXT,
  FOREIGN KEY (page_id) REFERENCES cms_pages(id) ON DELETE SET NULL
);
