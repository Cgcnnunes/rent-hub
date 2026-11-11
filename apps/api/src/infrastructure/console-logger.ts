import type { Logger } from '../application/logger';

export const consoleLogger: Logger = {
  error(event: string): void {
    console.error(event);
  },
  info(event: string): void {
    console.info(event);
  },
};
