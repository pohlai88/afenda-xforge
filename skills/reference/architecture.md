# XForge Architecture Governance

## 1. Purpose

This document defines the target architecture for XForge, a production-grade ERP foundation.

The intent is not to build the full ERP surface immediately. The intent is to establish a stable monorepo, a single mutation pipeline, tenant isolation, permission checks, and auditability so future modules can be added without reworking the platform.

This document is a governance contract for engineers. If implementation conflicts with this document, the implementation must change.

## 2. Architecture Goals

XForge must optimize for:

- clear ownership of code and business rules
- predictable dependency direction
- tenant-scoped data access
- server-side permission enforcement
- auditable mutations
- incremental delivery of one business module at a time
- a repo layout that scales without becoming a generic engine

## 3. Architecture Positioning

XForge should use next-forge as the monorepo and productivity reference, but XForge remains the ERP governance base.

Use next-forge patterns for:

- app and package separation
- shared infrastructure packages
- Turborepo discipline
- deployment-ready app shape
- observability, security, storage, docs, storybook, and supporting app structure

Use XForge rules for:

- tenant and company isolation
- company grants
- server-side permission finality
- audit governance
- canonical execution pipeline
- metadata limits
- feature ownership
- delivery and testing governance

Do not treat next-forge as the ERP architecture source of truth. Its SaaS integrations are useful, but ERP correctness depends on XForge governance.

Architecture assessment:

```txt
next-forge as ERP base: 6.5 / 10
XForge as ERP base: 8.8 / 10
XForge with selected next-forge packages: 9.3 / 10
```

Adopt from next-forge:

```txt
apps/app
apps/web
apps/api
apps/email
apps/docs
apps/storybook
apps/studio
packages/analytics
packages/logger
packages/email
packages/machine
packages/next-config
packages/observability
packages/security
packages/seo
packages/storage
packages/typescript-config
```

Defer until a real ERP need exists:

```txt
payments
cms
collaboration
ai
feature-flags
```

### Current App Scaffold Stance

XForge should not treat all next-forge apps as equal priority.

Scaffold now:

- `apps/app` - the ERP shell and primary governance surface
- `apps/web` - public or marketing-facing shell, if the project needs one
- `apps/api` - separate runtime for health, webhooks, and external integrations
- `apps/email` - preview surface for transactional templates
- `apps/docs` - dedicated Mintlify-style public docs surface when the repo needs product or platform documentation
- `apps/storybook` - component workshop and visual regression staging
- `apps/studio` - database inspection and migration support surface

## 4. Technology Baseline

XForge should learn from enterprise ERP stacks, but it must not adopt every technology as foundation code on day one.

### Recommended baseline

| Layer | XForge baseline | Governance position |
| --- | --- | --- |
| Frontend | Compatible current versions of Next.js App Router, React, TypeScript, and Tailwind CSS | Foundation |
| Backend | Next.js Server Actions and Route Handlers first | Foundation |
| Backend runtime | Node.js through Next.js runtime | Foundation |
| Database | PostgreSQL 16 with Drizzle ORM on Supabase or Neon | Foundation |
| Messaging | NATS JetStream | Later, when event-driven workflows are proven |
| Notifications | Supabase Realtime Broadcast and Edge Functions behind `packages/notifications` | Optional later infrastructure |
| Auth | Supabase Auth, Neon Auth, or Auth0 behind `packages/auth` | Foundation requirement |
| Gateway | Kong API Gateway | Deployment concern for external APIs |
| Cache | Redis | Later, only for measured cache, queue, or rate-limit needs |
| Search | Meilisearch with Vietnamese search support | Later, when full-text master-data search is needed |
| Monitoring | Prometheus, Grafana, Loki | Production infrastructure |
| Build | Turborepo with pnpm workspaces | Foundation |
| Testing | Vitest and Playwright | Foundation |
| CI/CD | GitHub Actions | Foundation |
| Orchestration | Not required for foundation | Defer |
| IaC | Not required for foundation | Defer |

### Enterprise ERP lessons to adopt

