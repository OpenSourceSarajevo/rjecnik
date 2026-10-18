# Rječnik

Rječnik is a Bosnian language dictionary application. This is a monorepo containing:

- [`apps/web`](./apps/web) — public-facing dictionary search site (Vercel)
- [`apps/admin`](./apps/admin) — admin dashboard for managing entries (Netlify)
- [`tools/etl`](./tools/etl) — one-time Python ETL pipeline (historical use, not actively developed)
- [`supabase`](./supabase) — migrations, edge functions, and local dev config shared by both apps

See [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) for contribution guidelines, and [`docs/architecture/decisions`](./docs/architecture/decisions) for the architecture decision records behind these choices.

### Prerequisites

- [Node 20+](https://nodejs.org/) (see each app's `.nvmrc`, or run `nvm use` from within `apps/web`/`apps/admin`)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
- [Docker](https://docs.docker.com/engine/install/)

## Getting Started

1. Navigate to `apps/web` and/or `apps/admin`:

```bash
cd apps/web
```

```bash
cd apps/admin
```

2. Install npm packages:

```bash
npm install
```

3. Configure the application:

```bash
cp .env.example .env
```

   - `apps/web` only: `NEXT_PUBLIC_GITHUB_REPOSITORY` is the full URL of the GitHub repo (e.g. `https://github.com/OpenSourceSarajevo/rjecnik`), used to build the "report an issue" link on each dictionary entry.
   - `apps/admin` only: `NEXT_PUBLIC_SITE_URL` is the base URL Google OAuth redirects back to after sign-in (`${NEXT_PUBLIC_SITE_URL}/auth/callback`). Defaults to `http://localhost:3000` for local dev — change it to your deployed/preview URL when testing auth on Netlify.

4. Run the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Make sure to configure a different port for one of the apps if running both.

### Setting up auth

1. Set up a Google Cloud Console app to get a client id and secret:

   - Go to the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials) and create an **OAuth 2.0 Client ID** (Web application type).
   - Add an **Authorized redirect URI**:
     - Local Supabase (via Docker): `http://localhost:54321/auth/v1/callback`
     - Hosted Supabase: `https://<your-project-ref>.supabase.co/auth/v1/callback` (find the exact value in your Supabase dashboard under Authentication → Providers → Google)
   - Copy the generated **Client ID** and **Client Secret** — you'll need them in the next step.

2. If you are using supabase via docker, follow the steps for setting the environment variables correctly, and if you are using a hosted instance of supabase follow the official supabase docs for setting up auth providers

3. Try signing in via google, this will add your email to the database but fail

4. Manually assign the `app_permission` `Dictionary.ReadWrite` to your user in the `user_permissions` table, then try signing in again:

   - **Via Supabase Studio** (local instance at [http://localhost:54323](http://localhost:54323)): open Table Editor → `user_permissions` → insert a new row with your `user_id` (find it in the `auth.users` table) and `permission` set to `Dictionary.ReadWrite`.
   - **Via SQL Editor** (Studio or hosted dashboard), replacing `<your_user_id>`:

     ```sql
     insert into user_permissions (user_id, permission)
     values ('<your_user_id>', 'Dictionary.ReadWrite');
     ```

## Running Supabase Locally

1. Start docker desktop

2. Export google cloud console secrets:

```
export AUTH_GOOGLE_CLIENT_ID=
export AUTH_GOOGLE_CLIENT_SECRET=
```

3. Start the supabase container:

```bash
supabase start
```

4. From the console output copy the values of `API URL` and `anon key` into your app's `.env`:

   - `apps/web`: `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   - `apps/admin`: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Stop the container

```bash
supabase stop
```

```bash
supabase stop --no-backup
```

### Creating migrations

1. To create a new migration for the supabase database run:

```bash
supabase migration new <migration_name>
```

2. Navigate to `supabase/migrations`, find your new migration file and write you SQL.

3. Apply the new migration by restarting the supabase container

## Troubleshooting

- **`supabase start` fails immediately / hangs with a connection error.** Make sure Docker Desktop is running first — the Supabase CLI needs it to pull and run the local Postgres/Auth/Studio containers.
- **`supabase start` takes several minutes the first time.** This is expected — it's pulling the Supabase Docker images. Subsequent starts are much faster since the images are cached.
- **Port `3000` already in use when running both apps.** Both `apps/web` and `apps/admin` default to port 3000. Run one of them on a different port: `npm run dev -- -p 3001`.
- **Signed in with Google but still can't access the admin dashboard.** You're missing the `Dictionary.ReadWrite` permission — see step 4 of [Setting up auth](#setting-up-auth) above.
