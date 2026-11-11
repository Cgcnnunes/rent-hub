import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const cli = require.resolve('@commitlint/cli/cli.js');

function isValid(subject: string, branch = 'rent-00007'): boolean {
  const result = spawnSync(process.execPath, [cli], {
    input: subject,
    encoding: 'utf8',
    env: { ...process.env, COMMIT_BRANCH: branch },
  });

  if (result.error) throw result.error;

  assert.notEqual(result.status, null, result.stderr);

  return result.status === 0;
}

test('accepts each documented type and lowercase descriptions', () => {
  for (const type of ['feat', 'chore', 'refactor', 'fix', 'doc']) {
    assert.equal(isValid(`${type}(RENT-00007): ação 123 (#34)`), true);
  }
});

test('rejects invalid formats and types', () => {
  for (const subject of [
    'Merge pull request #34',
    'docs(RENT-00007): description',
    'fix(RENT-1): description',
    'fix(RENT-00007):description',
    'fix(RENT-00007): ',
    'fix(rent-00007): description',
    'fix(RENT-00008): description',
  ]) {
    assert.equal(isValid(subject), false, subject);
  }
});

test('rejects uppercase and whitespace-only descriptions', () => {
  assert.equal(isValid('fix(RENT-00007): Description'), false);
  assert.equal(isValid('fix(RENT-00007): Árvore'), false);
  assert.equal(isValid('fix(RENT-00007): 1 Uppercase'), false);
  assert.equal(isValid('fix(RENT-00007):   '), false);
});

test('enforces the description length including the squash suffix', () => {
  assert.equal(isValid(`doc(RENT-00007): ${'a'.repeat(120)}`), true);
  assert.equal(isValid(`doc(RENT-00007): ${'a'.repeat(121)}`), false);
  assert.equal(isValid(`doc(RENT-00007): ${'a'.repeat(114)} (#34)`), true);
  assert.equal(isValid(`doc(RENT-00007): ${'a'.repeat(115)} (#34)`), false);
  assert.equal(isValid(`doc(RENT-00007): ${'😀'.repeat(120)}`), true);
  assert.equal(isValid(`doc(RENT-00007): ${'😀'.repeat(121)}`), false);
});

test('requires a valid lowercase branch and the matching uppercase scope', () => {
  assert.equal(isValid('fix(RENT-00042): description', 'rent-00042'), true);
  assert.equal(isValid('fix(RENT-00007): description', 'rent-00042'), false);
  assert.equal(isValid('fix(RENT-00007): description', 'RENT-00007'), false);
  assert.equal(isValid('fix(RENT-00007): description', 'main'), false);
});

test('reads the current branch when no CI branch is supplied', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'rent-hub-commitlint-'));
  const env = { ...process.env };
  delete env.COMMIT_BRANCH;

  try {
    execFileSync('git', ['init', '-q', '-b', 'rent-00042'], { cwd: directory });
    const config = path.resolve('commitlint.config.ts');
    for (const [subject, expected] of [
      ['fix(RENT-00042): description', 0],
      ['fix(RENT-00007): description', 1],
    ] as const) {
      const result = spawnSync(process.execPath, [cli, '--config', config], {
        cwd: directory,
        encoding: 'utf8',
        env,
        input: subject,
      });
      if (result.error) throw result.error;
      assert.equal(result.status, expected, result.stderr);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
