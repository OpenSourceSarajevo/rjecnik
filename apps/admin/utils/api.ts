import { createApi, createFetchTransport } from '@rjecnik/api';

import { createClient } from '@/utils/supabase/client';

export { ApiError } from '@rjecnik/api';

/**
 * Rječnik API (apps/api), called from the browser and authenticated with the
 * current Supabase session's access token.
 */
export const api = createApi(
  createFetchTransport({
    baseUrl: process.env.NEXT_PUBLIC_API_URL!,
    getToken: async () => {
      const {
        data: { session },
      } = await createClient().auth.getSession();
      return session?.access_token;
    },
  })
);
