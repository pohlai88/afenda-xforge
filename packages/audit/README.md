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

## What was adopted from the legacy kernel

The legacy Afenda kernel had a stronger execution-audit contract. Xforge now keeps the useful parts:

- 7W1H-shaped audit records
- explicit actor type, route, surface, module, and subject context
- summary and reason normalization
- change-level diffing with `added`, `removed`, and `changed`
- bounded redaction for sensitive fields and nested payloads
- query helpers for actor, target, request, and export use cases

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
- request IDs can be used to reconstruct a single execution pipeline run

## Deferred on purpose

The legacy kernel also embedded audit into a broader execution transaction model. Xforge should add that next where feature transactions already exist, rather than forcing a full refactor into every domain action at once.
