import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const branchPattern = /^refs\/heads\/rent-\d{5}$/u;

export function validatePushDestination(remoteRef: string): void {
  if (!branchPattern.test(remoteRef)) {
    throw new Error(
      'Push only the current rent-xxxxx feature branch to a rent-xxxxx branch.',
    );
  }
}

export function validatePushRef(
  localRef: string,
  remoteRef: string,
  current: string,
): void {
  validatePushDestination(remoteRef);
  if (!branchPattern.test(localRef) || localRef !== current) {
    throw new Error(
      'Push only the current rent-xxxxx feature branch to a rent-xxxxx branch.',
    );
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const refs = readFileSync(0, 'utf8').trim().split('\n').filter(Boolean);
  let hasBranch = false;
  for (const ref of refs) {
    const [localRef, localSha, remoteRef] = ref.trim().split(/\s+/u);
    if (!localRef || !localSha || !remoteRef)
      throw new Error('Invalid push ref input.');
    if (!remoteRef.startsWith('refs/heads/')) continue;
    validatePushDestination(remoteRef);
    const current = execFileSync('git', ['symbolic-ref', '-q', 'HEAD'], {
      encoding: 'utf8',
    }).trim();
    validatePushRef(localRef, remoteRef, current);
    if (!/^0+$/u.test(localSha)) hasBranch = true;
  }
  if (hasBranch) console.log('branch');
}
