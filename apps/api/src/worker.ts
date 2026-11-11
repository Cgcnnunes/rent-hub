import { handleRequest } from './handler.ts';

export default {
  fetch(request: Request): Response {
    return handleRequest(request);
  },
};
