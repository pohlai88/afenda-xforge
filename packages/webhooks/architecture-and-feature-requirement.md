# Webhooks Architecture

## Business Definition

**Webhooks Architecture is the XForge infrastructure package capability that provides provider-neutral webhook contracts, outbound delivery, inbound verification, queue and dead-letter primitives, and tenant-safe operational boundaries without taking ownership of ERP business workflows or mutation authority.**

---

# Webhooks Architecture Includes

| Area | What It Covers |
| --- | --- |
| **Outbound Delivery Contracts** | Provider-neutral webhook envelopes, publisher contracts, retry classification, circuit-breaker support, and provider adapters such as Svix |
| **Inbound Verification** | Raw-body signature verification, replay-window checks, idempotency key derivation, tenant-resolution contracts, and mapped inbound dispatch primitives |
| **Queue And Dead Letter Contracts** | Queue publisher and consumer contracts, dead-letter queue records, replay operations, and Redis-backed queue integration helpers |
| **Registry And Versioning** | Event, provider, and schema registries plus explicit versioned event contracts |
| **Operational Observability** | Safe logging, tracing, metrics, redaction policy, and operational inspection boundaries for webhook delivery |

---

# Webhooks Architecture Does Not Include

| Excluded Area | Owned By |
| --- | --- |
| ERP business decisions and feature workflow meaning | Owning feature packages |
| Permission finality and execution authority | `@repo/permissions` and `@repo/execution` |
| Audit persistence and business audit semantics | `@repo/audit` and consuming feature layers |
| Direct business mutation authority | Approved feature server entrypoints or execution pipeline |
| App route ownership and UI operations screens | `apps/api` and system admin feature surfaces |
| Provider-specific business mapping | `packages/integrations/*` |

---

# Source of Truth Ownership

| Data / Business Object | Source of Truth | Notes |
| --- | --- | --- |
| Webhook transport contracts | `@repo/webhooks` | This package owns provider-neutral envelope, queue, DLQ, verification, and observability contracts. |
| Provider credentials and secret validation | Server environment and package env helpers | Secrets must be validated server-side and never sourced from request payloads or client headers. |
| Tenant, company, organization, and workspace authority | Trusted server-side state outside this package | This package may define lookup contracts, but it must not treat payload claims as authoritative context. |
| Business event meaning and downstream mutation behavior | Owning feature packages and execution pipeline | Webhooks may transport and verify events, but they must not decide ERP business outcomes. |
| Audit evidence storage | `@repo/audit` and consuming layers | This package may expose operational metadata, but business audit ownership stays external. |

---

# Boundary Rules

| Rule | Requirement |
| --- | --- |
| Tenant boundary | Inbound and outbound flows must carry trusted tenant context, and inbound payload claims remain hints until verified against server-owned state. |
| Permission boundary | Replay, discard, endpoint management, and business mutations must be permission-gated by consuming layers, not by package-local shortcuts. |
| Audit boundary | Webhook operations may surface operational metadata, but business audit evidence remains outside this package. |
| API boundary | `apps/api` owns route handlers; `@repo/webhooks` supplies verification, transport, and contract helpers only. |
| Runtime boundary | Runtime files that touch env, secrets, queue consumers, or provider clients must remain server-only. |
| Package boundary | `@repo/webhooks` must not import feature packages or bypass `@repo/execution`, `@repo/audit`, or trusted context resolution. |

---

# Webhooks Architecture Requirement Statement

| Requirement | Description |
| --- | --- |
| **Webhooks Architecture** | Provides governed webhook transport and verification primitives for XForge, including provider-neutral outbound envelopes, inbound verification, queue and dead-letter contracts, registry validation, and tenant-safe operational boundaries. |

---

# Enterprise Functional Requirements

