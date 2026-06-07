# Viet-ERP `saas` and `admin` Adoption Map

## Scope

This document maps the current Viet-ERP packages:

- `Viet-ERP/packages/saas`
- `Viet-ERP/packages/admin`

to the Xforge architecture and current package surface for adoption and migration planning.

The goal is not to port these packages verbatim. The goal is to split them into the Xforge boundaries that already exist, or into architecture slots that Xforge still needs to add.

## Architecture Constraints

The Xforge architecture document establishes these relevant boundaries:

- `packages/features/master-data/<feature-name>` is the canonical business feature unit.
- `contract.ts` is the source of truth for the feature boundary.
- `server.ts` is the approved public server entrypoint.
- `queries.ts` owns tenant-scoped reads.
- `actions.ts` owns mutations and must call the canonical execution pipeline.
- `packages/execution` should own the canonical mutation lifecycle.
- `packages/permissions` should own permission contracts and guards.
- `packages/audit` should own audit event shape and persistence.
- Supporting infrastructure belongs in packages like `health`, `metrics`, `observability`, `storage`, `notifications`, and `events`, not inside business feature packages.

Relevant references:

- [architecture.md](</c:/JackProject/afenda-bolt/afenda-Xforge/skills/reference/architecture.md>)
- [packages/api/README.md](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/api/README.md>)
- [packages/features/master-data/customers/README.md](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/features/master-data/customers/README.md>)

## Current Xforge Anchors

These existing Xforge packages are the immediate landing zones for extracted concepts:

- [packages/api](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/api>)
- [packages/audit](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/audit>)
- [packages/execution](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/execution>)
- [packages/database](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/database>)
- [packages/auth](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/auth>)
- [packages/health](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/health>)
- [packages/logger](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/logger>)
- [packages/metrics](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/metrics>)
- [packages/observability](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/observability>)
- [packages/openapi](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/openapi>)
- [packages/permissions](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/permissions>)
- [packages/shared](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/shared>)
- [packages/features/master-data/customers](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/features/master-data/customers>)

These architecture targets are still next-wave expansion slots:

- `packages/billing`
- `packages/commercial`
- `packages/tenancy`
- `packages/metadata`
- `packages/metadata-ui`

## File-By-File Mapping

### 1. `Viet-ERP/packages/saas/package.json`

Source: [Viet-ERP/packages/saas/package.json](</c:/JackProject/afenda-bolt/Viet-ERP/packages/saas/package.json>)

What it is:

- A mixed package manifest for pricing, subscriptions, entitlement logic, onboarding logic, and tenant provisioning.
- Declares infra dependencies that the source file does not really use yet.

Adoption decision:

- Do not migrate this manifest as a package.
- Re-split the code into smaller Xforge packages first, then create package manifests that match the actual runtime responsibilities.

Target in Xforge:

- Future `packages/billing` or `packages/commercial`
- Future `packages/tenancy`
- Existing `packages/notifications` only if the provisioning flow later emits notifications
- Existing `packages/events` only if lifecycle events are actually emitted

Migration note:

- `@vierp/database`, `@vierp/events`, and `@vierp/notifications` are declared here but are not meaningfully used by `src/index.ts`.
- Xforge should not reproduce that drift.

### 2. `Viet-ERP/packages/saas/src/index.ts`

Source: [Viet-ERP/packages/saas/src/index.ts](</c:/JackProject/afenda-bolt/Viet-ERP/packages/saas/src/index.ts>)

What it is:

- A single large commercial and tenancy policy file.
- Contains pricing, subscriptions, invoices, usage limits, onboarding, tenant provisioning, and MRR reporting.

Adoption decision:

- Do not port this file into one Xforge package.
- Split by responsibility before adoption.

Target in Xforge:

- Future `packages/billing` or `packages/commercial` for pricing and subscriptions
- Future `packages/tenancy` for tenant provisioning policy
- Future `packages/permissions` for enforceable entitlement contracts
- Future `packages/execution` for mutation orchestration
- Existing feature packages only when a real client-facing feature boundary exists

Internal symbol mapping:

