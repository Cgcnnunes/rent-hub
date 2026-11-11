'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { test } = require('node:test');

const workspaceRoot = path.resolve(__dirname, '..');
const nxPackage = require('nx/package.json');
const nxBin = path.resolve(
  path.dirname(require.resolve('nx/package.json')),
  nxPackage.bin.nx,
);

const cases = [
  { file: 'apps/web/app/page.tsx', projects: ['web'] },
  { file: 'apps/api/src/handler.ts', projects: ['api'] },
  { file: 'packages/contracts/src/index.ts', projects: ['api', 'contracts'] },
  {
    file: 'packages/localization/src/index.ts',
    projects: ['localization', 'web'],
  },
];

for (const { file, projects } of cases) {
  test(`affected projects for ${file}`, () => {
    const output = execFileSync(
      process.execPath,
      [nxBin, 'show', 'projects', '--affected', '--json', `--files=${file}`],
      {
        cwd: workspaceRoot,
        encoding: 'utf8',
        env: { ...process.env, NX_DAEMON: 'false' },
      },
    );

    assert.deepEqual(JSON.parse(output).sort(), projects);
  });
}

for (const { file, projects, target } of [
  { file: 'apps/web/app/page.tsx', projects: ['web'], target: 'build' },
  { file: 'apps/web/app/page.tsx', projects: ['web'], target: 'test-e2e' },
  {
    file: 'packages/localization/src/index.ts',
    projects: ['localization', 'web'],
    target: 'lint',
  },
  {
    file: 'packages/contracts/src/index.ts',
    projects: ['api', 'contracts'],
    target: 'typecheck',
  },
]) {
  test(`affected ${target} targets for ${file}`, () => {
    const output = execFileSync(
      process.execPath,
      [
        nxBin,
        'show',
        'projects',
        '--affected',
        '--json',
        `--with-target=${target}`,
        `--files=${file}`,
      ],
      {
        cwd: workspaceRoot,
        encoding: 'utf8',
        env: { ...process.env, NX_DAEMON: 'false' },
      },
    );
    assert.deepEqual(JSON.parse(output).sort(), projects);
  });
}
