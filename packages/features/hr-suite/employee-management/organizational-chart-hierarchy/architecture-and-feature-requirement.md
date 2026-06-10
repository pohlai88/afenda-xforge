# Organizational Chart & Hierarchy

## Business Definition

Organizational Chart & Hierarchy is the HR suite capability that maintains and visualizes the official organizational structure across legal entities, business units, departments, teams, positions, reporting lines, and effective-dated structural changes. It acts as the canonical organization model that downstream HR workflows use for assignment, approval routing, headcount visibility, and structural traceability.

---

# Organizational Chart & Hierarchy Includes

| Area | What It Covers |
| --- | --- |
| Organization-unit structure | Legal entities, business units, departments, sub-departments, teams, and related structural nodes. |
| Parent-child hierarchy | Canonical organization-tree relationships with structural integrity and effective dates. |
| Position structure | Position records, ownership, status, and structural placement within organizational units. |
| Reporting relationships | Direct and non-standard reporting relationships used for workflow routing and escalation. |
| Structural projections | Org-chart nodes, overview snapshots, units, positions, reporting-lines, vacancy, headcount, and audit surfaces. |
| Structural mutations | Governed upsert and maintenance flows for units, positions, and reporting relationships. |
| Structural governance | Loop prevention, parent-child integrity, status semantics, and capability-aware writes. |
| Audit trail | Auditable record of structural changes and effective-date context. |

---

# Organizational Chart & Hierarchy Does Not Include

| Excluded Area | Owned By |
| --- | --- |
| Employee personal profile ownership | Employee Records Management |
| Employee employment-history ownership | Employee Records Management |
| Document storage and version workflow | Document Management and `packages/storage` |
| Payroll calculation and finance posting | Payroll Processing and Finance-owned systems |
| Recruiting pipeline ownership | Recruitment & Onboarding |
| Leave, attendance, and time capture | Time & Attendance feature packages |
| Employee self-service profile management | Employee Self-Service Portal |
| Performance, learning, and compliance workflow ownership | Adjacent HR feature packages |
| Offboarding and asset-recovery process ownership | Offboarding & Exit Management |

---

# Source of Truth Ownership

| Data / Business Object | Source of Truth | Notes |
| --- | --- | --- |
| Organization units, positions, and reporting topology | Organizational Chart & Hierarchy | This package is the canonical owner of the structural organization model used by downstream HR workflows. |
| Employee profile and employment identity | Employee Records Management | This package may reference employees and managers but must not own employee master-profile state. |
| Documents and file artifacts | Document Management and `packages/storage` | Structural records may reference external artifacts, but file persistence and policy stay outside this boundary. |
| Downstream approval, payroll, analytics, and planning outputs | Downstream owning packages or systems | This package publishes trusted structure references but must not take ownership of downstream calculations or postings. |

---

# Boundary Rules

| Rule | Requirement |
| --- | --- |
| Tenant boundary | All structure reads and writes must resolve execution context before accessing organizational data. |
| Permission boundary | All structural mutations must enforce capability or policy checks before execution. |
| Audit boundary | Unit, position, and reporting-line changes must create audit evidence. |
| API boundary | App-layer routes and actions must consume package contracts, schemas, and policy helpers instead of bypassing them. |
| UI boundary | UI surfaces must consume page models, projectors, and list surfaces instead of raw repository objects. |
| Cross-feature boundary | Downstream features may depend on structure references, but only this package owns the canonical hierarchy model. |

---

# Organizational Chart & Hierarchy Requirement Statement

| Requirement | Description |
| --- | --- |
| **Organizational Chart & Hierarchy** | Maintains the canonical organization structure, position model, reporting topology, and structural read models required for assignment, routing, headcount, vacancy, and audit use cases across the HR suite. |

---

# Enterprise Functional Requirements

