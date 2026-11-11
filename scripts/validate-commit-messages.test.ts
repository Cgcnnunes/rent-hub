import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const cli = require.resolve('@commitlint/cli/cli.js');

function isValid(subject: string): boolean {
  const result = spawnSync(process.execPath, [cli], {
    input: subject,
    encoding: 'utf8',
  });
  if (result.error) throw result.error;
  assert.notEqual(result.status, null, result.stderr);
  return result.status === 0;
}

test('accepts each documented type and lowercase descriptions', () => {
  for (const type of ['feat', 'chore', 'refactor', 'fix', 'doc']) {
    assert.equal(isValid(`${type}(rent-00001): ação 123 (#34)`), true);
  }
});

test('rejects invalid formats and types', () => {
  for (const subject of [
    'Merge pull request #34',
    'docs(rent-00001): description',
    'fix(rent-1): description',
    'fix(rent-00001):description',
    'fix(rent-00001): ',
  ]) {
    assert.equal(isValid(subject), false, subject);
  }
});

test('rejects uppercase and whitespace-only descriptions', () => {
  assert.equal(isValid('fix(rent-00001): Description'), false);
  assert.equal(isValid('fix(rent-00001): Árvore'), false);
  assert.equal(isValid('fix(rent-00001): 1 Uppercase'), false);
  assert.equal(isValid('fix(rent-00001):   '), false);
});

test('enforces the description length including the squash suffix', () => {
  assert.equal(isValid(`doc(rent-00001): ${'a'.repeat(120)}`), true);
  assert.equal(isValid(`doc(rent-00001): ${'a'.repeat(121)}`), false);
  assert.equal(isValid(`doc(rent-00001): ${'a'.repeat(114)} (#34)`), true);
  assert.equal(isValid(`doc(rent-00001): ${'a'.repeat(115)} (#34)`), false);
  assert.equal(isValid(`doc(rent-00001): ${'😀'.repeat(120)}`), true);
  assert.equal(isValid(`doc(rent-00001): ${'😀'.repeat(121)}`), false);
});
