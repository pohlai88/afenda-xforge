# Performance Appraisals
## Business Definition
**Performance Appraisals is the HRM function that manages employee performance review cycles, including goal setting, self-assessments, manager evaluations, competency reviews, feedback collection, rating calibration, performance outcomes, development actions, approval workflows, and audit history.**

---
# Performance Appraisals Includes

| Area                         | What It Covers                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| **Performance Review Cycle** | Annual review, mid-year review, probation review, project review, quarterly review      |
| **Goal Setting**             | Employee goals, department goals, KPI goals, role-based goals, measurable targets       |
| **Goal Tracking**            | Goal progress, completion percentage, target achievement, milestone status              |
| **Self-Assessment**          | Employee self-review, self-rating, achievement comments, reflection notes               |
| **Manager Evaluation**       | Manager rating, performance comments, achievement review, final evaluation              |
| **Competency Assessment**    | Role competency, leadership competency, technical competency, behavioral competency     |
| **KPI Evaluation**           | KPI score, target result, weighted score, achievement percentage                        |
| **Rating Scale**             | Numeric rating, descriptive rating, performance level, rating guide                     |
| **Performance Feedback**     | Manager feedback, peer feedback reference, HR feedback, review notes                    |
| **Review Meeting Tracking**  | Review discussion date, meeting notes, acknowledgment status                            |
| **Development Action**       | Improvement plan, development goal, training recommendation, coaching action            |
| **Performance Outcome**      | Final rating, performance category, promotion recommendation, compensation reference    |
| **Calibration Reference**    | Rating calibration, department normalization, HR review, leadership review              |
| **Approval Workflow**        | Manager submission, employee acknowledgment, HR review, final approval                  |
| **Performance History**      | Previous review cycles, past ratings, goal achievement history                          |
| **Reporting**                | Rating distribution, completion status, overdue reviews, department performance summary |
| **Audit Trail**              | Created by, submitted by, reviewed by, approved by, acknowledged by, timestamp          |

---
# Performance Appraisals Does Not Include

| Excluded Area                  | Owned By                              |
| ------------------------------ | ------------------------------------- |
| Employee master profile        | Employee Records Management           |
| Organization hierarchy         | Organizational Chart & Hierarchy      |
| Job and position structure     | Organizational Chart / Job Management |
| Salary adjustment planning     | Compensation Planning & Modeling      |
| Bonus payout calculation       | Bonus & Incentive Management          |
| Payroll calculation            | Payroll Processing                    |
| Training course management     | Learning & Development                |
| Disciplinary case management   | Employee Relations / Compliance       |
| Attendance record ownership    | Leave & Attendance Management         |
| Leave balance calculation      | Leave & Attendance Management         |
| Recruitment assessment scoring | Recruitment & Applicant Tracking      |
| Document storage engine        | Document Management                   |
| Workforce planning             | Workforce Planning                    |

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
# Performance Appraisals Requirement Statement

