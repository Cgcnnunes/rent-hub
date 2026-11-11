import { consoleLogger } from './infrastructure/console-logger.ts';
import { createNodeServer } from './node-server.ts';

const server = createNodeServer();

server.on('error', () => {
  consoleLogger.error('api.node.server.failed');
  process.exitCode = 1;
});

server.listen(8787, '127.0.0.1', () => {
  consoleLogger.info('api.node.server.started');
});
