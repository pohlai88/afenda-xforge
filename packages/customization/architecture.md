# Customization Architecture

`@repo/customization` owns governed metadata override contracts for tenant and company ERP customization.

The package exists so tenants can adapt their ERP screens without redeploying code, while XForge keeps enforcement, audit, permissions, and business behavior under platform control.

## Audience

This document is for engineers building or reviewing customization contracts, metadata rendering, admin tooling, persistence adapters, and feature metadata.

## Decision Enabled

Use this document to decide whether a change belongs in `@repo/customization`, a feature package, `@repo/metadata-ui`, an admin package, or an execution/security package.

## Current State

The package currently provides:

- strict Zod schemas for tenant and company customization payloads
- TypeScript contracts for approved override surfaces
- lifecycle, rollback, repository-port, and audit descriptor contracts
- metadata resolution helpers that apply safe overrides to feature-owned metadata
- metadata-aware validation helpers for publish-time and preview-time enforcement
- deterministic tenant/company layering helpers for runtime and preview paths
- import/export fixture helpers with deterministic serialization
- tests for schema validation, mismatch rejection, and metadata resolution

The package does not yet provide:

- persistence adapters
- draft/publish workflow
- versioning or rollback
- audit event emission
- admin UI
- permission checks

Those gaps are intentional boundaries, not permission to add database, auth, UI, or execution dependencies here.

## Core Principle

Customization is a governed overlay on top of feature-owned metadata.

Feature metadata defines the system model. Tenant and company customization may change only approved metadata surfaces used for presentation and layout. It must never change canonical business behavior, security authority, tenant isolation, company enforcement, audit obligations, or execution flow.

This follows mature ERP patterns:

- ERPNext/Frappe keeps base DocTypes intact and stores Custom Fields, Customize Form changes, and Property Setters as non-destructive customization objects.
- Odoo separates model/view extension from access rights, record rules, and core workflow enforcement.
- XForge follows the same split: metadata overlays are configurable, authority remains governed.

## Ownership

`@repo/customization` owns:

- tenant-scoped customization contracts
- company-scoped customization contracts
- customization schema validation
- metadata-compatible override validation
- deterministic override resolution
- lifecycle contract types for draft, published, archived, and rollback-ready customization
- repository port contracts for future persistence adapters
- import/export fixture contract shapes

`@repo/customization` does not own:

- UI rendering
- admin screens
- database persistence implementation
- tenant membership
- company grants
- permission finality
- audit emission
- business rules
- server actions
- execution pipeline behavior
- feature-owned default metadata

## Allowed Override Surfaces

Tenant and company customization may alter:

- feature title and description
- field label, description, placeholder, visibility, and order
- section label, description, visibility, columns, and field grouping
- form label, layout, visibility, and section ordering
- table title, columns, column labels, column visibility, column order, width, and alignment
- filter labels and visibility
- safe action label, visibility, and placement
- approved presentation tokens such as density, tone, variant, icon, and size

## Forbidden Override Surfaces

Tenant and company customization must not alter:

- tenant id resolution
- company id resolution
- permission grants or final permission decisions
- role membership
- audit requirements
- execution pipeline selection
- mutation behavior
- validation rules that affect persisted business data
- required system fields unless the owning feature explicitly marks them customizable
- feature-owned schema semantics
- workflow transitions
- accounting, payroll, inventory, or compliance rules
- direct database queries
- direct server actions
- renderer implementation

## Package Boundary Rules

Allowed dependencies:

- `customization -> metadata`
- `customization -> zod`
- `customization -> shared type-only utilities`, when needed and architecture-approved

Forbidden dependencies:

- `customization -> ui`
- `customization -> metadata-ui`
- `customization -> database`
- `customization -> auth`
- `customization -> execution`
- `customization -> permissions`
- `customization -> audit`
- `customization -> features`
- `customization -> apps`

The intended package split is:

```txt
feature metadata   -> feature-owned defaults
customization      -> tenant and company metadata overlays
metadata-ui        -> renderer composition
ui                 -> primitive components
admin package      -> editor, workflow, publish, rollback
database adapter   -> persistence implementation
execution          -> authoritative mutations and permission gates
audit              -> audit event sink
```

## Runtime Resolution Flow

Runtime customization must resolve from trusted server context.

```txt
trusted request context
  -> tenant and company identity
  -> load published customization overlays
  -> validate overlays against current feature metadata
  -> resolve base metadata + tenant overlay + company overlay
  -> pass resolved metadata to metadata-ui
```

The client must not select tenant, company, or customization payloads through query params, local storage, or ad hoc headers.

## Layering Rules

Resolution order must be deterministic:

```txt
feature-owned metadata
  -> published tenant customization
  -> published company customization
```

Company customization is allowed only when the feature is company-aware and the trusted context contains an authorized company scope.

