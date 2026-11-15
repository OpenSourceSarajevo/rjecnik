// Request and response shapes of the Rječnik API (apps/api/app/routers)

export type Definition = {
  type: string | null;
  gender: string | null;
  examples: string[] | null;
  definition: string;
  part_of_speech: string | null;
  pronunciation_ipa: string | null;
  pronunciation_audio: string | null;
  synonyms?: string[] | null;
  antonyms?: string[] | null;
};

export type WordForm = {
  form: string;
  name: string;
  value: string;
  category: string;
};

/** A public dictionary word. */
export type Word = {
  id: number;
  headword: string;
  definitions: Definition[];
  origins?: string[] | null;
  forms?: WordForm[] | null;
  alternatives?: string[] | null;
  synonyms?: string[] | null;
  antonyms?: string[] | null;
  frequency?: number | null;
};

/** A word as admins see it, including the editor note and audit columns. */
export type WordDetail = Word & {
  note?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_by?: string | null;
  updated_at?: string | null;
};

export type WordSummary = Pick<Word, 'id' | 'headword' | 'definitions'>;

export type WordPage = {
  items: Word[];
  limit: number;
  offset: number;
};

export type SearchParams = {
  q?: string;
  page?: number;
  page_size?: number;
};

export type SearchResults = {
  items: WordSummary[];
  has_more: boolean;
};

/** Body of create/update; on update, omitted optional fields are left unchanged. */
export type WordInput = {
  headword: string;
  definitions: Definition[];
  forms?: WordForm[] | null;
  alternatives?: string[] | null;
  origins?: string[] | null;
  synonyms?: string[] | null;
  antonyms?: string[] | null;
  frequency?: number | null;
  note?: string | null;
};

export type DashboardStats = {
  stats: { words: number; definitions: number; forms: number };
  type_breakdown: { type: string; count: number }[];
};

export type IgnoreType = 'ostalo' | 'ime' | 'strana_riječ' | 'skraćenica';

export type IgnoredWord = {
  id: number;
  headword: string;
  // Plain string when reading: a few legacy rows still hold English types
  type: string;
  inserted_at: string | null;
  updated_at: string | null;
};

export type ListIgnoredParams = {
  q?: string;
  page?: number;
  page_size?: number;
};

export type IgnoredWordPage = {
  items: IgnoredWord[];
  total: number;
};

export type BulkIgnoreResult = {
  items: IgnoredWord[];
  count: number;
};

export type Strategy =
  | 'Frequency Only'
  | 'New Definition'
  | 'New Form'
  | 'Existing Form'
  | 'New Headword'
  | 'Ignore'
  | 'Remove';

export type NewWord = {
  id: number;
  headword: string;
  examples: string[];
  count: number;
  is_new: boolean;
  created_at: string | null;
  created_by: string | null;
  assigned_to: string | null;
  strategy: Strategy | null;
};

export type ListNewWordsParams = {
  headword?: string;
  /** A strategy, or `'none'` for unassigned words. */
  strategy?: Strategy | 'none';
  is_new?: boolean;
  page?: number;
  page_size?: number;
};

export type NewWordPage = {
  items: NewWord[];
  total: number;
};

export type ExistingFormInput = {
  /** The existing headword the new word is a form of. */
  headword: string;
};

export type NewFormInput = {
  headword: string;
  /** The headword's complete form list, including the new form. */
  forms: WordForm[];
};

export type NewDefinitionInput = {
  headword: string;
  definition: {
    type?: string | null;
    gender?: string | null;
    definition: string;
    examples?: string[] | null;
  };
  updateFrequency?: boolean;
};

export type NewHeadwordInput = {
  definitions: Partial<Definition>[];
  forms?: WordForm[] | null;
  origins?: string[] | null;
  alternatives?: string[] | null;
  synonyms?: string[] | null;
  antonyms?: string[] | null;
};

export type IgnoreNewWordInput = {
  type?: IgnoreType;
};
