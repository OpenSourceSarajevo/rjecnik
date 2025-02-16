# 3. Next.js

Date: 2024-??-??

## Status

Accepted

## Context

We needed a SEO-friendly, and scalable frontend framework for the application. The framework should:

- Provide server-side rendering (SSR) and static site generation (SSG) for better SEO.
- Be easy to maintain and integrate with our backend (Supabase).
- Handle dynamic routing efficiently for word details pages.

## Decision

We chose Next.js as our frontend framework because:

- SEO Optimization: Supports SSR & SSG, making content indexable by search engines.
- Performance: Automatic static optimization reduces load times for dictionary pages.
- Built-in API routes: Simplifies backend communication when needed.
- Dynamic Routing: Handles headwords dynamically (/word/[headword]).
- Easy integration with Supabase: Allows fetching data using server components or API routes.

## Consequences

### Benefits

- Fast page loads: Pre-rendering improves performance.
- Better SEO: Server-side rendering ensures search engines can index dictionary words.
- Scalability: Supports both static and dynamic content efficiently.
- Developer-friendly: Familiar React-based development with powerful features.

### Drawbacks

- Potentially overkill for the simplicity and size of this application.
