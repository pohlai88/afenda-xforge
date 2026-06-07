# XForge Setup

## Purpose

This document explains how to bootstrap XForge for local development and how setup choices relate to the architecture and customization rules.

Use this as the companion to [`architecture.md`](./architecture.md), [`customization.md`](./customization.md), and [`packages.md`](./packages.md).

XForge setup is not just environment wiring. It is part of the governance model:

- package boundaries must stay intact
- tenant and company isolation must remain server-enforced
- writes must go through the canonical execution pipeline
- `pnpm` is the workspace package manager contract

## Setup Model

XForge setup has two categories of decisions:

### Fixed foundations

These are not setup-time customization points:

- Next.js, React, TypeScript, and Tailwind CSS as the application baseline
- Node.js as the runtime baseline
- PostgreSQL 16 as the database baseline
- Drizzle ORM as the schema and migration layer
- `pnpm` as the package manager contract
- canonical auth, execution, permission, and audit packages
- server-side tenant and company enforcement

### Swappable setup-time choices

These can be selected when bootstrapping a workspace:

- managed database provider: Supabase Postgres or Neon Postgres
- auth provider: Supabase Auth, Neon Auth, or Auth0
- optional supporting packages: cache, events, search, observability, security, storage, cms, email, analytics, seo
- optional apps: `apps/web`, `apps/api`, `apps/email`, `apps/docs`, `apps/storybook`

If a setup choice weakens tenant isolation, company grants, audit, or dependency direction, it is not a valid choice.

## Prerequisites

Before bootstrapping, prepare:

- Node.js installed locally
- `pnpm` available through Corepack or installed at the version pinned by the repo
- a managed PostgreSQL 16 database
- an auth provider account, if auth is enabled
- access to any optional provider accounts you plan to activate

Recommended baseline:

- use a managed database instead of self-hosting Postgres for the foundation
- defer Kubernetes, Helm, and Terraform until operational scale justifies them
- do not add Stripe, CMS, collaboration, or docs tooling unless the repo actually enables those packages

## Bootstrap Flow

The exact CLI may vary by implementation, but the bootstrap sequence should always be the same.

1. Create or clone the XForge workspace.
2. Enable the pinned `pnpm` version.
3. Install dependencies with `pnpm install`.
4. Copy environment templates into the package-local env files used by the repo.
5. Configure the database connection for `packages/database`.
6. Configure the selected auth provider in `packages/auth`.
7. Add any optional supporting packages only if the project needs them now.
8. Run database generation or migration tasks.
9. Start the workspace with the repo's `dev` script.
10. Verify the first feature slice through the canonical execution and query paths.

The bootstrap should stop after the foundation is working. Do not pre-install every optional integration.

## Environment Contract

Environment variables must be explicit, typed, and package-owned.

### Required baseline variables

At minimum, the foundation should define:

- `DATABASE_URL` for the managed PostgreSQL connection
- application URL variables for local development
- auth provider variables for the chosen auth integration

### Optional provider variables

Add these only when the corresponding package is enabled:

- cache provider variables for `packages/cache`
- event bus variables for `packages/events`
- search provider variables for `packages/search`
- observability variables for `packages/observability`
- storage variables for `packages/storage`
- CMS variables for `packages/cms`
- email provider variables for `packages/email`
- analytics variables for `packages/analytics`
- SEO or docs variables if the repo enables those packages

Rules:

- keep environment access inside the package that owns the provider
- validate env at build or startup time with the package's schema
- fail fast if a required variable is missing
- do not centralize unrelated secrets in a single shared module

## Local Development

Local development should be simple and repeatable.

### Standard workflow

1. Install dependencies with `pnpm install`.
2. Start the dev scripts defined by the workspace.
3. Connect the app to the local or managed database.
4. Verify auth/session behavior in the browser.
5. Verify tenant-scoped reads and audited writes through the first master-data feature.

### Package manager rule

Use `pnpm` for all workspace operations.

Do not default to `npm` for the workspace. If a one-off command requires another package manager during debugging, treat it as temporary and do not let it redefine the workspace contract.

## Database Setup

The database baseline is PostgreSQL 16 with Drizzle ORM.

### Setup expectations

- provision a managed PostgreSQL 16 instance
- set the connection string in the database package env contract
- generate or update the schema from the database package
- run migrations before starting feature development

### Setup rules

- the database package owns schema, client setup, and migrations
- every table must have an owner
- tenant-scoped records must carry tenant identity explicitly
- company-scoped records must carry company identity explicitly
- database setup must not create a bypass path around the execution pipeline

## Auth Setup

The auth layer is selectable, but the contract is fixed.

### Allowed providers

- Supabase Auth
- Neon Auth
- Auth0

### Auth setup requirements

- configure identity and session handling in `packages/auth`
- map provider claims into XForge permission contracts
- keep tenant membership and company grants inside the XForge server-side model
- verify the server re-checks permission before any sensitive action

### Auth setup rules

- the auth provider may identify the user
- the auth provider may not replace tenant membership checks
- the auth provider may not replace company grants
- the auth provider may not replace audit

## Optional Packages

Add optional packages only when the product actually needs them.

### Supporting infrastructure

- `packages/cache`
- `packages/events`
- `packages/search`
- `packages/observability`
- `packages/security`
- `packages/storage`
- `packages/cms`
- `packages/email`
- `packages/analytics`
- `packages/seo`

### Optional apps

- `apps/web`
- `apps/api`
- `apps/email`
- `apps/docs`
- `apps/storybook`

Do not install or scaffold these by default unless the repo roadmap requires them.

## First Feature Setup

The first production slice should be the master-data customer feature.

Recommended target:

```txt
packages/features/master-data/customers
```

The setup for the first feature should verify:

- server-side tenant resolution
- company grant handling if the feature is company-scoped
- permission checks before execution
- audit write after successful mutation
- no direct feature-to-feature imports
- no direct database access from client components

## What Setup Must Not Do

Setup must not:

- introduce Kubernetes, Helm, or Terraform by default
- make `npm` the default workspace manager
- add SaaS-specific packages that are not part of the XForge baseline
- bypass package-local env validation
- hide auth, database, or provider configuration in an unowned shared file
- mix business logic into setup scripts

## Validation Checklist

After setup, verify:

1. `pnpm install` succeeds.
2. Database connectivity works.
3. Auth/session configuration works for the selected provider.
4. The workspace starts with the repo's dev script.
5. The first feature slice can read and write through the canonical pipeline.
6. Cross-feature imports are blocked.
7. Tenant isolation and company grant checks are enforced on the server.

## Relationship To The Other Docs

- [`architecture.md`](./architecture.md) defines what is fixed.
- [`customization.md`](./customization.md) defines what can be swapped.
- [`packages.md`](./packages.md) defines where code belongs.

If setup conflicts with those rules, the setup is wrong.
