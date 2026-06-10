# Customization Architecture

## Business Definition

**Customization Architecture is the XForge package capability that allows tenant- and company-scoped metadata overrides to adapt approved ERP presentation surfaces without redeploying code, while keeping business behavior, permissions, audit obligations, and execution authority under platform control.**

---

# Customization Architecture Includes

| Area | What It Covers |
| --- | --- |
| **Customization Contracts** | TypeScript contracts for tenant and company customization payloads, lifecycle metadata, repository ports, audit descriptors, import/export fixtures, and resolution results |
| **Schema Validation** | Strict Zod validation for customization shape, lifecycle rules, scope rules, duplicate override keys, and fixture format |
| **Metadata-Aware Validation** | Validation of customization payloads against feature metadata, canonical node ids, metadata fingerprints, customization policy, safe actions, and supported surfaces |
| **Deterministic Resolution** | Safe merge helpers that resolve feature metadata with tenant and company overlays in a fixed order for runtime and preview paths |
| **Fixture Serialization** | Deterministic import/export helpers and metadata node snapshots for environment promotion, drift detection, and review workflows |

---

# Customization Architecture Does Not Include

| Excluded Area | Owned By |
| --- | --- |
| UI rendering primitives and metadata rendering | `@repo/ui` and `@repo/metadata-ui` |
| Admin editor screens, publish workflow UI, and rollback UI | Future admin package or app layer |
| Database persistence implementation | Infrastructure or app package with database access |
| Permission finality and execution authorization | Execution and permissions layers |
| Audit event emission sink | Audit package or calling layer |
| Feature-owned default metadata | Owning feature packages |
| Business rules, server actions, and mutation execution | Feature execution pipeline |
| Tenant membership and company grant authority | Identity, membership, and tenant/company context layers |

---

# Source of Truth Ownership

| Data / Business Object | Source of Truth | Notes |
| --- | --- | --- |
| Feature metadata defaults | Owning feature package and `@repo/metadata` contracts | Customization may overlay approved presentation surfaces only; it must not become the canonical definition of the feature model. |
| Tenant and company identity context | Trusted execution context outside this package | Customization consumes tenant/company scope as input, but must not resolve authority from client-controlled input. |
| Customization payload contract | `@repo/customization` | This package owns the payload shape, lifecycle contract, validation issues, fixture shape, and resolution result contract. |
| Customization persistence state | Future repository implementation behind `CustomizationRepositoryContract` | This package defines repository ports only; it must not own direct database access. |
| Audit event persistence | Audit layer or caller | This package defines stable audit operation descriptors but must not emit audit records directly. |

---

# Boundary Rules

| Rule | Requirement |
| --- | --- |
| Tenant boundary | All runtime and preview resolution must receive trusted tenant and optional company scope before customization layers are loaded. |
| Permission boundary | Publish, archive, rollback, import, and admin mutation authority must be enforced outside this package before repository operations execute. |
| Audit boundary | State-changing customization operations must be auditable, but this package must expose descriptors instead of writing audit events directly. |
| API boundary | Public routes and admin workflows must not bypass customization contracts, schema validation, metadata-aware validation, or lifecycle rules. |
| UI boundary | UI and metadata renderers must consume resolved metadata projections, not raw customization persistence records. |
| Package boundary | `@repo/customization` may depend on `@repo/metadata` and `zod`, but must not depend on UI, database, auth, execution, permissions, audit, feature packages, or apps. |

These boundaries are mandatory because customization is a governed overlay, not a second execution system.

---

# Customization Architecture Requirement Statement

| Requirement | Description |
| --- | --- |
| **Customization Architecture** | Provides governed metadata overlay contracts, validation, and deterministic resolution for tenant and company ERP customization while preserving feature-owned business rules, trusted scope enforcement, and platform control. |

---

# Enterprise Functional Requirements

