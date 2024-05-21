# Rječnik

### Prerequisites

- [Node 18](https://nodejs.org/download/release/v18.18.2/)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
- [Docker](https://docs.docker.com/engine/install/)

## Getting Started

1. Navigate to `rjecnik-web`:

```bash
cd rjecnik-web
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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Running Supabase Locally

1. Start docker desktop

2. Start the supabase container:

```bash
supabase start
```

3. From the console output copy the values of `API URL` and `anon key` for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Stop the container

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
