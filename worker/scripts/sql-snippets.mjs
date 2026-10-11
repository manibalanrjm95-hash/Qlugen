// SQL shared by local maintenance scripts. Must match migrations/0003_cms_publish_versions.sql.
export const NO_DELETE_TRIGGER_SQL = "CREATE TRIGGER trg_cms_versions_no_delete BEFORE DELETE ON cms_versions WHEN OLD.status != 'draft' BEGIN SELECT RAISE(ABORT, 'cms_versions: published and archived versions cannot be deleted'); END;"
