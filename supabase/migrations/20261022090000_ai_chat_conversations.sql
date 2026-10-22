-- AI assistant conversations from the admin word editor, kept for reviewing what the assistant
-- proposed and what it cost. One row per chat; each turn is appended to `messages` by the chat
-- route through append_ai_chat_turn.
--
-- `messages` holds, in order:
--   {"role": "user", "instruction": ..., "word": <form contents sent>, "created_at": ...}
--   {"role": "assistant", "model": ..., "proposal": ... | null, "error": {"code", "message"} | null,
--    "usage": {...} | null, "created_at": ...}
CREATE TABLE ai_chat_conversations (
  id UUID PRIMARY KEY,
  word_id INTEGER REFERENCES words_v2 (id) ON DELETE SET NULL,
  -- Kept when the editor's account is removed, so the history and costs stay complete
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  -- The model of the latest answered turn; null until a model has answered
  model TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cache_creation_input_tokens INTEGER NOT NULL DEFAULT 0,
  cache_read_input_tokens INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ai_chat_conversations_word_id_idx ON ai_chat_conversations (word_id);
CREATE INDEX ai_chat_conversations_user_id_created_at_idx ON ai_chat_conversations (user_id, created_at);

ALTER TABLE ai_chat_conversations ENABLE ROW LEVEL SECURITY;

create policy "Enable select for users with Dictionary.ReadWrite"
on "public"."ai_chat_conversations"
as PERMISSIVE
for SELECT
to authenticated
using ((auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite');

create policy "Enable insert of own rows for users with Dictionary.ReadWrite"
on "public"."ai_chat_conversations"
as PERMISSIVE
for INSERT
to authenticated
with check (
  user_id = auth.uid()
  and (auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite'
);

create policy "Enable update of own rows for users with Dictionary.ReadWrite"
on "public"."ai_chat_conversations"
as PERMISSIVE
for UPDATE
to authenticated
using (
  user_id = auth.uid()
  and (auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite'
)
with check (
  user_id = auth.uid()
  and (auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite'
);

-- Creates the conversation on its first turn and appends to it afterwards, in one statement so
-- concurrent turns can't overwrite each other. Runs with the caller's rights, so the policies above
-- decide who may write: appending to another editor's conversation fails.
create function public.append_ai_chat_turn(
  conversation_id UUID,
  word_id INTEGER,
  model TEXT,
  messages JSONB,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cache_creation_input_tokens INTEGER,
  cache_read_input_tokens INTEGER
)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.ai_chat_conversations as c (
    id, word_id, model, messages,
    input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens
  )
  values (
    conversation_id, word_id, model, messages,
    input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens
  )
  on conflict (id) do update set
    model = coalesce(excluded.model, c.model),
    messages = c.messages || excluded.messages,
    input_tokens = c.input_tokens + excluded.input_tokens,
    output_tokens = c.output_tokens + excluded.output_tokens,
    cache_creation_input_tokens = c.cache_creation_input_tokens + excluded.cache_creation_input_tokens,
    cache_read_input_tokens = c.cache_read_input_tokens + excluded.cache_read_input_tokens,
    updated_at = now();
$$;
