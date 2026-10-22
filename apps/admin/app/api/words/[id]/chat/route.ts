import { createClient } from '@/utils/supabase/server';
import {
  lastUserTurn,
  WordAssistantError,
  type ChatTurn,
  type TokenUsage,
} from '@/utils/ai/assistant';
import { getWordAssistant } from '@/utils/ai/backend';
import { ProposedWordSchema, WordProposalSchema, type WordProposal } from '@/utils/ai/wordProposal';
import { jwtDecode } from 'jwt-decode';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { createReplyExtractor } from './replyExtractor';

const RATE_LIMIT_MESSAGES = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const MAX_TURNS = 20;
const MAX_INSTRUCTION_LENGTH = 2000;

// Editor turns carry the form contents at the time they were sent (see toWordContext), assistant
// turns the proposal they answered with. The last turn is the new editor message.
const ChatRequestSchema = z.object({
  // Created by the chat panel when it opens; all turns of one chat are saved under it
  conversationId: z.uuid(),
  conversation: z
    .array(
      z.discriminatedUnion('role', [
        z.object({
          role: z.literal('user'),
          instruction: z.string().trim().min(1).max(MAX_INSTRUCTION_LENGTH),
          word: ProposedWordSchema.extend({ headword: z.string() }),
        }),
        z.object({ role: z.literal('assistant'), proposal: WordProposalSchema }),
      ])
    )
    .min(1)
    .max(MAX_TURNS)
    .refine((turns) => turns.at(-1)?.role === 'user', 'The last turn must be an editor turn'),
});

export type ChatRequest = { conversationId: string; conversation: ChatTurn[] };

// The response body is newline-delimited JSON, one event per line. Reply events stream the reply
// text as it is written; the stream ends with either the validated proposal (whose reply is the
// complete one) or an error with a message for the editor.
export type ChatStreamEvent =
  | { type: 'reply'; text: string }
  | { type: 'proposal'; proposal: WordProposal }
  | { type: 'error'; code: WordAssistantError['code']; message: string };

type ErrorEvent = Extract<ChatStreamEvent, { type: 'error' }>;

const errorEvent = (error: unknown): ErrorEvent => {
  const assistantError =
    error instanceof WordAssistantError
      ? error
      : new WordAssistantError(
          'misconfigured',
          'Došlo je do greške u radu asistenta. Ako se ponavlja, obratite se administratoru.',
          500,
          { cause: error }
        );
  if (!(error instanceof WordAssistantError)) console.error('Word chat failed', error);
  return { type: 'error', code: assistantError.code, message: assistantError.message };
};

const NO_USAGE: TokenUsage = {
  input_tokens: 0,
  output_tokens: 0,
  cache_creation_input_tokens: 0,
  cache_read_input_tokens: 0,
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const session = await supabase.auth.getSession();

  if (session.error || !session.data.session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jwt = jwtDecode<{ user_permission?: string }>(session.data.session.access_token);
  if (jwt.user_permission !== 'Dictionary.ReadWrite') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const userId = session.data.session.user.id;

  const wordId = Number((await params).id);
  if (!Number.isInteger(wordId) || wordId <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const parseResult = ChatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parseResult.error.issues },
      { status: 400 }
    );
  }
  const { conversationId, conversation } = parseResult.data;

  const [word, recentRequests] = await Promise.all([
    supabase.from('words_v2').select('id').eq('id', wordId).maybeSingle(),
    supabase
      .from('ai_chat_requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()),
  ]);

  if (word.error || recentRequests.error) {
    return NextResponse.json(
      { error: (word.error ?? recentRequests.error)!.message },
      { status: 500 }
    );
  }
  if (!word.data) {
    return NextResponse.json({ error: 'Riječ nije pronađena.' }, { status: 404 });
  }
  if ((recentRequests.count ?? 0) >= RATE_LIMIT_MESSAGES) {
    return NextResponse.json(
      {
        error: `Poslali ste ${RATE_LIMIT_MESSAGES} poruka asistentu u posljednjih sat vremena. Pokušajte ponovo kasnije.`,
      },
      { status: 429 }
    );
  }

  const { error: insertError } = await supabase
    .from('ai_chat_requests')
    .insert({ user_id: userId, word_id: wordId });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const assistant = getWordAssistant();
  const { instruction, word: wordContext } = lastUserTurn(conversation);
  const requestedAt = new Date().toISOString();

  // Appends the editor's message and the outcome to the stored conversation. Failed turns are kept
  // too, with the tokens they were billed for.
  const saveTurn = async (
    outcome: { proposal: WordProposal } | { error: ErrorEvent },
    model: string | undefined,
    usage: TokenUsage | null | undefined
  ) => {
    const { error } = await supabase.rpc('append_ai_chat_turn', {
      conversation_id: conversationId,
      word_id: wordId,
      model: model ?? null,
      messages: [
        { role: 'user', instruction, word: wordContext, created_at: requestedAt },
        {
          role: 'assistant',
          model: model ?? null,
          proposal: 'proposal' in outcome ? outcome.proposal : null,
          error:
            'error' in outcome
              ? { code: outcome.error.code, message: outcome.error.message }
              : null,
          usage: usage ?? null,
          created_at: new Date().toISOString(),
        },
      ],
      ...(usage ?? NO_USAGE),
    });
    if (error) console.error('Saving the word chat turn failed', error);
  };
  const extractReply = createReplyExtractor();
  const encoder = new TextEncoder();
  // Stops the model when the editor closes the chat or the connection drops
  const abortController = new AbortController();
  request.signal.addEventListener('abort', () => abortController.abort(), { once: true });

  // Streaming from the first byte keeps the response within the hosting platform's time limit
  // for requests that take a while, and lets the editor read the reply as it is written
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      // A cancelled stream can't be written to anymore
      const send = (event: ChatStreamEvent) => {
        if (abortController.signal.aborted) return;
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      try {
        const { proposal, model, usage } = await assistant.propose(conversation, {
          signal: abortController.signal,
          onText: (delta) => {
            const text = extractReply(delta);
            if (text) send({ type: 'reply', text });
          },
        });
        send({ type: 'proposal', proposal });
        await saveTurn({ proposal }, model, usage);
      } catch (error) {
        const event = errorEvent(error);
        send(event);
        const assistantError = error instanceof WordAssistantError ? error : undefined;
        await saveTurn({ error: event }, assistantError?.model, assistantError?.usage);
      }
      if (!abortController.signal.aborted) controller.close();
    },
    cancel() {
      abortController.abort();
    },
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
