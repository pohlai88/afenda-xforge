# Employee Records Management

## Business Definition

Employee Records Management is the HR suite capability that maintains the official employee master profile and its governed lifecycle. It owns the canonical worker record, sensitive profile access controls, assignment and status history, completeness tracking, document references, and audit-ready mutation history so adjacent HR domains can rely on one operational employee record.

---

# Employee Records Management Includes

| Area | What It Covers |
| --- | --- |
| Employee master profile | Stable employee identifier, names, contact details, emergency contacts, and profile coverage state. |
| Employment context | Employment status, hire and separation context, rehire continuity, and lifecycle state references. |
| Organizational references | Manager, department, role, location, and related assignment references required by downstream HR domains. |
| Assignment history | Effective-dated assignment changes, reporting changes, and organizational movement history. |
| Status history | Historical employment-state transitions such as active, separated, archived, and rehired. |
| Document references | References to required employee documents and completeness status, without owning binary storage. |
| Sensitive-read controls | Safe access to protected profile fields through policy-aware package surfaces. |
| Operational read models | Directory, detail, incomplete-record, assignment, document-reference, and audit-trail package surfaces. |
| Audit trail | Governed record-change history for profile updates, assignment changes, archive actions, and rehire actions. |

---

# Employee Records Management Does Not Include

| Excluded Area | Owned By |
| --- | --- |
| Organization hierarchy design and stewardship | Organizational Chart & Hierarchy |
| Binary document storage and file lifecycle | Document Management and `packages/storage` |
| Employee self-service UX ownership | Employee Self-Service Portal |
| Recruiting and applicant ownership | Recruitment & Onboarding |
| Payroll calculation and statutory processing | Payroll Processing |
| Leave, attendance, and time capture | Leave & Attendance Management |
| Performance, learning, and disciplinary workflows | Talent Management feature packages |
| Offboarding clearance orchestration | Offboarding & Exit Management |

---

# Source of Truth Ownership

| Data / Business Object | Source of Truth | Notes |
| --- | --- | --- |
| Employee profile and lifecycle record | Employee Records Management | This package is the canonical owner of employee identity, employment context, status history, and assignment references inside the HR suite boundary. |
| Organization structure and reporting topology | Organizational Chart & Hierarchy | This package may reference units, positions, and reporting structures, but it must not own the hierarchy model itself. |
| Documents and file artifacts | Document Management and `packages/storage` | This package stores document references and completeness state only. File storage, upload policy, and versioning stay outside this boundary. |
| Payroll, time, and downstream calculations | Downstream feature packages | This package publishes trusted employee references to downstream domains but must not duplicate their source-of-truth calculations. |

---

# Boundary Rules

| Rule | Requirement |
| --- | --- |
| Tenant boundary | All reads and writes must resolve execution context before accessing employee data. |
| Permission boundary | Sensitive reads and all mutations must enforce policy or capability checks before execution. |
| Audit boundary | Every employee-record mutation must create an audit event or pass through an auditable execution path. |
| API boundary | Public routes and server actions must use package contracts, schemas, and policy-aware surfaces instead of bypassing them. |
| UI boundary | UI consumers must use page models, directory surfaces, and detail projections instead of raw persistence models. |
| Cross-feature boundary | Adjacent HR packages may reference employee records, but they must not take ownership of employee master-profile state. |

---

# Employee Records Management Requirement Statement

| Requirement | Description |
| --- | --- |
| **Employee Records Management** | Maintains the canonical employee master profile with governed assignment history, status history, sensitive-access control, document references, operational read models, and auditable lifecycle mutations. |

---

# Enterprise Functional Requirements

