import { spawn, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { createServer } from 'node:net';

const root = resolve(import.meta.dirname, '..');
const preferredPort = Number(process.env.MEHRANA_DEV_API_PORT || 8787);

async function findAvailablePort(start) {
  const apiHost = process.env.API_HOST || '0.0.0.0';
  for (let port = start; port < start + 30; port += 1) {
    const available = await new Promise((resolvePort, rejectPort) => {
      const probe = createServer();
      probe.once('error', rejectPort);
      probe.listen(port, apiHost, () => probe.close(error => error ? rejectPort(error) : resolvePort(true)));
    }).catch(error => {
      if (error.code === 'EADDRINUSE' || error.code === 'EACCES') return false;
      throw error;
    });
    if (available) return port;
  }
  throw new Error(`No free API port found between ${start} and ${start + 29}. Set MEHRANA_DEV_API_PORT to a free port and try again.`);
}

const apiPort = await findAvailablePort(preferredPort);
const devEnv = { ...process.env, PORT: String(apiPort), API_PORT: String(apiPort), MEHRANA_DEV_API_PORT: String(apiPort) };
const migration = spawnSync(process.execPath, [resolve(root, 'server/db/migrate.js')], { cwd: root, stdio: 'inherit', env: devEnv });
if (migration.error) throw migration.error;
if (migration.status !== 0) process.exit(migration.status || 1);
console.info(`Using API port ${apiPort}`);
const processes = [
  spawn(process.execPath, ['--watch', resolve(root, 'server/index.js')], { cwd: root, stdio: 'inherit', env: devEnv }),
  spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1'], { cwd: root, stdio: 'inherit', env: devEnv }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of processes) if (child.exitCode === null) child.kill('SIGTERM');
  setTimeout(() => process.exit(code), 250).unref();
}
for (const child of processes) {
  child.on('error', error => { console.error('Unable to start Mehrana service:', error); stop(1); });
  child.on('exit', code => { if (!stopping && code !== 0) stop(code || 1); });
}
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
