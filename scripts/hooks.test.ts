import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { validatePushRef } from './push-policy.ts';

const require = createRequire(import.meta.url);

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
  const cases: Array<[string, number]> = [
    ['feat(rent-00001): valid description', 0],
    ['fix(rent-00001): Invalid', 1],
    [`fix(rent-00001): ${'a'.repeat(121)}`, 1],
    ['Merge branch main', 1],
  ];
  for (const [subject, expected] of cases) {
    const result = spawnSync(process.execPath, [cli], {
      input: subject,
      encoding: 'utf8',
    });
    assert.equal(result.status, expected, result.stderr || result.stdout);
  }
});

test('pre-push rejects an actual ref update to main', () => {
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  const result = spawnSync(process.execPath, ['scripts/push-policy.ts'], {
    input: `refs/heads/rent-00007 ${sha} refs/heads/main ${sha}\n`,
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /rent-xxxxx/u);
});

test('staged diff check rejects whitespace errors and conflict markers', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'rent-hub-hook-test-'));
  try {
    execFileSync('git', ['init', '-q'], { cwd: directory });
    for (const content of [
      'trailing space \n',
      '<<<<<<< HEAD\nconflict\n=======\nother\n>>>>>>> branch\n',
    ]) {
      writeFileSync(path.join(directory, 'example.txt'), content);
      execFileSync('git', ['add', 'example.txt'], { cwd: directory });
      const result = spawnSync('git', ['diff', '--cached', '--check'], {
        cwd: directory,
        encoding: 'utf8',
      });
      assert.notEqual(result.status, 0, content);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
