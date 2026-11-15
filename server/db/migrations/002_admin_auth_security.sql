-- Adds a verified destination for administrator OTP and persistent login throttling.
-- Existing mother tables and records are not modified.
ALTER TABLE admin_users ADD COLUMN phone TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_phone
  ON admin_users(phone) WHERE phone IS NOT NULL;

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  attempted_at INTEGER NOT NULL,
  succeeded INTEGER NOT NULL DEFAULT 0 CHECK (succeeded IN (0, 1))
);
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_username_time
  ON admin_login_attempts(username, attempted_at);
