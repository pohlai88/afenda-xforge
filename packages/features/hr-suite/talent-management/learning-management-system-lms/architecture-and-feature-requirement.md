# Learning Management System (LMS)
## Business Definition
**Learning Management System (LMS) is the HRM function that delivers, manages, tracks, and reports employee learning through online courses, learning paths, certifications, compliance training, assessments, progress dashboards, and completion records.**

---
# Learning Management System (LMS) Includes

Audit migration pending for include scope.

---
# Learning Management System (LMS) Does Not Include

Audit migration pending for exclusion scope.

---
# Source of Truth Ownership

| Data / Business Object | Source of Truth | Notes |
| --- | --- | --- |
| Feature-owned business records, workflows, and projections | This feature package | This package is the canonical owner for its own commands, read models, and audit-relevant state inside the documented feature boundary. |
| Employee, candidate, organization, position, or company references | Upstream HR source packages | This feature may reference upstream identities and structure, but it must not duplicate canonical master-data ownership. |
| Documents, evidence artifacts, and file storage | Document Management and `packages/storage` | This feature may store references, statuses, or metadata, but it must not own binary file persistence or storage policy. |
| Downstream payroll, reporting, analytics, or external integration outputs | The downstream owning package or external system | This feature should publish validated references, events, or projections instead of mutating downstream source-of-truth state directly. |

---
# Boundary Rules

| Rule | Requirement |
| --- | --- |
| Tenant boundary | All reads and writes must resolve execution context before accessing data. |
| Permission boundary | All mutations must check capability, policy, or permission before execution. |
| Audit boundary | All state-changing actions must write an audit event or pass through an auditable mutation boundary. |
| API boundary | Public routes must not bypass feature contracts, schemas, or policies. |
| UI boundary | UI must consume projections, page models, or read models instead of raw persistence models. |
| Cross-feature boundary | This feature must integrate through references, contracts, projections, or validated execution flows instead of directly taking ownership of adjacent domain state. |

