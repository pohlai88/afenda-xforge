# Employee Engagement Surveys

## Business Definition

Employee Engagement Surveys is the talent-management capability that defines, activates, and tracks internal employee-feedback surveys used to measure engagement, sentiment, participation, and follow-up themes across the workforce. It should eventually own survey definitions, survey lifecycle state, participation tracking, and package-level read models for HR teams, while integrating with downstream analytics and action-planning consumers instead of duplicating their ownership.

---

# Employee Engagement Surveys Includes

| Area | What It Covers |
| --- | --- |
| Survey definition | Survey identity, title, status, and lifecycle metadata for engagement instruments. |
| Survey lifecycle | Draft, active, and archived survey state transitions. |
| Survey administration surface | Package-owned create, update, and list flows for survey records. |
| Survey retrieval | Package-owned list and get-record query surfaces. |
| Talent-management metadata | Manifest, metadata, and package integration surfaces for the feature boundary. |

---

# Employee Engagement Surveys Does Not Include

| Excluded Area | Owned By |
| --- | --- |
| Employee master profile ownership | Employee Records Management |
| Survey response collection and answer storage | Future survey-response or experience-management implementation slice |
| Advanced analytics, sentiment scoring, and benchmarking | Analytics and reporting packages |
| Engagement action planning and follow-up workflow | Adjacent talent-management or people-operations workflows |
| Notification delivery and campaign orchestration | Notifications and app-layer workflow owners |
| Document or file artifact storage | Document Management and `packages/storage` |

---

# Source of Truth Ownership

| Data / Business Object | Source of Truth | Notes |
| --- | --- | --- |
| Survey definition records within the package boundary | Employee Engagement Surveys | The current package owns the scaffolded survey record identity, title, and status surfaces that exist in code. |
| Employee identity and organization references | Upstream HR source packages | Future respondent or audience targeting must reference upstream master-data ownership instead of duplicating it here. |
| Survey responses, sentiment metrics, and analytics outputs | Future downstream implementation slices | This package should not claim analytics or response ownership until dedicated persistence and query boundaries exist. |
| Documents, uploads, and evidence artifacts | Document Management and `packages/storage` | File persistence is outside the current feature boundary. |

---

# Boundary Rules

| Rule | Requirement |
| --- | --- |
| Tenant boundary | All future reads and writes must resolve execution context before accessing survey records. |
| Permission boundary | Survey creation, activation, archival, and updates must enforce capability or policy checks before execution. |
| Audit boundary | State-changing survey actions must emit audit evidence once the feature moves beyond scaffold status. |
| API boundary | App-layer routes must consume package contracts and actions instead of bypassing them. |
| UI boundary | UI consumers must depend on package queries or future projections instead of in-memory implementation details. |
| Cross-feature boundary | This package may expose survey definitions, but analytics, notification delivery, and action planning remain outside its ownership. |

---

# Employee Engagement Surveys Requirement Statement

| Requirement | Description |
| --- | --- |
| **Employee Engagement Surveys** | Defines and governs employee-engagement survey records, lifecycle state, package integration surfaces, and future-ready administration boundaries for workforce feedback programs. |

---

# Enterprise Functional Requirements

| Code | Requirement |
| --- | --- |
| **HRM-EES-001** | System shall maintain employee-engagement survey records with stable identifiers, titles, and lifecycle status. |
| **HRM-EES-002** | System shall support draft, active, and archived survey lifecycle states. |
| **HRM-EES-003** | System shall allow authorized users to create survey definitions. |
| **HRM-EES-004** | System shall allow authorized users to update survey definition metadata and status. |
| **HRM-EES-005** | System shall provide list and detail retrieval for survey records. |
| **HRM-EES-006** | System shall expose package-owned manifest, metadata, contract, execution, and server surfaces for app-layer integration. |
| **HRM-EES-007** | System shall keep survey-definition ownership separate from employee-profile ownership, notification delivery, and analytics ownership. |
| **HRM-EES-008** | System shall evolve toward auditable, policy-aware survey lifecycle mutations as persistence and authorization mature. |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria |
| --: | --- |
| 1 | A survey record can be created with a generated identifier, a name, and an initial draft status. |
| 2 | A survey record can be updated with a new name or lifecycle status. |
| 3 | Survey records can be listed through a package query surface. |
| 4 | A specific survey record can be retrieved by identifier through a package query surface. |
| 5 | Public package exports provide contract, manifest, execution, metadata, and server entry points. |
| 6 | The package does not claim response analytics, response storage, or notification ownership that is not implemented in code. |
| 7 | The current implementation status is documented as partial rather than overstated as production-complete. |

