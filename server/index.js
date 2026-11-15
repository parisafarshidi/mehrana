
import { createServer } from 'node:http';
import {
  randomInt,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
  createHash,
} from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, resolve, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dbPath = resolve(process.env.MEHRANA_DB_PATH || 'server/data/mehrana.sqlite');
mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL UNIQUE,
    data_json TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS otp_challenges (
    phone TEXT PRIMARY KEY,
    salt TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    sent_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
`);


const DIST_DIR = resolve('dist');
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function serveStatic(req, res, url) {
  if (!['GET', 'HEAD'].includes(req.method) || url.pathname.startsWith('/api/')) {
    return false;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return false;
  }

  const requestedPath = resolve(DIST_DIR, pathname.replace(/^\/+/, ''));
  if (!requestedPath.startsWith(DIST_DIR + sep) && requestedPath !== DIST_DIR) {
    return false;
  }

  let filePath = requestedPath;
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = resolve(filePath, 'index.html');
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    if (extname(pathname)) return false;
    filePath = resolve(DIST_DIR, 'index.html');
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) return false;

  const content = readFileSync(filePath);
  const contentType = MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream';
  const isHtml = contentType.startsWith('text/html');

  res.writeHead(200, {
    'content-type': contentType,
    'content-length': content.length,
    'cache-control': isHtml ? 'no-cache' : 'public, max-age=31536000, immutable',
    'x-content-type-options': 'nosniff',
  });
  res.end(req.method === 'HEAD' ? undefined : content);
  return true;
}

const now = () => Date.now();

function asciiDigits(value) {
  return String(value || '').replace(/[۰-۹٠-٩]/g, digit =>
    String(
      digit.charCodeAt(0) -
      (digit >= '۰' && digit <= '۹' ? 1776 : 1632)
    )
  );
}

const otpRequestTimes = new Map();
const demoLoginAttempts = new Map();

const safeEqual = (a, b) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
};

function normalizePhone(value) {
  const digits = asciiDigits(value)
    .replace(/[\s()-]/g, '')
    .replace(/^\+/, '');

  const local = digits.startsWith('0098')
    ? digits.slice(4)
    : digits.startsWith('98')
      ? digits.slice(2)
      : digits;

  const national = local.startsWith('0')
    ? local.slice(1)
    : local;

  return /^9\d{9}$/.test(national)
    ? `+98${national}`
    : null;
}

function sendJson(res, status, data, headers = {}) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  });

  res.end(JSON.stringify(data));
}

const MAX_REQUEST_BYTES = 1_100_000;

function readJson(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    let totalBytes = 0;
    let settled = false;

    function onData(chunk) {
      if (settled) return;

      totalBytes += chunk.length;

      if (totalBytes > MAX_REQUEST_BYTES) {
        settled = true;
        chunks.length = 0;

        req.removeListener('data', onData);
        req.resume();

        const error = new Error('request too large');
        error.statusCode = 413;
        reject(error);
        return;
      }

      chunks.push(chunk);
    }

    req.on('data', onData);

    req.on('end', () => {
      if (settled) return;

      settled = true;

      try {
        const body = Buffer.concat(chunks).toString('utf8');
        resolveBody(JSON.parse(body || '{}'));
      } catch {
        const error = new Error('invalid JSON');
        error.statusCode = 400;
        reject(error);
      }
    });

    req.on('error', error => {
      if (settled) return;

      settled = true;
      reject(error);
    });
  });
}

function cookieValue(req, key) {
  const cookie = req.headers.cookie
    ?.split(';')
    .map(item => item.trim())
    .find(item => item.startsWith(`${key}=`));

  return cookie
    ? decodeURIComponent(cookie.slice(key.length + 1))
    : '';
}

function sessionUser(req) {
  const token = cookieValue(req, 'mh_session');

  if (!token) return null;

  const digest = createHash('sha256')
    .update(token)
    .digest('hex');

  const session = db
    .prepare('SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > ?')
    .get(digest, now());

  return session
    ? db.prepare('SELECT id, phone FROM users WHERE id = ?').get(session.user_id)
    : null;
}

async function deliverOtp(phone, code) {
  const url = process.env.SMS_API_URL;
  const token = process.env.SMS_API_TOKEN;

  if (url && token) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        to: phone,
        message: `کد ورود مهرانا: ${code}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`SMS provider returned ${response.status}`);
    }

    return;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SMS provider is not configured');
  }

  console.info(`[Mehrana development OTP] ${phone}: ${code}`);
}

function setSessionCookie(token) {
  const secure = process.env.NODE_ENV === 'production'
    ? '; Secure'
    : '';

  return `mh_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000${secure}`;
}

function setAdminSessionCookie(token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `mh_admin_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure}`;
}

function clearAdminSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `mh_admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`;
}

function adminSession(req) {
  const token = cookieValue(req, 'mh_admin_session');
  if (!token) return null;
  const digest = createHash('sha256').update(token).digest('hex');
  const session = db.prepare(`
    SELECT s.id AS session_id, a.id, a.username, a.full_name
    FROM admin_sessions s
    JOIN admin_users a ON a.id = s.admin_id
    WHERE s.token_hash = ? AND s.revoked_at IS NULL
      AND s.expires_at > ? AND a.is_active = 1
  `).get(digest, new Date().toISOString());
  return session || null;
}