| Code | Requirement |
| --- | --- |
| **WEB-001** | System shall expose explicit provider-neutral webhook contracts for outbound delivery, inbound verification, queue processing, dead-letter handling, replay, and observability. |
| **WEB-002** | System shall validate provider credentials and secrets from trusted server environment only. |
| **WEB-003** | System shall verify inbound webhook signatures against the raw request body and enforce replay-window checks where provider timestamps exist. |
| **WEB-004** | System shall derive stable idempotency keys before side effects are executed for inbound processing. |
| **WEB-005** | System shall require explicit event, provider, and schema registry entries before production webhook delivery or verification. |
| **WEB-006** | System shall use provider-neutral queue and dead-letter contracts that preserve event, tenant, and operation context. |
| **WEB-007** | System shall classify delivery failures as retryable or terminal and support circuit-breaker behavior for outbound providers. |
| **WEB-008** | System shall keep webhook tenant resolution and business mutation authority outside provider payload trust boundaries. |
| **WEB-009** | System shall redact secrets and sensitive payload values from operational logs and inspection views. |
| **WEB-010** | System shall keep route ownership in app layers and business mutation ownership in approved feature entrypoints or execution pipelines. |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria |
| --: | --- |
| 1 | Provider-neutral outbound envelopes include stable event, tenant, operation, timing, schema version, and payload fields. |
| 2 | Malformed or missing provider secrets are rejected by environment validation helpers. |
| 3 | Inbound signature verification accepts valid signatures and rejects invalid signatures using raw request bodies. |
| 4 | Replay-window validation rejects stale inbound requests where timestamp-based provider verification is required. |
| 5 | Idempotency keys are derived deterministically before inbound side effects. |
| 6 | Event, provider, and schema registries reject unknown or unsupported definitions. |
| 7 | Queue, retry, circuit-breaker, and dead-letter contracts preserve tenant and operation context. |
| 8 | Replay contracts are explicit and do not bypass execution, permission, or audit obligations in consuming layers. |
| 9 | Logs and operational payload views exclude provider secrets, signing secrets, raw signatures, raw bodies, and sensitive audit payloads. |
| 10 | Webhook helpers do not directly mutate ERP business state without going through approved external entrypoints. |

---

# Definition of Done

This section replaces the former standalone `dod.md` for `@repo/webhooks`.

| Area | Done When |
| --- | --- |
| Architecture and boundaries | The package remains a supporting infrastructure package, not a business feature package, and route ownership, business mutation ownership, and provider-specific business mapping remain outside this package. |
| Public surface | Public exports are explicit, stable, and documented through package-level documentation and manifest entries. |
| Environment and runtime safety | Secrets are server-only, environment validation fails closed, and client runtimes do not import webhook provider or queue runtime code. |
| Outbound and inbound contracts | Typed envelopes, registry validation, raw-body verification, replay-window checks, idempotency derivation, and tenant-safe resolution contracts are present and explicit. |
| Queue and DLQ behavior | Retry classification, circuit-breaker behavior, dead-letter records, and replay contracts preserve provider-neutral governance boundaries. |
| Observability | Redaction, metrics, tracing, and operational logging stay distinct from business audit evidence and never leak secrets. |
| Tests and verification | The relevant package lint, typecheck, and test commands pass, and changed behaviors have focused test coverage. |
| Documentation and release readiness | This document, README, and implementation prompt remain aligned, and any remaining production gaps are explicitly documented as external or future integration work. |

---

# Implementation Status

**Status:** Partial

**Last audited:** 2026-06-10

This document standardizes the current `@repo/webhooks` package architecture and DoD into one source-of-truth document. The package already contains provider-neutral contracts, outbound and inbound primitives, queue and dead-letter contracts, Redis-backed helpers, observability surfaces, and targeted tests. Remaining production-readiness gaps are primarily in downstream business execution coverage and future context-hardening for broader provider flows.

