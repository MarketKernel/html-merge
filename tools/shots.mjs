/**
 * Screenshots of every main screen: builds, then runs the page's browser test
 * with `--shots`, into shots/ unless another folder is named.
 *
 *   npm run shots                  # -> shots/
 *   npm run shots -- shots/before  # -> shots/before/
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { root } from './load.mjs';

const dir = resolve(process.argv[2] ?? 'shots');
mkdirSync(dir, { recursive: true });

for (const args of [['build.mjs'], ['tests/app.mjs', '--shots', dir]]) {
  const { status } = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
  if (status !== 0) process.exit(status ?? 1);
}
console.log(`screenshots in ${dir}`);
