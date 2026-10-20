import { z } from 'zod';
import type { Definition, WordForm } from '@/app/api/dictionary/route';

// Schemas for the AI assistant's response. Every field is required (nullable where the app allows
// "no value") because structured outputs require all object keys. Type, gender and form labels are
// plain strings rather than enums: existing words contain older values (e.g. "imenica m.") that the
// assistant must be able to return unchanged. The preferred values are listed in the prompt.

export const ProposedDefinitionSchema = z.object({
  type: z
    .string()
    .nullable()
    .describe('Vrsta riječi, npr. "imenica", "glagol", "pridjev"; null ako nije poznata'),
  gender: z
    .string()
    .nullable()
    .describe('Rod: "muški", "ženski" ili "srednji"; null ako nije primjenjivo'),
  definition: z
    .string()
    .describe('Tekst definicije jednog značenja; prazan string ako nije popunjen'),
  examples: z.array(z.string()).describe('Primjeri upotrebe za ovo značenje'),
  synonyms: z.array(z.string()).describe('Sinonimi za ovo značenje'),
  antonyms: z.array(z.string()).describe('Antonimi za ovo značenje'),
  part_of_speech: z.string().nullable(),
  pronunciation_ipa: z.string().nullable(),
});

export const ProposedFormSchema = z.object({
  category: z.string().describe('"padež" ili "glagolsko vrijeme"'),
  form: z
    .string()
    .describe('Za padeže "jednina"/"množina", za glagole lice, npr. "1. lice jednine"'),
  name: z.string().describe('Naziv padeža ili vremena malim slovima, npr. "genitiv", "futur i"'),
  value: z.string().describe('Sam oblik riječi'),
});

export const ProposedWordSchema = z.object({
  origins: z.array(z.string()),
  alternatives: z.array(z.string()),
  definitions: z.array(ProposedDefinitionSchema),
  forms: z.array(ProposedFormSchema),
});

export const WordProposalSchema = z.object({
  reply: z
    .string()
    .describe('Kratak odgovor uredniku na bosanskom: šta je promijenjeno i šta treba provjeriti'),
  word: ProposedWordSchema.nullable().describe(
    'Kompletno predloženo stanje riječi, ili null ako nema izmjena (npr. odgovor na pitanje)'
  ),
});

export type ProposedDefinition = z.infer<typeof ProposedDefinitionSchema>;
export type ProposedWord = z.infer<typeof ProposedWordSchema>;
export type WordProposal = z.infer<typeof WordProposalSchema>;

// The editor's current, possibly unsaved, form contents
export type WordDraft = {
  headword: string;
  origins: string[];
  alternatives: string[];
  definitions: Definition[];
  forms: WordForm[];
};

// What the assistant sees: the draft in the same shape it has to answer with, so unchanged parts
// can be copied back as they are. The headword is context only, and pronunciation audio is left out
// because the assistant can't produce it — the apply step keeps it.
export type WordContext = ProposedWord & { headword: string };

export const toWordContext = (draft: WordDraft): WordContext => ({
  headword: draft.headword,
  origins: draft.origins,
  alternatives: draft.alternatives,
  definitions: draft.definitions.map((d) => ({
    type: d.type,
    gender: d.gender,
    definition: d.definition,
    examples: d.examples ?? [],
    synonyms: d.synonyms ?? [],
    antonyms: d.antonyms ?? [],
    part_of_speech: d.part_of_speech,
    pronunciation_ipa: d.pronunciation_ipa,
  })),
  forms: draft.forms.map(({ category, form, name, value }) => ({ category, form, name, value })),
});