| Area | Status | Evidence |
| --- | --- | --- |
| Feature contracts and schemas | Implemented | [`src/contract.ts`](./src/contract.ts), [`src/registry/schema-registry.ts`](./src/registry/schema-registry.ts) |
| Authorization and policy boundary | Partial | [`src/inbound/tenant-resolution.ts`](./src/inbound/tenant-resolution.ts), [`src/inbound/dispatcher.ts`](./src/inbound/dispatcher.ts), [`implementation.prompt.md`](./implementation.prompt.md) |
| Source-of-truth integration | Partial | [`src/inbound/tenant-resolution.ts`](./src/inbound/tenant-resolution.ts), [`src/inbound/mapped-event.ts`](./src/inbound/mapped-event.ts) |
| Repository and persistence | Implemented for queue and DLQ package scope | [`src/queue/redis.ts`](./src/queue/redis.ts), [`src/dead-letter/queue.ts`](./src/dead-letter/queue.ts) |
| Queries, projections, or read models | Implemented as operational registries and inspection contracts | [`src/registry/index.ts`](./src/registry/index.ts), [`src/dead-letter/inspector.ts`](./src/dead-letter/inspector.ts) |
| Actions, workflows, or mutations | Implemented for transport and replay contracts only | [`src/outbound/publisher.ts`](./src/outbound/publisher.ts), [`src/dead-letter/replay.ts`](./src/dead-letter/replay.ts) |
| HTTP or API routes | Not owned by this package by design | [`README.md`](./README.md), [`implementation.prompt.md`](./implementation.prompt.md) |
| Requirement coverage registry | Not implemented as a dedicated registry file | [`architecture-and-feature-requirement.md`](./architecture-and-feature-requirement.md) |
| Verification tests | Implemented | [`src/tests/outbound.test.ts`](./src/tests/outbound.test.ts), [`src/tests/inbound-verifier.test.ts`](./src/tests/inbound-verifier.test.ts), [`src/tests/queue.test.ts`](./src/tests/queue.test.ts), [`src/tests/dead-letter.test.ts`](./src/tests/dead-letter.test.ts), [`src/tests/tenant-resolution.test.ts`](./src/tests/tenant-resolution.test.ts) |

### Planning Mark

- `Current audited slices: WEB-001, WEB-002, WEB-003, WEB-004, WEB-005, WEB-006, WEB-007, WEB-008, WEB-009, WEB-010`
- `Slice status: partial; package contracts and runtime primitives are implemented, but full production coverage still depends on consuming-layer integrations`
- `Feature status: partially implemented as production-oriented infrastructure`

---

# Requirement Coverage

| Requirement | Status | Evidence |
| --- | --- | --- |
| WEB-001 | Implemented | [`src/index.ts`](./src/index.ts), [`src/contract.ts`](./src/contract.ts), [`package.json`](./package.json) |
| WEB-002 | Implemented | [`src/keys.ts`](./src/keys.ts), [`keys.ts`](./keys.ts), [`src/tests/outbound.test.ts`](./src/tests/outbound.test.ts) |
| WEB-003 | Implemented | [`src/inbound/verifier.ts`](./src/inbound/verifier.ts), [`src/inbound/replay-window.ts`](./src/inbound/replay-window.ts), [`src/security/signatures.ts`](./src/security/signatures.ts), [`src/tests/inbound-verifier.test.ts`](./src/tests/inbound-verifier.test.ts) |
| WEB-004 | Implemented | [`src/inbound/idempotency.ts`](./src/inbound/idempotency.ts), [`src/tests/idempotency.test.ts`](./src/tests/idempotency.test.ts) |
| WEB-005 | Implemented | [`src/registry/event-registry.ts`](./src/registry/event-registry.ts), [`src/registry/provider-registry.ts`](./src/registry/provider-registry.ts), [`src/registry/schema-registry.ts`](./src/registry/schema-registry.ts), [`src/tests/registry.test.ts`](./src/tests/registry.test.ts) |
| WEB-006 | Implemented | [`src/queue/contract.ts`](./src/queue/contract.ts), [`src/queue/publisher.ts`](./src/queue/publisher.ts), [`src/dead-letter/contract.ts`](./src/dead-letter/contract.ts), [`src/tests/queue.test.ts`](./src/tests/queue.test.ts), [`src/tests/dead-letter.test.ts`](./src/tests/dead-letter.test.ts) |
| WEB-007 | Implemented | [`src/outbound/retry-policy.ts`](./src/outbound/retry-policy.ts), [`src/outbound/circuit-breaker.ts`](./src/outbound/circuit-breaker.ts), [`src/tests/circuit-breaker.test.ts`](./src/tests/circuit-breaker.test.ts) |
| WEB-008 | Partial | [`src/inbound/tenant-resolution.ts`](./src/inbound/tenant-resolution.ts), [`src/tests/tenant-resolution.test.ts`](./src/tests/tenant-resolution.test.ts) |
| WEB-009 | Implemented | [`src/security/redaction.ts`](./src/security/redaction.ts), [`src/observability/index.ts`](./src/observability/index.ts), [`src/tests/redaction.test.ts`](./src/tests/redaction.test.ts) |
| WEB-010 | Partial | [`implementation.prompt.md`](./implementation.prompt.md), [`README.md`](./README.md) |