- Large ERP schemas need explicit database ownership, migrations, multi-schema discipline, and tenant/company scoping from the start.
- Event-driven architecture should be introduced after synchronous execution paths are correct and audited.
- SSO and RBAC are not sufficient by themselves; XForge must still enforce tenant membership, company grants, permissions, and audit on the server.
- Search should be treated as a read model, not as the source of truth.
- API gateways protect and route external APIs, but they do not replace application authorization.
- Monitoring must cover application errors, audit failures, queue lag, database health, and request latency.
- Kubernetes, Helm, and Terraform are not required for the foundation and should be added only when deployment scale justifies them.

### Packages created by this baseline

These packages may exist as supporting infrastructure packages:

```txt
packages/analytics
packages/ai
packages/cache
packages/events
packages/health
packages/integrations/*
packages/jurisdictions/*
packages/logger
packages/machine
packages/metrics
packages/notifications
packages/rate-limit
packages/search
```

Rules:

- `packages/analytics` owns telemetry providers, client/server analytics helpers, and lightweight UI wiring, not ERP business decisions.
- `packages/logger` owns structured runtime logging, request context propagation, request wrappers, and server log helpers. It propagates request, correlation, and operation context. Route wrappers may attach safe custom props and quiet logging flags for high-volume endpoints. It is server-only and must not own audit evidence or business decisions.
- `packages/ai` owns model registry helpers, AI SDK adapters, and AI UI primitives, not ERP business decisions.
- `packages/machine` owns product-specific AI orchestration, assistant selection, context assembly, and prompt wiring. It may compose approved feature server entrypoints, but it must not own business decisions or import feature internals.
- `packages/events` owns event contracts and publishers, not business decisions.
- `packages/integrations/*` owns external vendor adapters, webhook verifiers, transport clients, and provider-specific mapping helpers, not ERP business decisions.
- `packages/jurisdictions/*` owns country-specific legal/compliance constants, pure calculators, validation schemas, reference catalogs, and formatting helpers, not persistence or workflow authority.
- `packages/notifications` owns notification transport helpers, Supabase topic conventions, and Edge Function dispatch clients, not business decisions.
- `packages/cache` owns cache clients and helpers, not source-of-truth state.
- `packages/rate-limit` owns request throttling policies, limiter adapters, and response headers, not business decisions.
- `packages/search` owns indexing and search clients, not canonical records.
- Features may publish events, invalidate cache, and update search read models only after the canonical execution pipeline succeeds.

## 5. Non-Goals

XForge is not allowed to start as:

- a full ERP with CRM, finance, HR, inventory, procurement, payroll, and reporting all at once
- a generic workflow engine
- a generic form engine
- a generic import/export engine
- a generic notification platform
- a client-first application with direct database access from UI code
- a direct copy of every next-forge SaaS package

Only the foundation and the first real business module are in scope initially.

## 6. Target Repository Shape

XForge should use a Turborepo-style monorepo with `apps/` and `packages/`.

