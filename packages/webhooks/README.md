# @repo/webhooks

Supporting infrastructure package for outbound and inbound webhook contracts.

This package owns:

- webhook env loading
- outbound provider-neutral envelope helpers
- provider registry and schema registry contracts
- queue, retry, circuit-breaker, dead-letter, and replay contracts
- inbound verification, replay-window, idempotency, and tenant-resolution contracts
- security redaction and signature helpers
- Redis-backed queue and dead-letter primitives
- provider-neutral inbound mapping contracts consumed by `packages/integrations/*`

This package does not own ERP business workflow decisions or database mutation authority.

Consuming runtime expectations:

- trusted inbound endpoint configuration is stored in server-owned database state
- the tenant-facing operational ownership for webhook endpoint management belongs under `@repo/features-system-admin-control-plane`
- provider-specific inbound payload mapping lives in `packages/integrations/*`
- scheduled queue dispatch is owned by `apps/api`
- `CRON_SECRET` must be configured in the API deployment environment for Vercel cron authentication
- `XFORGE_WEBHOOK_ENDPOINTS_JSON` may be used during database seeding to upsert trusted endpoint records
- tenant operators may manage endpoint records through the permission-gated `apps/api` webhook endpoint routes

## Local Development

Use the repo-level local helpers:

- `pnpm webhooks:local:doctor`
- `pnpm webhooks:local:bootstrap`
- `pnpm webhooks:local:api`
- `pnpm webhooks:local:smoke`
- `pnpm webhooks:integration`

These wrappers exist because the webhook flow depends on:

- root-owned `DATABASE_URL` and `CRON_SECRET`
- Redis for queue and dispatch state
- database migrations required before audit-backed feature execution can commit
- trusted endpoint rows that must exist before signed inbound requests can resolve a tenant

The smoke command exercises:

- cron-authenticated dispatch health
- signed inbound webhook ingestion for the current company and customer event owners
- queued dispatch execution
- persisted database verification for the created company and customer records

The integration command is CI-safe by default:

- it only runs when `XFORGE_ENABLE_WEBHOOK_INTEGRATION_TESTS=true`
- otherwise it exits without failing the pipeline
