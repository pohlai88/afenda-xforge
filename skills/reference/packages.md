# XForge Package Reference

## Purpose

This document defines how packages are organized in XForge, what each package class is responsible for, and where customization is allowed.

Use this as the package-level companion to [`architecture.md`](./architecture.md) and [`customization.md`](./customization.md).

The goal is simple: make package ownership explicit so business logic does not leak across feature boundaries.

## Package Model

All workspace packages live under `/packages` and are imported through explicit workspace aliases such as `@repo/<name>` or the alias configured by the repo.

Package boundaries are architectural boundaries.

Every package must have:

- a clear owner
- a single responsibility
- an explicit public surface
- a documented dependency direction
- test and build ownership

Packages are not interchangeable by default. Some are fixed governance packages, some are supporting infrastructure, and some are business feature packages.

## Package Classes

### 1. Foundation packages

These packages define the ERP operating model and should exist before business modules scale out:

```txt
packages/database
packages/auth
packages/execution
packages/permissions
packages/audit
packages/design-system
packages/metadata
packages/customization
packages/metadata-ui
packages/shared
packages/ui
```

Responsibilities:

- `packages/database` owns the database client, schema, migrations, and table ownership.
- `packages/auth` owns identity, sessions, hostname and subdomain tenant resolution, and active company resolution.
- `packages/execution` owns the canonical mutation lifecycle.
- `packages/permissions` owns server-side permission contracts and checks.
- `packages/audit` owns audit event shape and persistence.
- `packages/design-system` owns typed visual vocabulary — token registries, variant contracts, generated CSS, tenant branding resolution, and `resolvePresentationMetadata()`. It must not own React rendering, metadata authority, or business execution.
- `packages/metadata` owns declarative metadata contracts only.
- `packages/customization` owns governed tenant and company overrides on top of feature-owned metadata. It may adjust labels, field visibility, order, grouping, form layout, table columns, filters, presentation, and safe action exposure. It must not own permission finality, tenant or company enforcement, audit requirements, execution behavior, or business rules.
- `packages/metadata-ui` owns metadata-driven rendering helpers and may compose `packages/ui` primitives into metadata panels, table shells, and action bars.
- `packages/shared` owns cross-feature primitives, value objects, constants, and narrow contracts.
- `packages/ui` owns reusable presentational components only, including generic purpose variants that stay feature-agnostic.

### 2. Supporting infrastructure packages

These packages support the ERP, but they are not business modules:

```txt
packages/cache
packages/events
packages/health
packages/jurisdictions/*
packages/metrics
packages/logger
packages/notifications
packages/machine
packages/search
packages/observability
packages/security
packages/storage
packages/integrations/*
packages/cms
packages/collaboration
packages/email
packages/analytics
packages/seo
```

Rules:

- These packages may react to successful execution results.
- They must not make business decisions.
- They must not become source-of-truth stores.
- They must not bypass auth, permissions, tenant scope, company grants, or audit.
- `packages/machine` owns product-specific AI orchestration, assistant selection, context assembly, and prompt wiring. It may compose approved feature server entrypoints, but it must not own business decisions or import feature internals.
- `packages/logger` owns structured runtime logging, request context propagation, request wrappers, and server log helpers. It propagates request, correlation, and operation context. Its root export is server-only and client components must not import it.
- `packages/health` owns dependency checks, liveness/readiness/startup contracts, and health report composition.
- `packages/integrations/*` is the vendor-adapter family for systems such as Linear or Workday.
- `packages/jurisdictions/*` is the country-policy family for legal/compliance rules, reference catalogs, and pure calculators such as Vietnam tax or insurance formulas.
- Integration packages may own provider clients, auth flows, webhook verification, retries, and mapping helpers.
- Jurisdiction packages may own validation schemas, constants, and formatting helpers, but they must not own workflow, persistence, or direct provider transport.
- Integration packages must not own XForge business workflow decisions or direct database mutation authority.
- Tenant and company context used by integration entrypoints must still come from trusted server-side resolution, not from vendor payload assumptions.

### 3. Feature packages

Feature packages are the canonical place to build business capabilities.

The primary and first-class feature family is:

```txt
packages/features/master-data/<feature-name>
```

Examples:

```txt
packages/features/master-data/customers
packages/features/master-data/companies
packages/features/master-data/suppliers
packages/features/master-data/products
packages/features/master-data/locations
packages/features/master-data/departments
packages/features/master-data/tax-codes
packages/features/master-data/currencies
```

Master-data is explicit, not implied. It is a real feature family with its own ownership rules, not a dumping ground for shared records.

