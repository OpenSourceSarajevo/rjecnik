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

export type Word = {
  id: number;
  headword: string;
  definitions: Definition[];
  forms?: WordForm[] | null;
  alternatives?: string[] | null;
  origins?: string[] | null;
  synonyms?: string[] | null;
  antonyms?: string[] | null;
  frequency: number;
  note?: string | null;
};
