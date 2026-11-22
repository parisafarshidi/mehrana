CREATE TABLE IF NOT EXISTS consultation_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  topic TEXT NOT NULL CHECK(topic IN ('family-health','child-growth','mehrana','other')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','answered')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_status_created
  ON consultation_requests(status, created_at DESC);
