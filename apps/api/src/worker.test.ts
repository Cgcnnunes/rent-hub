import { build } from 'esbuild';
import { Miniflare } from 'miniflare';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Worker runtime adapter', () => {
  let worker: Miniflare;

  beforeAll(async () => {
    const result = await build({
      bundle: true,
      entryPoints: ['apps/api/src/worker.ts'],
      format: 'esm',
      platform: 'browser',
      write: false,
    });

    worker = new Miniflare({
      compatibilityDate: '2026-07-30',
      modules: true,
      script: result.outputFiles[0].text,
    });

    await worker.ready;
  }, 30_000);

  afterAll(async () => {
    await worker?.dispose();
  });

  it('serves the health route in workerd', async () => {
    const response = await worker.dispatchFetch(
      'http://localhost/api/v1/health',
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { status: 'ok' } });
  });

  it('returns the shared error for unsupported routes and methods', async () => {
    for (const [url, method] of [
      ['http://localhost/missing', 'GET'],
      ['http://localhost/api/v1/health', 'POST'],
    ]) {
      const response = await worker.dispatchFetch(url, { method });

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({
        error: { code: 'NOT_FOUND', message: 'Resource not found.' },
      });
    }
  });
});
