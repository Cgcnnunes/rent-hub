'use strict';

const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const { test } = require('node:test');

const { validatePushRef } = require('./push-policy.cjs');

test('only allows pushing the current feature branch to a feature branch', () => {
  const current = 'refs/heads/rent-00007';
  assert.doesNotThrow(() => validatePushRef(current, current, current));
  for (const [source, destination] of [
    [current, 'refs/heads/main'],
    [current, 'refs/heads/feature'],
    ['refs/heads/main', current],
    ['refs/heads/rent-00008', current],
    ['(delete)', current],
  ]) {
    assert.throws(() => validatePushRef(source, destination, current));
  }
});

test('commitlint enforces the same subject rules as pull request validation', () => {
  const cli = require.resolve('@commitlint/cli/cli.js');
  for (const [subject, expected] of [
    ['feat(rent-00001): valid description', 0],
    ['fix(rent-00001): Invalid', 1],
    [`fix(rent-00001): ${'a'.repeat(121)}`, 1],
    ['Merge branch main', 1],
  ]) {
    const result = spawnSync(process.execPath, [cli], {
      input: subject,
      encoding: 'utf8',
    });
    assert.equal(result.status, expected, result.stderr || result.stdout);
  }
});

test('pre-push rejects an actual ref update to main', () => {
  const ref = execFileSync('git', ['symbolic-ref', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  const result = spawnSync(process.execPath, ['scripts/pre-push.cjs'], {
    input: `${ref} ${sha} refs/heads/main ${sha}\n`,
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /rent-xxxxx/u);
});
