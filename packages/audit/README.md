# `@repo/audit`

Audit helpers for Xforge mutation flows.

## Purpose

This package is intentionally narrower than the Viet-ERP audit package.

It owns:

- audit event contracts
- sanitized audit writes
- diff and masking helpers
- query helpers over the `audit_events` table

It does not own:

- ORM middleware
- file-based export backends
- billing or tenancy policy

## Standard usage

1. Let feature `actions.ts` run through the canonical execution pipeline.
2. Return meaningful `before` and `after` snapshots from the domain operation.
3. Pass `writeAuditEvent` from `@repo/audit` into `@repo/execution`.
4. Use `listAuditEvents(...)` or the target/request helpers for read-side queries.

## Important rule

If a mutation updates an existing record, do not return `before: {}` unless the operation is truly create-only. The audit package can compute diffs, but only from the snapshots the feature provides.