| Requirement                | Description                                                                                                                                                                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Performance Appraisals** | Facilitates employee performance reviews with review cycles, goal setting, self-assessments, manager evaluations, competency reviews, KPI scoring, feedback, calibration references, development actions, approval workflow, reporting, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-PER-001** | System shall create and manage performance review cycles.                                                                                                                                       |
| **HRM-PER-002** | System shall support review types including annual, mid-year, quarterly, probation, project, and ad hoc reviews.                                                                                |
| **HRM-PER-003** | System shall define review period, review start date, submission deadline, approval deadline, and finalization date.                                                                            |
| **HRM-PER-004** | System shall assign eligible employees to performance review cycles.                                                                                                                            |
| **HRM-PER-005** | System shall determine review eligibility by employment status, tenure, department, grade, role, legal entity, and employee category.                                                           |
| **HRM-PER-006** | System shall allow employees and managers to define performance goals.                                                                                                                          |
| **HRM-PER-007** | System shall support goal weighting.                                                                                                                                                            |
| **HRM-PER-008** | System shall support measurable goal targets and achievement results.                                                                                                                           |
| **HRM-PER-009** | System shall track goal progress during the review period.                                                                                                                                      |
| **HRM-PER-010** | System shall allow employees to complete self-assessments.                                                                                                                                      |
| **HRM-PER-011** | System shall allow employees to provide self-ratings and comments.                                                                                                                              |
| **HRM-PER-012** | System shall allow managers to complete employee evaluations.                                                                                                                                   |
| **HRM-PER-013** | System shall allow managers to provide ratings, comments, and performance summaries.                                                                                                            |
| **HRM-PER-014** | System shall support competency-based assessment.                                                                                                                                               |
| **HRM-PER-015** | System shall support KPI-based assessment.                                                                                                                                                      |
| **HRM-PER-016** | System shall calculate weighted performance scores where configured.                                                                                                                            |
| **HRM-PER-017** | System shall support configurable rating scales.                                                                                                                                                |
| **HRM-PER-018** | System shall support manager recommendation for development, promotion, compensation review, or performance improvement.                                                                        |
| **HRM-PER-019** | System shall support employee acknowledgment of completed review.                                                                                                                               |
| **HRM-PER-020** | System shall support review meeting notes and discussion date.                                                                                                                                  |
| **HRM-PER-021** | System shall route performance reviews through approval workflow.                                                                                                                               |
| **HRM-PER-022** | System shall support HR review before finalization where required.                                                                                                                              |
| **HRM-PER-023** | System shall support rating calibration reference where enabled.                                                                                                                                |
| **HRM-PER-024** | System shall prevent finalization when mandatory review sections are incomplete.                                                                                                                |
| **HRM-PER-025** | System shall lock finalized performance reviews from normal editing.                                                                                                                            |
| **HRM-PER-026** | System shall preserve performance appraisal history by employee and review cycle.                                                                                                               |
| **HRM-PER-027** | System shall expose final rating and performance outcome references to Compensation Planning & Modeling and Bonus & Incentive Management where authorized.                                      |
| **HRM-PER-028** | System shall notify employees, managers, HR, and approvers of pending, submitted, returned, overdue, acknowledged, and finalized reviews.                                                       |
| **HRM-PER-029** | System shall provide performance reports by employee, manager, department, legal entity, review cycle, rating, completion status, and period.                                                   |
| **HRM-PER-030** | System shall restrict performance appraisal data based on employee, manager, HR, leadership, compensation, and auditor permissions.                                                             |
| **HRM-PER-031** | System shall maintain audit trail for goal creation, self-assessment, manager evaluation, rating change, submission, return, approval, acknowledgment, calibration reference, and finalization. |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                       |
| --: | ----------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Performance review cycle can be created with review type, review period, deadline, and eligible population.                               |
|   2 | Eligible employees can be assigned to a review cycle.                                                                                     |
|   3 | Employee goals can be created with target, weight, due date, and progress status.                                                         |
|   4 | Manager can review and approve employee goals where required.                                                                             |
|   5 | Employee can complete self-assessment.                                                                                                    |
|   6 | Employee can provide self-rating and self-review comments.                                                                                |
|   7 | Manager can complete employee evaluation.                                                                                                 |
|   8 | Manager can provide rating, comments, and performance summary.                                                                            |
|   9 | Competency assessment can be completed where configured.                                                                                  |
|  10 | KPI-based assessment can be completed where configured.                                                                                   |
|  11 | Weighted performance score can be calculated where configured.                                                                            |
|  12 | Configurable rating scale can be applied to review forms.                                                                                 |
|  13 | Review cannot be finalized when mandatory sections are incomplete.                                                                        |
|  14 | Employee can acknowledge completed performance review.                                                                                    |
|  15 | Review meeting date and discussion notes can be recorded.                                                                                 |
|  16 | HR can review performance appraisal before finalization where required.                                                                   |
|  17 | Rating calibration reference can be recorded where enabled.                                                                               |
|  18 | Finalized performance review is locked from normal editing.                                                                               |
|  19 | Final performance outcome can be referenced by Compensation Planning & Modeling and Bonus & Incentive Management where authorized.        |
|  20 | Performance appraisal history remains available by employee and review cycle.                                                             |
|  21 | Performance reports can be generated by cycle, department, manager, rating, completion status, and period.                                |
|  22 | Unauthorized users cannot view or edit restricted performance appraisal data.                                                             |
|  23 | Notifications are sent for pending, submitted, returned, overdue, acknowledged, and finalized reviews.                                    |
|  24 | Every goal, self-assessment, manager evaluation, rating change, approval, acknowledgment, and finalization action creates an audit event. |

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
| HRM-PER-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-PER-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-PER-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-talent-management-performance-appraisals typecheck`
2. `pnpm --filter @repo/features-talent-management-performance-appraisals lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
