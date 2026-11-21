import type { Transport } from '../transport';
import { dashboardEndpoints } from './dashboard';
import { ignoredWordsEndpoints } from './ignoredWords';
import { newWordsEndpoints } from './newWords';
import { qualityEndpoints } from './quality';
import { wordsEndpoints } from './words';

/**
 * Typed Rječnik API endpoints on top of any `Transport`. Every function takes the
 * transport's per-call options as its last argument (e.g. an `AbortSignal` via `{ signal }`).
 */
export function createApi<Options>(send: Transport<Options>) {
  return {
    words: wordsEndpoints(send),
    dashboard: dashboardEndpoints(send),
    ignoredWords: ignoredWordsEndpoints(send),
    newWords: newWordsEndpoints(send),
    quality: qualityEndpoints(send),
  };
}

export type Api<Options = unknown> = ReturnType<typeof createApi<Options>>;
