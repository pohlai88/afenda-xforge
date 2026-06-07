# `@repo/features-master-data-customers`

Tenant-scoped customer feature package for the first real Xforge business module.

## Purpose

This package establishes the expected feature shape:

- `contract.ts` owns the route and data contract
- `manifest.ts` owns shell registration metadata
- `server.ts` is the approved public server entrypoint
- `queries.ts` and `actions.ts` stay behind the feature boundary
- `metadata.ts` stays declarative

## Current state

The package now provides:

- authenticated, tenant-scoped customer listing
- authenticated customer creation backed by `@repo/database`
- route contracts and OpenAPI registration through the app API surface

## Scaffold rule

When a future update action is added, capture the existing record first and return it through a shared snapshot helper instead of hardcoding `before: {}`.

Use `src/shared/audit-snapshot.ts` for that pattern:

- `createAuditSnapshot(before, after)` returns the canonical `before`/`after` pair
- update actions should pass that pair into the execution result so `@repo/audit` can compute a real diff

The remaining production gaps are the broader execution, permission, and audit packages described in the architecture docs.
