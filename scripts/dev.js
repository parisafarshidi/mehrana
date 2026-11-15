import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const processes = [
  spawn(process.execPath, [resolve(root, 'server/index.js')], { cwd: root, stdio: 'inherit', env: process.env }),
  spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1'], { cwd: root, stdio: 'inherit', env: process.env }),
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
