# Webhooks Architecture Implementation Prompt

Use this prompt when asking an AI IDE or coding agent to implement `packages/webhooks` according to the local architecture document.

## Prompt

You are implementing the XForge `@repo/webhooks` package in `packages/webhooks`.

Before writing code, read these files in order:

```txt
AGENTS.md
skills/reference/architecture.md
skills/reference/packages.md
packages/webhooks/architecture-and-feature-requirement.md
packages/webhooks/package.json
packages/webhooks/index.ts
packages/webhooks/keys.ts
packages/webhooks/lib/svix.ts
```

Treat `packages/webhooks/architecture-and-feature-requirement.md` as the package-level source of truth. If existing code conflicts with the architecture document, update the code to match the document. Do not weaken tenant, permission, audit, execution, or package-boundary rules to make implementation easier.

## Objective

Promote `packages/webhooks` from a flat Svix helper into an enterprise-ready supporting infrastructure package with:

- explicit public entry points
- server-only runtime boundaries
- provider-neutral outbound event envelopes
- event, provider, and schema registries
- queue/outbox contracts
- retry classification
- circuit-breaker contracts
- dead-letter and replay contracts
- inbound signature verification contracts
- replay-window validation
- idempotency key derivation
- tenant-resolution contracts
- redaction, metrics, and tracing contracts
- focused tests for the above

Do not implement ERP business workflow decisions inside `@repo/webhooks`.

## Non-Negotiable Boundaries

`@repo/webhooks` may:

- validate and format webhook event envelopes
- verify inbound webhook signatures
- derive idempotency keys
- define queue, retry, circuit-breaker, dead-letter, replay, registry, observability, and security contracts
- wrap Svix behind a provider-neutral outbound publisher
- expose server-only helpers to `apps/api`, workers, and approved server code

`@repo/webhooks` must not:

- import feature packages
- mutate ERP database records
- own tenant membership finality
- own company grant finality
- own permission finality
- write audit events directly as business evidence
- trust tenant, company, organization, or workspace ids from unverified payloads
- expose queue consumers or provider clients to client components
- log provider secrets, signing secrets, authorization headers, full signatures, raw request bodies, PII payloads, or audit before/after snapshots

Business mutations must go through approved feature `server.ts` entrypoints or `@repo/execution`. Audit remains owned by `@repo/audit`.

## Implementation Strategy

Implement in slices. Complete and verify one slice before starting the next. Keep existing root exports working during migration unless all call sites are updated.

### Slice 1: Package Boundary

Tasks:

- create `packages/webhooks/src`
- move the current package implementation into `src`
- create `src/index.ts`, `src/keys.ts`, `src/outbound/svix.ts`
- keep compatibility exports from the package root or update `package.json` exports safely
- add `src/contract.ts`
- add `README.md`
- keep all runtime code server-only

Expected package shape:

```txt
packages/webhooks/
├── architecture-and-feature-requirement.md
├── implementation.prompt.md
├── README.md
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── contract.ts
    ├── keys.ts
    └── outbound/
        └── svix.ts
```

Verify:

```txt
pnpm --filter @repo/webhooks typecheck
pnpm --filter @repo/webhooks lint
```

### Slice 2: Outbound Contract And Registries

Tasks:

- add `src/registry/event-registry.ts`
- add `src/registry/provider-registry.ts`
- add `src/registry/schema-registry.ts`
- add `src/registry/index.ts`
- define event names as dot-separated, versioned names, for example `customer.created.v1`
- define provider-neutral outbound envelope types
- require `eventId`, `eventType`, `tenantId`, `operationId`, `requestId`, `occurredAt`, `schemaVersion`, `payload`, and `redactionPolicy`
- allow optional `organizationId`, `companyId`, and `workspaceId` only as explicit context fields
- validate outbound events against the registry before publishing
- wrap Svix through `src/outbound/publisher.ts`

Rules:

- event schemas are immutable after release
- breaking changes require a new event version
- provider-specific business mapping remains in `packages/integrations/*`

Verify:

```txt
pnpm --filter @repo/webhooks typecheck
pnpm --filter @repo/webhooks lint
pnpm --filter @repo/webhooks test
```

### Slice 3: Queue, Retry, Circuit Breaker, DLQ, Replay

Tasks:

- add `src/queue/contract.ts`
- add `src/queue/publisher.ts`
- add `src/queue/consumer.ts`
- add `src/queue/index.ts`
- add `src/outbound/retry-policy.ts`
- add `src/outbound/circuit-breaker.ts`
- add `src/dead-letter/contract.ts`
- add `src/dead-letter/queue.ts`
- add `src/dead-letter/replay.ts`
- add `src/dead-letter/inspector.ts`
- add `src/dead-letter/index.ts`