Future user preferences may be added only for non-authoritative view preferences, such as local column density or personal sort preference. User preferences must not hide required operational fields or change action availability.

## Validation Requirements

Shape validation is not enough for enterprise customization.

Every customization must also be validated against the feature metadata it targets:

- `featureId` must match metadata id
- `entity` must match metadata entity
- tenant scope must not include `companyId`
- company scope must include `companyId`
- every field override key must exist in metadata fields
- every section override key must exist in metadata sections
- every section `fieldKeys` entry must exist in metadata fields
- every form override key must exist in metadata forms
- every form `sectionKeys` entry must exist in metadata sections
- every table override key must exist in metadata tables
- every table column override key must exist in metadata table columns
- every column `field` reference must exist in metadata fields
- `defaultSort` must target a known sortable column or allowed metadata sort key
- duplicate override keys must be rejected
- hidden required/system fields must be rejected unless explicitly allowed by metadata policy
- action overrides must target feature-declared safe actions only

Validation failures must be explicit enough for admin UI preview and publish workflows.

## Lifecycle Model

Enterprise customization requires lifecycle state. The contract model should support:

- `draft`: editable but not active for normal users
- `published`: active runtime customization
- `archived`: retained for history and rollback but not active

Each customization version should carry:

- stable customization id
- tenant id
- optional company id
- feature id
- entity
- status
- version
- base metadata version or fingerprint
- created by
- created at
- updated by
- updated at
- published by
- published at
- archived by
- archived at

Runtime resolution must use only published customization unless an admin preview explicitly requests a draft through a trusted server-side preview path.

## Repository Port

`@repo/customization` may define persistence ports but must not implement database access.

Future repository contracts should support:

- load published customization by tenant, optional company, feature id, and entity
- save draft customization
- publish draft customization
- archive customization
- list customization versions for a tenant and feature
- load a version for rollback preview

Database implementation belongs in an app, admin, or infrastructure package that is allowed to depend on the database.

## Admin Integration

Admin tooling should be built outside this package.

The future admin package should provide:

- governed customization editor
- metadata-aware field picker
- preview before publish
- validation diagnostics
- role-gated publish action
- rollback and archive actions
- audit history display
- import/export workflow

All admin mutations must go through the canonical execution pipeline and permission checks. `@repo/customization` can define the contract and validation helpers, but it must not bypass execution.

## Audit Integration

`@repo/customization` should expose stable operation names or event descriptors for consumers, but it must not emit audit events directly.

Expected auditable operations:

- customization draft created
- customization draft updated
- customization validated
- customization published
- customization archived
- customization rollback requested
- customization rollback published
- customization import attempted
- customization export generated

Audit payloads must include tenant id, optional company id, feature id, entity, customization id, version, actor id, and result.

## Import And Export

Customization fixtures allow safe promotion between environments.

Import must:

- parse strict schema
- validate against current metadata
- detect metadata fingerprint mismatch
- reject unknown keys unless explicitly imported as draft with warnings
- never publish automatically unless a trusted admin operation approves publish

Export must:

- include lifecycle metadata
- include base metadata version or fingerprint
- exclude secrets and runtime-only context
- be deterministic for review and source control

## Failure Modes

Expected failure modes and required behavior:

- mismatched feature id: reject
- mismatched entity: reject
- unknown override key: reject during metadata-aware validation
- stale metadata version: warn in draft, reject publish unless reviewed
- tenant/company scope mismatch: reject
- invalid company scope for non-company-aware feature: reject
- hidden required field: reject unless metadata explicitly permits it
- missing customization: return base metadata
- invalid published customization: fail closed to base metadata and emit operational signal from the calling layer

## Testing Requirements

Package tests must cover:

- schema shape validation
- tenant/company scope rules
- duplicate override key rejection
- metadata-aware validation
- hidden field behavior
- field, section, form, table, filter, action, and presentation merge behavior
- tenant and company layering order
- published-only runtime resolution
- draft preview resolution
- import/export round trip
- stale metadata fingerprint handling

## Enterprise Upgrade Roadmap

Recommended sequence:

1. Add metadata-aware validation helpers.
2. Add duplicate-key rejection across override arrays.
3. Add lifecycle contract types.
4. Add deterministic tenant/company layering resolver.
5. Add repository port interfaces.
6. Add audit operation descriptors.
7. Add import/export fixture contracts.
8. Integrate with future admin package through execution pipeline.

Do not add database, UI, auth, permission, audit, or feature package dependencies to complete this roadmap.

## Source Of Truth

This package-level architecture must stay compatible with:

- [`../../skills/reference/architecture.md`](../../skills/reference/architecture.md)
- [`../../skills/reference/packages.md`](../../skills/reference/packages.md)
- [`../../skills/reference/customization.md`](../../skills/reference/customization.md)