| Code | Requirement |
| --- | --- |
| **CUST-001** | System shall define strict contracts for tenant-scoped and company-scoped customization payloads. |
| **CUST-002** | System shall validate customization payload shape, lifecycle metadata, scope rules, and duplicate override keys before resolution. |
| **CUST-003** | System shall validate customization payloads against feature metadata, metadata customization policy, canonical metadata node identity, and supported metadata surfaces. |
| **CUST-004** | System shall resolve feature metadata with tenant and company overlays in a deterministic order without mutating canonical feature metadata. |
| **CUST-005** | System shall support runtime resolution that uses published customization only and preview resolution that can include drafts through trusted paths. |
| **CUST-006** | System shall fail closed to base metadata when published customization layers are invalid for runtime resolution. |
| **CUST-007** | System shall detect metadata drift such as stale fingerprints, renamed nodes, removed nodes, and node shape changes. |
| **CUST-008** | System shall restrict overrides to approved presentation surfaces and reject unsafe action, workflow, scope, or policy violations. |
| **CUST-009** | System shall define repository contracts for saving drafts, publishing, archiving, rollback, listing versions, loading runtime layers, loading preview layers, and import/export operations without implementing persistence in this package. |
| **CUST-010** | System shall provide deterministic import and export fixture support with metadata snapshots suitable for review and promotion across environments. |
| **CUST-011** | System shall expose stable audit operation descriptors for customization lifecycle operations without directly emitting audit events. |
| **CUST-012** | System shall keep customization package dependencies limited to metadata and validation concerns and reject cross-layer execution, auth, database, UI, and app coupling. |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria |
| --: | --- |
| 1 | A valid tenant-scoped customization contract parses successfully and rejects unknown properties, empty required identifiers, and unsupported scope values. |
| 2 | A company-scoped customization is rejected when `companyId` is missing, and a tenant-scoped customization is rejected when `companyId` is present. |
| 3 | Duplicate override keys or duplicate layout references are rejected during contract validation. |
| 4 | A customization targeting the wrong feature id, wrong entity, unsupported scope, unknown metadata key, or removed metadata node is rejected during metadata-aware validation. |
| 5 | Policy-less overrides for hidden required fields, system-owned fields, unsafe actions, or unsupported metadata surfaces are rejected. |
| 6 | Runtime resolution applies published tenant customization before company customization and preserves deterministic ordering. |
| 7 | Draft customization is excluded from normal runtime resolution and included only in preview-specific resolution paths. |
| 8 | Invalid published customization causes runtime resolution to fall back to base metadata instead of applying unsafe output. |
| 9 | Fixture export is deterministic and includes enough metadata snapshot information to detect renamed, removed, or structurally changed metadata nodes on import review. |
| 10 | Repository, audit, and lifecycle contracts exist without introducing direct database, UI, execution, or audit-sink implementation into this package. |

---

# Definition of Done

This section replaces the former standalone `dod.md` for `@repo/customization`. A customization change is done only when it is safe for tenant and company ERP customization without weakening platform governance.

| Area | Done When |
| --- | --- |
| Architecture and boundaries | The change keeps `@repo/customization` independent from UI, metadata-ui, database, auth, permissions, audit, execution, apps, and feature internals, and it remains an overlay on feature-owned metadata. |
| Contracts | Public types are exported through stable package paths, scope behavior is explicit, lifecycle fields exist when publishable state is involved, and new customizable or forbidden surfaces are reflected in this document. |
| Schemas | Runtime schemas are strict, reject unknown properties, enforce tenant/company scope rules, reject duplicate override keys, and provide diagnostics usable by preview and publish workflows. |
| Metadata-aware validation | Publish-time validation confirms feature and entity identity, canonical node targeting, reference integrity, safe action policy, metadata drift diagnostics, allowed sort keys, field safety rules, and company-scope eligibility. |
| Resolution | Resolution is deterministic, does not mutate base metadata, applies tenant before company, removes hidden items only from approved presentation surfaces, rejects mismatched overlays, and excludes drafts from normal runtime rendering. |
| Lifecycle and repository readiness | Draft, published, and archived lifecycle semantics are explicit, versioning and metadata fingerprint support exist, and repository behavior remains contract-only without importing database or app code. |
| Admin and audit integration | Admin workflows remain outside this package, but publish, archive, import, rollback, and validation operations are modeled so consuming layers can permission-gate and audit them correctly. |
| Import and export | Fixture export is deterministic, schema-validated, metadata-validated, fingerprint-aware, and never auto-publishes without a trusted admin operation. |
| Tests and verification | Every changed customization behavior has targeted tests, and `pnpm --filter @repo/customization lint`, `pnpm --filter @repo/customization typecheck`, and `pnpm --filter @repo/customization test` pass. |
| Documentation and release readiness | This document reflects new surfaces, lifecycle states, dependencies, and integration boundaries, and any remaining admin or persistence gaps are explicitly documented as future external integration. |

