import { createServer, type IncomingMessage, type Server } from 'node:http';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { handleRequest } from './handler';
import type { Logger } from './application/logger';
import { consoleLogger } from './infrastructure/console-logger';

function toRequest(message: IncomingMessage): Request {
  const headers = new Headers();
  for (let index = 0; index < message.rawHeaders.length; index += 2) {
    headers.append(message.rawHeaders[index], message.rawHeaders[index + 1]);
  }
  const method = message.method ?? 'GET';
  const init: RequestInit & { duplex?: 'half' } = { headers, method };
  if (method !== 'GET' && method !== 'HEAD') {
    const iterator = message[Symbol.asyncIterator]();
    init.body = new ReadableStream<Uint8Array>({
      async pull(controller): Promise<void> {
        const result = await iterator.next();
        if (result.done) {
          controller.close();
        } else {
          controller.enqueue(result.value);
        }
      },
      async cancel(): Promise<void> {
        await iterator.return?.();
      },
    });
    init.duplex = 'half';
  }
  return new Request(new URL(message.url ?? '/', 'http://localhost'), init);
}

export function createApiServer(logger: Logger = consoleLogger): Server {
  return createServer(async (request, response) => {
    try {
      const result = handleRequest(toRequest(request), logger);
      response.writeHead(result.status, Object.fromEntries(result.headers));
      const body = result.body;
      if (body) {
        const stream = Readable.from((async function* () {
          const reader = body.getReader();
          try {
            while (true) {
              const chunk = await reader.read();
              if (chunk.done) return;
              yield chunk.value;
            }
          } finally {
            reader.releaseLock();
          }
        })());
        await pipeline(stream, response);
      } else {
        response.end();
      }
    } catch {
      logger.error('api.node.request.failed');
      if (response.headersSent) {
        response.destroy();
      } else {
        response.writeHead(500, { 'content-type': 'application/json' });
        response.end(JSON.stringify({
          error: { code: 'INTERNAL_ERROR', message: 'Internal server error.' },
        }));
      }
    }
  });
}
