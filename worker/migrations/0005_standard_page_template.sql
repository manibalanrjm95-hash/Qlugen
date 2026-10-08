-- Finalise the page-builder templates: the early "standard-landing" template becomes the approved
-- "standard-page" template (cards gain a heading, the banner gains a button).
--
-- Safe by construction: only pages that were NEVER published are touched, and only their DRAFT
-- row (drafts are editable). Published/archived versions are immutable and are not modified.
-- Running it on a database without such pages changes nothing.

UPDATE cms_versions
SET content_json = json_object(
  'hero', json_set(json(json_extract(content_json, '$.hero')), '$.cta', json_object('label', 'Talk to an Architect', 'url', '/contact')),
  'intro', json(json_extract(content_json, '$.intro')),
  'cards', json_object(
    'eyebrow', 'Highlights',
    'title', 'Why it matters',
    'items', json(COALESCE(json_extract(content_json, '$.cards'), '[]'))
  ),
  'cta', json(json_extract(content_json, '$.cta')),
  'seo', json(json_extract(content_json, '$.seo'))
)
WHERE status = 'draft'
  AND json_type(content_json, '$.cards') = 'array'
  AND page_id IN (
    SELECT id FROM cms_pages
    WHERE template_id = 'standard-landing' AND published_version_id IS NULL
  );

UPDATE cms_pages
SET template_id = 'standard-page', content_type = 'standardPage'
WHERE template_id = 'standard-landing' AND published_version_id IS NULL;
