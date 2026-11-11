import { createApiServer } from './node-server';
import { consoleLogger } from './infrastructure/console-logger';

const port = Number(process.env.PORT ?? '3001');
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const server = createApiServer();
server.on('error', () => {
  consoleLogger.error('api.node.server.failed');
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  consoleLogger.info(`api.node.listening port=${port}`);
});
