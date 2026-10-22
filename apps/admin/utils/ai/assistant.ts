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

// Billed tokens of one request, in the Anthropic API's terms
export type TokenUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
};

export type WordAssistantResult = {
  proposal: WordProposal;
  // The model that answered, which can differ from the requested one after a fallback
  model: string;
  // null when nothing was billed, as with the fixture backend
  usage: TokenUsage | null;
};

// The AI backend the chat route calls. Implementations resolve with a proposal validated against
// WordProposalSchema, or reject with a WordAssistantError.
export type WordAssistant = {
  propose(conversation: ChatTurn[], options?: ProposeOptions): Promise<WordAssistantResult>;
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
// should answer with. Failures after a completed response, such as a refusal or a truncated
// answer, still carry the model and the billed tokens.
export class WordAssistantError extends Error {
  readonly model?: string;
  readonly usage?: TokenUsage;

  constructor(
    readonly code: WordAssistantErrorCode,
    message: string,
    readonly status: number,
    options?: { cause?: unknown; model?: string; usage?: TokenUsage }
  ) {
    super(message, options);
    this.name = 'WordAssistantError';
    this.model = options?.model;
    this.usage = options?.usage;
  }
}

export const lastUserTurn = (conversation: ChatTurn[]) => {
  const turn = conversation.at(-1);
  if (turn?.role !== 'user') {
    throw new Error('A conversation must end with an editor turn');
  }
  return turn;
};