---

# Element-by-Element Code Evaluation

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| Public Contract Surface | Implemented. The package exports explicit subpaths for transport, queue, registry, inbound, outbound, security, and observability concerns. | [`package.json`](./package.json), [`src/index.ts`](./src/index.ts) | Keep the root export stable and add new runtime surfaces through explicit subpaths only. |
| Inbound Verification | Implemented. Raw-body verification, replay-window helpers, idempotency derivation, and mapped inbound contracts exist with tests. | [`src/inbound/verifier.ts`](./src/inbound/verifier.ts), [`src/inbound/replay-window.ts`](./src/inbound/replay-window.ts), [`src/inbound/idempotency.ts`](./src/inbound/idempotency.ts) | Keep provider payload trust boundaries strict and resolve business mutations outside this package. |
| Outbound Delivery | Implemented. Publisher, delivery, retry, circuit-breaker, and Svix adapter layers exist behind provider-neutral contracts. | [`src/outbound/publisher.ts`](./src/outbound/publisher.ts), [`src/outbound/delivery.ts`](./src/outbound/delivery.ts), [`src/outbound/circuit-breaker.ts`](./src/outbound/circuit-breaker.ts), [`src/outbound/svix.ts`](./src/outbound/svix.ts) | Future providers should stay behind the same provider-neutral envelope and retry contracts. |
| Queue And Dead Letter | Implemented. Queue and DLQ contracts, Redis integration, replay support, and inspection primitives are present. | [`src/queue/contract.ts`](./src/queue/contract.ts), [`src/queue/redis.ts`](./src/queue/redis.ts), [`src/dead-letter/queue.ts`](./src/dead-letter/queue.ts), [`src/dead-letter/replay.ts`](./src/dead-letter/replay.ts) | Keep replay explicit and permission-gated in consuming layers; do not let queue helpers become workflow owners. |
| Registry And Versioning | Implemented. Event, provider, and schema registries formalize explicit versioned external contracts. | [`src/registry/event-registry.ts`](./src/registry/event-registry.ts), [`src/registry/provider-registry.ts`](./src/registry/provider-registry.ts), [`src/registry/schema-registry.ts`](./src/registry/schema-registry.ts) | Maintain additive compatibility rules and avoid silent contract drift. |
| Observability And Redaction | Implemented. Metrics, tracing, event metadata, and redaction utilities separate operations concerns from audit evidence. | [`src/observability/metrics.ts`](./src/observability/metrics.ts), [`src/observability/tracing.ts`](./src/observability/tracing.ts), [`src/security/redaction.ts`](./src/security/redaction.ts) | Keep secrets and sensitive payloads out of logs and operational views by default. |

---

# Verification Summary

1. `pnpm --filter @repo/webhooks lint`
2. `pnpm --filter @repo/webhooks typecheck`
3. `pnpm --filter @repo/webhooks test`

These commands are the package verification contract. They were not re-run as part of this documentation standardization pass.

---

# Audience

This document is for engineers working on webhook transport, verification, replay, queue processing, provider adapters, and consuming operational integrations.

---

# Decision Enabled

Use this document to decide whether a change belongs in `@repo/webhooks`, `apps/api`, `packages/integrations/*`, an admin operations surface, or an owning feature package.

---

# Source Of Truth References

- [`../../skills/reference/architecture.md`](../../skills/reference/architecture.md)
- [`../../skills/reference/packages.md`](../../skills/reference/packages.md)
- [`implementation.prompt.md`](./implementation.prompt.md)
