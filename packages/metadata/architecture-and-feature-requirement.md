# Metadata Architecture

## Business Definition

**Metadata Architecture is the XForge package capability that defines declarative contracts, schemas, constants, and validation helpers for feature and entity metadata without owning UI rendering, execution behavior, or permission finality.**

---

# Metadata Architecture Includes

| Area | What It Covers |
| --- | --- |
| **Declarative Contracts** | Fields, sections, forms, actions, states, tables, filters, presentation hints, ids, and customization policy contracts |
| **Runtime Schemas** | Zod schemas for package-owned metadata contracts |
| **Constants** | Shared metadata kinds, field kinds, action kinds, and state kinds |
| **Validation Helpers** | Parsing and assertion helpers for package-owned metadata contracts |
| **Public Exports** | Explicit subpaths for constants, contracts, schemas, and validation utilities |

---

# Metadata Architecture Does Not Include

| Excluded Area | Owned By |
| --- | --- |
| UI rendering | `@repo/metadata-ui` and `@repo/ui` |
| Mutation execution and workflow authority | Feature packages and execution pipeline |
| Permission finality and security enforcement | Auth and permissions layers |
| Database persistence logic | Data and infrastructure packages |
| Feature-specific business rules | Owning feature packages |

---

# Source of Truth Ownership

| Data / Business Object | Source of Truth | Notes |
| --- | --- | --- |
| Declarative metadata model | `@repo/metadata` | This package owns the canonical metadata contract surface. |
| UI rendering of metadata | `@repo/metadata-ui` | Metadata describes structure and hints; it does not render UI itself. |
| Customization overlay governance | `@repo/customization` | Customization extends metadata through governed overlays but does not replace metadata ownership. |
| Business authority and permissions | Feature and runtime layers | Metadata may carry hints, but it must not decide permission finality or business execution. |

---

# Boundary Rules

| Rule | Requirement |
| --- | --- |
| Rendering boundary | Metadata describes structure and presentation hints but must not render UI directly. |
| Execution boundary | Metadata must not execute mutations or encode authoritative business workflow logic. |
| Permission boundary | Metadata may expose hints but must not define permission finality or security enforcement. |
| Package boundary | Dependencies are limited to `zod` and package-local contracts; no UI, database, auth, execution, or feature imports are allowed. |
| Customization boundary | Metadata may expose customization policy contracts without becoming the customization owner. |

---

# Metadata Architecture Requirement Statement

| Requirement | Description |
| --- | --- |
| **Metadata Architecture** | Provides declarative metadata contracts, schemas, constants, and validation helpers for XForge while preserving downstream ownership of rendering, execution, security, and feature business semantics. |

---

# Enterprise Functional Requirements

| Code | Requirement |
| --- | --- |
| **MD-001** | System shall expose explicit declarative contracts for feature and entity metadata. |
| **MD-002** | System shall expose runtime schemas for package-owned metadata contracts. |
| **MD-003** | System shall expose validation helpers for parsing and asserting metadata contracts. |
| **MD-004** | System shall preserve explicit package boundaries between metadata contracts, UI rendering, execution, and feature business logic. |
| **MD-005** | System shall support customization policy contracts without transferring customization ownership into this package. |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria |
| --: | --- |
| 1 | Consumers can import metadata contracts, schemas, constants, and validation helpers through explicit package exports. |
| 2 | Metadata schemas validate package-owned field, action, and feature metadata contracts. |
| 3 | Metadata contracts describe structure, presentation hints, and policy hints without rendering UI or executing mutations. |
| 4 | Package code does not depend on UI, database, auth, execution, permissions, or feature packages. |
| 5 | Customization policy is represented declaratively without making metadata the customization runtime owner. |

---

# Definition of Done

| Area | Done When |
| --- | --- |
| Architecture and boundaries | The package remains declarative and does not absorb rendering, execution, or runtime authority. |
| Public surface | Contracts, schemas, constants, and validation helpers are exported explicitly. |
| Validation | Package-owned metadata contracts are validated through strict runtime schemas and assertion helpers. |
| Tests and verification | `pnpm --filter @repo/metadata lint`, `pnpm --filter @repo/metadata typecheck`, and `pnpm --filter @repo/metadata test` pass. |
| Documentation | This document reflects the actual declarative ownership and non-ownership boundaries of the package. |

---

# Implementation Status

**Status:** Implemented

