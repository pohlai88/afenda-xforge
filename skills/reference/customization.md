# Customization

## Purpose

XForge is customizable, but only within the architecture boundaries defined in [`architecture.md`](./architecture.md).

The goal of customization is to let teams swap providers, add supporting apps, and change presentation concerns without breaking the ERP governance model.

## What Must Stay Fixed

These parts are not customization points:

- tenant and company isolation
- company grants
- canonical execution pipeline
- canonical query pipeline
- audit writes for successful mutations
- feature package ownership
- cross-feature import restrictions
- `packages/shared` limits
- `pnpm` as the package manager contract

If a customization would weaken one of those rules, it is not a valid customization.

## Swappable Layers

### Database

**Baseline**: PostgreSQL 16 with Drizzle ORM

**Preferred managed providers**:

- Supabase Postgres
- Neon Postgres

**What can change**:

- database host
- database credentials
- schema layout
- migration strategy inside Drizzle

**What must not change**:

- tenant and company scoping
- feature ownership of tables
- audited write flow
- server-side query enforcement

**How to swap**:

1. Update `packages/database`.
2. Update the environment contract in `packages/database` and consuming apps.
3. Regenerate or adjust Drizzle schemas and migrations.
4. Verify every feature still uses the canonical query and mutation paths.

### Authentication

**Baseline**: Auth0, Supabase Auth, or Neon Auth behind `packages/auth`

**What can change**:

- identity provider
- login method
- SSO provider
- session storage strategy
- claim mapping

**What must not change**:

- tenant membership enforcement
- company grant enforcement
- permission finality on the server
- audit obligations

**How to swap**:

1. Replace the provider integration in `packages/auth`.
2. Update session, middleware, and provider-specific hooks.
3. Map provider roles or claims into XForge permission contracts.
4. Revalidate every feature that depends on auth state.

### Search

**Baseline**: Meilisearch for read-side search

**What can change**:

- search provider
- index structure
- language tuning
- search deployment topology

**What must not change**:

- canonical records remain in PostgreSQL
- search remains a read model
- search never becomes a write path

**How to swap**:

1. Update `packages/search`.
2. Keep feature write flows unchanged.
3. Rebuild indexes from canonical data.

### Cache

**Baseline**: Redis

**What can change**:

- Redis provider
- cache key strategy
- TTL policy
- invalidation strategy

**What must not change**:

- cache must never become source of truth
- cache must not bypass audit or permission checks

**How to swap**:

1. Update `packages/cache`.
2. Keep cache access behind approved server-side flows.
3. Verify cache invalidation after canonical writes.

### Messaging

**Baseline**: NATS JetStream

**What can change**:

- event bus provider
- stream topology
- consumer strategy
- replay policy

**What must not change**:

- messages are post-commit side effects only
- event publishing must not happen before the audited mutation succeeds
- business decisions must remain in feature and execution code

**How to swap**:

1. Update `packages/events`.
2. Keep event publishing as a post-commit hook.
3. Do not move domain decisions into event handlers.

### Notifications

**Baseline**: Supabase Realtime Broadcast and Edge Functions behind `packages/notifications`

**What can change**:

- realtime topic strategy
- Edge Function implementation details
- durable notification table design
- provider-specific fan-out for email, SMS, or push

**What must not change**:

- notifications remain post-commit side effects
- notification infrastructure must not own business decisions
- notification feeds must not become canonical ERP state
- user and tenant access must remain server-enforced and RLS-compatible

**How to swap**:

1. Update `packages/notifications`.
2. Keep dispatch behind execution-owned post-commit hooks.
3. Keep in-app delivery on authenticated private channels.
4. Keep durable notification history in Postgres if the product requires inbox state.

### Observability

**Baseline**: Prometheus, Grafana, Loki

**What can change**:

- metrics backend
- dashboard provider
- log storage
- alerting provider

**What must not change**:

- application logs, metrics, and traces must still cover audit failures, permission denials, queue lag, and database health

### Gateway

**Baseline**: Kong for external API traffic

**What can change**:

- gateway vendor
- routing rules
- rate limiting policy

