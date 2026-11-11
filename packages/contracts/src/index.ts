export interface HealthResponse {
  data: {
    status: 'ok';
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