---

# Implementation Status

**Status:** Partial

**Last audited:** 2026-06-10

This document reflects the actual codebase for the `@repo/customization` package as audited on 2026-06-10. The package already implements strict customization contracts, schema validation, metadata-aware validation, deterministic tenant/company layering, runtime and preview resolution helpers, deterministic fixture serialization, repository port contracts, and stable audit operation descriptors. It intentionally does not implement persistence adapters, admin UI, permission enforcement, or audit event sinks.

| Area | Status | Evidence |
| --- | --- | --- |
| Feature contracts and schemas | Implemented | [`src/contracts/customization.contract.ts`](./src/contracts/customization.contract.ts), [`src/schemas/customization.schema.ts`](./src/schemas/customization.schema.ts) |
| Authorization and policy boundary | Partial | [`src/validation/validate-customization-against-metadata.ts`](./src/validation/validate-customization-against-metadata.ts), [`architecture-and-feature-requirement.md`](./architecture-and-feature-requirement.md) |
| Source-of-truth integration | Implemented for metadata integration only | [`src/validation/validate-customization-against-metadata.ts`](./src/validation/validate-customization-against-metadata.ts), [`src/internal/metadata-node-resolution.ts`](./src/internal/metadata-node-resolution.ts) |
| Repository and persistence | Partial: contract only, no adapter | [`src/contracts/customization.contract.ts`](./src/contracts/customization.contract.ts) |
| Queries, projections, or read models | Implemented as metadata resolution helpers | [`src/resolution/resolve-customized-metadata.ts`](./src/resolution/resolve-customized-metadata.ts), [`src/resolution/resolve-layered-customization.ts`](./src/resolution/resolve-layered-customization.ts) |
| Actions, workflows, or mutations | Partial: lifecycle contract only, no execution implementation | [`src/contracts/customization.contract.ts`](./src/contracts/customization.contract.ts) |
| HTTP or API routes | Not started in this package by design | [`package.json`](./package.json) |
| Requirement coverage registry | Not implemented as a dedicated registry file | [`architecture-and-feature-requirement.md`](./architecture-and-feature-requirement.md) |
| Verification tests | Implemented | [`src/tests/customization.schema.test.ts`](./src/tests/customization.schema.test.ts), [`src/tests/resolve-customized-metadata.test.ts`](./src/tests/resolve-customized-metadata.test.ts) |

### Planning Mark

- `Current audited slices: CUST-001, CUST-002, CUST-003, CUST-004, CUST-005, CUST-006, CUST-007, CUST-008, CUST-009, CUST-010, CUST-011, CUST-012`
- `Slice status: partial; package-owned contracts and resolution are implemented, platform integrations remain external by design`
- `Feature status: partially implemented as intended package boundary; not a full end-to-end customization platform on its own`

---

# Requirement Coverage

This section lists the package requirements that have direct code evidence in the current `@repo/customization` implementation. Requirements that depend on external layers remain partial where this package intentionally stops at contracts and validation boundaries.