| Code | Requirement |
| --- | --- |
| **HRM-OCH-001** | System shall maintain canonical organization units with stable identifiers, types, parent relationships, and effective dates. |
| **HRM-OCH-002** | System shall maintain positions within organizational units with status, title, location, and cost-center context. |
| **HRM-OCH-003** | System shall maintain reporting relationships separately from the pure organization-unit tree. |
| **HRM-OCH-004** | System shall prevent malformed structural relationships such as invalid parent-child links or unsafe hierarchy mutations. |
| **HRM-OCH-005** | System shall provide projection-oriented read models for org chart, units, positions, reporting lines, vacancy, headcount, and audit views. |
| **HRM-OCH-006** | System shall support effective-dated structural changes without losing traceability. |
| **HRM-OCH-007** | System shall expose structure references for downstream assignment, approval-routing, reporting, and planning consumers. |
| **HRM-OCH-008** | System shall restrict structural mutations to authorized users while allowing wider read access where appropriate. |
| **HRM-OCH-009** | System shall preserve a package-owned repository boundary for structural persistence. |
| **HRM-OCH-010** | System shall provide package-owned contracts, schemas, manifest data, and metadata for app-layer integration. |
| **HRM-OCH-011** | System shall preserve audit history for organization-unit, position, and reporting-line changes. |
| **HRM-OCH-012** | System shall keep structural state separate from UI-friendly page models and projections. |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria |
| --: | --- |
| 1 | Authorized users can create or update organization units through governed package actions. |
| 2 | Organization units preserve parent relationships, unit type, and structural status. |
| 3 | Positions can be managed within organizational units without collapsing into employee profile ownership. |
| 4 | Reporting relationships can be modeled separately from pure organization hierarchy. |
| 5 | Structural mutations reject malformed relationships instead of silently corrupting the hierarchy. |
| 6 | Org-chart, unit, position, and reporting-line read models can be served from package-owned projections. |
| 7 | Effective-dated changes preserve structural traceability for reorganizations. |
| 8 | Downstream domains can consume trusted structure references without duplicating the hierarchy model. |
| 9 | Unauthorized callers cannot execute structural write paths. |
| 10 | Structural changes create audit evidence. |
| 11 | Package exports provide stable manifest, schema, contract, execution, metadata, and server surfaces. |
| 12 | Typecheck, lint, and package tests verify the core package boundary. |

---

# Definition of Done

This section replaces separate package-level `dod.md` files for the feature package.

| Area | Done When |
| --- | --- |
| Architecture and boundaries | The change preserves canonical hierarchy ownership and does not move employee, payroll, or document ownership into this package. |
| Contracts and schemas | Unit, position, and reporting inputs remain explicit through package contracts and schemas. |
| Validation and policy enforcement | Unsafe structure mutations and unauthorized writes fail through package validation and policy boundaries. |
| Runtime behavior | Projections, page models, and repository behavior remain deterministic and structurally explainable. |
| Tests and verification | Typecheck, lint, and package tests pass for the changed slice. |
| Documentation | This document and related roadmap references match the actual package implementation. |
| Release readiness | The structural slice is safe for app-layer consumption or any partial status is documented explicitly. |

---

# Implementation Status

**Status:** Implemented

**Last audited:** 2026-06-10

The package contains explicit contracts, schemas, policy surfaces, repository adapters, projectors, requirement-coverage registry assets, and tests. The status below reflects the package boundary rather than app-layer route ownership.

| Area | Status | Evidence |
| --- | --- | --- |
| Feature contracts and schemas | Implemented | [`src/contract.ts`](./src/contract.ts), [`src/schema.ts`](./src/schema.ts), [`src/contracts/index.ts`](./src/contracts/index.ts) |
| Authorization and policy boundary | Implemented | [`src/policy.ts`](./src/policy.ts), [`src/feature-scope.ts`](./src/feature-scope.ts), [`src/registry/capability.ts`](./src/registry/capability.ts) |
| Source-of-truth integration | Implemented | [`src/repository.ts`](./src/repository.ts), [`src/repository.database.ts`](./src/repository.database.ts), [`src/metadata.ts`](./src/metadata.ts) |
| Repository and persistence | Implemented | [`src/repository.ts`](./src/repository.ts), [`src/repository.database.ts`](./src/repository.database.ts), [`src/store.ts`](./src/store.ts) |
| Queries, projections, or read models | Implemented | [`src/queries.ts`](./src/queries.ts), [`src/queries/read-models.ts`](./src/queries/read-models.ts), [`src/projector.ts`](./src/projector.ts), [`src/page-model.server.ts`](./src/page-model.server.ts) |
| Actions, workflows, or mutations | Implemented | [`src/actions.ts`](./src/actions.ts), [`src/actions.server.ts`](./src/actions.server.ts), [`src/execution/action.ts`](./src/execution/action.ts) |
| HTTP or API routes | Not implemented in package boundary | App-layer routes are not declared inside this package. |
| Requirement coverage registry | Implemented | [`src/registry/requirement-coverage.ts`](./src/registry/requirement-coverage.ts), [`src/manifest.ts`](./src/manifest.ts) |
| Verification tests | Implemented | [`test/organizational-chart-hierarchy.test.ts`](./test/organizational-chart-hierarchy.test.ts) |

