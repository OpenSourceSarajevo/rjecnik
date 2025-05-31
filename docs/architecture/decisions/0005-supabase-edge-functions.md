# 5. Supabase-Edge-Functions

Date: 2025-05-31

## Status

Accepted

## Context

To support dynamic ingestion of new text files (e.g., from books, articles, or other corpora), a secure, scalable mechanism is required to:

- Accept text uploads via an API endpoint
- Parse and extract candidate words
- Analyze and deduplicate them
- Update the existing dictionary dataset accordingly

## Decision

We will implement the ingestion endpoint using Supabase Edge Functions.

Rationale

### Integrated with Supabase Ecosystem

- Seamless integration with the Supabase database (PostgreSQL) and storage
- No need to manage separate backend infrastructure
- Simplified access to Supabase client libraries and authentication

### Low Latency & Scalable

- Edge Functions are deployed to V8 isolates close to the user, providing low-latency responses
- Automatically scaled by Supabase—no server provisioning required

### Secure & Role-Aware

- Auth-aware environment: access to user sessions and JWT tokens
- Can enforce row-level security (RLS) rules and call supabase.auth.getUser() directly

### Ideal for Compute-Light Tasks

- Text parsing, word tokenization, and basic frequency counts are lightweight operations
- Edge Functions are suitable for short-lived CPU-bound tasks (e.g., processing a 10–100 KB text file)

### Cost-Effective

- No additional cost beyond Supabase’s free tier (depending on usage)
- Avoids the need to host a separate backend (e.g., Node.js or Python API server)

## Consequences

- Heavy or long-running processing (e.g., parsing very large corpora or ML analysis) may hit time/memory limits
- To mitigate, large-scale processing may need to be offloaded to a background job system or external function (e.g., Supabase Scheduled Functions or a managed Cloud Function)
- Edge Functions require careful logging and error handling as debugging can be less straightforward than local APIs

## Alternatives Considered

If in the future we need more control or have a heavier load on the system then a self-hosted api can be written, or a tool like databricks can be taken into consideration.
