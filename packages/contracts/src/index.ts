export interface HealthResponse {
  data: {
    status: 'ok';
  };
}

export interface ErrorResponse {
  error: {
    code: 'INTERNAL_ERROR' | 'NOT_FOUND';
    message: string;
  };
}
