# Webhooks Architecture Governance

## Purpose

This document governs `@repo/webhooks` as the XForge webhook infrastructure package.

The package is currently a small Svix outbound helper with environment loading. The production target is a governed webhook boundary that can support outbound delivery, inbound verification, provider adapters, event and schema registries, queue-backed delivery, idempotency, dead-letter handling, replay, observability, and tenant-safe routing without becoming a business workflow package.

If implementation conflicts with this document, update the implementation to match this document or record an architecture decision before changing the package role.

## Repository Context

Local repository:

```txt
pohlai88/afenda-xforge
```

GitHub repository metadata:

```txt
visibility: public
default branch: main
remote: https://github.com/pohlai88/afenda-xforge.git
```

The package must remain safe for a public repository:

- secrets must be loaded only from validated server environment
- webhook signing secrets must never be committed
- examples must use placeholder values
- tests must use deterministic local fixtures
- logs must not include raw secrets, full signatures, authorization headers, or sensitive payload fields

## Package Classification

`packages/webhooks` is a supporting infrastructure package.

It may own:

- outbound webhook provider clients
- outbound event delivery helpers
- inbound signature verification primitives
- inbound replay-window checks
- idempotency contracts
- delivery attempt contracts
- provider-neutral webhook event envelopes
- webhook event, provider, and schema registries
- queue contract and worker-facing delivery primitives
- retry, circuit-breaker, dead-letter, and replay contracts
- safe logging and observability metadata for webhook delivery
- app-facing helpers used by `apps/api` route handlers

It must not own:

- ERP business decisions
- feature workflow decisions
- tenant membership finality
- company grant finality
- permission finality
- audit event persistence
- direct database mutation authority
- provider-specific business mapping that belongs under `packages/integrations/*`

## Relationship To XForge Governance

Webhook processing must obey the same XForge authority model as server actions and route handlers.

Outbound webhooks:

```txt
canonical execution pipeline succeeds
audit event is written
post-commit effect requests webhook delivery
@repo/webhooks validates the event against the registry
@repo/webhooks formats the provider-neutral event
event is written to an outbox or queue
worker delivers through the provider client
retry, circuit-breaker, and dead-letter policies handle failures
provider client returns delivery metadata
caller records operational result where appropriate
```

Inbound webhooks:

```txt
route handler receives raw body
provider adapter verifies signature and replay window
trusted server code resolves tenant context
idempotency key is checked before side effects
event type and schema version are checked against the registry
provider payload is mapped into an approved command or event
feature server entrypoint or execution pipeline performs any business mutation
audit is written by the canonical execution pipeline
```

`@repo/webhooks` may verify and transport webhook messages. It must not decide what an ERP record means or mutate ERP state directly.

Operational ownership rule:

- webhook endpoint lifecycle is a system administration concern
- the governed feature owner for tenant-facing endpoint management is `@repo/features-system-admin-control-plane`
- `apps/api` may host temporary operational routes, but the business-facing control surface belongs under the system admin feature family

## Target Directory Shape

Promote the package from flat helper files into this production-ready shape:

