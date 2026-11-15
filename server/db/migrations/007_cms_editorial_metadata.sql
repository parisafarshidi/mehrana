ALTER TABLE feature_content ADD COLUMN source_title TEXT NOT NULL DEFAULT '';
ALTER TABLE feature_content ADD COLUMN source_pages TEXT NOT NULL DEFAULT '';
ALTER TABLE feature_content ADD COLUMN reviewed_at TEXT NOT NULL DEFAULT '';
ALTER TABLE feature_content ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_feature_content_order ON feature_content(content_type, status, sort_order, min_age_months, title);
