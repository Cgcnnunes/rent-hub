import type { Logger } from '../application/logger.ts';

export const consoleLogger: Logger = {
  info(event) {
    console.info({ event });
  },

  error(event) {
    console.error({ event });
  },
};
