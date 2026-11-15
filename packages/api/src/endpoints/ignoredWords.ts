import type { Transport } from '../transport';
import type {
  BulkIgnoreResult,
  IgnoredWord,
  IgnoredWordPage,
  IgnoreType,
  ListIgnoredParams,
} from '../types';

export function ignoredWordsEndpoints<Options>(send: Transport<Options>) {
  return {
    list: (params: ListIgnoredParams, options?: Options) =>
      send<IgnoredWordPage>({ method: 'GET', path: '/api/words/ignored', query: params }, options),

    /** Adds headwords, or changes the type of those already on the list. */
    bulkAdd: (body: { headwords: string[]; type: IgnoreType }, options?: Options) =>
      send<BulkIgnoreResult>({ method: 'POST', path: '/api/words/ignored', body }, options),

    update: (id: number, body: { type: IgnoreType }, options?: Options) =>
      send<IgnoredWord>({ method: 'PATCH', path: `/api/words/ignored/${id}`, body }, options),

    remove: (id: number, options?: Options) =>
      send<void>({ method: 'DELETE', path: `/api/words/ignored/${id}` }, options),
  };
}