Required behavior:

- queue messages contain provider-neutral envelope data and delivery metadata only
- queue consumers are server-only
- retry failures are classified as retryable or terminal
- circuit states are `closed`, `open`, and `half-open`
- dead-letter records are created after retry exhaustion
- replay preserves original `eventId` and `operationId` unless a new event is intentionally generated
- replay re-checks idempotency and circuit state

Do not add real managed queue infrastructure unless the repo already has a clear queue provider. Define contracts first.

Verify:

```txt
pnpm --filter @repo/webhooks typecheck
pnpm --filter @repo/webhooks lint
pnpm --filter @repo/webhooks test
```

### Slice 4: Inbound Verification, Replay Window, Idempotency, Tenant Resolution

Tasks:

- add `src/inbound/envelope.ts`
- add `src/inbound/verifier.ts`
- add `src/inbound/replay-window.ts`
- add `src/inbound/idempotency.ts`
- add `src/inbound/tenant-resolution.ts`
- add `src/inbound/dispatcher.ts`
- add `src/inbound/index.ts`
- add constant-time signature verification helpers under `src/security/signatures.ts`
- add redaction helpers under `src/security/redaction.ts`
- add secret-rotation contracts under `src/security/secret-rotation.ts`

Required behavior:

- verify signatures against raw request bodies
- reject missing or malformed signatures
- enforce replay-window validation when provider timestamps exist
- derive idempotency keys from provider, provider event id, tenant id, and event type
- treat payload-provided tenant/company/organization/workspace ids as hints only
- tenant resolution must use trusted server-side lookup contracts

Do not implement feature business mutations. Dispatcher may define contracts and call approved callbacks only.

Verify:

```txt
pnpm --filter @repo/webhooks typecheck
pnpm --filter @repo/webhooks lint
pnpm --filter @repo/webhooks test
```

### Slice 5: Observability And Operations Contracts

Tasks:

- add `src/observability/events.ts`
- add `src/observability/metrics.ts`
- add `src/observability/tracing.ts`
- add operational contracts for delivery search, dead-letter inspection, replay, discard, and provider health
- expose only safe server contracts; do not build UI inside this package

Safe log fields:

```txt
provider
eventType
eventId
tenantId
companyId
operationId
requestId
deliveryId
attempt
status
durationMs
```

Forbidden log fields:

```txt
provider tokens
signing secrets
authorization headers
full signatures
full raw bodies
PII payload fields
audit before/after snapshots
```

Verify:

```txt
pnpm --filter @repo/webhooks typecheck
pnpm --filter @repo/webhooks lint
pnpm --filter @repo/webhooks test
```

### Slice 6: API Runtime Integration

Do this slice only after the package contracts are stable.

Tasks:

- wire `apps/api` route handlers to `@repo/webhooks/inbound` only if a route already exists or the user explicitly asks for one
- keep vendor-specific payload mapping in `packages/integrations/*`
- call feature `server.ts` entrypoints or `@repo/execution` for mutations
- add route smoke tests if route handlers are created

Do not create new business workflows in `apps/api` just to demonstrate the package.

## Testing Requirements

Add focused tests as implementation grows.

Minimum coverage:

- env validation accepts valid provider tokens and rejects malformed tokens
- outbound envelope validation rejects missing tenant and operation fields
- registry rejects unknown event types and unsupported versions
- Svix publisher is mocked and receives expected event type and payload
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

If the package has no `test` script, add one using the repository's existing test framework. Do not introduce a new test framework if the repo already standardizes on one.

## Final Verification

At the end of each slice, run the narrowest relevant checks:

```txt
pnpm --filter @repo/webhooks typecheck
pnpm --filter @repo/webhooks lint
pnpm --filter @repo/webhooks test
```

When all slices are complete, run broader checks only if the local repo state makes it safe:

```txt
pnpm lint:architecture
pnpm lint:biome
pnpm typecheck
```

If broader checks fail because of unrelated existing worktree changes, report that clearly and do not modify unrelated files.

## Output Expected From The AI IDE

After each slice, report:

- files changed
- package exports changed
- tests added
- commands run and results
- remaining architecture gaps
- any assumptions made

Keep the implementation aligned with `packages/webhooks/architecture-and-feature-requirement.md`. If unsure whether a behavior belongs in `@repo/webhooks`, default to a contract-only implementation and keep business execution outside this package.