```txt
xforge/
├── apps/
│   ├── app/              # Main ERP application shell
│   ├── web/              # Optional marketing or public site
│   ├── api/              # Optional separate API runtime, added later if needed
│   ├── email/            # Optional email preview app
│   ├── docs/             # Docs site
│   ├── storybook/        # Component workshop
│   └── studio/           # Database studio
├── packages/
│   ├── analytics/        # Optional product and usage analytics
│   ├── ai/               # Optional AI SDK helpers and UI primitives
│   ├── logger/           # Structured runtime logging and request context helpers
│   ├── machine/          # Product AI orchestration and assistant shell
│   ├── audit/            # Audit event contract and writer
│   ├── auth/             # Authentication, session, tenant resolution
│   ├── cache/            # Optional Redis cache helpers
│   ├── database/         # Database client, schema, migrations
│   ├── email/            # Optional transactional email package
│   ├── events/           # Optional NATS/event contracts and publishers
│   ├── health/           # Operational health checks and probe contracts
│   ├── jurisdictions/    # Country-specific policy and reference packages
│   ├── execution/        # Canonical mutation pipeline
│   ├── features/
│   │   ├── master-data/
│   │   │   └── customers/ # Canonical master-data feature package pattern
│   │   ├── hr/            # Later feature family
│   │   ├── inventory/     # Later feature family
│   │   └── finance/       # Later feature family
│   ├── integrations/
│   │   ├── linear/        # External vendor adapter
│   │   └── workday/       # External vendor adapter
│   ├── metadata/         # Metadata contracts only
│   ├── metadata-ui/      # Metadata-driven rendering helpers
│   ├── next-config/      # Shared Next.js config
│   ├── notifications/    # Optional Supabase Realtime + Edge notifications
│   ├── observability/    # Logging, errors, instrumentation
│   ├── rate-limit/       # Request throttling, quotas, abuse controls
│   ├── permissions/      # Server-side permission checks
│   ├── search/           # Optional Meilisearch indexing and clients
│   ├── security/         # Security headers, request guards, bot/WAF helpers
│   ├── seo/              # Optional metadata, sitemap, JSON-LD helpers
│   ├── shared/           # Cross-feature primitives and contracts only
│   ├── storage/          # File/blob storage integration
│   ├── typescript-config/ # Shared TypeScript config
│   └── ui/               # Shared UI primitives only
├── .github/
│   └── workflows/        # CI/CD pipelines
├── turbo.json
├── package.json          # package scripts and packageManager
├── pnpm-workspace.yaml   # pnpm workspace definition
└── biome.jsonc
```

### Directory ownership rules

- `apps/*` owns routing, shell composition, and page-level wiring.
- `packages/ui` owns reusable presentational components only.
- `packages/database` owns schema, migrations, client setup, and table definitions.
- `packages/auth` owns authentication, session access, tenant membership, hostname and subdomain tenant resolution, and active tenant resolution.
- `packages/execution` owns the only canonical mutation entrypoint.
- `packages/features/master-data/<feature-name>` owns the feature-specific master-data capability, its server entrypoint, its metadata, its vertical scaffold, and any horizontal business areas inside the package.
- `packages/permissions` owns permission contracts and server-side guards.
- `packages/audit` owns the 7W1H audit event shape and persistence.
- `packages/metadata` owns metadata contracts only.
- `packages/metadata-ui` owns metadata-driven rendering helpers.
- `packages/shared` owns cross-feature primitives, value objects, constants, and narrow contracts that are not business execution logic.
- `packages/integrations/*` owns external system clients, webhook verification helpers, retry policy helpers, and provider-specific request/response mapping.
- `packages/cache`, `packages/events`, `packages/health`, `packages/jurisdictions/*`, `packages/logger`, `packages/notifications`, `packages/search`, `packages/rate-limit`, `packages/security`, `packages/storage`, `packages/observability`, `packages/email`, `packages/analytics`, `packages/ai`, and `packages/seo` are supporting infrastructure packages, not ERP business modules.
- `packages/domain-*` is legacy naming and should not be used for new work.

## 7. Dependency Direction

Dependency flow must remain one-way and boring.

Allowed:

```txt
apps/app -> feature server entrypoints
apps/app -> packages/ui
apps/app -> packages/auth
apps/app -> packages/execution
apps/app -> packages/shared
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
metadata-ui -> metadata
metadata-ui -> ui
```

Forbidden:

```txt
packages/ui -> database
packages/ui -> auth
packages/ui -> feature packages
packages/machine -> feature internals
packages/metadata -> mutation logic
client components -> direct database access
client components -> server-only package roots
client components -> feature server/actions/queries/execution subpaths
pages -> direct mutation without execution
business modules -> bypass audit
business modules -> bypass permission checks
packages/features/* -> packages/features/*
packages/features/* -> sibling feature internals
packages/features/* -> master-data feature imports
packages/integrations/* -> database mutation logic
packages/integrations/* -> permission finality
packages/shared -> business rule ownership
packages/shared -> database mutation logic
packages/cache -> source-of-truth state
packages/search -> source-of-truth records
packages/events -> business rule ownership
API gateway -> authorization finality
```

