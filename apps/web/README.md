# web

Public-facing dictionary search site, deployed on Vercel.

See the [root README](../README.md) for prerequisites, initial setup, and running Supabase locally. This file only covers what's specific to this app.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — from your local (`supabase start`) or hosted Supabase project. Note: unlike `admin`, these are **not** prefixed with `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_GITHUB_REPOSITORY` — full URL of the GitHub repo (e.g. `https://github.com/OpenSourceSarajevo/rjecnik`), used to build the "report an issue" link on each dictionary entry.

## How it talks to Supabase

The site calls its own Next.js API route (`/api/dictionary`), which invokes the Supabase RPC function `search_words_ranked`. There is no direct client-side database access.

## Routing

Bosnian-language URLs are served over English route names via Next.js rewrites: `/rjecnik` → `/dictionary`.