```txt
packages/webhooks/
├── architecture.md
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── contract.ts
│   ├── keys.ts
│   ├── env.ts
│   ├── registry/
│   │   ├── index.ts
│   │   ├── event-registry.ts
│   │   ├── provider-registry.ts
│   │   └── schema-registry.ts
│   ├── outbound/
│   │   ├── index.ts
│   │   ├── delivery.ts
│   │   ├── publisher.ts
│   │   ├── svix.ts
│   │   ├── retry-policy.ts
│   │   ├── circuit-breaker.ts
│   │   └── dead-letter.ts
│   ├── inbound/
│   │   ├── index.ts
│   │   ├── envelope.ts
│   │   ├── verifier.ts
│   │   ├── idempotency.ts
│   │   ├── replay-window.ts
│   │   ├── tenant-resolution.ts
│   │   └── dispatcher.ts
│   ├── queue/
│   │   ├── index.ts
│   │   ├── contract.ts
│   │   ├── publisher.ts
│   │   └── consumer.ts
│   ├── dead-letter/
│   │   ├── index.ts
│   │   ├── contract.ts
│   │   ├── queue.ts
│   │   ├── replay.ts
│   │   └── inspector.ts
│   ├── security/
│   │   ├── signatures.ts
│   │   ├── redaction.ts
│   │   └── secret-rotation.ts
│   ├── observability/
│   │   ├── events.ts
│   │   ├── metrics.ts
│   │   └── tracing.ts
│   └── tests/
│       ├── outbound.test.ts
│       ├── inbound-verifier.test.ts
│       ├── idempotency.test.ts
│       ├── registry.test.ts
│       ├── queue.test.ts
│       ├── dead-letter.test.ts
│       ├── circuit-breaker.test.ts
│       └── redaction.test.ts
└── README.md
```

Migration rule:

- keep current exports working during the first promotion slice
- move implementation into `src/`
- update package exports to point at `src/*`
- remove compatibility exports only after all internal imports have moved

## Public Entry Points

The final package surface should be explicit:

```json
{
  ".": "./src/index.ts",
  "./contract": "./src/contract.ts",
  "./keys": "./src/keys.ts",
  "./registry": "./src/registry/index.ts",
  "./outbound": "./src/outbound/index.ts",
  "./inbound": "./src/inbound/index.ts",
  "./queue": "./src/queue/index.ts",
  "./dead-letter": "./src/dead-letter/index.ts",
  "./security": "./src/security/signatures.ts",
  "./package.json": "./package.json"
}
```

Allowed imports:

- `apps/api` may import `@repo/webhooks/inbound` for route-handler verification helpers.
- `apps/api` may import `@repo/webhooks/outbound` for operational webhook routes.
- worker runtimes may import `@repo/webhooks/queue` and `@repo/webhooks/dead-letter`.
- feature packages and execution post-commit hooks may import provider-neutral outbound contracts.
- `packages/integrations/*` may import pure verifier or envelope primitives when provider-specific code needs them.

Forbidden imports:

- client components must not import `@repo/webhooks`
- feature packages must not import provider clients directly
- `@repo/webhooks` must not import feature packages
- `@repo/webhooks` must not import `@repo/database` for business mutations
- `@repo/webhooks` must not bypass `@repo/execution` or `@repo/audit`
- `@repo/webhooks` must not expose queue consumers to client runtimes

## Environment Governance

Environment access must stay server-only and validated.

Required conventions:

- provider credentials live in `src/keys.ts` or `src/env.ts`
- env schemas must reject malformed secrets
- optional providers must fail closed when invoked without credentials
- `SKIP_ENV_VALIDATION` may only skip validation for build-time workflows, not runtime authorization
- provider tokens must not be accepted from request payloads, query params, or client headers

Current environment variable:

```txt
SVIX_TOKEN
```

Future variables should be provider-scoped:

```txt
SVIX_TOKEN
WEBHOOK_REPLAY_WINDOW_SECONDS
WEBHOOK_IDEMPOTENCY_TTL_SECONDS
WEBHOOK_QUEUE_VISIBILITY_TIMEOUT_SECONDS
WEBHOOK_DLQ_RETENTION_DAYS
WEBHOOK_CIRCUIT_BREAKER_FAILURE_THRESHOLD
```

## Registry Governance

Webhook event names, providers, and schema versions must be registered before production use.

Registry files own provider-neutral declarations only:

```txt
registry/event-registry.ts
registry/provider-registry.ts
registry/schema-registry.ts
```

Event registry rules:

- event names must use dot-separated, versioned names, for example `customer.created.v1`
- event names must not use mixed naming forms such as `customer_created`, `CustomerCreated`, and `customer.created` for the same event
- every event must declare owner, payload schema, schema version, allowed scopes, and delivery sensitivity
- feature-owned event meaning belongs to the feature package; the registry records the external contract
- deprecated events must remain registered until their support window ends

