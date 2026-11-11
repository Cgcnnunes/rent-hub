import { build } from 'esbuild';

await Promise.all([
  build({
    bundle: true,
    entryPoints: ['apps/api/src/node.ts'],
    format: 'esm',
    outfile: 'dist/apps/api/node.mjs',
    platform: 'node',
    target: 'node22',
  }),
  build({
    bundle: true,
    entryPoints: ['apps/api/src/worker.ts'],
    format: 'esm',
    outfile: 'dist/apps/api/worker.mjs',
    platform: 'browser',
    target: 'es2022',
  }),
]);
