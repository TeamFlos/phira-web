import { spawnSync } from 'node:child_process';

const [input, ...extra] = process.argv.slice(2);
if (!input || extra.length) {
  console.error('Usage: pnpm gen:api <path-to-openapi.json>');
  process.exit(1);
}

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const result = spawnSync(pnpm, ['exec', 'openapi-typescript', input, '-o', 'src/api/schema.d.ts'], {
  stdio: 'inherit',
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
