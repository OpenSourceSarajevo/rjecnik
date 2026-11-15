# web

Public-facing dictionary search site, deployed on Vercel.

See the [root README](../README.md) for prerequisites, initial setup, and running Supabase locally. This file only covers what's specific to this app.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `NEXT_PUBLIC_API_URL` — base URL of the Rječnik API ([`apps/api`](../api)), e.g. `http://localhost:8000`. The API must list this site's origin in its `CORS_ORIGINS`, since search calls it from the browser.
- `NEXT_PUBLIC_GITHUB_REPOSITORY` — full URL of the GitHub repo (e.g. `https://github.com/OpenSourceSarajevo/rjecnik`), used to build the "report an issue" link on each dictionary entry.

## How it gets its data

All data comes from the public endpoints of the Rječnik API (`utils/api.ts`); the site never talks to Supabase directly:

- search (browser) — `GET /api/words/search`
- word page (server, revalidated hourly) — `GET /api/words/headword/{headword}`
- sitemap (server, revalidated daily) — `GET /api/words/headwords`

## Routing

Bosnian-language URLs are served over English route names via Next.js rewrites: `/rjecnik` → `/dictionary`.
