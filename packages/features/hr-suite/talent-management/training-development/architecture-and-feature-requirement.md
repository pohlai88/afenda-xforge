# Training & Development
## Business Definition
**Training & Development is the HRM function that manages employee learning, skills, competencies, training programs, training assignments, course completion, certification tracking, development plans, training effectiveness, and compliance-related learning requirements.**

---
# Training & Development Includes

| Area                              | What It Covers                                                                                  |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Training Program Management**   | Internal training, external training, online course, classroom course, workshop, seminar        |
| **Course Catalog**                | Course title, course description, category, duration, provider, delivery mode                   |
| **Learning Assignment**           | Assigned course, required course, optional course, manager-assigned training                    |
| **Employee Skill Profile**        | Employee skills, skill level, proficiency level, skill gap reference                            |
| **Competency Tracking**           | Role competency, technical competency, leadership competency, behavioral competency             |
| **Certification Tracking**        | Required certification, certification status, issue date, expiry date, renewal date             |
| **Training Requirement**          | Mandatory training, role-based training, compliance training, safety training                   |
| **Training Enrollment**           | Employee enrollment, waitlist, approval, cancellation, attendance                               |
| **Training Completion**           | Completed, failed, no-show, withdrawn, expired, renewed                                         |
| **Training Assessment**           | Test score, passing score, assessment result, practical evaluation                              |
| **Development Plan**              | Individual development plan, career development goal, manager recommendation                    |
| **Training Provider**             | Internal trainer, external provider, certification body, learning vendor                        |
| **Training Cost Tracking**        | Course fee, travel cost, subsidy, training budget reference                                     |
| **Training Effectiveness**        | Feedback survey, rating, learning outcome, post-training evaluation                             |
| **Learning History**              | Completed courses, past certifications, expired certifications, renewal history                 |
| **Compliance Learning Reference** | Required policy training, safety training, regulatory training                                  |
| **Reporting**                     | Training completion report, certification expiry report, skill gap report, training cost report |
| **Audit Trail**                   | Assigned by, enrolled by, approved by, completed by, certified by, timestamp, evidence          |

---
# Training & Development Does Not Include

| Excluded Area                      | Owned By                                |
| ---------------------------------- | --------------------------------------- |
| Employee master profile            | Employee Records Management             |
| Employee job and assignment record | Employee Records / Organizational Chart |
| Performance appraisal scoring      | Performance Appraisals                  |
| Compensation planning              | Compensation Planning & Modeling        |
| Bonus payout calculation           | Bonus & Incentive Management            |
| Payroll calculation                | Payroll Processing                      |
| Expense claim reimbursement        | Expense Reimbursement                   |
| Document storage engine            | Document Management                     |
| Compliance rule monitoring         | Compliance & Regulatory Tracking        |
| Workplace incident management      | Health & Safety / Compliance            |
| Recruitment assessment scoring     | Recruitment & Applicant Tracking        |
| Organization structure             | Organizational Chart & Hierarchy        |
| External LMS platform ownership    | LMS / External Learning Provider        |
| Finance budget approval            | Finance / Budgeting                     |

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
# Training & Development Requirement Statement

