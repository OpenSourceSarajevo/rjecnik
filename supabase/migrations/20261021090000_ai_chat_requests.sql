-- One row per message an editor sends to the AI assistant, used for the per-user rate limit in
-- the admin chat route. Rows are only ever inserted by the editor themselves.
CREATE TABLE ai_chat_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE CASCADE,
  word_id INTEGER REFERENCES words_v2 (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ai_chat_requests_user_id_created_at_idx ON ai_chat_requests (user_id, created_at);

ALTER TABLE ai_chat_requests ENABLE ROW LEVEL SECURITY;

create policy "Enable insert of own rows for users with Dictionary.ReadWrite"
on "public"."ai_chat_requests"
as PERMISSIVE
for INSERT
to authenticated
with check (
  user_id = auth.uid()
  and (auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite'
);

create policy "Enable select of own rows"
on "public"."ai_chat_requests"
as PERMISSIVE
for SELECT
to authenticated
using (user_id = auth.uid());