Later feature families can be added only when they have a clear business boundary, such as system administration, HR, inventory, or finance.

The first non-master-data control-plane feature family is:

```txt
packages/features/system-admin/control-plane
```

`system-admin/control-plane` is a governed tenant administration feature surface. It may expose overview, tenant settings, users/access, customization governance, audit, and health/metrics summaries through approved feature entrypoints. It must not become a top-level `packages/system-admin` foundation package because it does not own tenant resolution, permission finality, audit authority, execution finality, customization resolution, health collection, or metrics collection.

Master-data support primitives now live in `packages/features/_integration`. That package may host shared service primitives, sync helpers, and domain-neutral types for ERP orchestration, but it must not own feature routes, app-facing behavior, or business record authority. The actual business capabilities still belong under `packages/features/master-data/<feature-name>`.

If ERP orchestration needs to be reused across feature families, keep it in `packages/features/_integration`. It may coordinate approved feature `server.ts` entrypoints, but it must not own feature metadata, business records, or domain decisions.

## Package Entry Points

Feature packages should expose stable entry points. The standard surface is:

- `index.ts` for the public export surface
- `contract.ts` for execution context, action names, and request/response contracts
- `schema.ts` for the feature-local TypeScript domain schema and record/input shapes
- `metadata.ts` for declarative labels, filters, columns, and presentation hints
- `server.ts` for the public server-only entrypoint
- `manifest.ts` for registration with the shell or routing layer

These files are the package boundary.

Implementation files such as `queries.ts`, `actions.ts`, `components/`, `forms/`, `tables/`, and `tests/` are internal unless explicitly re-exported through the approved surface.

Feature-local business persistence should use repository taxonomy, such as `repository.ts` or a `repository/` directory. Do not name business-record persistence `storage.ts`; `packages/storage` is reserved for object/file storage providers such as Blob, R2, and Supabase Storage.

## Canonical Feature Layout

The canonical feature package pattern is:

```txt
packages/features/master-data/customers/
└── src/
    ├── manifest.ts
    ├── index.ts
    ├── contract.ts
    ├── schema.ts
    ├── metadata.ts
    ├── feature-scope.ts
    ├── execution.ts
    ├── repository.ts
    ├── queries.ts
    ├── actions.ts
    ├── server.ts
    ├── components/
    ├── forms/
    ├── tables/
    └── tests/
```

File roles:

- `manifest.ts` describes how the feature registers with the ERP shell.
- `index.ts` is the thin public re-export surface.
- `contract.ts` is the source of truth for the feature boundary.
- `schema.ts` owns the feature-local TypeScript record and input shapes.
- `metadata.ts` stays declarative and must not contain business rules.
- `queries.ts` contains server-side reads and must enforce tenant scope.
- `actions.ts` contains server-side mutations and must call the canonical execution pipeline.
- `server.ts` is the only approved public server entrypoint for the feature.
- `feature-scope.ts` contains immutable feature-local scope/context primitives when needed.
- `execution.ts` or `execution/` contains feature-local orchestration helpers and must not bypass the canonical execution pipeline.
- `repository.ts` or `repository/` contains feature business-record persistence adapters. Final source-of-truth persistence belongs behind `packages/database`, not `packages/storage`.
- `index.ts`, `server.ts`, `actions.ts`, `queries.ts`, and feature-local execution modules are server-only files when they re-export or execute runtime behavior.
- Client components import feature-owned data from pure subpaths such as `contract`, `manifest`, `metadata`, or intentionally pure feature-local shared modules.
- Server code imports feature behavior from the `server` subpath when only runtime behavior is needed.

If the feature grows large, it may contain horizontal business areas that repeat the same vertical scaffold.

Example:

```txt
packages/features/hr/
└── src/
    ├── manifest.ts
    ├── index.ts
    ├── server.ts
    ├── payroll/
    │   ├── manifest.ts
    │   ├── contract.ts
    │   ├── schema.ts
    │   ├── metadata.ts
    │   ├── queries.ts
    │   ├── actions.ts
    │   └── server.ts
    ├── benefits/
    │   ├── schema.ts
    └── leave/
        ├── schema.ts
```

Vertical means the top-to-bottom scaffold inside one feature or sub-feature.
Horizontal means the business areas that live side by side inside a larger package.

## Dependency Rules

Dependency flow must stay one-way and boring.

Allowed:

