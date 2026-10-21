import { anthropicBackend } from './anthropicBackend';
import type { WordAssistant } from './assistant';
import { fixtureBackend } from './fixtureBackend';

const BACKENDS = {
  fixture: fixtureBackend,
  anthropic: anthropicBackend,
} satisfies Record<string, WordAssistant>;

export type WordAssistantBackend = keyof typeof BACKENDS;

// Chosen by AI_BACKEND; defaults to the fixture backend so local development needs no API key
export const getWordAssistant = (): WordAssistant => {
  const name = process.env.AI_BACKEND || 'fixture';
  if (!(name in BACKENDS)) {
    throw new Error(
      `Unknown AI_BACKEND "${name}", expected one of: ${Object.keys(BACKENDS).join(', ')}`
    );
  }
  return BACKENDS[name as WordAssistantBackend];
};
