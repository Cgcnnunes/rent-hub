import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApiServer } from './node-server';

describe('Node HTTP adapter', () => {
  const server = createApiServer();
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Expected a TCP server address.');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  });

  it('serves health via a real HTTP connection', async () => {
    const response = await fetch(`${baseUrl}/api/v1/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { status: 'ok' } });
  });

  it('returns the common error envelope for a request with a body', async () => {
    const response = await fetch(`${baseUrl}/unknown`, { method: 'POST', body: 'test' });
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: { code: 'NOT_FOUND', message: 'Resource not found.' },
    });
  });
});
