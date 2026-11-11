'use strict';

const { readFileSync } = require('node:fs');

const { eslint, git, nx, runNode } = require('./hooks.cjs');
const { validatePushRef } = require('./push-policy.cjs');

const refs = readFileSync(0, 'utf8').trim().split('\n').filter(Boolean);

for (const ref of refs) {
  const [localRef, localSha, remoteRef] = ref.trim().split(/\s+/u);
  if (remoteRef.startsWith('refs/heads/')) {
    const current = git(['symbolic-ref', '-q', 'HEAD']);
    validatePushRef(localRef, remoteRef, current);
    if (!/^0+$/u.test(localSha)) {
      const base = git(['merge-base', 'origin/main', localSha]);
      runNode(require.resolve('prettier/bin/prettier.cjs'), ['--check', '.']);
      runNode(eslint, ['.', '--max-warnings=0']);
      runNode('--test', [
        'scripts/validate-commit-messages.test.cjs',
        'scripts/hooks.test.cjs',
      ]);
      runNode(nx, [
        'affected',
        '-t',
        'lint',
        'typecheck',
        'test',
        'build',
        'test-e2e',
        `--base=${base}`,
        `--head=${localSha}`,
      ]);
    }
  }
}
