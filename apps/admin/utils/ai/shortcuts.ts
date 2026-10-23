import type { WordContext, WordProposal } from './wordProposal';

export type Shortcut = {
  instruction: string;
  // Limits the proposal to forms of this category; everything else stays as the editor has it
  formCategory?: string;
};

// The instructions offered as buttons in the chat panel
export const SHORTCUTS: Shortcut[] = [
  { instruction: 'Popuni prazna polja' },
  { instruction: 'Popuni padeže', formCategory: 'padež' },
  { instruction: 'Popuni glagolska vremena', formCategory: 'glagolsko vrijeme' },
];

const normalize = (text: string) => text.trim().toLocaleLowerCase('bs');

// Typed instructions that match a shortcut get the same limits as the button
export const findShortcut = (instruction: string) =>
  SHORTCUTS.find((s) => normalize(s.instruction) === normalize(instruction));

// Keeps only the part of the proposal the shortcut is about, so an assistant that also rewrites
// definitions while filling cases can't slip those changes into the proposal
export const limitToShortcut = (
  proposal: WordProposal,
  current: WordContext,
  shortcut: Shortcut | undefined
): WordProposal => {
  const category = shortcut?.formCategory;
  if (!category || !proposal.word) return proposal;
  return {
    ...proposal,
    word: {
      origins: current.origins,
      alternatives: current.alternatives,
      definitions: current.definitions,
      forms: [
        ...current.forms.filter((f) => f.category !== category),
        ...proposal.word.forms.filter((f) => f.category === category),
      ],
    },
  };
};