| Source concern | Keep? | Xforge target | Migration note |
| --- | --- | --- | --- |
| `TierName`, `BillingCycle`, `SubscriptionStatus`, `InvoiceStatus`, `PricingPlan`, `PlanLimits` | Yes | Future `packages/billing` | Good domain types, but they belong in a dedicated commercial boundary, not inside a general `saas` bag. |
| `PRICING_PLANS` | Yes | Future `packages/billing/plans.ts` or `packages/commercial/plans.ts` | This should become the only source of truth for tier-to-module and limit definitions. |
| `createSubscription(...)` | Yes | Future `packages/billing/subscriptions.ts` | Pure logic and reusable. Keep, but wire later to persistence and real IDs. |
| `changeTier(...)` | Yes | Future `packages/billing/subscriptions.ts` plus future `packages/execution` orchestration | The commercial policy is useful, but DB mutation should not live beside pure pricing math. |
| `cancelSubscription(...)` | Yes | Future `packages/billing/subscriptions.ts` | Keep as domain logic. |
| `renewSubscription(...)` and invoice building | Yes | Future `packages/billing/invoices.ts` | Useful, but invoice number generation and payment collection need real infrastructure later. |
| `UsageMetricType`, `UsageSummary`, `UsageAlert` | Yes | Future `packages/billing/usage.ts` or `packages/permissions/usage.ts` | Good contract surface; keep the types but avoid tying them to a monolithic package. |
| `checkUsageLimits(...)` | Yes | Future `packages/permissions` with commercial input from `packages/billing` | Enforcement should feed permission and action gating. |
| `canPerformAction(...)` | Yes | Future `packages/permissions` | This is closer to policy enforcement than billing. |
| `OnboardingStep`, `OnboardingProgress` | Partial | Future `packages/tenancy/onboarding.ts` | Useful as control-plane onboarding contracts, not as a billing concern. |
| `generateOnboardingSteps(...)` | Partial | Future `packages/tenancy/onboarding.ts` | Keep the idea, but module checks must come from the canonical tier source, not local assumptions. |
| `calculateOnboardingProgress(...)` | Yes | Future `packages/tenancy/onboarding.ts` | Portable utility. |
| `TenantProvisionRequest`, `TenantProvisionResult` | Yes | Future `packages/tenancy/contracts.ts` and client-facing route `contract.ts` if exposed | Good boundary types, but the actual route must follow the Xforge `contract.ts` and `server.ts` pattern. |
| `provisionTenant(...)` | Partial | Split across future `packages/tenancy`, `packages/execution`, `packages/auth`, `packages/notifications` | The current function mixes generated credentials, onboarding, subscription creation, and login URL creation. Xforge should orchestrate these steps, not hide them in one helper. |
| `MRRReport`, `calculateMRR(...)` | Yes | Future `packages/billing/reporting.ts` | Keep as reporting/domain logic, but not inside a tenant-admin package. |
| helper functions like `getPlanPrice(...)`, `calculatePeriodEnd(...)`, `formatBillingCycle(...)` | Yes | Future `packages/billing` | Small pure helpers. |
| `generateInvoiceNumber(...)`, `generateTemporaryPassword(...)` | Replace | Invoice IDs in billing package, credentials generation via `auth` or execution flow | `generateTemporaryPassword()` especially should not become the Xforge auth pattern. |

Immediate recommendation:

- If Xforge adopts anything from this file soon, start with:
  - plan contracts
  - usage limit contracts
  - MRR calculation
- Defer tenant provisioning until Xforge has `execution`, `permissions`, and `audit` in place.

### 3. `Viet-ERP/packages/admin/package.json`

Source: [Viet-ERP/packages/admin/package.json](</c:/JackProject/afenda-bolt/Viet-ERP/packages/admin/package.json>)

What it is:

- A mixed operator/control-plane package manifest for tenant administration, monitoring, and audit.

Adoption decision:

- Do not migrate this manifest as a unit.
- Split runtime responsibilities across Xforge packages before creating the destination manifests.

Target in Xforge:

- Future control-plane feature or app package for tenant admin workflows
- Existing `packages/health`
- Existing `packages/metrics`
- Existing `packages/audit`

Migration note:

- `@vierp/events` and `@vierp/feature-flags` are declared here but not meaningfully used by `src/index.ts`.
- Xforge should not carry dead dependencies forward.

### 4. `Viet-ERP/packages/admin/src/index.ts`

Source: [Viet-ERP/packages/admin/src/index.ts](</c:/JackProject/afenda-bolt/Viet-ERP/packages/admin/src/index.ts>)

What it is:

- A mixed control-plane runtime file containing tenant admin workflows, fake monitoring, usage reporting, and audit persistence.

Adoption decision:

- Do not port as one file.
- Split tenant control-plane flows away from monitoring and audit immediately.

Target in Xforge:

- Future control-plane app or feature package for operator tenant actions
- Existing `packages/health`
- Existing `packages/metrics`
- Existing `packages/audit`
- Existing `packages/execution`
- Existing `packages/permissions`

Internal symbol mapping:

