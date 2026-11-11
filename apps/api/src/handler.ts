import type { ErrorResponse, HealthResponse } from '@rent-hub/contracts';

import { getHealth } from './application/health';
import type { Logger } from './application/logger';
import { consoleLogger } from './infrastructure/console-logger';

export function handleRequest(request: Request, logger: Logger = consoleLogger): Response {
  try {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/api/v1/health') {
      const body: HealthResponse = { data: getHealth() };
      return Response.json(body);
    }

    const body: ErrorResponse = {
      error: { code: 'NOT_FOUND', message: 'Resource not found.' },
    };
    return Response.json(body, { status: 404 });
  } catch {
    logger.error('api.request.failed');
    const body: ErrorResponse = {
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error.' },
    };
    return Response.json(body, { status: 500 });
  }
}