**What must not change**:

- the gateway is not authorization finality
- application authorization remains inside XForge

### CMS

**Baseline**: Payload behind `packages/cms`

**What can change**:

- CMS provider
- editorial workflow
- content modeling details
- preview strategy

**What must not change**:

- the CMS is not the ERP source of truth
- CMS content must not bypass package boundaries
- CMS integration must remain optional unless a real product surface needs it

**How to swap**:

1. Replace the provider client and collection/query helpers in `packages/cms`.
2. Update the environment contract for the new provider.
3. Rewire the consuming app's content routes and preview hooks.

**Viable alternatives**:

- Content Collections for Git-based local content
- Decap CMS for Git-based editorial UI

## Presentation Customization

### Design System

XForge can customize its presentation layer without changing architecture.

**Allowed**:

- theme colors
- fonts
- component density
- spacing scale
- surface styles
- dark mode behavior

**Recommended location**:

- `packages/ui`
- `packages/design-system` if the implementation introduces a dedicated design system package later

**Do not customize away**:

- shared component ownership
- thin client components
- server-first business logic

### Layout and UX

You may customize:

- navigation structure
- dashboard composition
- master-data screens
- table density
- form layout
- search and filter affordances

You may not customize:

- tenant/company enforcement
- permission gating
- feature import rules
- audit expectations

## Apps You Can Add

XForge may add apps when they have clear ownership.

### Foundation apps

- `apps/app` for the ERP shell
- `apps/web` for a public or marketing site if needed
- `apps/api` only if the project needs a separate Node runtime for external APIs
- `apps/email` for email preview if the project sends transactional mail
- `apps/docs` for internal or product documentation if needed
- `apps/storybook` for isolated UI development if the design system justifies it

### Later supporting apps

Add these only when a real need appears:

- admin tooling
- migration tooling
- import tooling
- reporting tooling

## Packages You Can Add

XForge may add packages when they are supporting infrastructure or a real feature family.

### Supporting infrastructure

- `packages/cache`
- `packages/events`
- `packages/search`
- `packages/observability`
- `packages/security`
- `packages/storage`
- `packages/notifications`
- `packages/cms`
- `packages/email`
- `packages/analytics`
- `packages/seo`

### Feature families

- `packages/features/master-data/*`
- `packages/features/hr/*`
- `packages/features/inventory/*`
- `packages/features/finance/*`

See [`packages.md`](./packages.md) for the canonical package layout and feature entry-point rules.

### Shared primitives

- `packages/shared`
- `packages/ui`
- `packages/metadata`
- `packages/metadata-ui`

## New Package Rules

When adding a new package:

1. Give it a clear owner.
2. Keep the public API explicit.
3. Add environment validation if it uses secrets or provider credentials.
4. Make sure it does not become a bypass path around execution, auth, permissions, or audit.
5. Register any build or test tasks in `turbo.json`.

## Deployment Customization

### Recommended default

For the XForge foundation, prefer a managed deployment path over Kubernetes, Helm, and Terraform.

That means:

- deploy the Next.js app with the platform of choice
- use managed Postgres
- use managed auth
- use managed cache or search where possible
- postpone self-managed orchestration until scale makes it necessary

### When to introduce Kubernetes, Helm, or Terraform

Add them only if:

- you have multiple runtime services that need coordinated deployment
- manual cloud console changes are creating drift
- operational scale requires explicit platform ownership

If you add them later, they belong to infrastructure governance, not feature architecture.

## Practical Swap Order

When replacing a provider, keep this order:

1. Update the package boundary.
2. Update environment variables and validation.
3. Update app integrations.
4. Update any provider-specific UI or webhook handling.
5. Re-run typecheck, lint, and tests.
6. Verify tenant/company isolation, auth checks, and audit behavior still hold.

## Summary

Customization in XForge means:

- swap providers at the package boundary
- keep the ERP rules fixed
- keep feature packages isolated
- keep writes canonical
- keep reads tenant-scoped

If a change requires relaxing those rules, it is not customization. It is an architecture change and should be treated separately.
