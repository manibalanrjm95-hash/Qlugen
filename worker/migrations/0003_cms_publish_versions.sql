-- Phase 4: publish, version history and restore.

-- Pointer to the page's current published version.
ALTER TABLE cms_pages ADD COLUMN published_version_id TEXT;

-- For drafts created by Restore: the historical version the draft was copied from.
ALTER TABLE cms_versions ADD COLUMN based_on_version_id TEXT;

UPDATE cms_pages
SET published_version_id = (
  SELECT v.id FROM cms_versions v
  WHERE v.page_id = cms_pages.id AND v.status = 'published'
  ORDER BY v.version_number DESC
  LIMIT 1
);

-- Released (published/archived) version numbers are unique per page; at most one published version per page.
CREATE UNIQUE INDEX IF NOT EXISTS idx_cms_versions_page_number_released
ON cms_versions(page_id, version_number)
WHERE status != 'draft';

CREATE UNIQUE INDEX IF NOT EXISTS idx_cms_versions_page_published
ON cms_versions(page_id)
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_cms_audit_created
ON cms_audit_log(created_at DESC);

-- Published and archived versions are immutable. The only allowed change is published -> archived.
CREATE TRIGGER IF NOT EXISTS trg_cms_versions_immutable
BEFORE UPDATE ON cms_versions
WHEN OLD.status != 'draft' AND (
  NEW.content_json IS NOT OLD.content_json
  OR NEW.page_id IS NOT OLD.page_id
  OR NEW.version_number IS NOT OLD.version_number
  OR NEW.created_at IS NOT OLD.created_at
  OR NEW.created_by IS NOT OLD.created_by
  OR NEW.published_at IS NOT OLD.published_at
  OR NEW.based_on_version_id IS NOT OLD.based_on_version_id
  OR (NEW.status IS NOT OLD.status AND NOT (OLD.status = 'published' AND NEW.status = 'archived'))
)
BEGIN
  SELECT RAISE(ABORT, 'cms_versions: published and archived versions are immutable');
END;

CREATE TRIGGER IF NOT EXISTS trg_cms_versions_no_delete
BEFORE DELETE ON cms_versions
WHEN OLD.status != 'draft'
BEGIN
  SELECT RAISE(ABORT, 'cms_versions: published and archived versions cannot be deleted');
END;