| Code | Requirement |
| --- | --- |
| **HRM-ERM-001** | System shall maintain a canonical employee master profile with stable employee identity and employment context. |
| **HRM-ERM-002** | System shall maintain employee personal, contact, and emergency-contact information through governed mutation paths. |
| **HRM-ERM-003** | System shall maintain effective-dated employee organizational assignments including manager, department, role, and location references. |
| **HRM-ERM-004** | System shall preserve assignment history and status history instead of overwriting historical workforce context. |
| **HRM-ERM-005** | System shall support archive, separation, and rehire lifecycle actions without losing historical continuity. |
| **HRM-ERM-006** | System shall maintain document-reference completeness state for required employee records without owning binary file storage. |
| **HRM-ERM-007** | System shall provide operational read models for employee directory, detail, completeness, assignment, document-reference, and audit-trail views. |
| **HRM-ERM-008** | System shall restrict protected employee fields through sensitive-read controls and policy-aware access. |
| **HRM-ERM-009** | System shall expose trusted employee references for downstream HR domains without duplicating their business ownership. |
| **HRM-ERM-010** | System shall validate employee-record mutations through explicit contracts, schemas, and workflow guards. |
| **HRM-ERM-011** | System shall track employment-status transitions with actor, timestamp, and change reason. |
| **HRM-ERM-012** | System shall support search and directory retrieval across employee status and organizational references. |
| **HRM-ERM-013** | System shall preserve audit history for profile edits, assignment changes, status transitions, archive actions, and rehire actions. |
| **HRM-ERM-014** | System shall keep current profile state separate from derived read models used by UI or integration consumers. |
| **HRM-ERM-015** | System shall provide package-owned contracts and manifest surfaces that make the feature safe to consume from app and integration layers. |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria |
| --: | --- |
| 1 | HR users can create and update an employee master record through governed package actions. |
| 2 | Employee profile reads expose directory-safe data separately from protected detail fields. |
| 3 | Manager, department, role, and location assignment references can be updated without losing prior assignment history. |
| 4 | Status history records can distinguish active, separated, archived, and rehired employee states. |
| 5 | Archive and rehire actions preserve historical continuity instead of creating disconnected records. |
| 6 | Document-reference completeness can show which required employee artifacts are missing or linked. |
| 7 | Employee directory and detail surfaces can be queried without exposing raw persistence records directly to UI callers. |
| 8 | Sensitive profile fields are hidden or degraded safely for unauthorized callers. |
| 9 | Search and list surfaces can return employee records by operational criteria such as status or assignment context. |
| 10 | Downstream features can consume employee references without taking ownership of the employee master record. |
| 11 | Invalid record mutations fail through package contracts or policy guards instead of producing silent state corruption. |
| 12 | Assignment, status, archive, and rehire changes create audit evidence. |
| 13 | Public package exports provide stable manifest, metadata, contract, execution, search, and server surfaces. |
| 14 | Package-level tests cover core record, assignment, status, lifecycle, and sensitive-read behavior. |
| 15 | The package can be verified through lint, typecheck, and test commands. |

---

# Definition of Done

This section replaces separate package-level `dod.md` files for the feature package.

| Area | Done When |
| --- | --- |
| Architecture and boundaries | The change preserves employee-record ownership, lifecycle continuity, and cross-feature master-data boundaries. |
| Contracts and schemas | Record, query, search, and lifecycle inputs remain explicit and validated through package contracts or schemas. |
| Validation and policy enforcement | Sensitive reads, record mutations, and lifecycle transitions fail safely when unauthorized or invalid. |
| Runtime behavior | Directory, detail, assignment, status-history, and lifecycle surfaces remain deterministic and auditable. |
| Tests and verification | Typecheck, lint, and package tests pass for the changed slice. |
| Documentation | This document and related roadmap references match the current package surface. |
| Release readiness | The implemented slice is safe for package consumers, or remaining gaps are documented as partial. |

---

# Implementation Status

**Status:** Implemented

**Last audited:** 2026-06-10

This document reflects the actual package-owned feature surface in code. The package contains explicit contracts, search and query surfaces, auditable mutation paths, repository boundaries, projectors, and package-level tests.

| Area | Status | Evidence |
| --- | --- | --- |
| Feature contracts and schemas | Implemented | [`src/contract.ts`](./src/contract.ts), [`src/schema.ts`](./src/schema.ts), [`src/contracts/index.ts`](./src/contracts/index.ts) |
| Authorization and policy boundary | Implemented | [`src/policy.ts`](./src/policy.ts), [`src/sensitive-access.shared.ts`](./src/sensitive-access.shared.ts), [`src/feature-scope.ts`](./src/feature-scope.ts) |
| Source-of-truth integration | Implemented | [`src/repository.ts`](./src/repository.ts), [`src/records-store.ts`](./src/records-store.ts), [`src/metadata.ts`](./src/metadata.ts) |
| Repository and persistence | Implemented | [`src/repository.ts`](./src/repository.ts), [`src/records-store.ts`](./src/records-store.ts) |
| Queries, projections, or read models | Implemented | [`src/queries.ts`](./src/queries.ts), [`src/queries/records.query.ts`](./src/queries/records.query.ts), [`src/projector/read-models.ts`](./src/projector/read-models.ts), [`src/detail-page-model.server.ts`](./src/detail-page-model.server.ts) |
| Actions, workflows, or mutations | Implemented | [`src/actions.ts`](./src/actions.ts), [`src/actions.server.ts`](./src/actions.server.ts), [`src/execution/action.ts`](./src/execution/action.ts) |
| HTTP or API routes | Not implemented in package boundary | App-layer routes are not declared inside this package. |
| Requirement coverage registry | Partial | [`src/manifest.ts`](./src/manifest.ts), [`src/coverage.shared.ts`](./src/coverage.shared.ts) |
| Verification tests | Implemented | [`test/records-baseline.test.ts`](./test/records-baseline.test.ts), [`test/assignment-history.test.ts`](./test/assignment-history.test.ts), [`test/status-history.test.ts`](./test/status-history.test.ts), [`test/archive-lifecycle.test.ts`](./test/archive-lifecycle.test.ts), [`test/profile-sensitive-read.test.ts`](./test/profile-sensitive-read.test.ts) |

