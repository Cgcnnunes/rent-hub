import { describe, expect, it } from 'vitest';

import { handleRequest } from './handler';
import worker from './worker';

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

  it('uses the same handler through the Worker entry', async () => {
    const response = worker.fetch(
      new Request('http://localhost/api/v1/health'),
    );
    expect(await response.json()).toEqual({ data: { status: 'ok' } });
  });
});
