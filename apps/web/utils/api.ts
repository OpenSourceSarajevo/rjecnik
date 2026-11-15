import { createApi, createFetchTransport } from '@rjecnik/api';

export { ApiError } from '@rjecnik/api';

/** Public endpoints of the Rječnik API; works on the server and in the browser. */
export const api = createApi(createFetchTransport({ baseUrl: process.env.NEXT_PUBLIC_API_URL! }));
