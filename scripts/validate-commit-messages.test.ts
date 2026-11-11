import assert from 'node:assert/strict';
import { test } from 'node:test';

import { validateSubject } from './validate-commit-messages.ts';

test('accepts each documented type and lowercase descriptions', () => {
  for (const type of ['feat', 'chore', 'refactor', 'fix', 'doc']) {
    assert.equal(validateSubject(`${type}(rent-00001): ação 123 (#34)`), null);
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
    assert.notEqual(validateSubject(subject), null, subject);
  }
});

test('rejects uppercase and whitespace-only descriptions', () => {
  assert.notEqual(validateSubject('fix(rent-00001): Description'), null);
  assert.notEqual(validateSubject('fix(rent-00001): Árvore'), null);
  assert.notEqual(validateSubject('fix(rent-00001):   '), null);
});

test('enforces the description length including the squash suffix', () => {
  assert.equal(validateSubject(`doc(rent-00001): ${'a'.repeat(120)}`), null);
  assert.notEqual(validateSubject(`doc(rent-00001): ${'a'.repeat(121)}`), null);
  assert.equal(
    validateSubject(`doc(rent-00001): ${'a'.repeat(114)} (#34)`),
    null,
  );
  assert.notEqual(
    validateSubject(`doc(rent-00001): ${'a'.repeat(115)} (#34)`),
    null,
  );
});