**Last audited:** 2026-06-10

This package already contains a complete contract, schema, constant, and validation surface for metadata. This document standardizes its architecture and completion criteria into one package-level source of truth.

| Area | Status | Evidence |
| --- | --- | --- |
| Feature contracts and schemas | Implemented | [`src/contracts`](./src/contracts), [`src/schemas`](./src/schemas) |
| Authorization and policy boundary | Implemented by declarative scope | [`src/contracts/customization-policy.contract.ts`](./src/contracts/customization-policy.contract.ts), [`package.json`](./package.json) |
| Source-of-truth integration | Implemented | [`src/index.ts`](./src/index.ts), [`src/constants`](./src/constants) |
| Repository and persistence | Not applicable by design | [`package.json`](./package.json) |
| Queries, projections, or read models | Not applicable by design | [`src/validation`](./src/validation) |
| Actions, workflows, or mutations | Not applicable by design | [`src/contracts/action.contract.ts`](./src/contracts/action.contract.ts) |
| HTTP or API routes | Not applicable by design | [`package.json`](./package.json) |
| Requirement coverage registry | Not implemented as a dedicated registry file | [`architecture-and-feature-requirement.md`](./architecture-and-feature-requirement.md) |
| Verification tests | Implemented | [`src/tests/field.schema.test.ts`](./src/tests/field.schema.test.ts), [`src/tests/action.schema.test.ts`](./src/tests/action.schema.test.ts), [`src/tests/feature-metadata.schema.test.ts`](./src/tests/feature-metadata.schema.test.ts) |

### Planning Mark

- `Current audited slices: MD-001, MD-002, MD-003, MD-004, MD-005`
- `Slice status: implemented`
- `Feature status: implemented as a declarative contract package`

---

# Requirement Coverage

| Requirement | Status | Evidence |
| --- | --- | --- |
| MD-001 | Implemented | [`src/contracts/feature-metadata.contract.ts`](./src/contracts/feature-metadata.contract.ts), [`src/contracts/entity-metadata.contract.ts`](./src/contracts/entity-metadata.contract.ts) |
| MD-002 | Implemented | [`src/schemas/feature-metadata.schema.ts`](./src/schemas/feature-metadata.schema.ts), [`src/schemas/field.schema.ts`](./src/schemas/field.schema.ts), [`src/schemas/action.schema.ts`](./src/schemas/action.schema.ts) |
| MD-003 | Implemented | [`src/validation/parse-feature-metadata.ts`](./src/validation/parse-feature-metadata.ts), [`src/validation/assert-metadata-contract.ts`](./src/validation/assert-metadata-contract.ts) |
| MD-004 | Implemented | [`package.json`](./package.json), [`architecture-and-feature-requirement.md`](./architecture-and-feature-requirement.md) |
| MD-005 | Implemented | [`src/contracts/customization-policy.contract.ts`](./src/contracts/customization-policy.contract.ts), [`src/schemas/customization-policy.schema.ts`](./src/schemas/customization-policy.schema.ts) |

---

# Element-by-Element Code Evaluation

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| Contract Surface | Implemented. The package defines canonical metadata contracts for entities, features, fields, actions, forms, sections, filters, and tables. | [`src/contracts`](./src/contracts) | Add new metadata surfaces through declarative contracts first. |
| Runtime Schemas | Implemented. Strict Zod schemas cover package-owned metadata contracts. | [`src/schemas`](./src/schemas) | Keep runtime validation aligned with public contracts. |
| Validation Helpers | Implemented. Parse and assert helpers provide package-owned validation entrypoints. | [`src/validation`](./src/validation) | Preserve package-local contract validation rather than relying on callers to re-implement checks. |

---

# Verification Summary

1. `pnpm --filter @repo/metadata lint`
2. `pnpm --filter @repo/metadata typecheck`
3. `pnpm --filter @repo/metadata test`

These commands define package verification. They were not re-run as part of this documentation standardization pass.

---

# Audience

This document is for engineers defining or reviewing the declarative metadata model used across XForge.

---

# Decision Enabled

Use this document to decide whether a concern belongs in `@repo/metadata`, `@repo/metadata-ui`, `@repo/customization`, or a feature package.

---

# Source Of Truth References

- [`../../skills/reference/architecture.md`](../../skills/reference/architecture.md)
- [`../../skills/reference/packages.md`](../../skills/reference/packages.md)
