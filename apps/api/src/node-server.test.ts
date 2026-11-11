import { once } from 'node:events';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { createNodeServer } from './node-server.ts';

describe('Node HTTP adapter', () => {
  const server = createNodeServer();
  let baseUrl: string;

  beforeAll(async () => {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');

    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Expected a TCP server address');
    }

    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('serves the shared health route over HTTP', async () => {
    const response = await fetch(`${baseUrl}/api/v1/health`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { status: 'ok' } });
  });

  it('returns the shared error for another method', async () => {
    const response = await fetch(`${baseUrl}/api/v1/health`, {
      body: 'test',
      method: 'POST',
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: { code: 'NOT_FOUND', message: 'Resource not found.' },
    });
  });

  it('logs and sanitizes unexpected adapter failures', async () => {
    const logger = { error: vi.fn(), info: vi.fn() };
    const failing = createNodeServer(() => {
      throw new Error('secret internal details');
    }, logger);

    failing.listen(0, '127.0.0.1');
    await once(failing, 'listening');

    const address = failing.address();

    if (!address || typeof address === 'string') {
      throw new Error('Expected a TCP server address');
    }

    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/`);

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error.' },
      });
      expect(logger.error).toHaveBeenCalledExactlyOnceWith(
        'api.node.request.failed',
      );
    } finally {
      await new Promise<void>((resolve, reject) => {
        failing.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  it('preserves request bodies and response headers through the adapter', async () => {
    const echo = createNodeServer(async (request) => {
      const body = await request.text();

      return new Response(`${request.headers.get('x-example')}:${body}`, {
        headers: [
          ['content-type', 'text/plain'],
          ['set-cookie', 'first=1'],
          ['set-cookie', 'second=2'],
        ],
        status: 201,
      });
    });

    echo.listen(0, '127.0.0.1');
    await once(echo, 'listening');

    const address = echo.address();

    if (!address || typeof address === 'string') {
      throw new Error('Expected a TCP server address');
    }

    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/`, {
        body: 'test body',
        headers: { 'x-example': 'value' },
        method: 'POST',
      });

      expect(response.status).toBe(201);
      expect(await response.text()).toBe('value:test body');
      expect(response.headers.getSetCookie()).toEqual(['first=1', 'second=2']);
    } finally {
      await new Promise<void>((resolve, reject) => {
        echo.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
