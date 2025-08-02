export type WordProcessingStrategy = 'Frequency Only' | 'New Example' | 'New Definition' | 'New Form' | 'Existing Form' | 'New Headword' | 'Ignore' | 'Remove';

export type NewWord = {
  id: number;
  headword: string;
  examples: string[];
  count: number;
  is_new: boolean;
  created_at: string;
  created_by: string;
  assigned_to: string | null;
  strategy: WordProcessingStrategy | null;
};
