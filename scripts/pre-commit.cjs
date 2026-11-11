'use strict';

const { execFileSync, spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

const { eslint, nx, root, runNode } = require('./hooks.cjs');

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
  runNode(require.resolve('prettier/bin/prettier.cjs'), [
    '--check',
    '--ignore-unknown',
    ...files,
  ]);
  runNode(eslint, ['.', '--max-warnings=0']);
  runNode('--test', [
    'scripts/validate-commit-messages.test.cjs',
    'scripts/hooks.test.cjs',
  ]);
  runNode(nx, ['affected', '-t', 'test', `--files=${files.join(',')}`]);
}