| Requirement | Status | Evidence |
| --- | --- | --- |
| CUST-001 | Implemented | [`src/contracts/customization.contract.ts`](./src/contracts/customization.contract.ts), [`src/schemas/customization.schema.ts`](./src/schemas/customization.schema.ts) |
| CUST-002 | Implemented | [`src/schemas/customization.schema.ts`](./src/schemas/customization.schema.ts), [`src/validation/parse-customization.ts`](./src/validation/parse-customization.ts), [`src/validation/assert-customization-contract.ts`](./src/validation/assert-customization-contract.ts), [`src/tests/customization.schema.test.ts`](./src/tests/customization.schema.test.ts) |
| CUST-003 | Implemented | [`src/validation/validate-customization-against-metadata.ts`](./src/validation/validate-customization-against-metadata.ts), [`src/internal/metadata-node-resolution.ts`](./src/internal/metadata-node-resolution.ts), [`src/tests/resolve-customized-metadata.test.ts`](./src/tests/resolve-customized-metadata.test.ts) |
| CUST-004 | Implemented | [`src/resolution/resolve-customized-metadata.ts`](./src/resolution/resolve-customized-metadata.ts), [`src/resolution/resolve-layered-customization.ts`](./src/resolution/resolve-layered-customization.ts), [`src/tests/resolve-customized-metadata.test.ts`](./src/tests/resolve-customized-metadata.test.ts) |
| CUST-005 | Implemented | [`src/resolution/resolve-layered-customization.ts`](./src/resolution/resolve-layered-customization.ts), [`src/tests/resolve-customized-metadata.test.ts`](./src/tests/resolve-customized-metadata.test.ts) |
| CUST-006 | Implemented | [`src/resolution/resolve-layered-customization.ts`](./src/resolution/resolve-layered-customization.ts), [`src/tests/resolve-customized-metadata.test.ts`](./src/tests/resolve-customized-metadata.test.ts) |
| CUST-007 | Implemented | [`src/validation/validate-customization-against-metadata.ts`](./src/validation/validate-customization-against-metadata.ts), [`src/internal/customization-fixture-snapshot.ts`](./src/internal/customization-fixture-snapshot.ts), [`src/tests/resolve-customized-metadata.test.ts`](./src/tests/resolve-customized-metadata.test.ts) |
| CUST-008 | Implemented | [`src/validation/validate-customization-against-metadata.ts`](./src/validation/validate-customization-against-metadata.ts), [`src/schemas/customization.schema.ts`](./src/schemas/customization.schema.ts), [`src/tests/resolve-customized-metadata.test.ts`](./src/tests/resolve-customized-metadata.test.ts) |
| CUST-009 | Partial | [`src/contracts/customization.contract.ts`](./src/contracts/customization.contract.ts) |
| CUST-010 | Implemented | [`src/serialization/customization-fixture.ts`](./src/serialization/customization-fixture.ts), [`src/internal/customization-fixture-snapshot.ts`](./src/internal/customization-fixture-snapshot.ts), [`src/tests/resolve-customized-metadata.test.ts`](./src/tests/resolve-customized-metadata.test.ts) |
| CUST-011 | Implemented | [`src/contracts/customization.contract.ts`](./src/contracts/customization.contract.ts) |
| CUST-012 | Implemented | [`package.json`](./package.json), [`src/index.ts`](./src/index.ts) |

---

# Element-by-Element Code Evaluation