Feature packages must not import other feature packages directly.

This includes master-data. Master-data is a feature family, not a global dependency bucket. If HR, inventory, finance, or another feature needs customer, company, product, or location data, it must use one of these paths:

- call an approved feature `server.ts` entrypoint from the application or orchestration layer
- depend on a narrow contract or value object moved into `packages/shared`
- use a read model exposed by `packages/search` after the owning feature has indexed it

Cross-feature writes must always go through the canonical execution pipeline.

### Cross-feature orchestration

Cross-feature orchestration must not live inside a feature package.

For the first production target, keep general orchestration inside `apps/app`. If orchestration becomes reusable or complex, introduce `packages/orchestration` later. Product-specific AI orchestration may live in `packages/machine` as a narrow supporting package.

The orchestration layer may call approved feature `server.ts` entrypoints only. It must not import feature internals, and it must not bypass tenant, company, permission, execution, or audit rules.

### Shared package limits

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

`packages/jurisdictions/*` may centralize country variance, but they must stay pure:

Allowed:

```txt
tax and insurance constants
pure calculators
invoice validation schemas
bank and address reference catalogs
country-specific formatting helpers
provider-neutral compliance contracts
```

Forbidden:

```txt
database mutations
tenant or company authorization
feature workflow orchestration
execution pipeline ownership
provider transport side effects
```

## 8. Package Naming

Shared workspace packages should use a stable workspace alias convention.

Recommended import style:

```ts
import { database } from "@repo/database";
import { requireAuth } from "@repo/auth";
import { executeMutation } from "@repo/execution";
import { can } from "@repo/permissions";
import { writeAuditEvent } from "@repo/audit";
import { customerManifest } from "@repo/features-master-data-customers/manifest";
import { customerContract } from "@repo/features-master-data-customers/contract";
import { customerMetadata } from "@repo/features-master-data-customers/metadata";
import { createCustomer } from "@repo/features-master-data-customers/server";
```

If the implementation chooses a different package prefix later, the same dependency rules still apply.

### Feature Families

Master-data features are the default, first-class feature family in XForge.

Master-data features model shared reference records that other parts of the ERP depend on, such as:

- customers
- companies
- suppliers
- products
- locations
- departments
- tax codes
- currencies

Master-data features may be tenant-scoped, company-scoped, or both, but they must always obey the canonical tenant and company grant rules defined in this document.

`packages/features/master-data/<feature-name>` is the canonical unit of master-data feature development.

Other feature families may be added later, but they must follow the same architectural rules.

### Feature Package Contract

Each master-data feature package should publish these stable entry points:

- `manifest.ts` for feature registration and shell integration
- `index.ts` for the public export surface
- `server.ts` for server-only queries and mutations
- `contract.ts` for schemas, types, action names, and request/response contracts
- `metadata.ts` for feature metadata such as labels, columns, filters, states, and presentation hints
- `shared/` for narrow feature-local primitives that may be reused inside the feature boundary
- `execution/` for the feature-local execution surface and orchestration helpers
- `queries.ts` and `actions.ts` may exist as internal implementation files or as explicitly exported subpaths, but they must not become a bypass around `server.ts`

Feature packages grow along two axes:

- Vertical scaffold means the top-to-bottom structure required to make a feature or sub-feature complete.
- Horizontal business areas mean the left-to-right functional areas inside a larger feature package.

The standard vertical scaffold is:

```txt
packages/features/master-data/customers/
└── src/
    ├── manifest.ts
    ├── index.ts
    ├── contract.ts
    ├── metadata.ts
    ├── queries.ts
    ├── actions.ts
    ├── server.ts
    ├── shared/
    ├── execution/
    ├── components/
    ├── forms/
    ├── tables/
    └── tests/
```

Large feature packages may contain multiple horizontal business areas, and each area should repeat the same vertical scaffold.

Example large feature layout:

