---
name: xforge
description: Expert assistance for XForge — a production-grade ERP monorepo with tenant isolation, company grants, canonical execution, and master-data feature packages. Triggers on questions about XForge architecture, setup, packages, customization, dependency boundaries, setup workflows, pnpm, managed Postgres, auth, and ERP governance.
---

# XForge

XForge is a production-grade ERP monorepo for building tenant-scoped business systems with explicit company grants, server-side permission enforcement, auditability, and a canonical execution pipeline.

It uses a monorepo structure with apps, supporting infrastructure packages, and feature packages. The first-class feature family is `packages/features/master-data/<feature-name>`.

## Core Positioning

XForge is not a generic SaaS template.

It is a governance-first ERP foundation:

- tenant isolation is mandatory
- company grants are explicit
- writes go through one canonical execution pipeline
- sensitive reads go through a canonical query pipeline
- feature packages do not cross-import other feature packages directly
- `packages/shared` stays narrow and boring
- `pnpm` is the workspace package manager contract

## Quick Start

The recommended starting point is the XForge setup and architecture docs:

- `reference/framework.md`
- `reference/setup.md`
- `reference/architecture.md`
- `reference/packages.md`
- `reference/customization.md`

The base setup contract is:

1. Use `pnpm` for the workspace.
2. Use Node.js through the Next.js runtime.
3. Use PostgreSQL 16 with Drizzle ORM.
4. Choose a managed provider such as Supabase Postgres or Neon Postgres.
5. Choose an auth provider such as Supabase Auth, Neon Auth, or Auth0.
6. Add optional supporting packages only when there is a real product need.
7. Build the first production slice in `packages/features/master-data/customers`.

## Architecture Overview

### Apps

Apps are deployable entry points. Common app roles include:

- `apps/app` for the main ERP shell
- `apps/web` for a public or marketing surface if needed
- `apps/api` only if a separate Node runtime becomes necessary
- `apps/email` for transactional email preview if needed
- `apps/docs` for internal or product documentation if needed
- `apps/storybook` for isolated UI work if the design system justifies it

### Foundation packages

These packages define the ERP operating model:

- `auth`
- `database`
- `execution`
- `permissions`
- `audit`
- `metadata`
- `metadata-ui`
- `shared`
- `ui`

### Supporting infrastructure packages

These packages support the ERP but are not business modules:

- `cache`
- `events`
- `search`
- `observability`
- `security`
- `storage`
- `email`
- `analytics`
- `seo`

### Feature packages

Master-data is the canonical feature family:

- `packages/features/master-data/customers`
- `packages/features/master-data/companies`
- `packages/features/master-data/suppliers`
- `packages/features/master-data/products`
- `packages/features/master-data/locations`
- `packages/features/master-data/departments`
- `packages/features/master-data/tax-codes`
- `packages/features/master-data/currencies`

Later families such as HR, inventory, and finance may be added when the business boundary is clear.

## Key Concepts

### Environment Variables

Environment variables are package-owned and validated locally by the package that needs them.

Fixed baseline variables include:

- `DATABASE_URL`
- auth provider variables
- app URL variables for local development

Optional packages may introduce their own provider keys, but they must not hide secrets in an unowned shared module.

### Server-First Model

XForge is server-first.

- server components and server utilities are the default
- client components stay thin
- database access is server-side only
- sensitive reads and all writes go through governed server entry points

### Canonical Execution

All mutations follow the same flow:

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

Post-commit hooks may publish events, invalidate cache, or refresh search read models after the audited mutation succeeds.

### Canonical Query Flow

Sensitive reads must enforce tenant scope and, when relevant, company grants before returning data.

### Master-Data Feature Contract

The canonical feature package pattern includes:

- `manifest.ts`
- `index.ts`
- `contract.ts`
- `metadata.ts`
- `server.ts`

Standard implementation files like `queries.ts`, `actions.ts`, `components/`, `forms/`, `tables/`, and `tests/` remain internal unless explicitly re-exported through the approved surface.

## Common Tasks

### Understanding the Architecture

Read the docs in this order:

1. `reference/architecture.md`
2. `reference/packages.md`
3. `reference/customization.md`
4. `reference/setup.md`

### Adding a New Package

Follow the package rules:

1. Decide whether the package is foundation, supporting infrastructure, or a feature package.
2. Define the public API explicitly.
3. Add env validation if the package needs credentials or secrets.
4. Register tasks in the workspace tooling.
5. Keep dependency direction one-way.

### Building a New Feature

For feature development:

1. Create the feature under `packages/features/master-data/<feature-name>` unless there is a stronger business family.
2. Define `manifest.ts`, `contract.ts`, `metadata.ts`, and `server.ts`.
3. Keep `queries.ts` and `actions.ts` internal.
4. Never import sibling feature packages directly.
5. Route cross-feature coordination through `apps/app`, execution flows, or narrow shared contracts.

### Swapping Providers

Provider swaps happen at the package boundary:

- database provider swaps happen in `database`
- auth provider swaps happen in `auth`
- search provider swaps happen in `search`
- cache provider swaps happen in `cache`
- observability swaps happen in `observability`

The ERP rules do not change when a provider changes.

### Adding Optional Integrations

Only add SaaS-style integrations when the product has a real need. The default foundation does not require payments, CMS, collaboration, feature flags, AI, or notifications.

## Development Workflow

Recommended development order:

1. Scaffold the monorepo.
2. Establish shared config and foundation packages.
3. Configure the database and auth provider.
4. Implement permissions, audit, and execution.
5. Build the first master-data feature.
6. Add observability and other infrastructure only when needed.

## References

- `reference/framework.md` - what to copy from next-forge and what to optimize for XForge
- `reference/architecture.md` - ERP governance, boundaries, and runtime model
- `reference/packages.md` - package ownership, entry points, and dependency rules
- `reference/customization.md` - provider swaps and extension boundaries
- `reference/setup.md` - bootstrap and environment setup