| Requirement                | Description                                                                                                                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Training & Development** | Tracks employee skills, manages training programs, assigns learning requirements, monitors course completion, tracks certifications and renewals, identifies skill gaps, supports development plans, records training assessments, reports training outcomes, and maintains audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **HRM-TRN-001** | System shall create and maintain a training course catalog.                                                                                                                                      |
| **HRM-TRN-002** | System shall support training types including classroom, online, workshop, seminar, external course, certification, safety training, and compliance training.                                    |
| **HRM-TRN-003** | System shall maintain training provider records.                                                                                                                                                 |
| **HRM-TRN-004** | System shall define course duration, delivery mode, capacity, cost, location, trainer, and prerequisites.                                                                                        |
| **HRM-TRN-005** | System shall define mandatory training requirements by legal entity, department, role, grade, location, employment type, and employee category.                                                  |
| **HRM-TRN-006** | System shall assign training to employees individually or in bulk.                                                                                                                               |
| **HRM-TRN-007** | System shall allow employees to enroll in available training where enabled.                                                                                                                      |
| **HRM-TRN-008** | System shall support manager or HR approval for training enrollment where required.                                                                                                              |
| **HRM-TRN-009** | System shall support waitlist management when course capacity is full.                                                                                                                           |
| **HRM-TRN-010** | System shall track training attendance.                                                                                                                                                          |
| **HRM-TRN-011** | System shall track training completion status including not started, enrolled, in progress, completed, failed, no-show, withdrawn, expired, and renewed.                                         |
| **HRM-TRN-012** | System shall support training assessment results.                                                                                                                                                |
| **HRM-TRN-013** | System shall capture test score, passing score, result, and assessment date where applicable.                                                                                                    |
| **HRM-TRN-014** | System shall maintain employee skill profiles.                                                                                                                                                   |
| **HRM-TRN-015** | System shall track skill name, skill category, proficiency level, evidence, and last assessed date.                                                                                              |
| **HRM-TRN-016** | System shall track employee competencies by role, job family, department, or grade.                                                                                                              |
| **HRM-TRN-017** | System shall identify skill gaps against role or competency requirements.                                                                                                                        |
| **HRM-TRN-018** | System shall create development plan items based on skill gaps, manager recommendations, or performance review outcomes.                                                                         |
| **HRM-TRN-019** | System shall track employee certifications.                                                                                                                                                      |
| **HRM-TRN-020** | System shall capture certification issue date, expiry date, renewal date, issuing body, and certificate reference.                                                                               |
| **HRM-TRN-021** | System shall alert employees, managers, and HR before certification expiry.                                                                                                                      |
| **HRM-TRN-022** | System shall flag expired or missing required certifications.                                                                                                                                    |
| **HRM-TRN-023** | System shall link certification evidence to Document Management.                                                                                                                                 |
| **HRM-TRN-024** | System shall support training feedback surveys and course evaluation.                                                                                                                            |
| **HRM-TRN-025** | System shall track training cost by employee, department, provider, course, and period.                                                                                                          |
| **HRM-TRN-026** | System shall expose mandatory training completion status to Compliance & Regulatory Tracking where required.                                                                                     |
| **HRM-TRN-027** | System shall expose skill and certification readiness to Performance Appraisals and Employee Lifecycle Management where authorized.                                                              |
| **HRM-TRN-028** | System shall provide training reports by employee, department, manager, role, course, certification, status, provider, and period.                                                               |
| **HRM-TRN-029** | System shall restrict training, skill, certification, and assessment data based on employee, manager, HR, compliance, and auditor permissions.                                                   |
| **HRM-TRN-030** | System shall maintain audit trail for course setup, training assignment, enrollment, approval, attendance, completion, assessment, certification, renewal, expiry, and development plan actions. |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                                                           |
| --: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Training course can be created with title, category, provider, delivery mode, duration, cost, capacity, and prerequisites.                                                    |
|   2 | Training can be classified as classroom, online, workshop, seminar, external, certification, safety, or compliance training.                                                  |
|   3 | Mandatory training requirements can be configured by role, department, grade, location, legal entity, employment type, and employee category.                                 |
|   4 | Training can be assigned to individual employees or groups.                                                                                                                   |
|   5 | Employee can enroll in available training where enabled.                                                                                                                      |
|   6 | Training enrollment can require manager or HR approval.                                                                                                                       |
|   7 | Waitlist can be used when course capacity is full.                                                                                                                            |
|   8 | Training attendance can be recorded.                                                                                                                                          |
|   9 | Training completion status can be tracked.                                                                                                                                    |
|  10 | Training assessment score, result, and passing status can be recorded.                                                                                                        |
|  11 | Employee skill profile can be maintained with skill category and proficiency level.                                                                                           |
|  12 | Employee competencies can be tracked by role, job family, department, or grade.                                                                                               |
|  13 | Skill gaps can be identified against role or competency requirements.                                                                                                         |
|  14 | Development plan items can be created from skill gaps, manager recommendations, or performance review outcomes.                                                               |
|  15 | Employee certification can be recorded with issue date, expiry date, renewal date, and issuing body.                                                                          |
|  16 | Certification evidence can be linked to Document Management.                                                                                                                  |
|  17 | Expiring certifications generate alerts before expiry.                                                                                                                        |
|  18 | Expired or missing required certifications are flagged.                                                                                                                       |
|  19 | Training feedback and course evaluation can be captured.                                                                                                                      |
|  20 | Training cost can be tracked by employee, department, provider, course, and period.                                                                                           |
|  21 | Mandatory training completion status is available to Compliance & Regulatory Tracking where required.                                                                         |
|  22 | Skill and certification readiness can be referenced by Performance Appraisals and Employee Lifecycle Management where authorized.                                             |
|  23 | Training reports can be generated by employee, department, manager, role, course, certification, status, provider, and period.                                                |
|  24 | Unauthorized users cannot view or modify restricted training, skill, certification, or assessment records.                                                                    |
|  25 | Every course setup, assignment, enrollment, approval, attendance, completion, assessment, certification, renewal, expiry, and development plan action creates an audit event. |

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
| HRM-TRN-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-TRN-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-TRN-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-talent-management-training-development typecheck`
2. `pnpm --filter @repo/features-talent-management-training-development lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