```txt
packages/features/hr/
└── src/
    ├── manifest.ts
    ├── index.ts
    ├── server.ts
    ├── payroll/
    │   ├── manifest.ts
    │   ├── contract.ts
    │   ├── metadata.ts
    │   ├── queries.ts
    │   ├── actions.ts
    │   ├── server.ts
    │   └── tests/
    ├── benefits/
    │   ├── manifest.ts
    │   ├── contract.ts
    │   ├── metadata.ts
    │   ├── queries.ts
    │   ├── actions.ts
    │   ├── server.ts
    │   └── tests/
    └── leave/
        ├── manifest.ts
        ├── contract.ts
        ├── metadata.ts
        ├── queries.ts
        ├── actions.ts
        ├── server.ts
        └── tests/
```

Rules for the feature contract:

- `contract.ts` is the source of truth for the feature boundary.
- `manifest.ts` describes how the feature registers with the ERP shell.
- `queries.ts` contains server-side read operations and must enforce tenant scope.
- `actions.ts` contains server-side mutation actions and must call the canonical execution pipeline.
- `server.ts` is the primary approved public server entrypoint for a feature or sub-feature.
- `server.ts` may delegate to `queries.ts`, `actions.ts`, `shared/`, and `execution/`.
- `queries.ts` and `actions.ts` are internal implementation files unless explicitly exported through the feature package surface for controlled reuse.
- `shared/` must stay within the feature boundary and must not import sibling feature packages.
- `execution/` must express the feature-local orchestration layer and must not bypass the canonical app-level execution pipeline.
- `metadata.ts` must remain declarative and must not contain business rules.
- `index.ts` should stay thin, start with `import "server-only"`, and only re-export approved public surface area for server composition.
- Apps and approved orchestration layers should import feature behavior through the published entry points, not by reaching into arbitrary internal files.
- Published subpaths should mirror the feature entry points: the package root for `index.ts`, plus `manifest`, `server`, `contract`, and `metadata` subpaths.
- Feature packages may also publish `shared`, `execution`, `queries`, and `actions` subpaths, but application code should still prefer `server.ts` and `index.ts` as the normal entry points.
- Apps and orchestration layers must not import directly from `queries.ts`, `actions.ts`, `components/`, `forms/`, `tables/`, or `tests/`.
- Client components must not import feature package roots, `server`, `actions`, `queries`, or `execution` subpaths. They may import pure `contract`, `manifest`, `metadata`, and intentionally pure `shared` subpaths.
- A feature may use shared packages, but it must not import another feature package directly.
- Cross-feature coordination belongs in execution flows, application orchestration, or narrow shared contracts.
- If a capability grows large enough to need sub-features, model them as horizontal business areas inside the feature package until a shared abstraction is genuinely justified.

## 9. Core Runtime Model

XForge must be server-first.

### Rendering model

- Use server components and server utilities by default.
- Use client components only for interaction-heavy UI such as forms, tables, dialogs, filters, command menus, and optimistic state.
- Keep client components thin. They should render and collect input, not own business rules.

### Mutation model

All create, update, delete, archive, restore, and workflow transition operations must go through one canonical execution pipeline.

There must not be competing mutation paths.

## 10. Canonical Execution Pipeline

Every mutation must follow the same order:

```txt
1. requireAuth()
2. resolveActiveTenant()
3. requireTenantMembership()
4. validateInput()
5. requirePermission()
6. executeDomainOperation()
7. writeAuditEvent()
8. revalidatePath() or invalidate cache
9. return typed result
```

No step may be skipped.

For company-scoped features, the pipeline extends to:

```txt
1. requireAuth()
2. resolveActiveTenant()
3. requireTenantMembership()
4. resolveActiveCompany()
5. requireCompanyGrant()
6. validateInput()
7. requirePermission()
8. executeDomainOperation()
9. writeAuditEvent()
10. revalidatePath() or invalidate cache
11. return typed result
```

This means:

- no direct mutation from pages
- no direct mutation from client components
- no business logic hidden in UI event handlers
- no permission finality decided only in the browser
- no event publishing, cache mutation, or search indexing before the audited domain operation succeeds

