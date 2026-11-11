export interface HealthResponse {
  data: {
    status: 'ok';
  };
}

export function healthResponse(): HealthResponse {
  return { data: { status: 'ok' } };
}