---
---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-LMS-001** | System shall create and maintain an online learning course catalog.                                                                                                                                             |
| **HRM-LMS-002** | System shall support course types including online course, video lesson, reading module, quiz, assessment, certification, compliance training, and blended learning reference.                                  |
| **HRM-LMS-003** | System shall maintain course metadata including title, category, description, provider, duration, level, language, delivery mode, and validity period.                                                          |
| **HRM-LMS-004** | System shall support internal and external learning content references.                                                                                                                                         |
| **HRM-LMS-005** | System shall support SCORM, xAPI, or external LMS content references where enabled.                                                                                                                             |
| **HRM-LMS-006** | System shall create and maintain learning paths.                                                                                                                                                                |
| **HRM-LMS-007** | System shall support role-based, department-based, onboarding, compliance, safety, leadership, and certification learning paths.                                                                                |
| **HRM-LMS-008** | System shall assign courses or learning paths to employees individually or in bulk.                                                                                                                             |
| **HRM-LMS-009** | System shall support mandatory and optional learning assignment classification.                                                                                                                                 |
| **HRM-LMS-010** | System shall allow employees to self-enroll in available courses where enabled.                                                                                                                                 |
| **HRM-LMS-011** | System shall support manager or HR approval for enrollment where required.                                                                                                                                      |
| **HRM-LMS-012** | System shall track course progress status including not started, in progress, completed, failed, overdue, expired, renewed, and cancelled.                                                                      |
| **HRM-LMS-013** | System shall track lesson progress, module progress, completion percentage, time spent, and last accessed date where supported.                                                                                 |
| **HRM-LMS-014** | System shall support quizzes and assessments.                                                                                                                                                                   |
| **HRM-LMS-015** | System shall capture assessment score, passing score, attempt count, result, and completion date.                                                                                                               |
| **HRM-LMS-016** | System shall enforce passing score and attempt limit where configured.                                                                                                                                          |
| **HRM-LMS-017** | System shall issue or record course completion certificates where enabled.                                                                                                                                      |
| **HRM-LMS-018** | System shall track certification issue date, expiry date, renewal date, and certification status.                                                                                                               |
| **HRM-LMS-019** | System shall generate reminders for due, overdue, failed, incomplete, and expiring certification items.                                                                                                         |
| **HRM-LMS-020** | System shall support mandatory compliance training assignment.                                                                                                                                                  |
| **HRM-LMS-021** | System shall expose mandatory training completion status to Compliance & Regulatory Tracking.                                                                                                                   |
| **HRM-LMS-022** | System shall expose onboarding learning completion status to Recruitment & Onboarding or Employee Lifecycle Management.                                                                                         |
| **HRM-LMS-023** | System shall expose learning completion and certification references to Training & Development.                                                                                                                 |
| **HRM-LMS-024** | System shall provide employee learning dashboard.                                                                                                                                                               |
| **HRM-LMS-025** | System shall provide manager team-learning dashboard.                                                                                                                                                           |
| **HRM-LMS-026** | System shall provide HR learning administration dashboard.                                                                                                                                                      |
| **HRM-LMS-027** | System shall provide progress, completion, overdue, certification, and compliance training reports.                                                                                                             |
| **HRM-LMS-028** | System shall restrict course assignment, course access, progress visibility, assessment results, and certification records based on role and permission.                                                        |
| **HRM-LMS-029** | System shall preserve learning history by employee, course, learning path, certification, provider, and period.                                                                                                 |
| **HRM-LMS-030** | System shall maintain audit trail for course setup, learning path setup, assignment, enrollment, progress update, assessment, completion, failure, certification, renewal, reminder, and report export actions. |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                                              |
| --: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Online course can be created with title, category, provider, duration, language, level, delivery mode, and description.                                          |
|   2 | Course can be classified as online course, video lesson, reading module, quiz, assessment, certification, compliance training, or blended learning reference.    |
|   3 | Internal or external learning content reference can be attached to a course.                                                                                     |
|   4 | SCORM, xAPI, or external LMS content reference can be supported where enabled.                                                                                   |
|   5 | Learning path can be created with ordered course sequence.                                                                                                       |
|   6 | Learning paths can be assigned by role, department, onboarding need, compliance need, safety requirement, or certification requirement.                          |
|   7 | Courses or learning paths can be assigned to employees individually or in bulk.                                                                                  |
|   8 | Learning assignment can be marked as mandatory or optional.                                                                                                      |
|   9 | Employee can self-enroll in available courses where enabled.                                                                                                     |
|  10 | Enrollment can require manager or HR approval where configured.                                                                                                  |
|  11 | Employee course progress can be tracked as not started, in progress, completed, failed, overdue, expired, renewed, or cancelled.                                 |
|  12 | Lesson progress, completion percentage, time spent, and last accessed date can be tracked where supported.                                                       |
|  13 | Assessment score, passing score, attempt count, and result can be recorded.                                                                                      |
|  14 | Passing score and attempt limit are enforced where configured.                                                                                                   |
|  15 | Completion certificate can be issued or recorded.                                                                                                                |
|  16 | Certification issue date, expiry date, renewal date, and status can be tracked.                                                                                  |
|  17 | Due, overdue, incomplete, failed, and expiring certification items generate reminders.                                                                           |
|  18 | Mandatory compliance training completion is available to Compliance & Regulatory Tracking.                                                                       |
|  19 | Onboarding learning completion is available to Recruitment & Onboarding or Employee Lifecycle Management.                                                        |
|  20 | Learning completion and certification references are available to Training & Development.                                                                        |
|  21 | Employee can view own learning progress dashboard.                                                                                                               |
|  22 | Manager can view team learning progress where authorized.                                                                                                        |
|  23 | HR can view organization-wide learning completion and overdue training dashboards.                                                                               |
|  24 | LMS reports can be generated by employee, course, learning path, department, manager, certification, status, provider, and period.                               |
|  25 | Unauthorized users cannot view or modify restricted learning, assessment, or certification records.                                                              |
|  26 | Learning history remains available by employee, course, learning path, certification, provider, and period.                                                      |
|  27 | Every course setup, assignment, enrollment, progress update, assessment, completion, certification, renewal, reminder, and report export creates an audit event. |

---
# Definition of Done

This section replaces separate package-level `dod.md` files for this feature package. A change is done only when the implemented slice matches the documented boundary and the verification evidence is current.

