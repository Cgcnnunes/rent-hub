import assert from 'node:assert/strict';
import { test } from 'node:test';

import { affectedProjects, splitProjects } from './ci-projects.ts';

test('separates affected apps and packages, including unconsumed packages', () => {
  assert.deepEqual(
    splitProjects([
      { name: 'web', root: 'apps/web', targets: { 'test-e2e': {} } },
      { name: 'api', root: 'apps/api', targets: { test: {} } },
      { name: 'localization', root: 'packages/localization', targets: {} },
      { name: 'orphan', root: 'packages/orphan', targets: {} },
    ]),
    {
      apps: [
        { name: 'web', browser: true },
        { name: 'api', browser: false },
      ],
      packages: ['localization', 'orphan'],
    },
  );
});

test('handles no affected projects', () => {
  assert.deepEqual(splitProjects([]), { apps: [], packages: [] });
});

for (const { file, apps, packages } of [
  { file: 'apps/web/app/page.tsx', apps: ['web'], packages: [] },
  { file: 'apps/api/src/handler.ts', apps: ['api'], packages: [] },
  {
    file: 'packages/localization/src/index.ts',
    apps: ['web'],
    packages: ['localization'],
  },
  {
    file: 'packages/contracts/src/index.ts',
    apps: ['api'],
    packages: ['contracts'],
  },
  {
    file: 'eslint.config.mjs',
    apps: ['api', 'web'],
    packages: ['contracts', 'localization'],
  },
  { file: 'README.md', apps: [], packages: [] },
]) {
  test(`selects the correct CI jobs for ${file}`, () => {
    const selected = affectedProjects([`--files=${file}`]);

    assert.deepEqual(selected.apps.map((app) => app.name).sort(), apps);

    assert.deepEqual(selected.packages.sort(), packages);

    if (apps.includes('web')) {
      assert.equal(
        selected.apps.find((app) => app.name === 'web')?.browser,
        true,
      );
    }
  });
}
