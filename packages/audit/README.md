# `@repo/audit`

Audit helpers for Xforge mutation flows.

## Purpose

This package owns the evidence model for governed mutations:

- audit event contracts
- redaction and diff normalization
- database writes, including transaction-aware writes
- tenant-scoped read and export helpers

It does not own:

- ORM middleware
- feature-local persistence logic
- observability logs
- policy decisions

## Canonical North Star

The audit contract is defined in [7w1h.md](./7w1h.md). Use that file as the source of truth when changing governed mutation evidence.
The exported TypeScript surface intentionally uses the `Audit7W1H*` types and `audit7w1h*` schemas so the north star stays visible in code as well as docs.

## What was adopted from the legacy kernel

The legacy Afenda kernel had a stronger execution-audit contract. Xforge keeps the useful parts:

- explicit actor type, route, surface, module, and subject context
- summary and reason normalization
- change-level diffing with `added`, `removed`, and `changed`
- every diff entry keeps its `change` classification through normalization and persistence
- bounded redaction for sensitive fields and nested payloads
- query helpers for actor, target, request, and export use cases
- runtime reference logs that can point back to the persisted `auditEventId` after a successful write

## Normalization behavior

- `requestId` is optional on input; the writer generates one when omitted.
- `operationId` defaults to `requestId` unless the caller provides a separate value.
- `actorType` defaults to `user` and `outcome` defaults to `success`.
- `module` falls back to the action prefix when omitted.
- `summary` falls back to a stable action-target sentence, and `reason` falls back to `summary` when omitted.
- `actorRole`, `approvalId`, `companyId`, `grantId`, `surface`, `route`, `subjectType`, `subjectId`, `policyReference`, `channel`, and `targetDisplayName` are normalized to nullable values.
- `occurredAt` is the event timestamp; `createdAt` is assigned when the event is persisted.

## Standard usage

1. Let feature `actions.ts` run through the canonical execution pipeline.
2. Return meaningful `before` and `after` snapshots from the domain operation.
3. Pass `writeAuditEvent` from `@repo/audit` into `@repo/execution`.
4. Use `writeAuditEventInTransaction` when the caller already owns a transaction.
5. Use `listAuditEvents(...)` or the target/request helpers for read-side queries.

## Important rule

If a mutation updates an existing record, do not return `before: {}` unless the operation is truly create-only. The audit package can compute diffs, but only from the snapshots the feature provides.

## Verification checklist

- create mutations write an event with an empty `before` snapshot and a complete `after` snapshot
- update mutations write both snapshots and produce field-level changes
- delete or archive mutations preserve the last visible state in `before`
- sensitive fields are masked before they are persisted or exported
- tenant and company filters are applied on every read path
- CSV/JSON exports are covered for empty and non-empty result sets
- request IDs can be used to reconstruct a single execution pipeline run, and `operationId` resolves back to the same run when callers omit it
- runtime logs may reference the persisted audit event ID, but audit remains the source of truth

## Deferred on purpose

The legacy kernel also embedded audit into a broader execution transaction model. Xforge should add that next where feature transactions already exist, rather than forcing a full refactor into every domain action at once.
