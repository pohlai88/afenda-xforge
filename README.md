# XForge

XForge is a governance-first ERP monorepo for building tenant-scoped business systems with explicit company grants, canonical execution, and auditable mutations.

## What It Is

- `pnpm` workspace
- Turborepo monorepo
- Next.js App Router foundation
- PostgreSQL 16 with Drizzle ORM
- managed auth and infrastructure at package boundaries
- master-data as the first-class feature family

## Docs

- [Framework adoption](./skills/reference/framework.md)
- [Architecture](./skills/reference/architecture.md)
- [Packages](./skills/reference/packages.md)
- [Package Architecture And Feature Requirement Coverage](./docs/runtime/17-package-architecture-and-feature-requirement-coverage.md)
- [Customization](./skills/reference/customization.md)
- [Setup](./skills/reference/setup.md)

## Baseline Rules

- tenant isolation is mandatory
- company grants are explicit
- writes go through the canonical execution pipeline
- sensitive reads go through the canonical query pipeline
- feature packages do not cross-import each other
- `packages/shared` stays narrow and boring

## Local Setup

See [`skills/reference/setup.md`](./skills/reference/setup.md) for the bootstrap and environment contract.

### Webhook Local Flow

For the webhook path owned by `packages/webhooks` and `apps/api`:

1. Run `pnpm webhooks:local:bootstrap`
2. Run `pnpm webhooks:local:api`
3. Bootstrap seeds the foundation rows plus default local webhook endpoints for `master-data.companies.create` and `master-data.customers.create`
4. Run `pnpm webhooks:local:smoke`

### CI-Safe Integration Check

Use `pnpm webhooks:integration` in CI or preview automation.

- it runs the same smoke verification path
- it only executes when `XFORGE_ENABLE_WEBHOOK_INTEGRATION_TESTS=true`
- otherwise it exits successfully and prints a skip message

The bootstrap path:

- starts Redis through [`docker-compose.webhooks.yml`](./docker-compose.webhooks.yml)
- loads root `.env.local` or `.env` with quoted values normalized
- runs the canonical `pnpm --filter @repo/database db:migrate` path
- validates the configured database environment
- seeds the foundation records and default local webhook endpoints unless `XFORGE_WEBHOOK_ENDPOINTS_JSON` is already set

The API wrapper injects:

- `DATABASE_URL` from the repo root env file
- `CRON_SECRET` from the repo root env file
- `REDIS_URL`, defaulting to `redis://127.0.0.1:6379`

### Database Rule

Use `pnpm --filter @repo/database db:migrate`.

- `db:push` is intentionally blocked
- schema changes must land as reviewed migrations

## Generators

- `pnpm gen` for a generic workspace package
- `pnpm gen:app` for a Next.js app scaffold
- `pnpm gen:feature` for a master-data feature scaffold
