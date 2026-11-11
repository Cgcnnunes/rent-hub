'use strict';

const { execFileSync, spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const eslint = path.resolve(
  path.dirname(require.resolve('eslint/package.json')),
  require('eslint/package.json').bin.eslint,
);
const nx = path.resolve(
  path.dirname(require.resolve('nx/package.json')),
  require('nx/package.json').bin.nx,
);

function runNode(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

module.exports = { eslint, git, nx, root, runNode };
