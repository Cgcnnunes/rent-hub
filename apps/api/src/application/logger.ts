export interface Logger {
  info(event: string): void;

  error(event: string): void;
}