### Planning Mark

- `Current audited slices: contracts, schemas, policy, repository, read models, actions, requirement coverage, and package tests`
- `Slice status: complete`
- `Feature status: implemented within the package boundary`

---

# Requirement Coverage

This package already carries a dedicated requirement-coverage registry and related manifest surfaces. The rows below capture the currently auditable package slice.

| Requirement | Status | Evidence |
| --- | --- | --- |
| HRM-OCH-001 | Implemented | [`src/schema.ts`](./src/schema.ts), [`src/repository.ts`](./src/repository.ts), [`src/registry/requirement-coverage.ts`](./src/registry/requirement-coverage.ts) |
| HRM-OCH-003 | Implemented | [`src/contract.ts`](./src/contract.ts), [`src/queries/read-models.ts`](./src/queries/read-models.ts), [`src/execution/action.ts`](./src/execution/action.ts) |
| HRM-OCH-004 | Implemented | [`src/policy.ts`](./src/policy.ts), [`src/schema.ts`](./src/schema.ts), [`test/organizational-chart-hierarchy.test.ts`](./test/organizational-chart-hierarchy.test.ts) |
| HRM-OCH-005 | Implemented | [`src/projector.ts`](./src/projector.ts), [`src/page-model.server.ts`](./src/page-model.server.ts), [`src/shared/list-surfaces.surface.ts`](./src/shared/list-surfaces.surface.ts) |
| HRM-OCH-008 | Implemented | [`src/registry/capability.ts`](./src/registry/capability.ts), [`src/policy.ts`](./src/policy.ts), [`src/actions.server.ts`](./src/actions.server.ts) |
| HRM-OCH-011 | Implemented | [`src/registry/audit.ts`](./src/registry/audit.ts), [`src/execution/event.ts`](./src/execution/event.ts), [`test/organizational-chart-hierarchy.test.ts`](./test/organizational-chart-hierarchy.test.ts) |

---

# Element-by-Element Code Evaluation

This evaluation reflects the current codebase as of 2026-06-10.

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| Structural contract boundary | Implemented through explicit schema and contract files. | [`src/contract.ts`](./src/contract.ts), [`src/schema.ts`](./src/schema.ts), [`src/contracts/org-model.contract.ts`](./src/contracts/org-model.contract.ts) | Add new structural fields through contracts and schemas first so repository, policy, and page-model layers stay aligned. |
| Structural mutation layer | Implemented through server actions and execution helpers. | [`src/actions.ts`](./src/actions.ts), [`src/actions.server.ts`](./src/actions.server.ts), [`src/execution/action.ts`](./src/execution/action.ts) | Keep unit, position, and reporting-line writes inside the audited mutation path. |
| Projection and page-model layer | Implemented through query, projector, and page-model surfaces. | [`src/queries.ts`](./src/queries.ts), [`src/projector.ts`](./src/projector.ts), [`src/page-model.server.ts`](./src/page-model.server.ts) | Preserve projection-friendly reads so UI consumers do not reconstruct the hierarchy manually. |
| Repository boundary | Implemented through file, testing, database, and shared repository surfaces. | [`src/repository.ts`](./src/repository.ts), [`src/repository.database.ts`](./src/repository.database.ts), [`src/repository.file.ts`](./src/repository.file.ts), [`src/repository.testing.ts`](./src/repository.testing.ts) | Keep persistence concerns behind repository adapters so future storage changes remain local to this package. |
| Governance registry surface | Implemented through package registry files. | [`src/registry/requirement-coverage.ts`](./src/registry/requirement-coverage.ts), [`src/registry/capability.ts`](./src/registry/capability.ts), [`src/registry/audit.ts`](./src/registry/audit.ts) | Extend governance through registry-driven contracts rather than app-layer duplication. |
| Verification surface | Implemented through package test coverage. | [`test/organizational-chart-hierarchy.test.ts`](./test/organizational-chart-hierarchy.test.ts) | Expand tests as more database-backed or app-layer integrations are added. |

---

# Verification Summary

1. `pnpm --filter @repo/features-employee-management-organizational-chart-hierarchy typecheck`
2. `pnpm --filter @repo/features-employee-management-organizational-chart-hierarchy lint`
3. `pnpm --filter @repo/features-employee-management-organizational-chart-hierarchy test`
