import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

const files = execFileSync(
  'git',
  ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'],
  {
    cwd: root,
    encoding: 'utf8',
  },
)
  .split('\0')
  .filter((file) => file && existsSync(path.join(root, file)));

if (files.length) {
  const unstaged = spawnSync('git', ['diff', '--quiet', '--', ...files], {
    cwd: root,
  });
  if (unstaged.error) throw unstaged.error;
  if (unstaged.status !== 0) {
    throw new Error(
      'Stage or discard unstaged changes in partially staged files before committing.',
    );
  }
  const result = spawnSync(
    process.execPath,
    [
      require.resolve('prettier/bin/prettier.cjs'),
      '--check',
      '--ignore-unknown',
      ...files,
    ],
    { cwd: root, stdio: 'inherit' },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
