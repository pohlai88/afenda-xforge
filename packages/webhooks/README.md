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
- provider-specific inbound payload mapping lives in `packages/integrations/*`
- scheduled queue dispatch is owned by `apps/api`
- `CRON_SECRET` must be configured in the API deployment environment for Vercel cron authentication
- `XFORGE_WEBHOOK_ENDPOINTS_JSON` may be used during database seeding to upsert trusted endpoint records
- tenant operators may manage endpoint records through the permission-gated `apps/api` webhook endpoint routes
