-- CMS media metadata. Binary files live in R2 (CMS_MEDIA binding); only metadata is stored here.
-- Assets are immutable: a replacement image is always a new row with a new r2_key.
CREATE TABLE IF NOT EXISTS cms_media (
  id TEXT PRIMARY KEY,
  r2_key TEXT UNIQUE NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  public_url TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_cms_media_created
ON cms_media(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cms_media_filename
ON cms_media(filename);