| Source concern | Keep? | Xforge target | Migration note |
| --- | --- | --- | --- |
| `TenantInfo` | Partial | Future control-plane feature `contract.ts` and `metadata.ts` | Useful shape for admin UIs, but it should be derived from real schema and feature route contracts. |
| `TenantManager.listTenants()` | Yes | Future control-plane feature `queries.ts` + `server.ts` | This should become a proper governed route if exposed to UI or clients. |
| `TenantManager.createTenant()` | Partial | Split into future `packages/tenancy`, `packages/execution`, `packages/auth`, and a control-plane feature `actions.ts` | Persisting a tenant and admin user is real, but this must stop hardcoding modules and bypassing commercial policy. |
| `TenantManager.updateTier()` | Partial | Future control-plane feature `actions.ts` calling future `packages/billing` and `packages/execution` | Keep the workflow, but the module list must come from the canonical plan source, not `admin`. |
| `TenantManager.deactivateTenant()` | Yes | Future control-plane feature `actions.ts` | Straightforward tenant lifecycle mutation, but should become auditable and permission-governed. |
| `TenantManager.getModulesForTier()` | No | Delete and replace with canonical `PRICING_PLANS` or equivalent from future `packages/billing` | This is the clearest duplication bug in the current design. |
| `SystemHealth` | Partial | Existing `packages/health` response contracts, plus `packages/metrics` if counters are added | Keep the shape idea, not the implementation. |
| `SystemMonitor.getHealth()` | Replace | Existing `packages/health` + app health routes | Xforge already has a dedicated health package and `/api/health` routes. |
| `SystemMonitor.checkDatabase()` | Replace | Existing [packages/health/checks.ts](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/health/checks.ts>) and [packages/database/db.ts](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/database/db.ts>) | This is already scaffolded in Xforge. |
| `SystemMonitor.checkModules()` | No | Do not port in current form | It is placeholder monitoring with fake ports and random latency. |
| `SystemMonitor.getUsageMetrics()` | Partial | Existing `packages/metrics` for instrumentation and future control-plane reporting `queries.ts` | The concept is valid, but the current implementation is mostly placeholders. |
| `AuditEntry` | Yes | Existing `packages/audit/contracts.ts` | Useful boundary type. |
| `AuditService.log()` | Yes | Existing `packages/audit/index.ts` or `packages/audit/writer.ts` | Real need, already available as a dedicated package boundary. |
| `AuditService.query()` | Yes | Existing `packages/audit/query.ts` and possible control-plane route contracts | Useful operator feature, but should still surface through governed route contracts. |
| exported singletons | Replace | Prefer thin server entrypoints and package-level factories | Xforge should avoid hiding broad runtime state behind singleton bags where possible. |

Immediate recommendation:

- Do not migrate `SystemMonitor`.
- Do not migrate `getModulesForTier()`.
- If adopting pieces soon, only lift:
  - list/query tenant read shapes
  - deactivation/update workflow ideas
  - audit contracts

## Cross-Package Collision To Fix During Migration

The main conflict between `saas` and `admin` is tier and tenant authority.

Current problem:

- `saas` defines the commercial truth for plans, modules, and limits.
- `admin` redefines modules again in `getModulesForTier()`.
- tenant creation is split across `provisionTenant()` and `TenantManager.createTenant()`.
- tier change is split across `changeTier()` and `updateTier()`.

Migration rule for Xforge:

- One package must own commercial truth.
- Admin/control-plane flows must call that package, not redefine it.

Recommended authority split:

- Future `packages/billing` or `packages/commercial`
  - plans
  - limits
  - subscriptions
  - invoice math
  - usage policy inputs
- Future `packages/tenancy`
  - tenant provisioning contracts
  - onboarding policy
  - tenant bootstrap orchestration helpers
- Existing `packages/permissions`
  - action gating and enforceable entitlements
- Existing `packages/audit`
  - audit event contracts and persistence
- Existing `packages/execution`
  - canonical mutation lifecycle
- Existing `packages/health`
  - runtime probes only
- Existing `packages/metrics`
  - counters, gauges, and reporting inputs

## How This Should Surface In Xforge

For any client-facing or control-plane HTTP endpoint created from this migration:

1. Define the API contract in feature `contract.ts`.
2. Implement reads in `queries.ts`.
3. Implement mutations in `actions.ts`.
4. Expose approved behavior through `server.ts`.
5. Build the route with `@repo/api`.
6. Register the same contract in OpenAPI.

Current working example:

- [packages/features/master-data/customers/src/contract.ts](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/features/master-data/customers/src/contract.ts>)
- [packages/features/master-data/customers/src/server.ts](</c:/JackProject/afenda-bolt/afenda-Xforge/packages/features/master-data/customers/src/server.ts>)
- [apps/app/app/api/customers/route.ts](</c:/JackProject/afenda-bolt/afenda-Xforge/apps/app/app/api/customers/route.ts>)
- [apps/app/app/api/openapi/_spec.ts](</c:/JackProject/afenda-bolt/afenda-Xforge/apps/app/app/api/openapi/_spec.ts>)

Do not expose future tenant-admin or billing routes by importing arbitrary internals directly from package files.

## Recommended Migration Order

1. Extract the commercial source of truth from `saas/src/index.ts`.
2. Delete the duplicated tier-to-module logic conceptually represented by `admin.getModulesForTier()`.
3. Keep wiring current feature packages through existing `packages/audit`, `packages/permissions`, and `packages/execution` boundaries.
4. Create a dedicated control-plane feature or app for tenant admin routes.
5. Implement tenant provisioning and tier-change workflows only after `packages/tenancy` and `packages/billing` or `packages/commercial` land.

## Bottom Line

- `saas` should not be adopted as one package.
- `admin` should not be adopted as one package.
- `health` and `audit` do not belong in the same control-plane file.
- plan and entitlement truth must exist in one place only.
- next-wave Xforge adoption should be split into commercial, tenancy, and control-plane route layers, while audit, permissions, and execution remain the current shared backbone.
