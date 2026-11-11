import { createServer } from 'node:http';
import type { IncomingMessage, Server, ServerResponse } from 'node:http';

import type { Logger } from './application/logger.ts';
import { internalError } from './errors.ts';
import { handleRequest } from './handler.ts';
import { consoleLogger } from './infrastructure/console-logger.ts';

type RequestHandler = (request: Request) => Response | Promise<Response>;

function toRequest(message: IncomingMessage): Request {
  if (!message.url?.startsWith('/') || !message.method) {
    throw new Error('Unsupported request target');
  }

  const headers = new Headers();

  for (let index = 0; index < message.rawHeaders.length; index += 2) {
    headers.append(message.rawHeaders[index], message.rawHeaders[index + 1]);
  }

  const method = message.method;
  const init: RequestInit & { duplex?: 'half' } = { headers, method };

  if (method !== 'GET' && method !== 'HEAD') {
    const iterator = message[Symbol.asyncIterator]();

    init.body = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const result = await iterator.next();

        if (result.done) {
          controller.close();
          return;
        }

        const chunk: unknown = result.value;

        if (!(chunk instanceof Uint8Array)) {
          throw new TypeError('Expected a binary request body');
        }

        controller.enqueue(chunk);
      },

      cancel() {
        message.destroy();
      },
    });

    init.duplex = 'half';
  }

  return new Request(`http://localhost${message.url}`, init);
}

async function writeResponse(
  outgoing: ServerResponse,
  response: Response,
): Promise<void> {
  const body = Buffer.from(await response.arrayBuffer());
  outgoing.statusCode = response.status;

  response.headers.forEach((value, name) => {
    if (name !== 'set-cookie') outgoing.setHeader(name, value);
  });

  const cookies = response.headers.getSetCookie();
  if (cookies.length > 0) outgoing.setHeader('set-cookie', cookies);

  outgoing.end(body);
}

export function createNodeServer(
  handler: RequestHandler = handleRequest,
  logger: Logger = consoleLogger,
): Server {
  return createServer((incoming, outgoing) => {
    outgoing.on('error', () => logger.error('api.node.response.failed'));

    void (async () => {
      try {
        await writeResponse(outgoing, await handler(toRequest(incoming)));
      } catch {
        logger.error('api.node.request.failed');

        if (outgoing.headersSent) {
          outgoing.destroy();
          return;
        }

        try {
          for (const name of outgoing.getHeaderNames()) {
            outgoing.removeHeader(name);
          }

          await writeResponse(outgoing, internalError());
        } catch {
          logger.error('api.node.response.failed');
          outgoing.destroy();
        }
      }
    })();
  });
}