---

# Definition of Done

This section replaces separate package-level `dod.md` files for the feature package.

| Area | Done When |
| --- | --- |
| Architecture and boundaries | Survey-definition ownership is clear and the package does not absorb analytics, notification, or employee-profile ownership. |
| Contracts and schemas | Survey inputs and outputs are explicit through stable contract surfaces. |
| Validation and policy enforcement | Future lifecycle writes enforce authorization and validation before survey state changes. |
| Runtime behavior | Query and action behavior is deterministic and no longer depends on untracked in-memory scaffolding for production use. |
| Tests and verification | Relevant package verification commands pass and any missing test coverage is documented explicitly. |
| Documentation | This document reflects the actual scaffold status and does not imply unimplemented enterprise capability. |
| Release readiness | The package is either clearly marked as scaffold/partial or has the required persistence, policy, and verification evidence to be promoted. |

---

# Implementation Status

**Status:** Partial

**Last audited:** 2026-06-10

The package currently provides a lightweight scaffold: manifest and metadata exports, basic survey record contracts, in-memory create and update actions, and list/get query surfaces. It does not yet provide persistent storage, explicit authorization, package tests, or application routes.

| Area | Status | Evidence |
| --- | --- | --- |
| Feature contracts and schemas | Implemented | [`src/contract.ts`](./src/contract.ts) |
| Authorization and policy boundary | Not started | No package-local policy or capability surface is present. |
| Source-of-truth integration | Partial | [`src/metadata.ts`](./src/metadata.ts), [`src/manifest.ts`](./src/manifest.ts) |
| Repository and persistence | Not started | The package has no repository or persistent storage boundary. |
| Queries, projections, or read models | Partial | [`src/queries.ts`](./src/queries.ts) |
| Actions, workflows, or mutations | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts) |
| HTTP or API routes | Not implemented in package boundary | App-layer routes are not declared inside this package. |
| Requirement coverage registry | Not started | No dedicated requirement-coverage registry exists in the package. |
| Verification tests | Not started | No package `test` directory or test script is currently declared. |

### Planning Mark

- `Current audited slices: contract, actions, queries, manifest, metadata, and shared server surface`
- `Slice status: partial`
- `Feature status: scaffolded and not yet production-complete`

---

# Requirement Coverage

This section records only the package-owned scaffold that can be verified directly in code today.

| Requirement | Status | Evidence |
| --- | --- | --- |
| HRM-EES-001 | Partial | [`src/contract.ts`](./src/contract.ts), [`src/actions.ts`](./src/actions.ts) |
| HRM-EES-002 | Partial | [`src/contract.ts`](./src/contract.ts), [`src/actions.ts`](./src/actions.ts) |
| HRM-EES-005 | Partial | [`src/queries.ts`](./src/queries.ts) |
| HRM-EES-006 | Implemented | [`src/manifest.ts`](./src/manifest.ts), [`src/metadata.ts`](./src/metadata.ts), [`src/server.ts`](./src/server.ts), [`src/index.ts`](./src/index.ts) |

---

# Element-by-Element Code Evaluation

This evaluation reflects the current codebase as of 2026-06-10.

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| Survey contract surface | Implemented as a minimal scaffold for record identity, status, create, update, and list inputs. | [`src/contract.ts`](./src/contract.ts) | Future survey-question, audience, and response models should extend explicit contracts instead of bypassing them. |
| Survey action surface | Partial and currently in-memory. | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts) | Introduce validation, policy checks, and persistent repository boundaries before treating lifecycle actions as production-ready. |
| Survey query surface | Partial and currently backed by in-memory records. | [`src/queries.ts`](./src/queries.ts) | Add repository-backed reads and projection surfaces before scaling usage beyond scaffold consumers. |
| Package metadata and manifest | Implemented for package discovery and integration. | [`src/manifest.ts`](./src/manifest.ts), [`src/metadata.ts`](./src/metadata.ts) | Preserve explicit package metadata as the feature grows. |
| Verification surface | Not yet implemented as automated package tests. | [`package.json`](./package.json) | Add package tests once persistence, authorization, and lifecycle rules are introduced. |

---

# Verification Summary

1. `pnpm --filter @repo/features-talent-management-employee-engagement-surveys typecheck`
2. `pnpm --filter @repo/features-talent-management-employee-engagement-surveys lint`
3. Package-level automated tests are not currently declared in `package.json`.
