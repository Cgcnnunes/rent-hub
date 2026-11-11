import { describe, expect, it, vi } from 'vitest';

import { createHandler, handleRequest } from './handler.ts';

describe('API boundary', () => {
  it('returns the shared health response', async () => {
    const response = handleRequest(
      new Request('http://localhost/api/v1/health'),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { status: 'ok' } });
  });

  it('returns a safe error for unknown routes', async () => {
    const response = handleRequest(new Request('http://localhost/unknown'));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: { code: 'NOT_FOUND', message: 'Resource not found.' },
    });
  });

  it('returns a safe error and logs an event when the use case fails', async () => {
    const logger = { error: vi.fn(), info: vi.fn() };
    const handler = createHandler(() => {
      throw new Error('secret internal details');
    }, logger);
    const response = handler(new Request('http://localhost/api/v1/health'));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error.' },
    });
    expect(logger.error).toHaveBeenCalledExactlyOnceWith('api.request.failed');
  });
});
