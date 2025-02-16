# 2. Supabase

Date: 2024-??-??

## Status

Accepted

## Context

We needed a free or low-cost storage solution and a very simple backend for the application. Supabase uses PostgREST, which allows automatic API generation from PostgreSQL tables, making it easy to interact with the database without writing custom backend logic.

## Decision

We chose Supabase (PostgreSQL) as our database and backend solution because:

- PostgreSQL JSONB support allows us to store structured dictionary data efficiently.
- Supabase provides an API out of the box, reducing backend development overhead.
- Scalability: PostgreSQL is well-suited for structured, relational data with indexing.
- Free-tier availability makes it cost-effective in early development.

## Consequences

### Benefits

- Structured storage: JSONB format allows efficient retrieval of dictionary entries.
- Less backend maintenance: Supabase provides ready-to-use APIs.
- Extensibility: We can later add real-time features (e.g., user-contributed words).
- Familiar SQL support: PostgreSQL allows complex queries with strong indexing.

### Drawbacks

- Vendor lock-in: Supabase is a managed service, though based on PostgreSQL.
- Limited fine-tuning: Some features may be restricted compared to self-hosted PostgreSQL.
- While on a free tier supabase will shut down your instance if not in use.