Provider registry rules:

- provider identifiers must be stable and lowercase
- provider capabilities must be explicit, for example outbound only, inbound only, app portal, retries, or signatures
- provider secret requirements must point to validated env keys
- provider-specific business mappings remain in `packages/integrations/*`

Schema registry rules:

- schema versions are immutable after release
- additive optional fields may be added only through a new schema version when external consumers depend on the old shape
- breaking changes require a new event version
- payload schemas must be deterministic and testable without network access

## Outbound Webhook Rules

Outbound delivery must use a provider-neutral event envelope before calling Svix or any future provider.

Minimum envelope:

```txt
eventId
eventType
tenantId
organizationId
companyId
workspaceId
operationId
requestId
occurredAt
schemaVersion
payload
redactionPolicy
```

Rules:

- publish only after the canonical execution pipeline succeeds
- include `tenantId` in every business webhook event
- include `organizationId` or `workspaceId` only when the source domain has those operating contexts
- include `companyId` when the source operation is company-scoped
- include `operationId` and `requestId` for traceability
- never send raw audit `before` and `after` values by default
- use explicit event type names, for example `customer.created.v1`
- version event schemas instead of changing payload shape silently
- fail closed if required envelope fields are missing

## Queue And Outbox Governance

Direct synchronous delivery is allowed only for low-risk development and explicitly documented operational endpoints. Enterprise production delivery must be queue-backed.

Required production flow:

```txt
Execution success
    ↓
Outbox record or queue message
    ↓
Webhook worker
    ↓
Provider delivery
    ↓
Delivery result
    ↓
Retry, circuit breaker, or dead letter
```

Queue rules:

- queue messages must contain only provider-neutral envelope data and delivery metadata
- queue consumers must be server-only workers or route handlers
- queue consumers must enforce idempotency before provider delivery
- queue payloads must not contain provider secrets
- queue visibility timeout and retry count must be configurable
- failed delivery attempts must be classified as retryable or terminal
- queue contracts may be implemented with a managed queue later, but the package owns the contract first

Outbox rules:

- event enqueue must happen only after the canonical execution pipeline succeeds
- outbox persistence may live in the database foundation or an application orchestration layer
- `@repo/webhooks` may define the outbox contract but must not own business persistence decisions
- outbox processing must be resumable after worker crashes

## Circuit Breaker Governance

Outbound providers must be protected by circuit breakers before high-volume production use.

Circuit states:

```txt
closed
open
half-open
```

Rules:

- open the circuit after a configured failure threshold for a provider and tenant delivery target
- stop non-critical delivery attempts while the circuit is open
- allow limited probe attempts in half-open state
- close the circuit only after successful probes
- emit metrics and operational events for state changes
- circuit state must not suppress audit writes or canonical execution results
- critical business operations must not depend on webhook provider availability

## Dead Letter Queue Governance

Retries must not become infinite loops. Failed messages must move to a dead-letter queue after retry policy is exhausted.

Dead-letter flow:

```txt
Delivery failed
    ↓
Retry policy exhausted
    ↓
Dead-letter queue
    ↓
Operations review
    ↓
Replay or terminal discard
```

Dead-letter records must include:

```txt
deadLetterId
provider
eventId
eventType
tenantId
organizationId
companyId
workspaceId
operationId
requestId
failureReason
attemptCount
firstFailedAt
lastFailedAt
replayStatus
```

Rules:

- DLQ records must redact sensitive payload fields
- replay must require an explicit server-side operation
- replay must preserve the original event id and operation id unless a new event is intentionally generated
- replay must re-check idempotency and provider circuit state
- terminal discard must be auditable as an operational action, not as a business mutation
- DLQ inspection must be read-only unless the caller uses an approved replay or discard action

## Inbound Webhook Rules

Inbound webhooks must be handled by `apps/api` route handlers or another explicit server runtime. The package supplies verification and dispatch primitives only.

