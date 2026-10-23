import type { WordContext, WordProposal } from '../wordProposal';
import kucaFillEmpty from './01-kuca-fill-empty.json';
import abaSplitDefinition from './02-aba-split-definition.json';
import iciVerbTenses from './03-ici-verb-tenses.json';
import lijepAdjective from './04-lijep-adjective.json';
import avlijaOrigin from './05-avlija-origin.json';
import kucaInflectedForm from './06-kuca-inflected-form.json';
import kucaCases from './07-kuca-cases.json';

// Sample conversations used to judge the prompt's quality and as responses for the fixture backend.
// Each one is a single editor turn: the instruction, the word as the assistant sees it, and the
// expected proposal.
export type WordProposalFixture = {
  name: string;
  description: string;
  instruction: string;
  word: WordContext;
  proposal: WordProposal;
};

export const WORD_PROPOSAL_FIXTURES: WordProposalFixture[] = [
  kucaFillEmpty,
  abaSplitDefinition,
  iciVerbTenses,
  lijepAdjective,
  avlijaOrigin,
  kucaInflectedForm,
  kucaCases,
];
