# rjecnik-admin

Admin dashboard for managing dictionary entries, deployed on Netlify.

See the [root README](../README.md) for prerequisites, initial setup, auth setup, and running Supabase locally. This file only covers what's specific to this app.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your local (`supabase start`) or hosted Supabase project.
- `NEXT_PUBLIC_SITE_URL` — base URL Google OAuth redirects back to after sign-in (`${NEXT_PUBLIC_SITE_URL}/auth/callback`). Defaults to `http://localhost:3000` for local dev; change it to your deployed/preview URL when testing auth on Netlify.

## How it talks to Supabase

The dashboard manages word entries via its own API routes and uses a Supabase edge function (`data-ingestion`) for batch imports. Access requires signing in via Google OAuth and having a `Dictionary.ReadWrite` row in `user_permissions` (see the root README for how to grant it).

## Routing

Bosnian-language URLs are served over English route names via Next.js rewrites: `/kontrolna-tabla` → `/dashboard`.
