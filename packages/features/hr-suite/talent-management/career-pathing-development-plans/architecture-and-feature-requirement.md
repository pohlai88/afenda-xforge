# Career Pathing & Development Plans
## Business Definition
**Career Pathing & Development Plans is the HRM function that creates, tracks, and manages personalized employee career progression roadmaps, including target roles, development goals, competency gaps, skill milestones, mentoring, coaching, learning actions, readiness progress, and career movement references.**

---
# Career Pathing & Development Plans Includes

| Area                               | What It Covers                                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Career Path Framework**          | Vertical progression, lateral movement, specialist track, leadership track, functional track    |
| **Target Role Planning**           | Future role, next role, target position, career aspiration, mobility preference                 |
| **Career Roadmap**                 | Career stages, milestones, required skills, required competencies, expected timeline            |
| **Development Plan**               | Individual development plan, learning plan, skill improvement plan, competency improvement plan |
| **Milestone-Based Goals**          | Development milestone, target completion date, progress status, evidence requirement            |
| **Skill Gap Reference**            | Required skill, current skill level, target proficiency, development gap                        |
| **Competency Gap Reference**       | Required competency, current competency level, target competency level                          |
| **Learning Actions**               | Course, learning path, certification, workshop, seminar, training recommendation                |
| **Mentoring**                      | Mentor assignment, mentoring plan, mentoring session, mentoring progress                        |
| **Coaching**                       | Coach assignment, coaching objective, coaching session, coaching outcome                        |
| **Stretch Assignment**             | Project assignment, acting role, leadership exposure, cross-functional assignment               |
| **Manager Development Review**     | Manager recommendation, progress review, development feedback                                   |
| **Employee Career Preference**     | Preferred role, preferred department, preferred location, career interest                       |
| **Readiness Tracking**             | Readiness for next role, promotion readiness, mobility readiness, development progress          |
| **Career Discussion Record**       | Career conversation, review date, notes, agreed actions                                         |
| **Development Progress Dashboard** | Completed goals, overdue milestones, active actions, readiness progress                         |
| **Integration Reference**          | Performance appraisal, training, LMS, competency framework, succession planning                 |
| **Audit Trail**                    | Created by, reviewed by, updated by, approved by, completed by, timestamp                       |

---
# Career Pathing & Development Plans Does Not Include

| Excluded Area                  | Owned By                              |
| ------------------------------ | ------------------------------------- |
| Employee master profile        | Employee Records Management           |
| Organization hierarchy         | Organizational Chart & Hierarchy      |
| Job and position structure     | Organizational Chart / Job Management |
| Competency and skill library   | Competency & Skills Framework         |
| Course delivery                | Learning Management System            |
| Training administration        | Training & Development                |
| Performance review scoring     | Performance Appraisals                |
| Promotion workflow execution   | Employee Lifecycle Management         |
| Compensation adjustment        | Compensation Planning & Modeling      |
| Bonus calculation              | Bonus & Incentive Management          |
| Payroll calculation            | Payroll Processing                    |
| Succession nomination decision | Succession Planning                   |
| Recruitment pipeline           | Recruitment & Applicant Tracking      |
| Document storage engine        | Document Management                   |

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
# Career Pathing & Development Plans Requirement Statement