function writeAudit(req, actorId, action, resourceType = null, resourceId = null, metadata = null) {
  db.prepare(`
    INSERT INTO audit_logs(
      actor_type, actor_id, action, resource_type, resource_id,
      ip_address, user_agent, metadata_json
    ) VALUES('admin', ?, ?, ?, ?, ?, ?, ?)
  `).run(
    actorId, action, resourceType, resourceId,
    req.socket?.remoteAddress || null,
    String(req.headers['user-agent'] || '').slice(0, 500) || null,
    metadata ? JSON.stringify(metadata) : null
  );
}

function adminPasswordMatches(password, stored) {
  const [salt, expected] = String(stored || '').split(':');
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64).toString('hex');
  return safeEqual(actual, expected);
}

function hashAdminPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

function adminOtpHash(code, salt) {
  return scryptSync(code, salt, 32).toString('hex');
}

async function deliverAdminOtp(phone, code) {
  await deliverOtp(phone, code);
}

function validateArticle(body) {
  const title = String(body.title || '').trim().slice(0, 180);
  const slug = String(body.slug || '').trim().toLowerCase();
  const content = String(body.content || '').trim();
  if (title.length < 3 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || content.length < 20) return null;
  const keywords = Array.isArray(body.keywords) ? body.keywords.map(x => String(x).trim()).filter(Boolean).slice(0, 40) : [];
  return {
    title, slug, content: content.slice(0, 500000),
    excerpt: String(body.excerpt || '').trim().slice(0, 500),
    category: String(body.category || 'تغذیه کودک').trim().slice(0, 80),
    metaTitle: String(body.metaTitle || title).trim().slice(0, 180),
    metaDescription: String(body.metaDescription || body.excerpt || '').trim().slice(0, 320),
    keywords, authorName: String(body.authorName || '').trim().slice(0, 100),
    reviewerName: String(body.reviewerName || '').trim().slice(0, 100),
    sourceNotes: String(body.sourceNotes || '').trim().slice(0, 2000),
    status: body.status === 'published' ? 'published' : 'draft'
  };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, { ok: true });
  }

  try {
    if (req.method === 'POST' && url.pathname === '/api/auth/demo-login') {
      const enabled = process.env.MEHRANA_DEMO_LOGIN === 'true';
      const expectedCode = process.env.MEHRANA_DEMO_ACCESS_CODE || '';
      if (!enabled || expectedCode.length < 12) {
        return sendJson(res, 404, { error: 'ورود آزمایشی فعال نیست.' });
      }

      const ip = req.socket?.remoteAddress || 'unknown';
      const stamp = now();
      const attempts = (demoLoginAttempts.get(ip) || []).filter(time => stamp - time < 15 * 60_000);
      if (attempts.length >= 5) {
        return sendJson(res, 429, { error: 'تعداد تلاش‌ها زیاد است؛ ۱۵ دقیقه دیگر دوباره امتحان کن.' });
      }

      const body = await readJson(req);
      if (!safeEqual(String(body.accessCode || ''), expectedCode)) {
        attempts.push(stamp);
        demoLoginAttempts.set(ip, attempts);
        return sendJson(res, 401, { error: 'کد دسترسی آزمایشی درست نیست.' });
      }

      demoLoginAttempts.delete(ip);
      const id = randomUUID();
      const phone = `+98999${String(randomInt(0, 10_000_000)).padStart(7, '0')}`;
      const demoData = {
        children: [{ id: 'demo-child', name: 'کودک نمونه', birth: '2025-03-12', feeding: 'تغذیه ترکیبی' }],
        active: 'demo-child',
        records: [], growth: [], plans: [], development: [], sleep: [],
        reminders: [], activities: [], healthRecords: [], familyMembers: [],
        subscription: { plan: 'free', status: 'inactive' }
      };
      db.prepare('INSERT INTO users(id, phone, data_json, created_at) VALUES(?,?,?,?)')
        .run(id, phone, JSON.stringify(demoData), stamp);

      const token = randomBytes(32).toString('base64url');
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const expiry = stamp + 12 * 60 * 60_000;
      db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').run(tokenHash, id, expiry);

      return sendJson(res, 200, {
        user: { id, phone, demo: true },
        demo: true,
        message: 'ورود آزمایشی فعال شد.'
      }, { 'set-cookie': setSessionCookie(token) });
    }

    const contentTypes = ['food','breastfeeding','activity','milestone','sleep_guide','reminder'];
    if (req.method === 'GET' && url.pathname === '/api/content') {
      const type = url.searchParams.get('type') || '';
      if (!contentTypes.includes(type)) return sendJson(res, 400, { error: 'نوع محتوا معتبر نیست.' });
      const items = db.prepare(`SELECT id,content_type AS type,title,slug,summary,category,min_age_months AS minAgeMonths,max_age_months AS maxAgeMonths,tags_json AS tagsJson,author_name AS authorName,reviewer_name AS reviewerName,source_title AS sourceTitle,source_pages AS sourcePages,reviewed_at AS reviewedAt,sort_order AS sortOrder,published_at AS publishedAt FROM feature_content WHERE content_type=? AND status='published' ORDER BY sort_order, min_age_months, title`).all(type);
      return sendJson(res, 200, { items: items.map(x => ({...x,tags:JSON.parse(x.tagsJson||'[]')})) }, { 'cache-control': 'public, max-age=60, s-maxage=300' });
    }
    const publicContentMatch = url.pathname.match(/^\/api\/content\/(food|breastfeeding|activity|milestone|sleep_guide|reminder)\/([a-z0-9-]+)$/);
    if (req.method === 'GET' && publicContentMatch) {
      const item = db.prepare(`SELECT id,content_type AS type,title,slug,summary,body,category,min_age_months AS minAgeMonths,max_age_months AS maxAgeMonths,tags_json AS tagsJson,author_name AS authorName,reviewer_name AS reviewerName,source_notes AS sourceNotes,source_title AS sourceTitle,source_pages AS sourcePages,reviewed_at AS reviewedAt,sort_order AS sortOrder,published_at AS publishedAt FROM feature_content WHERE content_type=? AND slug=? AND status='published'`).get(publicContentMatch[1], publicContentMatch[2]);
      return item ? sendJson(res, 200, { item: {...item,tags:JSON.parse(item.tagsJson||'[]')} }, { 'cache-control': 'public, max-age=60, s-maxage=300' }) : sendJson(res, 404, { error: 'محتوا پیدا نشد.' });
    }
    if (req.method === 'GET' && url.pathname === '/api/articles') {
      const articles = db.prepare(`SELECT title,slug,excerpt,category,meta_title AS metaTitle,meta_description AS metaDescription,author_name AS authorName,reviewer_name AS reviewerName,published_at AS publishedAt
        FROM articles WHERE status='published' ORDER BY published_at DESC`).all();
      return sendJson(res, 200, { articles }, { 'cache-control': 'public, max-age=60, s-maxage=300' });
    }
    const publicArticleMatch = url.pathname.match(/^\/api\/articles\/([a-z0-9-]+)$/);
    if (req.method === 'GET' && publicArticleMatch) {
      const article = db.prepare(`SELECT title,slug,excerpt,content,category,meta_title AS metaTitle,meta_description AS metaDescription,author_name AS authorName,reviewer_name AS reviewerName,source_notes AS sourceNotes,published_at AS publishedAt
        FROM articles WHERE slug=? AND status='published'`).get(publicArticleMatch[1]);
      return article ? sendJson(res, 200, { article }, { 'cache-control': 'public, max-age=60, s-maxage=300' }) : sendJson(res, 404, { error: 'مقاله پیدا نشد.' });
    }
    if (req.method === 'POST' && url.pathname === '/api/admin/auth/login') {
      const body = await readJson(req);
      const username = String(body.username || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!/^[a-zA-Z0-9_.-]{3,50}$/.test(username) || password.length < 1 || password.length > 200) {
        return sendJson(res, 400, { error: 'نام کاربری یا رمز عبور معتبر نیست.' });
      }

      const stamp = now();
      db.prepare('DELETE FROM admin_login_attempts WHERE attempted_at < ?').run(stamp - 24 * 60 * 60_000);
      const recentFailures = db.prepare(`
        SELECT COUNT(*) AS count FROM admin_login_attempts
        WHERE username = ? AND succeeded = 0 AND attempted_at > ?
      `).get(username, stamp - 15 * 60_000).count;
      if (recentFailures >= 5) {
        return sendJson(res, 429, { error: 'تلاش‌های ورود بیش از حد بوده است. ۱۵ دقیقه بعد دوباره تلاش کن.' });
      }

      const admin = db.prepare(`
        SELECT id, username, password_hash, full_name, phone, is_active, two_factor_enabled
        FROM admin_users WHERE username = ?
      `).get(username);
      const valid = Boolean(admin && admin.is_active === 1 && adminPasswordMatches(password, admin.password_hash));
      db.prepare('INSERT INTO admin_login_attempts(username, attempted_at, succeeded) VALUES(?,?,?)')
        .run(username, stamp, valid ? 1 : 0);

      if (!valid) {
        if (admin) writeAudit(req, admin.id, 'admin.login_failed', 'admin_user', String(admin.id));
        return sendJson(res, 401, { error: 'نام کاربری یا رمز عبور اشتباه است.' });
      }
      if (!admin.phone || !/^\+98\d{10}$/.test(admin.phone)) {
        return sendJson(res, 503, { error: 'شماره موبایل مدیر ثبت نشده است؛ راه‌اندازی مدیر را بررسی کن.' });
      }
      const recentOtpRequests = db.prepare(`
        SELECT COUNT(*) AS count FROM admin_otp_challenges
        WHERE admin_id = ? AND created_at > ?
      `).get(admin.id, new Date(stamp - 15 * 60_000).toISOString()).count;
      if (recentOtpRequests >= 3) {
        return sendJson(res, 429, { error: 'درخواست کد بیش از حد مجاز است. ۱۵ دقیقه بعد دوباره تلاش کن.' });
      }

      const code = String(randomInt(100000, 1_000_000));
      const salt = randomBytes(16).toString('hex');
      const expiresAt = new Date(stamp + 5 * 60_000).toISOString();
      db.prepare('UPDATE admin_otp_challenges SET consumed_at = ? WHERE admin_id = ? AND consumed_at IS NULL')
        .run(new Date(stamp).toISOString(), admin.id);
      const result = db.prepare(`
        INSERT INTO admin_otp_challenges(admin_id, salt, code_hash, expires_at, attempts, created_at)
        VALUES(?,?,?,?,0,?)
      `).run(admin.id, salt, adminOtpHash(code, salt), expiresAt, new Date(stamp).toISOString());

      try {
        await deliverAdminOtp(admin.phone, code);
      } catch (error) {
        db.prepare('UPDATE admin_otp_challenges SET consumed_at = ? WHERE id = ?')
          .run(new Date().toISOString(), Number(result.lastInsertRowid));
        console.error('Admin OTP delivery failed:', error.message);
        return sendJson(res, 503, { error: 'ارسال کد مدیر انجام نشد؛ تنظیمات سرویس پیامک را بررسی کن.' });
      }

      writeAudit(req, admin.id, 'admin.otp_requested', 'admin_user', String(admin.id));
      return sendJson(res, 200, {
        ok: true,
        requiresOtp: true,
        challengeId: Number(result.lastInsertRowid),
        expiresIn: 300,
        message: 'کد تأیید دومرحله‌ای ارسال شد.'
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/auth/verify-otp') {
      const body = await readJson(req);
      const challengeId = Number(body.challengeId);
      const code = asciiDigits(body.code).trim();
      if (!Number.isSafeInteger(challengeId) || challengeId < 1 || !/^\d{6}$/.test(code)) {
        return sendJson(res, 400, { error: 'کد تأیید معتبر نیست.' });
      }

      const challenge = db.prepare(`
        SELECT c.*, a.username, a.full_name, a.is_active
        FROM admin_otp_challenges c JOIN admin_users a ON a.id = c.admin_id
        WHERE c.id = ? AND c.consumed_at IS NULL
      `).get(challengeId);
      if (!challenge || challenge.is_active !== 1 || challenge.attempts >= 5 || new Date(challenge.expires_at).getTime() <= now()) {
        return sendJson(res, 400, { error: 'کد منقضی شده یا تلاش‌های مجاز تمام شده است؛ دوباره وارد شو.' });
      }

      const candidate = adminOtpHash(code, challenge.salt);
      if (!safeEqual(candidate, challenge.code_hash)) {
        db.prepare('UPDATE admin_otp_challenges SET attempts = attempts + 1 WHERE id = ?').run(challengeId);
        writeAudit(req, challenge.admin_id, 'admin.otp_failed', 'admin_user', String(challenge.admin_id));
        return sendJson(res, 400, { error: 'کد تأیید اشتباه است.' });
      }

      const stamp = new Date();
      db.prepare('UPDATE admin_otp_challenges SET consumed_at = ? WHERE id = ?')
        .run(stamp.toISOString(), challengeId);
      const token = randomBytes(32).toString('base64url');
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(stamp.getTime() + 8 * 60 * 60_000).toISOString();
      db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ? OR revoked_at IS NOT NULL')
        .run(stamp.toISOString());
      db.prepare('INSERT INTO admin_sessions(admin_id, token_hash, expires_at, created_at) VALUES(?,?,?,?)')
        .run(challenge.admin_id, tokenHash, expiresAt, stamp.toISOString());
      db.prepare('UPDATE admin_users SET last_login_at = ?, updated_at = ? WHERE id = ?')
        .run(stamp.toISOString(), stamp.toISOString(), challenge.admin_id);
      writeAudit(req, challenge.admin_id, 'admin.login_success', 'admin_user', String(challenge.admin_id));
      return sendJson(res, 200,
        { ok: true, admin: { id: challenge.admin_id, username: challenge.username, fullName: challenge.full_name } },
        { 'set-cookie': setAdminSessionCookie(token) }
      );
    }

    if (req.method === 'GET' && url.pathname === '/api/admin/auth/me') {
      const admin = adminSession(req);
      return admin
        ? sendJson(res, 200, { admin: { id: admin.id, username: admin.username, fullName: admin.full_name } })
        : sendJson(res, 401, { error: 'نشست مدیر معتبر نیست.' });
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/auth/logout') {
      const token = cookieValue(req, 'mh_admin_session');
      const admin = adminSession(req);
      if (token) {
        const digest = createHash('sha256').update(token).digest('hex');
        db.prepare('UPDATE admin_sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL')
          .run(new Date().toISOString(), digest);
      }
      if (admin) writeAudit(req, admin.id, 'admin.logout', 'admin_user', String(admin.id));
      return sendJson(res, 200, { ok: true }, { 'set-cookie': clearAdminSessionCookie() });
    }

    if (req.method === 'GET' && url.pathname === '/api/site-content') {
      const type=url.searchParams.get('type')||''; if(!['page','banner','menu','category','media'].includes(type)) return sendJson(res,400,{error:'نوع محتوا معتبر نیست.'});
      const rows=db.prepare(`SELECT id,title,slug,summary,body,payload_json AS payloadJson,sort_order AS sortOrder FROM site_content WHERE content_type=? AND status='published' ORDER BY sort_order,title`).all(type);
      return sendJson(res,200,{items:rows.map(x=>({...x,payload:JSON.parse(x.payloadJson||'{}')}))});
    }

    if (url.pathname.startsWith('/api/admin/')) {
      const admin = adminSession(req);
      if (!admin) return sendJson(res, 401, { error: 'برای دسترسی مدیر ابتدا وارد شو.' });
      if (req.method === 'GET' && url.pathname === '/api/admin/site-content') {
        const type = url.searchParams.get('type') || '';
        if (!['page','banner','menu','category','media'].includes(type)) return sendJson(res,400,{error:'نوع محتوا معتبر نیست.'});
        const rows = db.prepare(`SELECT id,content_type AS type,title,slug,summary,body,payload_json AS payloadJson,sort_order AS sortOrder,status,created_at AS createdAt,updated_at AS updatedAt FROM site_content WHERE content_type=? ORDER BY sort_order,updated_at DESC`).all(type);
        return sendJson(res,200,{items:rows.map(x=>({...x,payload:JSON.parse(x.payloadJson||'{}')}))});
      }
      if (req.method === 'POST' && url.pathname === '/api/admin/site-content') {
        const b=await readJson(req), type=String(b.type||''), title=String(b.title||'').trim().slice(0,180), slug=String(b.slug||'').trim().toLowerCase();
        if(!['page','banner','menu','category','media'].includes(type)||title.length<2||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return sendJson(res,400,{error:'نوع، عنوان و نشانی انگلیسی را بررسی کن.'});
        const stamp=new Date().toISOString(), status=b.status==='published'?'published':'draft';
        try { const r=db.prepare(`INSERT INTO site_content(content_type,title,slug,summary,body,payload_json,sort_order,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)`).run(type,title,slug,String(b.summary||'').slice(0,1000),String(b.body||'').slice(0,500000),JSON.stringify(b.payload&&typeof b.payload==='object'?b.payload:{}),Number.isInteger(Number(b.sortOrder))?Number(b.sortOrder):0,status,stamp,stamp); writeAudit(req,admin.id,'admin.site_content_created','site_content',String(r.lastInsertRowid),{type,status}); return sendJson(res,201,{ok:true,id:Number(r.lastInsertRowid)}); }
        catch(e){if(String(e.message).includes('UNIQUE'))return sendJson(res,409,{error:'این نشانی در این گروه قبلاً ثبت شده است.'});throw e;}
      }
      const siteContentMatch=url.pathname.match(/^\/api\/admin\/site-content\/(\d+)$/);
      if(siteContentMatch&&req.method==='PUT'){
        const id=Number(siteContentMatch[1]), b=await readJson(req), old=db.prepare('SELECT * FROM site_content WHERE id=?').get(id); if(!old)return sendJson(res,404,{error:'محتوا پیدا نشد.'});
        const title=String(b.title||'').trim().slice(0,180),slug=String(b.slug||'').trim().toLowerCase(); if(title.length<2||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))return sendJson(res,400,{error:'عنوان و نشانی انگلیسی معتبر لازم است.'});
        const stamp=new Date().toISOString(),status=b.status==='published'?'published':'draft';
        try{db.prepare(`UPDATE site_content SET title=?,slug=?,summary=?,body=?,payload_json=?,sort_order=?,status=?,updated_at=? WHERE id=?`).run(title,slug,String(b.summary||'').slice(0,1000),String(b.body||'').slice(0,500000),JSON.stringify(b.payload&&typeof b.payload==='object'?b.payload:{}),Number.isInteger(Number(b.sortOrder))?Number(b.sortOrder):0,status,stamp,id);writeAudit(req,admin.id,'admin.site_content_updated','site_content',String(id),{type:old.content_type,status});return sendJson(res,200,{ok:true});}
        catch(e){if(String(e.message).includes('UNIQUE'))return sendJson(res,409,{error:'این نشانی در این گروه قبلاً ثبت شده است.'});throw e;}
      }
      if(siteContentMatch&&req.method==='DELETE'){const id=Number(siteContentMatch[1]);const r=db.prepare('DELETE FROM site_content WHERE id=?').run(id);if(!r.changes)return sendJson(res,404,{error:'محتوا پیدا نشد.'});writeAudit(req,admin.id,'admin.site_content_deleted','site_content',String(id));return sendJson(res,200,{ok:true});}
      if (req.method === 'GET' && url.pathname === '/api/admin/dashboard') {
        writeAudit(req, admin.id, 'admin.dashboard_viewed', 'admin_dashboard');
        const motherCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
        return sendJson(res, 200, { admin: { id: admin.id, username: admin.username, fullName: admin.full_name }, stats: { mothers: motherCount } });
      }
      if (req.method === 'GET' && url.pathname === '/api/admin/content') {
        const type = url.searchParams.get('type') || '';
        if (!contentTypes.includes(type)) return sendJson(res, 400, { error: 'نوع محتوا معتبر نیست.' });
        const items = db.prepare(`SELECT id,content_type AS type,title,slug,summary,body,category,min_age_months AS minAgeMonths,max_age_months AS maxAgeMonths,tags_json AS tagsJson,author_name AS authorName,reviewer_name AS reviewerName,source_notes AS sourceNotes,source_title AS sourceTitle,source_pages AS sourcePages,reviewed_at AS reviewedAt,sort_order AS sortOrder,status,published_at AS publishedAt,created_at AS createdAt,updated_at AS updatedAt FROM feature_content WHERE content_type=? ORDER BY sort_order, updated_at DESC`).all(type);
        writeAudit(req, admin.id, 'admin.feature_content_listed', 'feature_content', type);
        return sendJson(res, 200, { items: items.map(x => ({...x,tags:JSON.parse(x.tagsJson||'[]')})) });
      }
      if (req.method === 'POST' && url.pathname === '/api/admin/content') {
        const body = await readJson(req); const type = String(body.type || '');
        const title = String(body.title || '').trim().slice(0,180); const slug = String(body.slug || '').trim().toLowerCase(); const contentBody = String(body.body || '').trim();
        const minAge = body.minAgeMonths === null || body.minAgeMonths === '' ? null : Number(body.minAgeMonths);
        const maxAge = body.maxAgeMonths === null || body.maxAgeMonths === '' ? null : Number(body.maxAgeMonths);
        if (!contentTypes.includes(type) || title.length < 3 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || contentBody.length < 20 || (minAge !== null && (!Number.isInteger(minAge)||minAge<0||minAge>60)) || (maxAge !== null && (!Number.isInteger(maxAge)||maxAge<0||maxAge>60)) || (minAge !== null && maxAge !== null && maxAge < minAge)) return sendJson(res,400,{error:'عنوان، نشانی، متن و بازه سنی را بررسی کن.'});
        const status = body.status === 'published' ? 'published' : 'draft'; const stamp = new Date().toISOString(); const tags = Array.isArray(body.tags) ? body.tags.map(x=>String(x).trim()).filter(Boolean).slice(0,40) : [];
        try { const result = db.prepare(`INSERT INTO feature_content(content_type,title,slug,summary,body,category,min_age_months,max_age_months,tags_json,author_name,reviewer_name,source_notes,source_title,source_pages,reviewed_at,sort_order,status,published_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(type,title,slug,String(body.summary||'').trim().slice(0,1000),contentBody.slice(0,500000),String(body.category||'').trim().slice(0,100),minAge,maxAge,JSON.stringify(tags),String(body.authorName||'').trim().slice(0,100),String(body.reviewerName||'').trim().slice(0,100),String(body.sourceNotes||'').trim().slice(0,5000),String(body.sourceTitle||'').trim().slice(0,250),String(body.sourcePages||'').trim().slice(0,100),String(body.reviewedAt||'').trim().slice(0,30),Number.isInteger(Number(body.sortOrder))?Number(body.sortOrder):0,status,status==='published'?stamp:null,stamp,stamp); writeAudit(req,admin.id,'admin.feature_content_created','feature_content',String(result.lastInsertRowid),{type,status}); return sendJson(res,201,{ok:true,id:Number(result.lastInsertRowid)}); }
        catch(error){if(String(error.message).includes('UNIQUE'))return sendJson(res,409,{error:'این نشانی در این بخش قبلاً استفاده شده است.'});throw error;}
      }
      const featureContentMatch = url.pathname.match(/^\/api\/admin\/content\/(\d+)$/);
      if (featureContentMatch && req.method === 'PUT') {
        const id=Number(featureContentMatch[1]); const body=await readJson(req); const existing=db.prepare('SELECT * FROM feature_content WHERE id=?').get(id); if(!existing)return sendJson(res,404,{error:'محتوا پیدا نشد.'});
        const title=String(body.title||'').trim().slice(0,180); const slug=String(body.slug||'').trim().toLowerCase(); const contentBody=String(body.body||'').trim(); const minAge=body.minAgeMonths===null||body.minAgeMonths===''?null:Number(body.minAgeMonths); const maxAge=body.maxAgeMonths===null||body.maxAgeMonths===''?null:Number(body.maxAgeMonths);
        if(title.length<3||! /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||contentBody.length<20||(minAge!==null&&(!Number.isInteger(minAge)||minAge<0||minAge>60))||(maxAge!==null&&(!Number.isInteger(maxAge)||maxAge<0||maxAge>60))||(minAge!==null&&maxAge!==null&&maxAge<minAge))return sendJson(res,400,{error:'عنوان، نشانی، متن و بازه سنی را بررسی کن.'});
        const status=body.status==='published'?'published':'draft'; const stamp=new Date().toISOString(); const tags=Array.isArray(body.tags)?body.tags.map(x=>String(x).trim()).filter(Boolean).slice(0,40):[]; const publishedAt=status==='published'?(existing.published_at||stamp):null;
        try{db.prepare(`UPDATE feature_content SET title=?,slug=?,summary=?,body=?,category=?,min_age_months=?,max_age_months=?,tags_json=?,author_name=?,reviewer_name=?,source_notes=?,source_title=?,source_pages=?,reviewed_at=?,sort_order=?,status=?,published_at=?,updated_at=? WHERE id=?`).run(title,slug,String(body.summary||'').trim().slice(0,1000),contentBody.slice(0,500000),String(body.category||'').trim().slice(0,100),minAge,maxAge,JSON.stringify(tags),String(body.authorName||'').trim().slice(0,100),String(body.reviewerName||'').trim().slice(0,100),String(body.sourceNotes||'').trim().slice(0,5000),String(body.sourceTitle||'').trim().slice(0,250),String(body.sourcePages||'').trim().slice(0,100),String(body.reviewedAt||'').trim().slice(0,30),Number.isInteger(Number(body.sortOrder))?Number(body.sortOrder):0,status,publishedAt,stamp,id);writeAudit(req,admin.id,'admin.feature_content_updated','feature_content',String(id),{type:existing.content_type,status});return sendJson(res,200,{ok:true});}
        catch(error){if(String(error.message).includes('UNIQUE'))return sendJson(res,409,{error:'این نشانی در این بخش قبلاً استفاده شده است.'});throw error;}
      }
      if (featureContentMatch && req.method === 'DELETE') { const id=Number(featureContentMatch[1]);const result=db.prepare('DELETE FROM feature_content WHERE id=?').run(id);if(!result.changes)return sendJson(res,404,{error:'محتوا پیدا نشد.'});writeAudit(req,admin.id,'admin.feature_content_deleted','feature_content',String(id));return sendJson(res,200,{ok:true}); }
      if (req.method === 'GET' && url.pathname === '/api/admin/articles') {
        const articles = db.prepare(`SELECT id,title,slug,excerpt,content,category,meta_title AS metaTitle,
          meta_description AS metaDescription,keywords_json AS keywordsJson,author_name AS authorName,
          reviewer_name AS reviewerName,source_notes AS sourceNotes,status,published_at AS publishedAt,
          created_at AS createdAt,updated_at AS updatedAt FROM articles ORDER BY updated_at DESC`).all();
        writeAudit(req, admin.id, 'admin.articles_listed', 'article');
        return sendJson(res, 200, { articles: articles.map(a => ({...a, keywords: JSON.parse(a.keywordsJson || '[]')})) });
      }
      if (req.method === 'POST' && url.pathname === '/api/admin/articles') {
        const body = await readJson(req);
        const article = validateArticle(body);
        if (!article) return sendJson(res, 400, { error: 'عنوان، نشانی، و محتوای مقاله را بررسی کن.' });
        const stamp = new Date().toISOString();
        try {
          const result = db.prepare(`INSERT INTO articles(title,slug,excerpt,content,category,meta_title,meta_description,keywords_json,author_name,reviewer_name,source_notes,status,published_at,created_at,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(article.title,article.slug,article.excerpt,article.content,article.category,article.metaTitle,article.metaDescription,JSON.stringify(article.keywords),article.authorName,article.reviewerName,article.sourceNotes,article.status,article.status==='published'?stamp:null,stamp,stamp);
          writeAudit(req, admin.id, 'admin.article_created', 'article', String(result.lastInsertRowid), {status:article.status});
          return sendJson(res, 201, { ok: true, id: Number(result.lastInsertRowid) });
        } catch (error) {
          if (String(error.message).includes('UNIQUE')) return sendJson(res, 409, { error: 'این نشانی قبلاً استفاده شده است.' });
          throw error;
        }
      }
      const articleMatch = url.pathname.match(/^\/api\/admin\/articles\/(\d+)$/);
      if (articleMatch && req.method === 'PUT') {
        const id = Number(articleMatch[1]);
        const body = await readJson(req);
        const article = validateArticle(body);
        if (!article) return sendJson(res, 400, { error: 'عنوان، نشانی، و محتوای مقاله را بررسی کن.' });
        const existing = db.prepare('SELECT id,status,published_at FROM articles WHERE id=?').get(id);
        if (!existing) return sendJson(res, 404, { error: 'مقاله پیدا نشد.' });
        const stamp = new Date().toISOString();
        const publishedAt = article.status === 'published' ? (existing.published_at || stamp) : null;
        try {
          db.prepare(`UPDATE articles SET title=?,slug=?,excerpt=?,content=?,category=?,meta_title=?,meta_description=?,keywords_json=?,author_name=?,reviewer_name=?,source_notes=?,status=?,published_at=?,updated_at=? WHERE id=?`)
            .run(article.title,article.slug,article.excerpt,article.content,article.category,article.metaTitle,article.metaDescription,JSON.stringify(article.keywords),article.authorName,article.reviewerName,article.sourceNotes,article.status,publishedAt,stamp,id);
          writeAudit(req, admin.id, 'admin.article_updated', 'article', String(id), {status:article.status});
          return sendJson(res, 200, { ok: true });
        } catch (error) {
          if (String(error.message).includes('UNIQUE')) return sendJson(res, 409, { error: 'این نشانی قبلاً استفاده شده است.' });
          throw error;
        }
      }
      if (articleMatch && req.method === 'DELETE') {
        const id = Number(articleMatch[1]);
        const result = db.prepare('DELETE FROM articles WHERE id=?').run(id);
        if (!result.changes) return sendJson(res, 404, { error: 'مقاله پیدا نشد.' });
        writeAudit(req, admin.id, 'admin.article_deleted', 'article', String(id));
        return sendJson(res, 200, { ok: true });
      }
    }
    if (req.method === 'POST' && url.pathname === '/api/auth/request-otp') {
      const body = await readJson(req);
      const phone = normalizePhone(body.phone);

      if (!phone) {
        return sendJson(res, 400, {
          error: 'شماره موبایل معتبر وارد کن.',
        });
      }

      const stamp = now();

      const history = (otpRequestTimes.get(phone) || [])
        .filter(time => stamp - time < 15 * 60_000);

      if (history.length >= 3) {
        return sendJson(res, 429, {
          error: 'برای دریافت کد کمی صبر کن و دوباره تلاش کن.',
        });
      }

      const last = db
        .prepare('SELECT sent_at FROM otp_challenges WHERE phone = ?')
        .get(phone);

      if (last && stamp - last.sent_at < 45_000) {
        return sendJson(res, 429, {
          error: 'برای دریافت کد جدید ۴۵ ثانیه صبر کن.',
        });
      }

      const code = String(randomInt(100000, 1_000_000));
      const salt = randomBytes(16).toString('hex');
      const codeHash = scryptSync(code, salt, 32).toString('hex');

      db.prepare(`
        INSERT INTO otp_challenges(
          phone, salt, code_hash, expires_at, attempts, sent_at
        )
        VALUES(?,?,?,?,0,?)
        ON CONFLICT(phone) DO UPDATE SET
          salt=excluded.salt,
          code_hash=excluded.code_hash,
          expires_at=excluded.expires_at,
          attempts=0,
          sent_at=excluded.sent_at
      `).run(phone, salt, codeHash, stamp + 5 * 60_000, stamp);

      history.push(stamp);
      otpRequestTimes.set(phone, history);

      try {
        await deliverOtp(phone, code);
      } catch (error) {
        console.error('OTP delivery failed:', error.message);

        return sendJson(res, 503, {
          error: 'ارسال پیامک انجام نشد؛ پیکربندی سرویس پیامک را بررسی کن.',
        });
      }

      return sendJson(res, 200, {
        ok: true,
        message: 'کد ورود ارسال شد.',
        expiresIn: 300,
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/verify-otp') {
      const body = await readJson(req);
      const phone = normalizePhone(body.phone);
      const code = asciiDigits(body.code).trim();

      if (!phone || !/^\d{6}$/.test(code)) {
        return sendJson(res, 400, {
          error: 'شماره موبایل یا کد واردشده معتبر نیست.',
        });
      }

      const challenge = db
        .prepare('SELECT * FROM otp_challenges WHERE phone = ?')
        .get(phone);

      if (
        !challenge ||
        challenge.expires_at < now() ||
        challenge.attempts >= 5
      ) {
        return sendJson(res, 400, {
          error: 'کد منقضی شده یا بیش از حد تلاش شده؛ کد تازه بگیر.',
        });
      }

      const candidate = scryptSync(code, challenge.salt, 32).toString('hex');

      if (!safeEqual(candidate, challenge.code_hash)) {
        db.prepare(
          'UPDATE otp_challenges SET attempts = attempts + 1 WHERE phone = ?'
        ).run(phone);

        return sendJson(res, 400, {
          error: 'کد واردشده درست نیست.',
        });
      }

      db.prepare('DELETE FROM otp_challenges WHERE phone = ?').run(phone);

      let user = db
        .prepare('SELECT id, phone FROM users WHERE phone = ?')
        .get(phone);

      if (!user) {
        const id = randomUUID();

        db.prepare(
          'INSERT INTO users(id,phone,created_at) VALUES(?,?,?)'
        ).run(id, phone, now());

        user = { id, phone };
      }

      const token = randomBytes(32).toString('base64url');

      const tokenHash = createHash('sha256')
        .update(token)
        .digest('hex');

      const expiry = now() + 30 * 24 * 60 * 60_000;

      db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now());

      db.prepare(
        'INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)'
      ).run(tokenHash, user.id, expiry);

      return sendJson(
        res,
        200,
        { user },
        { 'set-cookie': setSessionCookie(token) }
      );
    }

    if (req.method === 'GET' && url.pathname === '/api/auth/me') {
      const user = sessionUser(req);

      return user
        ? sendJson(res, 200, { user })
        : sendJson(res, 401, { error: 'وارد حساب نشدی.' });
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
      const token = cookieValue(req, 'mh_session');

      if (token) {
        db.prepare('DELETE FROM sessions WHERE token_hash = ?')
          .run(createHash('sha256').update(token).digest('hex'));
      }

      return sendJson(
        res,
        200,
        { ok: true },
        {
          'set-cookie':
            'mh_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0',
        }
      );
    }

    if (
      url.pathname === '/api/account/data' &&
      ['GET', 'PUT'].includes(req.method)
    ) {
      const user = sessionUser(req);

      if (!user) {
        return sendJson(res, 401, {
          error: 'برای ادامه وارد حساب شو.',
        });
      }

      if (req.method === 'GET') {
        const row = db
          .prepare('SELECT data_json FROM users WHERE id = ?')
          .get(user.id);

        let data = {};

        try {
          data = JSON.parse(row?.data_json || '{}');
        } catch {
          /* Return safe empty defaults. */
        }

        return sendJson(res, 200, { data });
      }

      const body = await readJson(req);
      const data = body.data;

      if (
        !data ||
        typeof data !== 'object' ||
        Array.isArray(data) ||
        JSON.stringify(data).length > 1_000_000
      ) {
        return sendJson(res, 400, {
          error: 'اطلاعات ارسالی معتبر نیست یا بیش از حد بزرگ است.',
        });
      }

      db.prepare('UPDATE users SET data_json = ? WHERE id = ?')
        .run(JSON.stringify(data), user.id);

      return sendJson(res, 200, { ok: true });
    }

    if (serveStatic(req, res, url)) return;

    return sendJson(res, 404, {
      error: 'مسیر پیدا نشد.',
    });

  } catch (error) {
    console.error('API error:', error);

    const status = error.statusCode || 400;

    const message = status === 413
      ? 'حجم اطلاعات ارسالی بیش از حد مجاز است.'
      : 'در پردازش درخواست مشکلی پیش آمد.';

    return sendJson(res, status, { error: message });
  }
});

const port = Number(process.env.PORT || process.env.API_PORT || 8787);
const host = process.env.API_HOST || '0.0.0.0';

server.listen(port, host, () => {
  console.info(`Mehrana server listening on ${host}:${port}`);
});
