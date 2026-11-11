import type { ErrorResponse, HealthResponse } from '@rent-hub/contracts';

import { getHealth } from './application/health.ts';
import type { HealthStatus } from './application/health.ts';
import type { Logger } from './application/logger.ts';
import { internalError } from './errors.ts';
import { consoleLogger } from './infrastructure/console-logger.ts';

export function createHandler(
  health: () => HealthStatus,
  logger: Logger,
): (request: Request) => Response {
  return (request) => {
    try {
      const url = new URL(request.url);

      if (request.method === 'GET' && url.pathname === '/api/v1/health') {
        const body: HealthResponse = { data: health() };

        return Response.json(body);
      }

      const body: ErrorResponse = {
        error: { code: 'NOT_FOUND', message: 'Resource not found.' },
      };

      return Response.json(body, { status: 404 });
    } catch {
      logger.error('api.request.failed');

      return internalError();
    }
  };
}

export const handleRequest = createHandler(getHealth, consoleLogger);
