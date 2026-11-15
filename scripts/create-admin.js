import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';
import { randomBytes, scryptSync } from 'node:crypto';
import { openDatabase } from '../server/db/database.js';

function ask(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: stdin, output: stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function askHidden(question) {
  return new Promise((resolve) => {
    stdout.write(question);
    let value = '';
    const wasRaw = Boolean(stdin.isRaw);
    if (stdin.isTTY && stdin.setRawMode) stdin.setRawMode(true);
    stdin.resume();
    const onData = (chunk) => {
      for (const char of chunk.toString('utf8')) {
        if (char === '\u0003') {
          if (stdin.setRawMode) stdin.setRawMode(wasRaw);
          stdout.write('\n');
          process.exit(130);
        }
        if (char === '\r' || char === '\n') {
          stdin.removeListener('data', onData);
          if (stdin.setRawMode) stdin.setRawMode(wasRaw);
          stdout.write('\n');
          resolve(value);
          return;
        }
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else if (char >= ' ' && char <= '~') value += char;
      }
    };
    stdin.on('data', onData);
  });
}

function normalizePhone(value) {
  const digits = value.replace(/[\s()-]/g, '').replace(/^\+/, '');
  const local = digits.startsWith('0098') ? digits.slice(4) : digits.startsWith('98') ? digits.slice(2) : digits;
  const national = local.startsWith('0') ? local.slice(1) : local;
  return /^9\d{9}$/.test(national) ? `+98${national}` : null;
}

const username = (await ask('Admin username (3-50 chars): ')).toLowerCase();
if (!/^[a-zA-Z0-9_.-]{3,50}$/.test(username)) {
  console.error('Invalid username. Use 3-50 letters, numbers, dot, underscore or hyphen.');
  process.exit(1);
}
const fullName = await ask('Admin full name: ');
const phoneInput = await ask('Admin mobile (+989xxxxxxxxx or 09xxxxxxxxx): ');
const phone = normalizePhone(phoneInput);
if (!phone) {
  console.error('Invalid Iranian mobile number.');
  process.exit(1);
}
const password = await askHidden('Password (at least 12 characters): ');
if (password.length < 12 || password.length > 200) {
  console.error('Password must be 12-200 characters.');
  process.exit(1);
}
const confirmation = await askHidden('Confirm password: ');
if (password !== confirmation) {
  console.error('Passwords do not match.');
  process.exit(1);
}

const salt = randomBytes(16).toString('hex');
const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
const db = openDatabase();
try {
  const exists = db.prepare('SELECT id FROM admin_users WHERE username = ? OR phone = ?').get(username, phone);
  if (exists) {
    console.error('An administrator with this username or phone already exists.');
    process.exitCode = 1;
  } else {
    const result = db.prepare(`
      INSERT INTO admin_users(username, password_hash, full_name, phone, is_active, two_factor_enabled)
      VALUES(?,?,?,?,1,1)
    `).run(username, passwordHash, fullName || null, phone);
    console.log(`Administrator created successfully. ID: ${result.lastInsertRowid}`);
    console.log('Two-factor authentication is enabled. The first login OTP will be printed only in development mode until SMS is configured.');
  }
} finally {
  db.close();
}
