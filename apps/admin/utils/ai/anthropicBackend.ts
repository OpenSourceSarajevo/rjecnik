import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { WordAssistantError, type ChatTurn, type WordAssistant } from './assistant';
import { formatUserMessage, SYSTEM_PROMPT } from './prompt';
import { WordProposalSchema } from './wordProposal';

const MODEL = 'claude-opus-5-5';
// Full verb tables run to a few thousand tokens; streaming keeps a high limit free of timeouts
const MAX_TOKENS = 32000;

const outputFormat = betaZodOutputFormat(WordProposalSchema);

let client: Anthropic | undefined;
// Created on first use so the fixture backend never needs an API key
const getClient = () => (client ??= new Anthropic());

const toMessage = (turn: ChatTurn): Anthropic.Beta.BetaMessageParam =>
  turn.role === 'user'
    ? { role: 'user', content: formatUserMessage(turn.instruction, turn.word) }
    : { role: 'assistant', content: JSON.stringify(turn.proposal) };

const toAssistantError = (error: unknown): WordAssistantError => {
  if (error instanceof WordAssistantError) return error;

  // Order matters: the abort and timeout errors are subclasses of the connection error
  if (error instanceof Anthropic.APIUserAbortError) {
    return new WordAssistantError('aborted', 'Zahtjev je prekinut.', 499, { cause: error });
  }
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return new WordAssistantError(
      'unavailable',
      'Asistent nije odgovorio na vrijeme. Pokušajte ponovo.',
      504,
      { cause: error }
    );
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return new WordAssistantError(
      'connection',
      'Nije moguće uspostaviti vezu s asistentom. Pokušajte ponovo.',
      502,
      { cause: error }
    );
  }
  if (
    error instanceof Anthropic.AuthenticationError ||
    error instanceof Anthropic.PermissionDeniedError
  ) {
    return new WordAssistantError(
      'misconfigured',
      'Asistent nije ispravno podešen. Obratite se administratoru.',
      500,
      { cause: error }
    );
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new WordAssistantError(
      'rate_limited',
      'Asistent trenutno ima previše zahtjeva. Pokušajte ponovo za minutu.',
      429,
      { cause: error }
    );
  }
  if (error instanceof Anthropic.InternalServerError) {
    return new WordAssistantError(
      'unavailable',
      'Asistent je trenutno nedostupan. Pokušajte ponovo malo kasnije.',
      503,
      { cause: error }
    );
  }
  // Bad requests, billing problems and anything unexpected: nothing the editor can fix
  return new WordAssistantError(
    'misconfigured',
    'Došlo je do greške u radu asistenta. Ako se ponavlja, obratite se administratoru.',
    500,
    { cause: error }
  );
};

// Calls Claude with the fixed instructions as a cached system prompt and the conversation as
// messages. The proposal comes back as structured output and is validated with the Zod schema.
export const anthropicBackend: WordAssistant = {
  async propose(conversation, { onText, signal } = {}) {
    try {
      const stream = getClient().beta.messages.stream(
        {
          model: MODEL,
          max_tokens: MAX_TOKENS,
          // Retry a declined request on another model instead of failing it
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          // Two cache breakpoints: the instructions are shared by all words, and the automatic one
          // caches the conversation so far for the next turn of the same chat
          system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
          cache_control: { type: 'ephemeral' },
          messages: conversation.map(toMessage),
          // Sent without the parse function: the stop reason is checked before parsing, so a
          // refused or truncated answer gets its own message instead of a parse error
          output_config: {
            effort: 'medium',
            format: { type: outputFormat.type, schema: outputFormat.schema },
          },
        },
        { signal }
      );
      if (onText) stream.on('text', onText);

      const message = await stream.finalMessage();

      if (message.stop_reason === 'refusal') {
        console.warn('Word assistant refused', message.stop_details);
        throw new WordAssistantError(
          'refusal',
          'Asistent je odbio ovaj zahtjev. Pokušajte preformulisati uputu.',
          422
        );
      }
      if (message.stop_reason === 'max_tokens') {
        throw new WordAssistantError(
          'truncated',
          'Odgovor asistenta je bio predug i prekinut je. Pokušajte s užom uputom, npr. samo padeži ili samo glagolska vremena.',
          502
        );
      }

      const text = message.content
        .flatMap((block) => (block.type === 'text' ? [block.text] : []))
        .join('');
      try {
        return outputFormat.parse(text);
      } catch (error) {
        throw new WordAssistantError(
          'invalid_output',
          'Asistent je vratio neispravan odgovor. Pokušajte ponovo.',
          502,
          { cause: error }
        );
      }
    } catch (error) {
      const assistantError = toAssistantError(error);
      if (assistantError.code !== 'aborted') {
        console.error('Word assistant failed', assistantError.cause ?? assistantError);
      }
      throw assistantError;
    }
  },
};