After a successful audited mutation, execution may invoke registered post-commit hooks for:

- event publishing through `packages/events`
- cache invalidation or refresh through `packages/cache`
- search read-model updates through `packages/search`

`packages/execution` owns the canonical mutation lifecycle. It must not contain feature-specific event, cache, or search logic.

`packages/events`, `packages/notifications`, `packages/cache`, and `packages/search` must not contain business decisions. They may only react to successful audited execution results.

### Query model

All sensitive reads must go through a canonical query pipeline.

Tenant-scoped queries must follow this order:

```txt
1. requireAuth()
2. resolveActiveTenant()
3. requireTenantMembership()
4. validateQueryInput()
5. requirePermission()
6. executeTenantScopedQuery()
7. return typed result
```

Company-scoped queries must follow this order:

```txt
1. requireAuth()
2. resolveActiveTenant()
3. requireTenantMembership()
4. resolveActiveCompany()
5. requireCompanyGrant()
6. validateQueryInput()
7. requirePermission()
8. executeCompanyScopedQuery()
9. return typed result
```

Client components must not call the database directly.
Pages must not bypass feature `server.ts` entrypoints for sensitive reads.

## 11. Tenant and Data Governance

Tenant isolation is mandatory.

### Database rules

- PostgreSQL 16 is the baseline relational database.
- Drizzle ORM is the baseline schema, query, and migration layer.
- Supabase Postgres and Neon Postgres are the preferred managed database options.
- Multi-schema database organization is allowed when it maps to clear ownership boundaries.
- Database schemas must not become feature bypass paths.
- Every table must have an owning package or feature family.
- Cross-schema access must go through approved server-side queries or execution flows.
- Drizzle schemas must preserve tenant and company scoping rules where the record is business-owned.

### Tenant rules

- Every business record must belong to a tenant.
- Every query must be tenant-scoped.
- Every mutation must verify active tenant membership before execution.
- Tenant context must be explicit in server-side execution.

### Hostname and subdomain rules

- XForge should treat subdomain-based tenancy as the default application model.
- The canonical tenant URL shape is `{tenantSlug}.{appBaseDomain}`.
- Tenant resolution must happen on the server from the normalized request host before sensitive reads, mutation entry, or company resolution.
- The client must not be allowed to override tenant context with query params, local storage, or ad hoc headers.
- Trusted proxy headers such as `x-forwarded-host` may be used only when the deployment boundary is trusted and normalized in one place.
- The apex domain and reserved hosts such as `www`, `app`, `admin`, `docs`, and `api` are platform routes, not tenant routes.
- Local development should support explicit host-based tenant resolution, for example `tenant.localhost` or an equivalent dev domain.
- Background jobs, webhooks, cron handlers, and queue consumers that do not originate from a tenant host must receive explicit tenant context from trusted server-side inputs.
- Custom domains may be added later as aliases to the same tenant resolution contract, but they must not replace the canonical server-side tenant membership checks.
- Tenant-specific site identity, logos, and theme overrides should be resolved from the server-side tenant context, not from a global mutable branding singleton.

### Company rules

- A company is a legal or operational entity inside a tenant.
- One tenant may contain multiple companies.
- Company access is never implied by tenant membership alone.
- Access to a company must be granted explicitly.
- Company grants are first-class records and must not be inferred from tenant membership or UI state.
- Cross-company access must declare the target company and the grant that authorizes it.
- Company-scoped records must include `companyId` in addition to `tenantId`.
- If a feature is company-aware, company resolution and grant checks must happen on the server before mutation or sensitive reads.

### Standard tenant-owned fields

Tenant-owned tables should include:

```txt
id
tenantId
createdAt
updatedAt
createdBy
updatedBy
deletedAt
version
```

Company-scoped tables should additionally include:

```txt
companyId
```

### Record lifecycle

- Use soft delete for normal business records.
- Use hard delete only for disposable technical records.
- Use append-only history or audit events for high-risk records.

## 12. Audit Governance

