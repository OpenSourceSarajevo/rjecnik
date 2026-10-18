# 6. Monorepo-Layout

Date: 2026-10-18

## Status

Accepted

## Context

The repository started with every project at the root, each prefixed with `rjecnik-` (`rjecnik-web`, `rjecnik-admin`, `rjecnik-ui-config`, `rjecnik-etl`). The prefix repeats the repository name and adds no information, and the flat structure gives no hint about what is a deployable app, what is shared code, and what is a one-off or operational tool.

New projects are planned (a standalone API, shared packages), so the root would only get more crowded.

## Decision

We will group projects by their role and drop the `rjecnik-` prefix:

- `apps/` — deployable applications (`apps/web`, `apps/admin`)
- `packages/` — code and configuration shared between apps (`packages/ui-config`)
- `tools/` — one-off or historical tooling that is not actively developed (`tools/etl`)
- `supabase/` — stays at the root, where the Supabase CLI expects it

Packages are named under the `@rjecnik/` scope (e.g. `@rjecnik/web`, `@rjecnik/admin`).

## Consequences

- Hosting providers must point at the new folders: Vercel's Root Directory is `apps/web` and Netlify's Base directory is `apps/admin`
- CI path filters and the build matrix use the new paths (`apps/**`, `packages/**`)
- Commit scopes stay short (`web`, `admin`, `supabase`, `docs`)
- The layout is ready for package manager workspaces, which makes sharing code between apps straightforward

## Alternatives Considered

Keeping the flat layout and only dropping the prefix (`web/`, `admin/`, `etl/`). This was rejected because it does not separate apps from shared packages and one-off tools.
