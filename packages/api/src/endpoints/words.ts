import type { Transport } from '../transport';
import type { SearchParams, SearchResults, Word, WordDetail, WordInput, WordPage } from '../types';

export function wordsEndpoints<Options>(send: Transport<Options>) {
  return {
    list: (params: { limit?: number; offset?: number } = {}, options?: Options) =>
      send<WordPage>({ method: 'GET', path: '/api/words', query: params }, options),

    search: (params: SearchParams, options?: Options) =>
      send<SearchResults>({ method: 'GET', path: '/api/words/search', query: params }, options),

    /** Every headword, e.g. for a sitemap. */
    headwords: (options?: Options) =>
      send<string[]>({ method: 'GET', path: '/api/words/headwords' }, options),

    byHeadword: (headword: string, options?: Options) =>
      send<Word>(
        { method: 'GET', path: `/api/words/headword/${encodeURIComponent(headword)}` },
        options
      ),

    /** Admin only. */
    byId: (id: number, options?: Options) =>
      send<WordDetail>({ method: 'GET', path: `/api/words/${id}` }, options),

    create: (body: WordInput, options?: Options) =>
      send<WordDetail>({ method: 'POST', path: '/api/words', body }, options),

    update: (id: number, body: Partial<WordInput>, options?: Options) =>
      send<WordDetail>({ method: 'PATCH', path: `/api/words/${id}`, body }, options),
  };
}
