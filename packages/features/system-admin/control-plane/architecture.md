# System Admin Control Plane Architecture

## Purpose

`@repo/features-system-admin-control-plane` is the governed system administration feature package for XForge.

It exists to expose tenant-scoped administration workflows without moving platform authority into an admin package.

## Placement

The package lives at:

```txt
packages/features/system-admin/control-plane
```

It is not a foundation package. Foundation authority remains in:

```txt
packages/auth
packages/permissions
packages/execution
packages/audit
packages/metadata
packages/customization
packages/health
packages/metrics
```

## Mature ERP Pattern

Mature ERP systems separate admin surfaces from authority:

- Frappe and ERPNext expose metadata-driven users, roles, and settings while permission enforcement stays in the framework.
- Odoo separates groups, access rights, record rules, menus, and views from the Settings UI.
- Dolibarr centralizes setup screens, but modules still declare their own permissions and setup behavior.
- Tryton keeps users, groups, preferences, sessions, and application keys model-backed and permission-governed.

XForge follows that model. System admin is an orchestration surface over governed packages, not a monolith.

## Authority Boundaries

Allowed:

- Read tenant-scoped admin overview data.
- Declare metadata-driven admin sections.
- Call approved execution entrypoints for sensitive mutations.
- Require permission checks through `@repo/permissions`.
- Write audit evidence through `@repo/audit`.
- Present customization governance commands inside `@repo/customization` limits.
- Present health and metrics as read-only operational summaries.

Forbidden:

- Owning tenant resolution.
- Owning permission finality.
- Owning audit shape or persistence.
- Owning customization resolution.
- Owning health or metrics collection.
- Bypassing the canonical execution pipeline.
- Importing sibling feature internals.
- Creating arbitrary tenant schema/code customization.

## Runtime Contract

Pure files:

- `contract.ts`
- `schema.ts`
- `metadata.ts`
- `manifest.ts`
- `shared/index.ts`

Server-only files:

- `index.ts`
- `queries.ts`
- `actions.ts`
- `server.ts`
- `execution/index.ts`

App code must import runtime behavior through:

```ts
import { readSystemAdminOverview } from "@repo/features-system-admin-control-plane/server";
```

Client-safe metadata imports must use pure subpaths:

```ts
import { systemAdminControlPlaneMetadata } from "@repo/features-system-admin-control-plane/metadata";
```

## Mutation Policy

Every sensitive mutation must:

1. Resolve authenticated actor from trusted server context.
2. Resolve active tenant from trusted server context.
3. Validate input.
4. Require a system-admin capability.
5. Execute through `@repo/execution`.
6. Emit 7W1H audit evidence.
7. Keep persistence behind the owning foundation or feature package.

## Customization Governance

System admin may publish or archive governed customization records only through contracts owned by `@repo/customization`.

It must not permit:

- arbitrary columns
- arbitrary code
- unrestricted field mutation
- permission bypass
- audit suppression
- deploy-time tenant patching

## Module Console Registry

System Admin registers module consoles from feature manifests (for example `@repo/features-hr-suite-hr-console/manifest`).

Capabilities:

- `system-admin.module-consoles.read` — registry and operator assignment read
- `system-admin.module-consoles.assign` — assign/revoke console operators (always System Admin)

Governance policy per company:

- **`unassigned_fallback`** — no active operator; tenant admin/owner with module-console read acts as implicit full operator for delegation and domain writes (audited with `governanceMode: "unassigned_fallback"`).
- **`operator_assigned`** — assigned operator owns delegation and domain writes; System Admin retains assignment authority and read-only console observation.

## Deferred UI

The package intentionally does not create an app route yet. The admin shell remains deferred until the application-level system admin navigation and layout are finalized.