This evaluation reflects the actual codebase as of 2026-06-10 for the current customization package boundary.

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| Contract Model | Implemented. The package defines customization scopes, lifecycle states, validation issue codes, repository contracts, audit descriptors, fixture contracts, and runtime resolution result types. | [`src/contracts/customization.contract.ts`](./src/contracts/customization.contract.ts) | Keep lifecycle, repository, and audit contracts stable so future admin and infrastructure layers can integrate without redefining the package boundary. |
| Strict Schema Validation | Implemented. Contract parsing enforces unknown-property rejection, scope rules, duplicate keys, duplicate layout references, lifecycle chronology, and rollback ordering. | [`src/schemas/customization.schema.ts`](./src/schemas/customization.schema.ts), [`src/validation/parse-customization.ts`](./src/validation/parse-customization.ts), [`src/validation/assert-customization-contract.ts`](./src/validation/assert-customization-contract.ts), [`src/tests/customization.schema.test.ts`](./src/tests/customization.schema.test.ts) | Add more schema rules only when they remain package-local and do not pull execution, auth, or persistence concerns into this layer. |
| Metadata-Aware Validation | Implemented. Validation checks feature/entity identity, scope policy, stale fingerprints, canonical node targeting, duplicate canonical targets, reference integrity, field/section/form/filter/table policies, safe action rules, and supported surfaces. | [`src/validation/validate-customization-against-metadata.ts`](./src/validation/validate-customization-against-metadata.ts), [`src/internal/metadata-node-resolution.ts`](./src/internal/metadata-node-resolution.ts), [`src/tests/resolve-customized-metadata.test.ts`](./src/tests/resolve-customized-metadata.test.ts) | Future feature metadata must continue to declare explicit customization policy rather than relying on package-local exceptions. |
| Deterministic Metadata Resolution | Implemented. The package resolves customized feature and entity metadata with stable ordering, hidden-field cleanup, and tenant-before-company layering. | [`src/resolution/resolve-customized-metadata.ts`](./src/resolution/resolve-customized-metadata.ts), [`src/resolution/resolve-layered-customization.ts`](./src/resolution/resolve-layered-customization.ts), [`src/tests/resolve-customized-metadata.test.ts`](./src/tests/resolve-customized-metadata.test.ts) | Preserve deterministic layering and fail-closed behavior; do not allow ad hoc merging in callers. |
| Runtime vs Preview Boundaries | Implemented. Published overlays drive runtime resolution, while preview helpers may include drafts and surface warnings under trusted preview semantics. | [`src/resolution/resolve-layered-customization.ts`](./src/resolution/resolve-layered-customization.ts), [`src/tests/resolve-customized-metadata.test.ts`](./src/tests/resolve-customized-metadata.test.ts) | Keep preview-only semantics explicit so drafts never leak into normal runtime paths. |
| Fixture Import/Export And Drift Review | Implemented. Fixture serialization is deterministic and includes metadata snapshot support for drift, rename, removal, and structural change review. | [`src/serialization/customization-fixture.ts`](./src/serialization/customization-fixture.ts), [`src/internal/customization-fixture-snapshot.ts`](./src/internal/customization-fixture-snapshot.ts), [`src/tests/resolve-customized-metadata.test.ts`](./src/tests/resolve-customized-metadata.test.ts) | Future environment-promotion workflows should reuse fixture review results instead of re-implementing drift checks elsewhere. |
| Repository Boundary | Partial. Repository operations are defined as contracts, but no persistence adapter exists in this package. | [`src/contracts/customization.contract.ts`](./src/contracts/customization.contract.ts) | Implement adapters in infrastructure or admin layers only; do not add direct database access here. |
| Audit Boundary | Partial. Stable audit operation names and descriptor shape exist, but audit emission is intentionally left to consuming layers. | [`src/contracts/customization.contract.ts`](./src/contracts/customization.contract.ts) | Preserve this split so audit sinks remain platform-owned and customization remains a pure contract/validation package. |
| Package Dependency Discipline | Implemented. The package exports contracts, schemas, serialization, resolution, and validation only, with dependencies limited to metadata and Zod. | [`package.json`](./package.json), [`src/index.ts`](./src/index.ts) | Do not add dependencies on UI, auth, execution, database, permissions, features, or apps to close unrelated platform gaps. |

---

# Verification Summary

1. `pnpm --filter @repo/customization typecheck` - passed on 2026-06-10.
2. `pnpm --filter @repo/customization test` - passed on 2026-06-10 with 42 tests passing.
3. `pnpm --filter @repo/customization lint` - passed on 2026-06-10.

Verification proves the package contracts and runtime helpers compile, pass tests, and are lint-clean.

---

# Audience

This document is for engineers building or reviewing customization contracts, metadata rendering boundaries, admin tooling integration, persistence adapters, and feature metadata customization policy.

---

# Decision Enabled

Use this document to decide whether a change belongs in `@repo/customization`, a feature package, `@repo/metadata-ui`, an admin package, or an execution, permission, audit, or infrastructure package.

---

# Source Of Truth References

This package architecture must stay compatible with:

- [`../../skills/reference/architecture.md`](../../skills/reference/architecture.md)
- [`../../skills/reference/packages.md`](../../skills/reference/packages.md)
- [`../../skills/reference/customization.md`](../../skills/reference/customization.md)