| Requirement                            | Description                                                                                                                                                                                                                                                                                              |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Career Pathing & Development Plans** | Creates personalized employee career progression roadmaps with target roles, milestone-based development goals, skill and competency gap references, learning actions, mentoring, coaching, stretch assignments, progress tracking, readiness indicators, manager reviews, reporting, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-CAR-001** | System shall create and maintain career path frameworks.                                                                                                                                                            |
| **HRM-CAR-002** | System shall support vertical, lateral, specialist, leadership, functional, and cross-functional career paths.                                                                                                      |
| **HRM-CAR-003** | System shall allow employees to define career aspirations and preferred target roles.                                                                                                                               |
| **HRM-CAR-004** | System shall allow managers or HR to recommend target roles for employees.                                                                                                                                          |
| **HRM-CAR-005** | System shall link target roles to job families, grades, positions, departments, and competency requirements.                                                                                                        |
| **HRM-CAR-006** | System shall compare employee current role against target role requirements.                                                                                                                                        |
| **HRM-CAR-007** | System shall identify skill gaps based on target role requirements.                                                                                                                                                 |
| **HRM-CAR-008** | System shall identify competency gaps based on target role requirements.                                                                                                                                            |
| **HRM-CAR-009** | System shall create personalized development plans for employees.                                                                                                                                                   |
| **HRM-CAR-010** | System shall support development goal types including skill, competency, certification, leadership, project, mentoring, and coaching goals.                                                                         |
| **HRM-CAR-011** | System shall define development milestones with target date, owner, priority, and completion criteria.                                                                                                              |
| **HRM-CAR-012** | System shall track development goal status including not started, in progress, completed, overdue, blocked, cancelled, and deferred.                                                                                |
| **HRM-CAR-013** | System shall recommend learning actions based on identified skill and competency gaps.                                                                                                                              |
| **HRM-CAR-014** | System shall link development goals to courses, learning paths, certifications, workshops, or external training.                                                                                                    |
| **HRM-CAR-015** | System shall support mentor assignment.                                                                                                                                                                             |
| **HRM-CAR-016** | System shall support coaching assignment.                                                                                                                                                                           |
| **HRM-CAR-017** | System shall track mentoring sessions, coaching sessions, notes, actions, and outcomes.                                                                                                                             |
| **HRM-CAR-018** | System shall support stretch assignments, project exposure, acting role assignments, and cross-functional development actions.                                                                                      |
| **HRM-CAR-019** | System shall allow employees to update development progress.                                                                                                                                                        |
| **HRM-CAR-020** | System shall allow managers to review and comment on development progress.                                                                                                                                          |
| **HRM-CAR-021** | System shall support scheduled career development discussions.                                                                                                                                                      |
| **HRM-CAR-022** | System shall record career discussion date, participants, notes, agreed actions, and next review date.                                                                                                              |
| **HRM-CAR-023** | System shall calculate or display readiness progress toward target role.                                                                                                                                            |
| **HRM-CAR-024** | System shall classify readiness as not ready, developing, near ready, ready, or role-ready.                                                                                                                         |
| **HRM-CAR-025** | System shall notify employees, managers, mentors, coaches, and HR of overdue milestones, upcoming reviews, and completed development goals.                                                                         |
| **HRM-CAR-026** | System shall expose development plan references to Performance Appraisals.                                                                                                                                          |
| **HRM-CAR-027** | System shall expose readiness indicators to Succession Planning where authorized.                                                                                                                                   |
| **HRM-CAR-028** | System shall expose learning recommendations to Training & Development and LMS.                                                                                                                                     |
| **HRM-CAR-029** | System shall provide career and development reports by employee, manager, department, job family, target role, readiness, status, and period.                                                                       |
| **HRM-CAR-030** | System shall restrict career aspiration, development plan, mentoring, coaching, and readiness data based on employee, manager, HR, mentor, coach, leadership, and auditor permissions.                              |
| **HRM-CAR-031** | System shall maintain audit trail for career path setup, target role selection, development plan creation, milestone update, mentor assignment, coach assignment, review, readiness update, and completion actions. |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                                                                                      |
| --: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Career path framework can be created for vertical, lateral, specialist, leadership, functional, or cross-functional progression.                                                                         |
|   2 | Employee can define career aspiration and target role.                                                                                                                                                   |
|   3 | Manager or HR can recommend target role where authorized.                                                                                                                                                |
|   4 | Target role can be linked to job family, grade, position, department, and required competencies.                                                                                                         |
|   5 | Employee current skills and competencies can be compared against target role requirements.                                                                                                               |
|   6 | Skill gaps can be identified for the selected target role.                                                                                                                                               |
|   7 | Competency gaps can be identified for the selected target role.                                                                                                                                          |
|   8 | Personalized development plan can be created for the employee.                                                                                                                                           |
|   9 | Development goals can be created for skills, competencies, certifications, leadership, projects, mentoring, or coaching.                                                                                 |
|  10 | Development milestones can store target date, owner, priority, and completion criteria.                                                                                                                  |
|  11 | Development goal status can be tracked as not started, in progress, completed, overdue, blocked, cancelled, or deferred.                                                                                 |
|  12 | Learning actions can be recommended from identified skill or competency gaps.                                                                                                                            |
|  13 | Development goals can be linked to courses, learning paths, certifications, workshops, or external training.                                                                                             |
|  14 | Mentor can be assigned to an employee development plan.                                                                                                                                                  |
|  15 | Coach can be assigned to an employee development plan.                                                                                                                                                   |
|  16 | Mentoring and coaching sessions can be tracked with notes, actions, and outcomes.                                                                                                                        |
|  17 | Stretch assignments, project exposure, acting roles, or cross-functional actions can be tracked.                                                                                                         |
|  18 | Employee can update development progress.                                                                                                                                                                |
|  19 | Manager can review and comment on development progress.                                                                                                                                                  |
|  20 | Career discussion records can capture date, participants, notes, agreed actions, and next review date.                                                                                                   |
|  21 | Readiness progress toward target role can be displayed.                                                                                                                                                  |
|  22 | Readiness can be classified as not ready, developing, near ready, ready, or role-ready.                                                                                                                  |
|  23 | Overdue milestones and upcoming reviews generate notifications.                                                                                                                                          |
|  24 | Development plan references are available to Performance Appraisals.                                                                                                                                     |
|  25 | Readiness indicators are available to Succession Planning where authorized.                                                                                                                              |
|  26 | Learning recommendations are available to Training & Development and LMS.                                                                                                                                |
|  27 | Career and development reports can be generated by employee, manager, department, job family, target role, readiness, status, and period.                                                                |
|  28 | Unauthorized users cannot view or modify restricted career aspiration, development plan, mentoring, coaching, or readiness data.                                                                         |
|  29 | Every career path setup, target role selection, development plan creation, milestone update, mentor assignment, coaching update, review, readiness update, and completion action creates an audit event. |

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
| HRM-CAR-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-CAR-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-CAR-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-talent-management-career-pathing-development-plans typecheck`
2. `pnpm --filter @repo/features-talent-management-career-pathing-development-plans lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
