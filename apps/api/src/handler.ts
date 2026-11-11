import { healthResponse } from '@rent-hub/contracts';

export function handleRequest(request: Request): Response {
  const url = new URL(request.url);

  if (request.method === 'GET' && url.pathname === '/api/v1/health') {
    return Response.json(healthResponse());
  }

  return Response.json(
    { error: { code: 'NOT_FOUND', message: 'Resource not found.' } },
    { status: 404 },
  );
}