### Planning Mark

- `Current audited slices: contracts, queries, projectors, actions, repository, lifecycle, search, and package tests`
- `Slice status: complete`
- `Feature status: implemented within the package boundary`

---

# Requirement Coverage

This table records the currently auditable requirement slice from package-owned code. It is intentionally evidence-based and does not claim application-layer behavior that is outside this package.

| Requirement | Status | Evidence |
| --- | --- | --- |
| HRM-ERM-001 | Implemented | [`src/contract.ts`](./src/contract.ts), [`src/repository.ts`](./src/repository.ts), [`src/records.contract.ts`](./src/records.contract.ts) |
| HRM-ERM-003 | Implemented | [`src/queries/assignments.query.ts`](./src/queries/assignments.query.ts), [`src/projector/assignment.ts`](./src/projector/assignment.ts), [`test/assignment-history.test.ts`](./test/assignment-history.test.ts) |
| HRM-ERM-004 | Implemented | [`src/queries/status-history.query.ts`](./src/queries/status-history.query.ts), [`src/projector/status.ts`](./src/projector/status.ts), [`test/status-history.test.ts`](./test/status-history.test.ts) |
| HRM-ERM-005 | Implemented | [`src/actions.ts`](./src/actions.ts), [`src/lifecycle-summary.server.ts`](./src/lifecycle-summary.server.ts), [`test/archive-lifecycle.test.ts`](./test/archive-lifecycle.test.ts) |
| HRM-ERM-006 | Partial | [`src/document-references-list.surface.ts`](./src/document-references-list.surface.ts), [`src/coverage.shared.ts`](./src/coverage.shared.ts) |
| HRM-ERM-008 | Implemented | [`src/sensitive-access.shared.ts`](./src/sensitive-access.shared.ts), [`test/profile-sensitive-read.test.ts`](./test/profile-sensitive-read.test.ts) |
| HRM-ERM-012 | Implemented | [`src/search.ts`](./src/search.ts), [`src/directory-list.surface.ts`](./src/directory-list.surface.ts), [`src/list-load.shared.ts`](./src/list-load.shared.ts) |
| HRM-ERM-013 | Implemented | [`src/contracts/audit.contract.ts`](./src/contracts/audit.contract.ts), [`src/registry/audit.ts`](./src/registry/audit.ts), [`test/mutation-audit.test.ts`](./test/mutation-audit.test.ts) |

---

# Element-by-Element Code Evaluation

This evaluation reflects the current codebase as of 2026-06-10.

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| Package manifest and metadata | Implemented as explicit package identity and metadata surfaces. | [`src/manifest.ts`](./src/manifest.ts), [`src/metadata.ts`](./src/metadata.ts) | Preserve exported package identity and metadata rather than letting app-layer code infer feature boundaries indirectly. |
| Canonical record contract | Implemented through explicit contracts and schemas. | [`src/contract.ts`](./src/contract.ts), [`src/schema.ts`](./src/schema.ts), [`src/contracts/domain.contract.ts`](./src/contracts/domain.contract.ts) | Add new record fields through contracts and schemas first so mutations and queries stay aligned. |
| Read-model and query layer | Implemented through package queries, page models, and projectors. | [`src/queries.ts`](./src/queries.ts), [`src/page-model.server.ts`](./src/page-model.server.ts), [`src/projector/read-models.ts`](./src/projector/read-models.ts) | Keep UI and integration consumers on read models instead of repository internals. |
| Mutation and lifecycle layer | Implemented through actions, execution, and lifecycle helpers. | [`src/actions.ts`](./src/actions.ts), [`src/actions.server.ts`](./src/actions.server.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/lifecycle-summary.server.ts`](./src/lifecycle-summary.server.ts) | Route future profile, archive, rehire, and assignment changes through the same audited mutation paths. |
| Persistence boundary | Implemented through repository and store abstractions. | [`src/repository.ts`](./src/repository.ts), [`src/records-store.ts`](./src/records-store.ts) | Keep persistence changes behind repository surfaces so feature consumers do not depend on storage layout. |
| Verification surface | Implemented through targeted package tests. | [`test/public-api.test.ts`](./test/public-api.test.ts), [`test/operational-hardening.test.ts`](./test/operational-hardening.test.ts), [`test/integration-contracts.test.ts`](./test/integration-contracts.test.ts) | Extend tests as new mutations, policy constraints, or integrations are added. |

---

# Verification Summary

1. `pnpm --filter @repo/features-employee-management-employee-records-management typecheck`
2. `pnpm --filter @repo/features-employee-management-employee-records-management lint`
3. `pnpm --filter @repo/features-employee-management-employee-records-management test`
