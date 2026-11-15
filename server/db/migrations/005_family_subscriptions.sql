-- Subscription and family-sharing foundation. No payment provider or invitation delivery is activated here.
CREATE TABLE IF NOT EXISTS subscription_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_amount INTEGER,
  currency TEXT NOT NULL DEFAULT 'IRR',
  duration_days INTEGER,
  features_json TEXT NOT NULL DEFAULT '[]',
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_key TEXT NOT NULL REFERENCES subscription_plans(plan_key),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK(status IN ('pending','active','expired','cancelled','inactive')),
  starts_at TEXT,
  expires_at TEXT,
  payment_provider TEXT,
  provider_reference TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id,status,expires_at);
CREATE TABLE IF NOT EXISTS family_invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('co_parent','caregiver','grandparent')),
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','revoked','expired')),
  expires_at TEXT NOT NULL,
  accepted_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_family_invites_owner ON family_invitations(owner_user_id,status);
CREATE INDEX IF NOT EXISTS idx_family_invites_phone ON family_invitations(invited_phone,status);
INSERT OR IGNORE INTO subscription_plans(plan_key,name,price_amount,currency,duration_days,features_json,is_active)
VALUES
 ('free','رایگان',0,'IRR',NULL,'["محتوای عمومی","پروفایل پایه کودک","ثبت‌های پایه"]',1),
 ('plus','مهرانا پلاس',NULL,'IRR',30,'["نقشه رشد","دفترچه خواب","فعالیت‌های شخصی‌سازی‌شده","گزارش ماهانه"]',1),
 ('family','مهرانا خانواده',NULL,'IRR',30,'["امکانات پلاس","حساب خانوادگی و دسترسی مراقبان"]',1);
