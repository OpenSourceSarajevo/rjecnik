import type { Transport } from '../transport';
import type {
  ExistingFormInput,
  IgnoreNewWordInput,
  ListNewWordsParams,
  NewDefinitionInput,
  NewFormInput,
  NewHeadwordInput,
  NewWord,
  NewWordPage,
  Strategy,
  WordDetail,
} from '../types';

export function newWordsEndpoints<Options>(send: Transport<Options>) {
  return {
    list: (params: ListNewWordsParams, options?: Options) =>
      send<NewWordPage>({ method: 'GET', path: '/api/words/new', query: params }, options),

    /** New words assigned to the signed-in editor. */
    mine: (options?: Options) =>
      send<NewWord[]>({ method: 'GET', path: '/api/words/new/mine' }, options),

    /** Assigns a strategy to the signed-in editor; `null` clears strategy and assignee. */
    assignStrategy: (id: number, strategy: Strategy | null, options?: Options) =>
      send<NewWord>(
        {
          method: 'PATCH',
          path: `/api/words/new/${id}/strategy/${encodeURIComponent(strategy ?? 'null')}`,
        },
        options
      ),

    // Applying a strategy removes the new word and returns the dictionary word it changed.

    applyFrequencyOnly: (id: number, options?: Options) =>
      send<WordDetail>({ method: 'POST', path: `/api/words/new/${id}/frequency-only` }, options),

    applyExistingForm: (id: number, body: ExistingFormInput, options?: Options) =>
      send<WordDetail>(
        { method: 'POST', path: `/api/words/new/${id}/existing-form`, body },
        options
      ),

    applyNewForm: (id: number, body: NewFormInput, options?: Options) =>
      send<WordDetail>({ method: 'POST', path: `/api/words/new/${id}/new-form`, body }, options),

    applyNewDefinition: (id: number, body: NewDefinitionInput, options?: Options) =>
      send<WordDetail>(
        { method: 'POST', path: `/api/words/new/${id}/new-definition`, body },
        options
      ),

    applyNewHeadword: (id: number, body: NewHeadwordInput, options?: Options) =>
      send<WordDetail>(
        { method: 'POST', path: `/api/words/new/${id}/new-headword`, body },
        options
      ),

    applyIgnore: (id: number, body: IgnoreNewWordInput = {}, options?: Options) =>
      send<void>({ method: 'POST', path: `/api/words/new/${id}/ignore`, body }, options),

    /** Discards the new word (e.g. an OCR error). */
    remove: (id: number, options?: Options) =>
      send<void>({ method: 'DELETE', path: `/api/words/new/${id}` }, options),
  };
}
