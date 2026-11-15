-- Editorial content catalog for food, breastfeeding, activities, milestones and sleep guidance.
-- Personal sleep logs, reminders, health records and family membership remain private user data.
CREATE TABLE IF NOT EXISTS feature_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_type TEXT NOT NULL CHECK(content_type IN ('food','breastfeeding','activity','milestone','sleep_guide','reminder')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  min_age_months INTEGER,
  max_age_months INTEGER,
  tags_json TEXT NOT NULL DEFAULT '[]',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  author_name TEXT NOT NULL DEFAULT '',
  reviewer_name TEXT NOT NULL DEFAULT '',
  source_notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(content_type, slug),
  CHECK(min_age_months IS NULL OR min_age_months BETWEEN 0 AND 60),
  CHECK(max_age_months IS NULL OR max_age_months BETWEEN 0 AND 60),
  CHECK(min_age_months IS NULL OR max_age_months IS NULL OR max_age_months >= min_age_months)
);
CREATE INDEX IF NOT EXISTS idx_feature_content_type_status ON feature_content(content_type,status,published_at);
CREATE INDEX IF NOT EXISTS idx_feature_content_updated ON feature_content(updated_at);
