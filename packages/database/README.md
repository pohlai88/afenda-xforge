# `@repo/database`

Shared Drizzle/Postgres access for Xforge.

## Migration Governance

Use `pnpm --filter @repo/database db:migrate` as the canonical migration command.

Rules:

- do not use `db:push`
- capture schema changes as reviewed SQL migrations under `packages/database/drizzle`
- use `db:migrate:kit` only when you explicitly need the raw Drizzle CLI behavior during maintenance or debugging

## Environment Validation

Use `pnpm --filter @repo/database db:validate-env` to validate the configured `DATABASE_URL`.

The command:

- loads the repo root env file
- connects to the configured database
- prints host, port, database, schema, and server version metadata
- reports whether the connection looks like a Neon endpoint and whether it uses a pooler-friendly host

## Query timing

When feature packages add repository or service methods on top of Drizzle, wrap the actual database call with `timeDatabaseQuery(...)`.

Use it for:

- domain reads and writes
- background jobs that hit Postgres
- health or maintenance queries that should be timed explicitly

Keep the metadata stable and domain-oriented:

- `operation`: `select`, `insert`, `update`, `delete`, `upsert`, `healthcheck`
- `resource`: table or domain name such as `tenants`, `companies`, `memberships`
- `metadata`: optional request or tenant context when it adds debugging value

Example:

```ts
import { database, timeDatabaseQuery } from "@repo/database";

export const listTenants = async () =>
  timeDatabaseQuery(
    () => database.query.tenants.findMany(),
    {
      operation: "select",
      resource: "tenants",
    }
  );
```

Do not add placeholder repositories just to consume this helper. Wire it when the first real domain package lands.

## Seeding

Use `pnpm --filter @repo/database db:seed` to bootstrap the foundation rows that every local environment needs.

The foundation seed is idempotent and currently creates:

- tenant: `xforge`
- company: `MAIN`
- customer: `DEMO`

## Domain fixtures

Set `XFORGE_DEMO_USER_ID` before running the seed to create the local access rows needed for auth and permissions:

- tenant membership for the demo user on the `xforge` tenant
- company grant for the demo user on the `MAIN` company

The domain fixture uses a single `owner`-level row for each table so the local environment can exercise the app without inventing a fake auth provider.

Keep both layers small and deterministic. Add more fixtures only when a package needs them for local development or test setup.
