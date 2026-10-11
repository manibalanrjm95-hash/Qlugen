-- Phase 6A: code-template page creation and page lifecycle flags.
ALTER TABLE cms_pages ADD COLUMN template_id TEXT;
ALTER TABLE cms_pages ADD COLUMN page_status TEXT NOT NULL DEFAULT 'published'
  CHECK (page_status IN ('draft', 'published', 'archived'));

UPDATE cms_pages SET template_id = content_type WHERE template_id IS NULL;
UPDATE cms_pages SET page_status = 'published' WHERE published_version_id IS NOT NULL;
