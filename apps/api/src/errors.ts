import type { ErrorResponse } from '@rent-hub/contracts';

export function internalError(): Response {
  const body: ErrorResponse = {
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error.' },
  };

  return Response.json(body, { status: 500 });
}
