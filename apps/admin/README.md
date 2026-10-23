# admin

Admin dashboard for managing dictionary entries, deployed on Netlify.

See the [root README](../README.md) for prerequisites, initial setup, auth setup, and running Supabase locally. This file only covers what's specific to this app.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your local (`supabase start`) or hosted Supabase project.
- `NEXT_PUBLIC_SITE_URL` — base URL Google OAuth redirects back to after sign-in (`${NEXT_PUBLIC_SITE_URL}/auth/callback`). Defaults to `http://localhost:3000` for local dev; change it to your deployed/preview URL when testing auth on Netlify.
- `AI_BACKEND` — which backend the [AI assistant](#ai-assistant) uses: `fixture` (default) or `anthropic`.
- `ANTHROPIC_API_KEY` — only needed when `AI_BACKEND=anthropic`. Server-only: never prefix it with `NEXT_PUBLIC_`.

## How it talks to Supabase

The dashboard manages word entries via its own API routes and uses a Supabase edge function (`data-ingestion`) for batch imports. Access requires signing in via Google OAuth and having a `Dictionary.ReadWrite` row in `user_permissions` (see the root README for how to grant it).

## Routing

Bosnian-language URLs are served over English route names via Next.js rewrites: `/kontrolna-tabla` → `/dashboard`.

## AI assistant

The word editor (`/dictionary/[id]`) has an _Asistent_ panel where editors ask Claude to fill or improve a word. The assistant only proposes changes; the editor reviews them, applies the ones they want to the form and saves as usual. Nothing the assistant returns is written to the database directly.

The pieces, in the order a message passes through them:

- `app/(dashboard)/dictionary/[id]/components/` — the chat panel and the change summary
- `app/api/words/[id]/chat/route.ts` — the chat route: permission check, rate limit, streaming, saving each turn
- `utils/ai/` — the backends, the prompt (`prompt.ts`), the proposal schema (`wordProposal.ts`) and the sample conversations (`fixtures/`)

### Backends

`AI_BACKEND` selects the backend. An unknown value makes the chat route fail.

| Value               | What it does                                                                                                       | Needs                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `fixture` (default) | Answers with the prepared responses in `utils/ai/fixtures/`, streamed like a real reply. No network call, no cost. | Nothing                                     |
| `anthropic`         | Calls Claude (`claude-opus-5-5`) through `@anthropic-ai/sdk`, with structured output and prompt caching.           | `ANTHROPIC_API_KEY`, credits on the account |

The fixture backend answers by headword: it has responses for `kuća`, `aba`, `ići`, `lijep`, `avlija` and `kuca`, and for any other word replies that it has no prepared response. Create one of those words locally to try the whole flow without an API key. To add a scenario, add a JSON file to `utils/ai/fixtures/` and list it in `fixtures/index.ts`.

To try the real model locally, set `AI_BACKEND=anthropic` and your own `ANTHROPIC_API_KEY` in `.env` and restart `npm run dev`. Every message costs money (see [Costs and limits](#costs-and-limits)).

> **Don't set `AI_BACKEND=fixture` in production.** Editors would get the sample responses as if they came from the assistant. There is no switch yet that turns the assistant off.

### Production setup

One-time setup for the Netlify deployment.

1. **Anthropic account.** In the [Anthropic Console](https://console.anthropic.com), use the project's organization (or create one):
   - Buy prepaid credits under _Settings → Billing_, and leave automatic reload off so spending can't exceed what was bought.
   - Set a monthly spend limit under _Settings → Limits_. Once it's reached, or the credits run out, requests fail and editors see an error in the chat asking them to contact an administrator.
   - Create an API key used only by this app, named e.g. `rjecnik-admin-netlify`.
2. **Netlify.** In the site's _Site configuration → Environment variables_, add:
   - `AI_BACKEND` = `anthropic`
   - `ANTHROPIC_API_KEY` = the key from step 1. Mark it as containing a secret value. It is only read at runtime by the chat route, so the _Functions_ scope is enough.

   Then trigger a new deploy; environment variable changes don't apply to the running deploy.

3. **Database.** Apply the assistant's migrations (`ai_chat_requests` and `ai_chat_conversations`) to the hosted project:

   ```bash
   supabase link --project-ref <project-ref>
   supabase db push
   ```

4. **Check.** Open a word in the deployed admin, open _Asistent_ and send _Popuni prazna polja_. The reply should stream in with a list of proposed changes, and a row with non-zero token counts should appear in `ai_chat_conversations`.

To rotate the key, create a new one in the Console, replace `ANTHROPIC_API_KEY` on Netlify, redeploy, then delete the old key.

### Costs and limits

- **Cost per message** depends mostly on how much the assistant writes. As a rough guide, a message costs a few cents, and filling a full verb table (42 forms) sits at the upper end. The fixed instructions are prompt-cached, so follow-up messages in the same chat cost less.
- **Rate limit:** each editor can send 30 messages per hour (`RATE_LIMIT_MESSAGES` in the chat route). Requests are counted in `ai_chat_requests`.
- **Model settings** — model, effort and maximum output length — are constants at the top of `utils/ai/anthropicBackend.ts`.
- **Request time:** the route streams its response from the start, so a long answer doesn't hit a timeout while the editor waits. Netlify's documented limit for streamed functions varies between pages of its docs, so if long answers (such as full verb tables) get cut off in production, that limit is the first thing to check.

Every turn is stored in `ai_chat_conversations` with the model and the billed tokens, including failed turns that were still billed. Editors with `Dictionary.ReadWrite` can read all conversations. To see usage per editor and month, run this in the Supabase SQL editor:

```sql
select
  date_trunc('month', c.created_at) as month,
  u.email,
  count(*) as conversations,
  sum(jsonb_array_length(c.messages) / 2) as messages,
  sum(c.input_tokens) as input_tokens,
  sum(c.output_tokens) as output_tokens,
  sum(c.cache_creation_input_tokens) as cache_write_tokens,
  sum(c.cache_read_input_tokens) as cache_read_tokens
from ai_chat_conversations c
left join auth.users u on u.id = c.user_id
group by 1, 2
order by 1 desc, 2;
```

Multiply the token totals by the model's current [per-token prices](https://www.anthropic.com/pricing#api) to get the cost. The Console's usage page shows the same spending from Anthropic's side.