| Area | Done When |
| --- | --- |
| Architecture and boundaries | The change preserves documented source-of-truth ownership, feature scope, and platform governance constraints. |
| Contracts and schemas | Public contracts, schemas, and manifest surfaces are explicit, stable, and aligned with the documented feature boundary. |
| Validation and policy enforcement | Invalid inputs, invalid scope, policy violations, and unsafe state transitions fail clearly and safely. |
| Runtime behavior | Queries, actions, execution paths, and repository behavior remain deterministic and do not create hidden cross-feature ownership. |
| Tests and verification | The relevant lint, typecheck, and test commands pass for the package, or any missing verification is explicitly documented as a gap. |
| Documentation | This document, package exports, and any development roadmap or implementation guidance reflect the actual package structure. |
| Release readiness | The implemented slice is safe to expose to its intended audience, or the remaining scope is explicitly marked as partial. |

---
# Implementation Status

**Status:** Partial

**Last audited:** 2026-06-10

This section reflects the package surface that exists in code today. Unless a row says otherwise, the evidence below confirms package-owned contracts, actions, queries, repository boundaries, and tests rather than a complete end-to-end application audit.

| Area | Status | Evidence |
| --- | --- | --- |
| Feature contracts and schemas | Implemented | [`src/contract.ts`](./src/contract.ts) |
| Authorization and policy boundary | Partial | [`src/manifest.ts`](./src/manifest.ts) |
| Source-of-truth integration | Partial | [`src/metadata.ts`](./src/metadata.ts) |
| Repository and persistence | Not started | [`package.json`](./package.json) |
| Queries, projections, or read models | Implemented | [`src/queries.ts`](./src/queries.ts) |
| Actions, workflows, or mutations | Implemented | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts) |
| HTTP or API routes | Not implemented in package boundary | App-layer routes are not defined inside this package. |
| Requirement coverage registry | Not started | [`src/manifest.ts`](./src/manifest.ts) |
| Verification tests | Not started | [`package.json`](./package.json) |

### Planning Mark

- `Current audited slices: package surface, contracts, queries, actions, repository, and verification assets`
- `Slice status: partial`
- `Feature status: partially implemented`

---
# Requirement Coverage

This package does not yet carry a complete row-by-row requirement audit in code unless explicitly linked below. The table records the currently auditable package-owned slice and should be expanded as implementation evidence becomes more precise.

| Requirement | Status | Evidence |
| --- | --- | --- |
| HRM-LMS-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-LMS-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-LMS-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

---
# Element-by-Element Code Evaluation

This evaluation reflects the current package codebase as of 2026-06-10. It records the implementation surfaces that future slices should preserve and extend rather than bypass.

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| Feature manifest and metadata | Implemented as package-owned manifest and metadata surfaces. | [`src/manifest.ts`](./src/manifest.ts), [`src/metadata.ts`](./src/metadata.ts) | Preserve the exported package identity, manifest surface, and metadata contract when adding routes or UI integrations. |
| Contract and schema boundary | Implemented through explicit contract or schema files. | [`src/contract.ts`](./src/contract.ts) | Add new inputs and outputs through stable contracts and schemas instead of ad hoc object shapes. |
| Query and read-model surface | Implemented through package-owned query or projection surfaces. | [`src/queries.ts`](./src/queries.ts) | Keep UI and API consumers on read models or query surfaces rather than repository internals. |
| Action and execution surface | Implemented through action or execution files. | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts) | Route mutations through explicit actions and execution helpers so policy, audit, and validation can be enforced centrally. |
| Repository or store boundary | Not started as a dedicated persistence boundary. | [`package.json`](./package.json) | Preserve a single persistence boundary so future storage changes do not leak into contracts or UI surfaces. |
| Verification surface | Package tests are not yet present. | [`package.json`](./package.json) | Add targeted tests as feature slices become production-critical, especially around policies, actions, and read-model correctness. |

---
# Verification Summary

1. `pnpm --filter @repo/features-talent-management-learning-management-system-lms typecheck`
2. `pnpm --filter @repo/features-talent-management-learning-management-system-lms lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
---
