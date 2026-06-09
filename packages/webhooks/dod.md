# Webhooks Package Definition Of Done

This Definition of Done applies to changes in `@repo/webhooks` and to consuming packages that rely on webhook transport, verification, and operational contracts.

## Scope

A webhook change is done only when it is safe for production transport and verification without weakening XForge tenant, permission, execution, or audit governance.

This DoD covers:

- package boundaries
- public contracts
- env handling
- outbound delivery contracts
- inbound verification contracts
- queue and dead-letter contracts
- observability contracts
- tests
- integration boundaries
- production readiness

This DoD does not require building every app-level route, worker, or admin UI before those packages exist, but it does require the package contracts to be safe and explicit.

## Architecture DoD

- The change keeps `@repo/webhooks` as a supporting infrastructure package, not a business feature package.
- The change is compatible with [`skills/reference/architecture.md`](C:/JackProject/afenda-bolt/afenda-Xforge/skills/reference/architecture.md), [`skills/reference/packages.md`](C:/JackProject/afenda-bolt/afenda-Xforge/skills/reference/packages.md), and [`architecture.md`](C:/JackProject/afenda-bolt/afenda-Xforge/packages/webhooks/architecture.md).
- `@repo/webhooks` does not own ERP business decisions, feature workflow authority, permission finality, audit persistence, or direct database mutation authority.
- `@repo/webhooks` does not import feature packages.
- Provider-specific business mappings remain in `packages/integrations/*`.
- App-level route handling remains in `apps/api`.
- Business mutations remain in approved feature `server.ts` entrypoints or `@repo/execution`.

## Public Surface DoD

- Public package exports are explicit in [package.json](C:/JackProject/afenda-bolt/afenda-Xforge/packages/webhooks/package.json).
- The root export remains stable unless a breaking change is explicitly approved.
- Compatibility shims may exist during migration, but they must be thin.
- Contract names describe transport and governance intent, not UI behavior.
- Package documentation includes [`README.md`](C:/JackProject/afenda-bolt/afenda-Xforge/packages/webhooks/README.md), [`architecture.md`](C:/JackProject/afenda-bolt/afenda-Xforge/packages/webhooks/architecture.md), this `dod.md`, and the implementation prompt when present.

## Runtime Boundary DoD

- Runtime files that access env, provider clients, or secrets are server-only.
- No client component may import `@repo/webhooks`.
- Queue consumers and provider clients are not exposed to client runtimes.
- Trusted server-side context is required before any business mutation outside this package.

## Environment DoD

- Provider credentials are loaded from validated server env helpers.
- Secrets are not accepted from request payloads, query params, or client headers.
- Optional providers fail closed when configuration is missing.
- Env contracts reject malformed secrets.
- Required env vars are documented at package level.

## Outbound Contract DoD

- Outbound delivery uses a typed envelope with `eventId`, `eventType`, `tenantId`, `operationId`, `requestId`, `occurredAt`, `schemaVersion`, `payload`, and `redactionPolicy`.
- Optional `organizationId`, `companyId`, and `workspaceId` fields are explicit.
- Event types, providers, and schemas are registered before publish.
- Payload validation happens before provider publish.
- Provider-specific transport details stay behind provider adapters such as Svix wrappers.
- Direct synchronous publishing is not treated as the final production path when queue-backed delivery is required.

## Inbound Contract DoD

- Inbound verification uses the raw request body.
- Signature comparison is constant-time.
- Replay-window validation exists when provider timestamps are available.
- Missing or malformed signatures fail closed.
- Idempotency keys are derived before side effects.
- Tenant context is resolved from trusted server-side inputs only.
- Payload-provided tenant, organization, company, or workspace ids are hints only until verified.

## Queue And Dead-Letter DoD

- Queue messages contain only provider-neutral envelope data and delivery metadata.
- Retry classification distinguishes retryable and terminal failures.
- Circuit-breaker contracts support `closed`, `open`, and `half-open`.
- Dead-letter records capture failure metadata needed for inspection and replay.
- Replay contracts are explicit and preserve idempotency behavior.
- Queue, replay, and DLQ contracts do not bypass execution, permissions, or audit obligations in consuming layers.

## Observability DoD

