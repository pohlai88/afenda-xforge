# System Admin Control Plane Definition Of Done

## Package

- Package is located at `packages/features/system-admin/control-plane`.
- Package name is `@repo/features-system-admin-control-plane`.
- Public exports are explicit and stable.
- Workspace discovery works through existing `pnpm-workspace.yaml` globs.

## Architecture

- Package is documented as a feature/control-plane package, not a foundation package.
- Authority remains in `auth`, `permissions`, `execution`, `audit`, `metadata`, `customization`, `health`, and `metrics`.
- Local architecture doc explains mature ERP patterns and XForge governance boundaries.

## Runtime

- Runtime entrypoints are server-only.
- Pure metadata and contracts are importable through explicit subpaths.
- Reads require tenant-scoped context and permission checks.
- Mutations call the canonical execution pipeline.
- Sensitive mutations write audit events.

## Customization

- Customization governance stays inside `@repo/customization` limits.
- No arbitrary schema, arbitrary code, or unrestricted tenant override is exposed.

## Validation

- `pnpm --filter @repo/features-system-admin-control-plane typecheck` passes.
- `pnpm --filter @repo/features-system-admin-control-plane test` passes.
- `pnpm lint:architecture` passes.
- Root reference docs mention the package placement and boundaries.
