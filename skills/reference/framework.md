# XForge Framework Adoption

## Purpose

This document explains how to copy the useful parts of next-forge into XForge and what to optimize for ERP governance.

The goal is not to reproduce next-forge verbatim. The goal is to keep the monorepo productivity model while replacing SaaS assumptions with explicit tenant, company, permission, and audit rules.

Use this as the bridge between next-forge inspiration and XForge implementation.

## What To Copy From Next-Forge

Copy the parts that improve monorepo productivity and developer flow:

- `apps/` and `packages/` separation
- shared config packages
- explicit package ownership
- app-level deployment shape
- docs and storybook support when useful
- typed environment validation
- boundary checks and workspace discipline
- optional supporting infrastructure packages
- reusable UI primitives
- a single workspace package manager contract

Copy the development ergonomics, not the SaaS defaults.

## What To Optimize For XForge

XForge should optimize the copied framework for ERP behavior:

- tenant isolation
- explicit company grants
- canonical execution pipeline
- canonical query pipeline
- server-side permission finality
- audit writes for successful mutations
- master-data as the first-class feature family
- feature package ownership
- pnpm workspace discipline

## What To Replace

The following next-forge assumptions should not be copied as-is:

- Auth0 as the default auth provider
- Prisma as the default ORM
- Bun as the default workspace manager
- Stripe, CMS, collaboration, AI, and feature flags as foundation packages
- vendor-owned notification feeds as foundation packages
- direct reliance on SaaS integration packages that do not serve the ERP baseline
- architecture that treats company access as optional or implicit

## XForge Framework Baseline

### Monorepo Shape

Keep the monorepo structure:

```txt
apps/
packages/
.github/
turbo.json
pnpm-workspace.yaml
```

### Foundation Packages

Keep the packages that define the operating model:

```txt
packages/auth
packages/database
packages/execution
packages/permissions
packages/audit
packages/metadata
packages/metadata-ui
packages/shared
packages/ui
```

### Supporting Infrastructure Packages

Keep the packages that support the ERP but do not own business rules:

```txt
packages/cache
packages/events
packages/health
packages/integrations/*
packages/jurisdictions/*
packages/search
packages/observability
packages/security
packages/storage
packages/email
packages/analytics
packages/seo
```

### Feature Packages

Make `packages/features/master-data/<feature-name>` the canonical feature family.

Examples:

```txt
customers
companies
suppliers
products
locations
departments
tax-codes
currencies
```

## Framework Rules

### 1. One package, one owner

Every package must have a clear owner and a clear dependency direction.

### 2. One execution path

All writes go through the canonical execution pipeline.

### 3. One query path for sensitive data

Tenant-scoped and company-scoped reads must be explicit and server-enforced.

### 4. One feature boundary

Feature packages must not import sibling feature packages directly.

### 5. One shared layer

`packages/shared` is only for narrow primitives and contracts.

## Adoption Order

When converting a next-forge idea into XForge, keep this order:

1. Copy the monorepo shape.
2. Replace the package manager with `pnpm`.
3. Replace the database layer with PostgreSQL 16 and Drizzle.
4. Replace the auth layer with the selected XForge provider.
5. Add execution, permissions, audit, and metadata packages.
6. Add the first master-data feature package.
7. Add supporting infrastructure packages only when needed.
8. Defer Kubernetes, Helm, and Terraform until scale justifies them.

## Success Criteria

The framework copy is correct when:

- the repo stays easy to navigate
- the foundation packages are explicit
- feature packages are isolated
- cross-feature imports are blocked
- writes are audited
- sensitive reads are tenant-scoped
- setup remains manageable with managed services

If any copied element weakens those outcomes, it should be redesigned before being adopted.

## Relationship To The Other Docs

- [`architecture.md`](./architecture.md) defines the target governance model.
- [`packages.md`](./packages.md) defines package ownership and entry points.
- [`customization.md`](./customization.md) defines what can be swapped.
- [`setup.md`](./setup.md) defines bootstrap and environment setup.

This document defines the copy-and-optimize layer between next-forge and XForge.
