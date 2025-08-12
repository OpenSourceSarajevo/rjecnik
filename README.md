# Rječnik

### Prerequisites

- [Node 18](https://nodejs.org/download/release/v18.18.2/)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
- [Docker](https://docs.docker.com/engine/install/)

## Getting Started

1. Navigate to `rjecnik-web` and/or `rjecnik-admin`:

```bash
cd rjecnik-web
```

```bash
cd rjecnik-admin
```

2. Install npm packages:

```bash
npm install
```

3. Configure the application:

```bash
cp .env.example .env
```

4. Run the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Make sure to configure a different port for one of the apps if running both.

### Setting up auth

1. Set up a Google Cloud Console app to get a client id and secret.

2. If you are using supabase via docker, follow the steps for setting the environment variables correctly, and if you are using a hosted instance of supabase follow the official supabase docs for setting up auth providers

2.1. Depending which method of running supabase you choose don't forget to add a correct Authorized redirect URI in your Google Console

3. Try signing in via google, this will add your email to the database but fail

4. In the table `user_permissions` manually assign the `app_permission` `Dictionary.ReadWrite` to your user and try signing in again

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

4. From the console output copy the values of `API URL` and `anon key` for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

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
