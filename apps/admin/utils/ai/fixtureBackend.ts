import { lastUserTurn, WordAssistantError, type WordAssistant } from './assistant';
import { WORD_PROPOSAL_FIXTURES } from './fixtures';
import { WordProposalSchema, type WordProposal } from './wordProposal';

const CHUNK_SIZE = 40;
const CHUNK_DELAY_MS = 15;

const normalize = (text: string) => text.trim().toLocaleLowerCase('bs');

// Prefer the fixture for the same word and instruction, then any fixture for the same word. Never
// answer with another word's fixture: its proposal would replace the editor's word.
const findProposal = (headword: string, instruction: string): WordProposal => {
  const sameWord = WORD_PROPOSAL_FIXTURES.filter(
    (f) => normalize(f.word.headword) === normalize(headword)
  );
  const fixture =
    sameWord.find((f) => normalize(f.instruction) === normalize(instruction)) ?? sameWord[0];

  if (!fixture) {
    const available = WORD_PROPOSAL_FIXTURES.map((f) => `„${f.word.headword}”`);
    return {
      reply: `Za riječ „${headword}” nema pripremljenog odgovora. Pripremljeni odgovori postoje za: ${[...new Set(available)].join(', ')}.`,
      word: null,
    };
  }
  return WordProposalSchema.parse(fixture.proposal);
};

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timeout);
      reject(new WordAssistantError('aborted', 'Zahtjev je prekinut.', 499));
    };
    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, ms);
    if (signal?.aborted) abort();
    else signal?.addEventListener('abort', abort, { once: true });
  });

// Answers with the prepared proposals in ./fixtures, without a network call. Output is streamed in
// small chunks so the chat behaves like it does with a real model.
export const fixtureBackend: WordAssistant = {
  async propose(conversation, { onText, signal } = {}) {
    const { instruction, word } = lastUserTurn(conversation);
    const proposal = findProposal(word.headword, instruction);

    const text = JSON.stringify(proposal);
    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      await wait(CHUNK_DELAY_MS, signal);
      onText?.(text.slice(i, i + CHUNK_SIZE));
    }
    return proposal;
  },
};