Audit is not logging.

Every successful mutation must write an audit event.

Audit events must include:

```txt
tenantId
actorId
action
targetType
targetId
before
after
reason
requestId
operationId
createdAt
```

When the action is company-scoped, the audit event must also include `companyId`.
When a company grant is used, the audit event must also include `grantId`.

Audit is part of the execution contract, not an optional side effect.

## 13. Permission Governance

Permission finality belongs on the server.

- Supabase Auth, Neon Auth, or Auth0 may provide identity, sessions, SSO, and external provider login.
- Auth provider roles or claims must be mapped into XForge permission contracts before use.
- The auth provider must not replace tenant membership, company grants, execution checks, or audit writing.
- Auth establishes user identity. The request host establishes tenant context. Both must be validated before company-aware access is granted.
- The UI may hide or disable actions based on permission state.
- The server must always re-check permissions before execution.
- A client-side disabled state is never sufficient authorization.
- Permission checks should be explicit and readable, not embedded in ad hoc page logic.

## 14. Metadata Governance

Metadata may define:

- presentation
- field labels
- table columns
- filters
- validation hints
- simple workflow configuration

Metadata must not define:

- accounting rules
- payroll rules
- inventory valuation
- approval authority
- permission finality
- security enforcement

Metadata describes the system. It does not govern the system.

## 15. API Governance

XForge must not expose two competing mutation systems.

### Initial stance

- Use Next.js server actions for internal app mutations first.
- Add a separate REST API later only if there is a clear runtime or integration need.

### If REST is added later

- REST handlers must call the same execution and domain layer used by server actions.
- REST must not become a second business-logic path.
- XForge should stay on the Node.js runtime through Next.js unless a future architecture decision introduces a separate service boundary.
- Any future standalone Node service must call the same feature `server.ts` entrypoints and execution contracts as the Next.js app.
- Kong may sit in front of REST APIs, but application authorization remains inside XForge.

### Integration governance

- Outbound and inbound third-party adapters belong under `packages/integrations/<vendor>`.
- These packages may own provider auth, client transport, webhook verification, retries, and mapping helpers.
- They must not own ERP business workflow decisions, permission finality, audit bypasses, or direct database mutation authority.
- Business decisions about when XForge synchronizes with Linear, Workday, or any other external system remain in feature packages, execution flows, or application orchestration.
- Do not introduce `packages/sdk` as a foundation package for this use case.
- Add a future XForge SDK only when external consumers need a stable XForge API client, and generate it from the canonical `@repo/api` and `@repo/openapi` contracts rather than hand-maintaining a parallel surface.

## 16. UI Governance

The UI must support the following states:

```txt
loading
empty
error
forbidden
ready
```

### Tables

All tables must support:

- pagination
- sorting
- filtering
- row actions
- empty state
- permission-aware actions

### Forms

All forms must support:

- server validation
- field errors
- submit pending state
- cancel path
- permission-aware disabled fields

## 17. Environment and Configuration

Environment handling must be explicit and typed.

### Rules

- Validate environment variables on the server with schema-based validation.
- Keep package-level env access isolated to the packages that need it.
- Compose app-level env from package-level env contracts.
- Avoid hidden build-time dependencies.

### Operational principle

If a package is imported into an app, its required environment variables must be documented and validated.

## 18. Tooling and Workspace Rules

The workspace should define task ownership centrally in `turbo.json`.

### Required workspace behavior

- pnpm workspaces are the package manager contract.
- `package.json` must declare `packageManager` with a pinned pnpm version.
- `pnpm-workspace.yaml` must define workspace package globs.
- `build` must depend on upstream builds and tests.
- `dev` must be persistent and uncached.
- `globalDependencies` must include local env files.
- Boundary checks must exist so packages do not depend on the wrong layers.
- Boundary checks must reject `packages/features/*` importing from `packages/features/*`.
- Boundary checks must reject apps and orchestration layers importing feature internals such as `queries.ts`, `actions.ts`, `components/`, `forms/`, `tables/`, or `tests/`.
- Shared package exports must be explicit.
- Generated clients must be reproducible in CI.