Rules:

- verify signatures against the raw request body
- use constant-time signature comparison
- enforce a replay window when provider timestamps exist
- reject missing or malformed signatures
- compute an idempotency key before side effects
- map provider payloads into provider-neutral commands outside this package when mapping is vendor-specific
- resolve tenant context from trusted server-side inputs only
- call feature `server.ts` entrypoints or the execution pipeline for business mutations

Tenant context for inbound webhooks may come from:

- a pre-registered webhook endpoint record owned by trusted server state
- a provider application id mapped to a tenant by trusted server state
- a route segment that is validated against trusted server state

Tenant context must not come only from:

- request payload claims
- unverified headers
- query params without a trusted lookup
- client-provided local state

## Tenant Resolution Service

Inbound webhook tenant resolution must be a dedicated server-side concern.

`inbound/tenant-resolution.ts` may define contracts for:

- provider application id to tenant lookup
- endpoint id to tenant lookup
- signing secret id to tenant lookup
- route segment to tenant lookup after trusted validation
- optional organization, company, or workspace context lookup

Rules:

- tenant resolution must happen after signature verification unless the provider requires endpoint-specific secret lookup
- when endpoint-specific secret lookup is needed, lookup must use a non-secret public endpoint id and then verify the raw body
- payload-provided tenant, organization, company, or workspace ids are hints only until verified against trusted server state
- resolved tenant context must be explicit in the command passed to feature server entrypoints
- company grants and permissions are still enforced by the canonical pipeline, not by webhook tenant resolution

## Idempotency And Replay Protection

Enterprise webhook handling must be idempotent.

Minimum behavior:

- derive a stable idempotency key from provider event id, provider name, tenant id, and event type
- store or check the key before any business side effect
- return a safe duplicate response for already-processed events
- track failed attempts separately from successful processing
- support retry without duplicating business mutations

Storage for idempotency may be implemented in a foundation package or route-level orchestration, but `@repo/webhooks` owns the idempotency contract and key derivation helper.

## Contract Version Lifecycle

Webhook contracts must have an explicit lifecycle.

Supported states:

```txt
draft
active
deprecated
retired
```

Version policy:

- production consumers may subscribe only to `active` versions
- `draft` versions are allowed only in development and test fixtures
- `deprecated` versions must remain documented until their support window ends
- `retired` versions must reject new subscriptions and delivery configuration
- breaking payload changes require a new event version
- the platform should support current and previous active versions where practical
- deprecation notices must include replacement event name, deprecation date, and retirement date

Compatibility policy:

- additive optional fields are allowed within a version only when consumers can safely ignore them
- removing fields, changing field meaning, changing enum values, or changing requiredness requires a new version
- old versions must not silently emit new semantics under the same event name

## Observability

Webhook logs are operational logs, not audit evidence.

Log safe fields:

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

Do not log:

```txt
provider tokens
signing secrets
authorization headers
full signatures
full raw bodies
PII payload fields
audit before/after snapshots
```

Metrics should track:

- outbound delivery success and failure count
- inbound verification failures
- duplicate event count
- replay-window rejection count
- provider latency
- retry count
- dead-letter count when a queue is introduced
- circuit breaker state changes
- replay success and failure count
- queue lag and age of oldest pending message

Tracing should propagate:

```txt
requestId
operationId
eventId
deliveryId
provider
tenantId
companyId
```

## Operational Portal Governance

Enterprise support requires a governed webhook operations surface.

The UI does not belong in `@repo/webhooks`, but this package must expose safe contracts that an admin surface can use.

Recommended operations surface:

```txt
System Admin
└── Webhook Operations
    ├── Deliveries
    ├── Failures
    ├── Retries
    ├── Dead Letters
    ├── Replay
    └── Provider Health
```

Rules:

- operations UI must be permission-gated server-side
- replay and discard actions must be explicit and auditable
- payload views must be redacted by default
- provider health must show circuit state and recent failure rates
- delivery search must support tenant, company, provider, event type, event id, operation id, status, and time range
- operations UI must call server routes or approved admin entrypoints, not package internals from client components

