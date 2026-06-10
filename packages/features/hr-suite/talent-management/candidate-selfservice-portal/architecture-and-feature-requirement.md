# Recruitment Self-Service Portal
## Business Definition
**Recruitment Self-Service Portal is the HRM function that allows candidates, employees, hiring managers, interviewers, recruiters, and approvers to perform recruitment-related actions through role-based self-service access, including job applications, candidate profile updates, interview participation, hiring feedback, offer review, requisition requests, and recruitment task tracking.**

---
# Recruitment Self-Service Portal Includes

| Area                             | What It Covers                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Candidate Portal**             | Candidate registration, profile creation, application tracking, resume upload                       |
| **Career Site Access**           | Job search, job listing, job application, application submission                                    |
| **Candidate Profile Management** | Personal details, contact information, resume, cover letter, portfolio, certificates                |
| **Application Tracking**         | Application status, hiring stage, interview status, offer status                                    |
| **Internal Job Application**     | Existing employee applies for internal vacancy                                                      |
| **Job Alert Subscription**       | Candidate job alerts, saved jobs, matching vacancy notification                                     |
| **Interview Self-Service**       | Interview invitation, interview confirmation, reschedule request, interview instructions            |
| **Assessment Access**            | Online assessment link, test submission, assessment status                                          |
| **Candidate Communication**      | Application confirmation, interview reminder, rejection notice, offer communication                 |
| **Offer Self-Service**           | Offer viewing, offer acceptance, offer decline, offer document acknowledgment                       |
| **Pre-Employment Forms**         | Candidate information form, right-to-work details, reference details, medical declaration reference |
| **Document Submission**          | Resume, identity document reference, certificate, portfolio, work eligibility document              |
| **Hiring Manager Portal**        | Requisition request, candidate review, shortlist feedback, interview feedback                       |
| **Interviewer Portal**           | Interview schedule, scorecard submission, evaluation comments, hiring recommendation                |
| **Recruiter Workspace**          | Candidate pipeline updates, communication tracking, task follow-up                                  |
| **Approver Portal**              | Requisition approval, offer approval, exception approval                                            |
| **Recruitment Task Tracking**    | Pending interviews, pending feedback, pending approvals, pending offer actions                      |
| **Audit Trail**                  | Submitted by, reviewed by, approved by, updated by, accepted by, timestamp                          |

---
# Recruitment Self-Service Portal Does Not Include

| Excluded Area                       | Owned By                                                 |
| ----------------------------------- | -------------------------------------------------------- |
| Recruitment pipeline engine         | Recruitment & Applicant Tracking                         |
| Job requisition workflow rules      | Recruitment & Applicant Tracking                         |
| Resume parsing engine               | Recruitment & Applicant Tracking                         |
| Interview scheduling logic          | Recruitment & Applicant Tracking                         |
| Offer approval workflow             | Recruitment & Applicant Tracking                         |
| Employee master profile after hire  | Employee Records Management                              |
| New-hire onboarding workflow        | Recruitment & Onboarding / Employee Lifecycle Management |
| Employee self-service portal        | Employee Self-Service Portal                             |
| Payroll setup                       | Payroll Processing                                       |
| Compensation planning               | Compensation Planning & Modeling                         |
| Background check provider ownership | External Provider / Compliance                           |
| Document storage engine             | Document Management                                      |
| Organization hierarchy              | Organizational Chart & Hierarchy                         |
| User permission governance          | IAM / Access Control                                     |

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
# Recruitment Self-Service Portal Requirement Statement

