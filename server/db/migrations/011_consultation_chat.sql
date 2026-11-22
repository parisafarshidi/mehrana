ALTER TABLE consultation_requests ADD COLUMN thread_token_hash TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_consultation_requests_thread_token
  ON consultation_requests(thread_token_hash) WHERE thread_token_hash IS NOT NULL;

CREATE TABLE IF NOT EXISTS consultation_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL REFERENCES consultation_requests(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK(sender IN ('parent','admin')),
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_consultation_messages_thread_created
  ON consultation_messages(request_id, created_at, id);