- Redaction helpers remove sensitive values from logs and operational payload views.
- Observability contracts distinguish operational logging from audit evidence.
- Metrics contracts cover delivery, replay, dead-letter, and queue behavior.
- Tracing contracts propagate request and operation correlation fields.
- Provider secrets, signing secrets, authorization headers, full signatures, raw bodies, and audit before/after data are never logged by this package.

## Integration Boundary DoD

- `apps/api` may use `@repo/webhooks/inbound` and `@repo/webhooks/outbound`, but route ownership stays in the app.
- `packages/integrations/*` may use pure verifier, envelope, or registry primitives for vendor-specific mappings.
- Feature packages may consume provider-neutral contracts only when that does not create cross-boundary workflow ownership.
- `@repo/webhooks` does not call feature internals directly.

## Test DoD

Every package change must include tests for the behavior it changes.

Minimum coverage:

- env validation accepts valid provider tokens and rejects malformed ones
- outbound envelope validation rejects missing tenant and operation fields
- registry rejects unknown event types and unsupported versions
- provider publish helpers receive the expected event type and payload
- queue contracts preserve event, operation, and tenant context
- retry policy classifies retryable and terminal failures
- circuit breaker opens, half-opens, and closes deterministically
- dead-letter records are created after retry exhaustion
- replay preserves idempotency behavior
- inbound signature verification accepts valid signatures
- inbound signature verification rejects invalid signatures
- replay-window validation rejects stale timestamps
- idempotency key derivation is deterministic
- redaction removes sensitive fields from logs

Run:

```txt
pnpm --filter @repo/webhooks lint
pnpm --filter @repo/webhooks typecheck
pnpm --filter @repo/webhooks test
```

If the package boundary changes materially, also run:

```txt
pnpm lint:architecture
```

## Documentation DoD

- [`architecture.md`](C:/JackProject/afenda-bolt/afenda-Xforge/packages/webhooks/architecture.md) is updated when the acceptance bar or boundary rules change.
- This `dod.md` is updated when completion criteria change.
- [`README.md`](C:/JackProject/afenda-bolt/afenda-Xforge/packages/webhooks/README.md) reflects the actual package role and public surface.
- The implementation prompt stays aligned with the package architecture and DoD when it is used to drive AI implementation.

## Release Readiness DoD

The package is production-ready only when:

- all public exports are explicit
- all runtime files that handle env, secrets, or provider transport are server-only
- outbound events use a typed, versioned envelope
- event types, providers, and schemas are registered
- queue-backed delivery exists for production paths
- circuit breakers protect outbound providers
- retry exhaustion moves messages to a dead-letter queue
- replay is explicit, permission-gated, and idempotent
- inbound signatures are verified using raw request bodies
- replay protection exists
- idempotency exists before side effects
- tenant context is resolved from trusted server state
- optional organization, company, and workspace context is validated against trusted server state before use
- business mutations go through approved feature server entrypoints or `@repo/execution`
- audit remains owned by `@repo/audit`
- provider secrets are validated and never logged
- tests cover registries, queue contracts, circuit breakers, DLQ, replay, verification, idempotency, redaction, and outbound publishing
- CI can run typecheck, lint, and tests for `@repo/webhooks`

## Current Package Status

Current status: infrastructure and consuming API integration largely complete; downstream business execution integration remains feature-specific.

Already present:

- explicit exports
- `src/` package boundary
- env loading and provider transport wrappers
- registry, queue, dead-letter, inbound, security, and observability contracts
- package-scoped lint, typecheck, and test coverage
- Redis-backed queue and dead-letter persistence contracts
- trusted webhook endpoint resolution from server-owned database state
- permission-gated replay and discard routes in `apps/api`
- provider-specific inbound mapping in `packages/integrations/*`
- scheduled queue dispatch entrypoint for `apps/api`
- supported inbound execution wiring into approved feature server entrypoints for master-data company and customer creation

Still needed before production-ready DoD pass:

- validated organization/workspace context against trusted server state when those scopes are introduced by a provider flow
- additional feature-owned execution wiring for any inbound event owners beyond the currently supported master-data handlers
- feature-owned audit semantics for downstream business mutations triggered by inbound webhooks beyond the current supported handlers
