import type { Transport } from '../transport';
import type {
  ListQualityWordsParams,
  QualityBreakdown,
  QualityDistribution,
  QualityWordPage,
  WordScore,
  WordToScore,
} from '../types';

/** Word data quality (admin only, read-only; rules change through migrations). */
export function qualityEndpoints<Options>(send: Transport<Options>) {
  return {
    /** Number of green, yellow, red and not yet scored words. */
    distribution: (options?: Options) =>
      send<QualityDistribution>({ method: 'GET', path: '/api/quality/distribution' }, options),

    /** Scores a word that has not been saved yet. */
    preview: (word: WordToScore, options?: Options) =>
      send<QualityBreakdown>({ method: 'POST', path: '/api/quality/preview', body: word }, options),

    words: (params: ListQualityWordsParams = {}, options?: Options) =>
      send<QualityWordPage>({ method: 'GET', path: '/api/quality/words', query: params }, options),

    /** Scores of up to 100 words, e.g. a page of search results. */
    scores: (ids: number[], options?: Options) =>
      send<WordScore[]>(
        { method: 'GET', path: '/api/quality/scores', query: { ids: ids.join(',') } },
        options
      ),
  };
}