### Required CI jobs

GitHub Actions should include at least:

- install and dependency verification
- formatting and lint checks
- typecheck
- unit tests
- database schema and migration validation
- Playwright smoke or E2E tests
- build validation

### Shared config packages

- `packages/typescript-config` owns shared TypeScript configs.
- `packages/next-config` owns shared Next.js configuration, analyzer wiring, image allowlists, and app-level config helpers.

## 19. Infrastructure Governance

Production infrastructure must support the ERP architecture without replacing application-level governance.

### Gateway

- Kong may route, rate-limit, and protect external API traffic.
- Kong must not be treated as authorization finality.
- Application code must still enforce auth, tenant, company grant, permission, and audit rules.

### Orchestration

- Kubernetes and Helm are not required for the XForge foundation.
- Default recommendation: do not introduce Kubernetes or Helm for the first production target.
- Add Kubernetes and Helm only when the project needs multi-service orchestration, internal networking, autoscaling, or platform ownership that cannot be handled by a managed application platform.
- Until then, prefer a simpler deployment target for the Next.js app and managed services for Postgres, auth, cache, and search.

### Infrastructure as code

- Terraform is not required for the XForge foundation.
- Default recommendation: do not introduce Terraform until cloud resource drift becomes a real operational risk.
- Add Terraform only when cloud resources become numerous enough that manual console configuration creates drift or audit risk.
- Terraform must not own application business configuration if it is introduced later.

### Monitoring

Prometheus, Grafana, and Loki should monitor:

- request latency and error rate
- database health and migration state
- audit write failures
- permission denials
- event queue lag
- search indexing lag
- cache availability

## 20. Testing Governance

Minimum tests per slice:

- typecheck
- lint
- unit tests for pure functions
- execution pipeline tests
- permission tests
- tenant isolation tests
- one happy-path E2E flow

Do not move to the next slice if the current slice cannot pass typecheck.

## 21. Delivery Governance

Each build slice must:

- build one clear capability
- avoid future modules
- avoid unrelated file churn
- include acceptance criteria
- include test requirements
- stop after completion
- summarize files changed

## 22. First Production Target

The first production-quality target is not a full ERP.

The first target is:

```txt
A tenant-scoped, permission-governed, audited packages/features/master-data/customers feature package
running on a clean monorepo foundation.
```

That module is the proving ground for the architecture.

## 23. Implementation Sequence

Recommended order:

1. Scaffold the monorepo structure.
2. Establish shared config packages.
3. Implement database, auth, permissions, audit, and execution packages.
4. Add the `packages/features/master-data/customers/src` vertical scaffold with `manifest.ts`, `index.ts`, `contract.ts`, `metadata.ts`, `shared/`, `execution/`, `queries.ts`, `actions.ts`, `server.ts`, UI composition folders, and tests.
5. Wire `apps/app` to the canonical execution pipeline through the Customers master-data feature package.
6. Add observability and harden tenant/permission checks.
7. Add `apps/api` only if the app needs a separate runtime.
8. Add optional supporting apps such as docs or storybook later.

## 24. Decision Summary

This architecture adopts the useful parts of next-forge:

- monorepo discipline
- explicit package ownership
- typed env validation
- shared config
- boundary enforcement
- deployable app composition
- selected infrastructure packages

It keeps XForge as the ERP governance source of truth for tenant isolation, company grants, permission finality, audit, execution, metadata limits, and feature ownership.

It intentionally defers SaaS-specific surface area such as payments, CMS, collaboration, AI, and feature flags until a real ERP requirement justifies them. Notifications, when needed, should remain an implicit infrastructure concern behind `packages/notifications` with Supabase Realtime and Edge Functions rather than a first-class SaaS UI dependency.

Provider swapping and extension guidance live in [`customization.md`](./customization.md).
Package-level ownership and entry-point rules live in [`packages.md`](./packages.md).
Bootstrap and environment setup guidance live in [`setup.md`](./setup.md).
