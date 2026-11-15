import { createApi, createFetchTransport } from '@rjecnik/api';

export { ApiError } from '@rjecnik/api';

// The server can reach the API at a different address than the browser (e.g. the
// `api` service in Docker Compose); API_URL is read at runtime and never sent to the client.
const baseUrl =
  (typeof window === 'undefined' && process.env.API_URL) || process.env.NEXT_PUBLIC_API_URL!;

/** Public endpoints of the Rječnik API; works on the server and in the browser. */
export const api = createApi(createFetchTransport({ baseUrl }));
