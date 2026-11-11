import { build } from 'esbuild';
import { convertV4MiniflareOptions, Miniflare } from 'miniflare';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Cloudflare Worker runtime', () => {
  let runtime: Miniflare;

  beforeAll(async () => {
    const result = await build({
      bundle: true,
      entryPoints: ['apps/api/src/worker.ts'],
      format: 'esm',
      platform: 'browser',
      target: 'es2022',
      write: false,
    });
    runtime = new Miniflare(convertV4MiniflareOptions({
      compatibilityDate: '2025-01-01',
      modules: true,
      script: result.outputFiles[0].text,
    }));
  });

  afterAll(async () => {
    await runtime?.dispose();
  });

  it('returns the health response inside workerd', async () => {
    const response = await runtime.dispatchFetch('http://localhost/api/v1/health');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { status: 'ok' } });
  });

  it('returns the standard error inside workerd', async () => {
    const response = await runtime.dispatchFetch('http://localhost/unknown');
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: { code: 'NOT_FOUND', message: 'Resource not found.' },
    });
  });
});