## Error Handling

Errors must be explicit and safe:

- configuration errors should fail fast with a clear server-side message
- verification failures should return unauthorized or bad request responses from the route handler
- provider delivery failures should include provider, event type, and operation id, not secrets
- retryable and non-retryable failures must be distinguishable
- business mutation failures must be handled by the canonical execution pipeline, not by this package

## Testing Requirements

Minimum tests before production use:

- env validation accepts valid provider tokens and rejects malformed ones
- outbound envelope validation rejects missing tenant and operation fields
- Svix publisher is mocked and called with the expected event type and payload
- inbound signature verification accepts valid signatures
- inbound signature verification rejects invalid signatures
- replay-window validation rejects stale timestamps
- idempotency key derivation is deterministic
- registry rejects unknown event types and unsupported versions
- queue contracts preserve event, operation, and tenant context
- circuit breaker opens, half-opens, and closes under deterministic conditions
- dead-letter records are created after retry exhaustion
- replay preserves idempotency behavior
- redaction removes sensitive fields from logs

Minimum package gates:

```txt
pnpm --filter @repo/webhooks typecheck
pnpm --filter @repo/webhooks lint
pnpm --filter @repo/webhooks test
```

If the package has no tests yet, implementation slices must add the `test` script and the first focused tests before expanding runtime behavior.

## Promotion Plan

### Slice 1: Package Boundary

- create `src/`
- move `index.ts`, `keys.ts`, and `lib/svix.ts` into governed subdirectories
- preserve existing root exports through `package.json`
- add `contract.ts`
- add package README
- add typecheck and lint validation

### Slice 2: Outbound Contract

- introduce provider-neutral event envelope
- introduce event, provider, and schema registries
- validate outbound payloads
- wrap Svix behind `outbound/publisher.ts`
- make event type and schema version explicit
- add outbound tests with mocked Svix

### Slice 3: Queue, Retry, And DLQ

- add queue contract, publisher, and consumer interfaces
- add retry classification
- add circuit-breaker contract
- add dead-letter contract and replay contract
- add deterministic tests for retry exhaustion, circuit state, and replay behavior

### Slice 4: Inbound Verification

- add provider-neutral verification contracts
- add raw body signature helpers
- add replay-window validation
- add idempotency key derivation
- add tenant-resolution contracts
- add inbound verifier tests

### Slice 5: API Runtime Integration

- wire `apps/api` route handlers to inbound helpers
- keep business mapping in `packages/integrations/*` or approved orchestration
- call feature `server.ts` entrypoints or canonical execution for mutations
- add route-handler smoke tests

### Slice 6: Production Operations

- add safe structured logs
- add metrics hooks
- add tracing hooks
- add retry classification
- add operational contracts for delivery search, DLQ inspection, replay, and provider health
- document operational runbooks

## Acceptance Criteria

The package is production-ready only when:

- all public exports are explicit
- all runtime files are server-only
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

## Current Implementation Assessment

Current files:

```txt
index.ts
keys.ts
lib/svix.ts
```

Current strengths:

- server-only Svix implementation
- typed environment loading
- small explicit package exports
- no current database or feature-package dependency leakage

Current gaps before enterprise production:

- no package-local architecture or README before this document
- no typed webhook event envelope
- no inbound verification surface
- no idempotency contract
- no event, provider, or schema registry
- no queue or outbox contract
- no circuit breaker contract
- no dead-letter or replay contract
- no retry or delivery classification
- no tests
- no safe logging or metrics contract
- flat files instead of a production directory structure

Recommendation:

Promote `packages/webhooks` as a supporting infrastructure package, not as a feature package and not as a generic integration package. Keep provider-specific business adapters under `packages/integrations/*`, keep route handling in `apps/api`, and keep business mutations inside approved feature entrypoints and the canonical execution pipeline.
