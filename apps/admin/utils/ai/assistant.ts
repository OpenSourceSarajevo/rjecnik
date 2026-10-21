import type { WordContext, WordProposal } from './wordProposal';

// One turn of a word chat. Editor turns carry the form contents at the time they were sent, so the
// assistant always sees the latest state; assistant turns carry the proposal it answered with.
export type ChatTurn =
  | { role: 'user'; instruction: string; word: WordContext }
  | { role: 'assistant'; proposal: WordProposal };

export type ProposeOptions = {
  // Receives the raw output as it is generated: partial JSON of the proposal
  onText?: (delta: string) => void;
  signal?: AbortSignal;
};

// The AI backend the chat route calls. Implementations resolve with a proposal validated against
// WordProposalSchema, or reject with a WordAssistantError.
export type WordAssistant = {
  propose(conversation: ChatTurn[], options?: ProposeOptions): Promise<WordProposal>;
};

export type WordAssistantErrorCode =
  | 'aborted'
  | 'refusal'
  | 'truncated'
  | 'invalid_output'
  | 'rate_limited'
  | 'unavailable'
  | 'connection'
  | 'misconfigured';

// Failure with a message that can be shown to the editor as it is, and the HTTP status the route
// should answer with
export class WordAssistantError extends Error {
  constructor(
    readonly code: WordAssistantErrorCode,
    message: string,
    readonly status: number,
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = 'WordAssistantError';
  }
}

export const lastUserTurn = (conversation: ChatTurn[]) => {
  const turn = conversation.at(-1);
  if (turn?.role !== 'user') {
    throw new Error('A conversation must end with an editor turn');
  }
  return turn;
};