```txt
apps/* -> feature server entrypoints
apps/* -> packages/ui
apps/* -> packages/auth
apps/* -> packages/execution
apps/* -> packages/shared
apps/* -> packages/customization
packages/machine -> feature server entrypoints
feature package -> execution
feature package -> auth
feature package -> permissions
feature package -> database
feature package -> metadata
feature package -> metadata-ui
feature package -> jurisdictions/*
feature package -> shared
feature package -> ui
execution -> auth
execution -> permissions
execution -> audit
execution -> database
customization -> metadata
metadata-ui -> metadata
metadata-ui -> customization
metadata-ui -> ui
```

Forbidden:

```txt
packages/features/* -> packages/features/*
packages/features/* -> sibling feature internals
packages/features/* -> direct imports from another feature package
packages/machine -> feature internals
packages/shared -> business rule ownership
packages/shared -> database mutation logic
packages/cache -> source-of-truth state
packages/events -> business rule ownership
packages/search -> source-of-truth records
packages/customization -> permission finality
packages/customization -> execution behavior
packages/customization -> audit policy
packages/customization -> tenant/company enforcement
packages/customization -> business rules
packages/ui -> database
packages/ui -> auth
client components -> direct database access
client components -> server-only package roots
client components -> feature server/actions/queries/execution subpaths
pages -> direct mutation without execution
```

Feature packages must not cross-import other feature packages directly.

If HR, inventory, finance, or another feature needs shared master-data, it must use one of these paths:

- a narrow value object or contract moved into `packages/shared`
- a country-specific rule or reference package under `packages/jurisdictions/*`
- a read model exposed by `packages/search` after the owning feature indexes it
- an approved server entrypoint called from `apps/app` or orchestration code

Cross-feature writes must always go through the canonical execution pipeline.

## Shared Package Rules

`packages/shared` must stay boring.

Allowed:

```txt
value objects
primitive types
constants
narrow shared contracts
formatting helpers with no business authority
```

Forbidden:

```txt
database mutations
permission checks
workflow decisions
accounting rules
payroll rules
inventory valuation
approval authority
tenant-specific business behavior
```

## Canonical Pipelines

Feature packages are not allowed to invent their own mutation path.

All mutations must go through the canonical execution pipeline:

```txt
requireAuth()
resolveActiveTenant()
requireTenantMembership()
optional: resolveActiveCompany()
optional: requireCompanyGrant()
validateInput()
requirePermission()
executeDomainOperation()
writeAuditEvent()
post-commit hooks
```

Post-commit hooks may publish events, invalidate cache, or update search read models.

All sensitive reads must go through the canonical query pipeline and enforce tenant scope before returning data.

## How To Add A Package

When adding a new package:

1. Decide whether it is foundation, supporting infrastructure, or a feature package.
2. Give it a clear owner and a single responsibility.
3. Define the public entry points up front.
4. Add environment validation if it needs secrets or provider credentials.
5. Register build and test tasks in `turbo.json`.
6. Add boundary checks so it cannot import the wrong layers.
7. Document whether it is swappable, fixed, or deferred.

If the package is a feature package:

1. Place it under `packages/features/master-data/<feature-name>` unless there is a stronger business family.
2. Create the standard vertical scaffold with `manifest.ts`, `index.ts`, `contract.ts`, `schema.ts`, `metadata.ts`, `queries.ts`, `actions.ts`, and `server.ts`.
3. Keep implementation files internal by default.
4. Do not let it import sibling feature packages directly.
5. Move reusable primitives into `packages/shared` only when they are genuinely narrow and stable.

For system administration work, use `packages/features/system-admin/<capability>` and keep each capability a governed control-plane feature. Do not create `packages/system-admin` unless the architecture is explicitly changed to introduce a new foundation package.

## Package Customization Rules

Customization happens at the package boundary, not by breaking package boundaries.

Safe customization points include:

- swapping database providers behind `packages/database`
- swapping auth providers behind `packages/auth`
- swapping search providers behind `packages/search`
- swapping country policy implementations behind `packages/jurisdictions/*`
- swapping cache providers behind `packages/cache`
- swapping structured logging transports or formats behind `packages/logger`
- swapping notification delivery behind `packages/notifications`
- swapping observability backends behind `packages/observability`
- swapping storage, CMS, email, analytics, or SEO integrations at their package boundary

Not allowed:

- letting feature packages depend on sibling feature internals
- moving business rules into `packages/shared`
- bypassing execution for writes
- bypassing tenant or company checks for reads
- treating cache, events, or search as canonical state

## Relationship To The Other Docs

- [`architecture.md`](./architecture.md) defines the system rules.
- [`customization.md`](./customization.md) defines what can be swapped.
- This document defines where code belongs and how packages should be shaped.

If a change is not compatible with all three, it is an architecture change, not a package customization.
