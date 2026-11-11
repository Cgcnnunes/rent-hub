export interface HealthStatus {
  status: 'ok';
}

export function getHealth(): HealthStatus {
  return { status: 'ok' };
}