| Requirement                         | Description                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Recruitment Self-Service Portal** | Provides role-based self-service access for candidates, internal applicants, hiring managers, interviewers, recruiters, and approvers to submit applications, manage candidate profiles, track application status, confirm interviews, complete assessments, submit hiring feedback, review offers, approve requisitions or offers, manage recruitment tasks, and maintain audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-RSS-001** | System shall provide a candidate-facing recruitment portal.                                                                                                                                                                         |
| **HRM-RSS-002** | System shall allow external candidates to create and maintain candidate profiles.                                                                                                                                                   |
| **HRM-RSS-003** | System shall allow candidates to search and view open job postings.                                                                                                                                                                 |
| **HRM-RSS-004** | System shall allow candidates to submit job applications online.                                                                                                                                                                    |
| **HRM-RSS-005** | System shall allow candidates to upload resume, cover letter, certificates, portfolio, or supporting documents.                                                                                                                     |
| **HRM-RSS-006** | System shall allow candidates to track application status.                                                                                                                                                                          |
| **HRM-RSS-007** | System shall allow candidates to update permitted profile information before hiring decision.                                                                                                                                       |
| **HRM-RSS-008** | System shall allow candidates to receive and respond to interview invitations.                                                                                                                                                      |
| **HRM-RSS-009** | System shall allow candidates to request interview rescheduling where enabled.                                                                                                                                                      |
| **HRM-RSS-010** | System shall allow candidates to access assigned assessments where enabled.                                                                                                                                                         |
| **HRM-RSS-011** | System shall allow candidates to complete pre-employment forms where required.                                                                                                                                                      |
| **HRM-RSS-012** | System shall allow candidates to view, accept, decline, or acknowledge offers where enabled.                                                                                                                                        |
| **HRM-RSS-013** | System shall allow candidates to withdraw applications.                                                                                                                                                                             |
| **HRM-RSS-014** | System shall support internal employee applications for internal job postings.                                                                                                                                                      |
| **HRM-RSS-015** | System shall allow hiring managers to submit requisition requests where enabled.                                                                                                                                                    |
| **HRM-RSS-016** | System shall allow hiring managers to view candidates assigned to their requisitions.                                                                                                                                               |
| **HRM-RSS-017** | System shall allow hiring managers to shortlist, reject, or comment on candidates where authorized.                                                                                                                                 |
| **HRM-RSS-018** | System shall allow interviewers to view assigned interviews.                                                                                                                                                                        |
| **HRM-RSS-019** | System shall allow interviewers to submit interview scorecards, ratings, comments, and hiring recommendations.                                                                                                                      |
| **HRM-RSS-020** | System shall allow approvers to approve, reject, return, or request clarification for requisitions.                                                                                                                                 |
| **HRM-RSS-021** | System shall allow approvers to approve, reject, return, or request clarification for offers.                                                                                                                                       |
| **HRM-RSS-022** | System shall display recruitment tasks by role, including pending applications, pending interviews, pending feedback, pending approvals, and pending offer actions.                                                                 |
| **HRM-RSS-023** | System shall send portal notifications for application updates, interview invitations, reminders, assessments, offers, approvals, rejections, and pending tasks.                                                                    |
| **HRM-RSS-024** | System shall restrict candidate, application, interview, scorecard, offer, and approval visibility based on role and permission.                                                                                                    |
| **HRM-RSS-025** | System shall protect candidate personal data with privacy controls and access logging.                                                                                                                                              |
| **HRM-RSS-026** | System shall support candidate consent collection for data processing where required.                                                                                                                                               |
| **HRM-RSS-027** | System shall support candidate account closure or data retention handling according to policy.                                                                                                                                      |
| **HRM-RSS-028** | System shall maintain audit trail for profile creation, application submission, document upload, interview response, assessment access, scorecard submission, offer response, approval, rejection, withdrawal, and account actions. |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                                        |
| --: | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | External candidate can create a candidate profile.                                                                                                         |
|   2 | Candidate can search and view open job postings.                                                                                                           |
|   3 | Candidate can submit application online.                                                                                                                   |
|   4 | Candidate can upload resume and supporting documents.                                                                                                      |
|   5 | Candidate can track application status.                                                                                                                    |
|   6 | Candidate can update permitted candidate profile fields.                                                                                                   |
|   7 | Candidate can receive and respond to interview invitation.                                                                                                 |
|   8 | Candidate can request interview rescheduling where enabled.                                                                                                |
|   9 | Candidate can access assigned assessment where enabled.                                                                                                    |
|  10 | Candidate can complete required pre-employment forms.                                                                                                      |
|  11 | Candidate can view, accept, decline, or acknowledge offer where enabled.                                                                                   |
|  12 | Candidate can withdraw application.                                                                                                                        |
|  13 | Internal employee can apply for internal job posting where enabled.                                                                                        |
|  14 | Hiring manager can submit requisition request where enabled.                                                                                               |
|  15 | Hiring manager can view candidates for assigned requisitions.                                                                                              |
|  16 | Hiring manager can shortlist, reject, or comment on candidates where authorized.                                                                           |
|  17 | Interviewer can view assigned interviews.                                                                                                                  |
|  18 | Interviewer can submit interview scorecard, rating, comments, and recommendation.                                                                          |
|  19 | Approver can approve, reject, return, or request clarification for requisitions.                                                                           |
|  20 | Approver can approve, reject, return, or request clarification for offers.                                                                                 |
|  21 | Recruitment tasks are visible by user role and responsibility.                                                                                             |
|  22 | Candidate and recruitment users receive notifications for relevant recruitment events.                                                                     |
|  23 | Candidate personal data is hidden from unauthorized users.                                                                                                 |
|  24 | Candidate consent is captured where required.                                                                                                              |
|  25 | Candidate account closure or retention action follows configured policy.                                                                                   |
|  26 | Every profile, application, document, interview, assessment, scorecard, offer, approval, rejection, withdrawal, and account action creates an audit event. |

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
| HRM-RSS-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-RSS-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-RSS-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-talent-management-candidate-selfservice-portal typecheck`
2. `pnpm --filter @repo/features-talent-management-candidate-selfservice-portal lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
