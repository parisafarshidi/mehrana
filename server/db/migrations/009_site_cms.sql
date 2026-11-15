CREATE TABLE IF NOT EXISTS site_content (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 content_type TEXT NOT NULL CHECK(content_type IN ('page','banner','menu','category','media')),
 title TEXT NOT NULL,
 slug TEXT NOT NULL,
 summary TEXT NOT NULL DEFAULT '',
 body TEXT NOT NULL DEFAULT '',
 payload_json TEXT NOT NULL DEFAULT '{}',
 sort_order INTEGER NOT NULL DEFAULT 0,
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 UNIQUE(content_type,slug)
);
CREATE INDEX IF NOT EXISTS idx_site_content_type_status_order ON site_content(content_type,status,sort_order);
