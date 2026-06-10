# Recruitment & Onboarding
## Business Definition
**Recruitment & Onboarding is the HRM function that manages the hiring journey from job requisition, job posting, applicant tracking, candidate evaluation, offer management, hiring approval, candidate conversion, and new-hire onboarding workflows until the employee is ready for active employment.**

---
# Recruitment & Onboarding Includes

| Area                        | What It Covers                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| **Job Requisition**         | Hiring request, vacancy request, replacement request, new headcount request                |
| **Requisition Approval**    | Manager approval, HR approval, finance approval, executive approval                        |
| **Job Posting**             | Internal posting, external posting, job description, job requirements                      |
| **Career Site Integration** | Career page, application form, candidate portal, job listing                               |
| **Applicant Tracking**      | Candidate pipeline, application status, hiring stage, candidate source                     |
| **Candidate Profile**       | Candidate personal details, contact details, resume, application history                   |
| **Resume Parsing**          | Skills, education, experience, certifications, employment history extraction               |
| **Candidate Screening**     | Screening questions, qualification check, eligibility check, shortlist decision            |
| **Interview Scheduling**    | Interview calendar, interviewer assignment, interview stage, interview confirmation        |
| **Interview Evaluation**    | Interview scorecard, comments, ratings, hiring recommendation                              |
| **Collaborative Hiring**    | Recruiter review, hiring manager feedback, panel scoring, decision tracking                |
| **Assessment Tracking**     | Test assignment, technical assessment, psychometric test, assessment result                |
| **Candidate Communication** | Application confirmation, interview invitation, rejection notice, offer communication      |
| **Offer Management**        | Offer proposal, salary offer, start date, employment terms, offer approval                 |
| **Offer Letter Reference**  | Offer letter generation, offer document link, candidate acceptance                         |
| **Pre-Employment Checks**   | Reference check, background check, right-to-work check, medical check reference            |
| **Candidate Conversion**    | Convert accepted candidate into employee record                                            |
| **New-Hire Onboarding**     | Onboarding checklist, onboarding tasks, document collection, orientation tasks             |
| **Onboarding Readiness**    | Required documents, profile completion, payroll readiness, IT readiness, manager readiness |
| **Audit Trail**             | Created by, approved by, screened by, interviewed by, offered by, converted by, timestamp  |

---
# Recruitment & Onboarding Does Not Include

| Excluded Area                            | Owned By                         |
| ---------------------------------------- | -------------------------------- |
| Employee master profile after conversion | Employee Records Management      |
| Employee lifecycle status after hiring   | Employee Lifecycle Management    |
| Organization hierarchy design            | Organizational Chart & Hierarchy |
| Payroll calculation                      | Payroll Processing               |
| Salary benchmarking                      | Salary Benchmarking & Surveys    |
| Compensation planning cycle              | Compensation Planning & Modeling |
| Benefits enrollment after activation     | Benefits Administration          |
| Daily attendance records                 | Leave & Attendance Management    |
| Shift assignment                         | Shift Scheduling                 |
| Training course management               | Learning & Development           |
| Performance review                       | Performance Management           |
| Document storage engine                  | Document Management              |
| IT account provisioning                  | IAM / IT Access Control          |
| Asset inventory ownership                | Asset Management                 |
| Legal case handling                      | Legal / Compliance               |

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
# Recruitment & Onboarding Requirement Statement

| Requirement                  | Description                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Recruitment & Onboarding** | Supports the hiring process from job requisitions, job postings, career site integration, applicant tracking, resume parsing, candidate screening, interview scheduling, collaborative evaluation, offer management, candidate conversion, and new-hire onboarding workflows with task tracking, readiness checks, communications, reporting, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-RON-001** | System shall allow authorized users to create job requisitions.                                                                                                                                    |
| **HRM-RON-002** | System shall capture requisition type including new headcount, replacement, temporary role, contract role, internship, or internal transfer.                                                       |
| **HRM-RON-003** | System shall link requisitions to legal entity, department, position, location, grade, hiring manager, and budget reference.                                                                       |
| **HRM-RON-004** | System shall route job requisitions through approval workflow.                                                                                                                                     |
| **HRM-RON-005** | System shall prevent job posting before requisition approval where approval is required.                                                                                                           |
| **HRM-RON-006** | System shall support internal and external job postings.                                                                                                                                           |
| **HRM-RON-007** | System shall publish approved vacancies to career site or job board integrations where enabled.                                                                                                    |
| **HRM-RON-008** | System shall allow candidates to submit applications online.                                                                                                                                       |
| **HRM-RON-009** | System shall create candidate profiles from applications.                                                                                                                                          |
| **HRM-RON-010** | System shall capture candidate source such as career site, referral, recruiter, agency, job board, or internal application.                                                                        |
| **HRM-RON-011** | System shall support resume upload and resume parsing.                                                                                                                                             |
| **HRM-RON-012** | System shall extract candidate skills, education, work history, certifications, and contact details where enabled.                                                                                 |
| **HRM-RON-013** | System shall support screening questions and knockout questions.                                                                                                                                   |
| **HRM-RON-014** | System shall support hiring pipeline stages.                                                                                                                                                       |
| **HRM-RON-015** | System shall track candidate status including applied, screened, shortlisted, interview, assessment, offer, hired, rejected, withdrawn, and archived.                                              |
| **HRM-RON-016** | System shall allow recruiters to move candidates between hiring stages.                                                                                                                            |
| **HRM-RON-017** | System shall support interview scheduling with candidate, interviewer, hiring manager, date, time, and interview type.                                                                             |
| **HRM-RON-018** | System shall send interview notifications or calendar invitations where enabled.                                                                                                                   |
| **HRM-RON-019** | System shall support interview scorecards.                                                                                                                                                         |
| **HRM-RON-020** | System shall allow interviewers to submit ratings, comments, and hiring recommendations.                                                                                                           |
| **HRM-RON-021** | System shall support collaborative candidate scoring across interview panel members.                                                                                                               |
| **HRM-RON-022** | System shall support assessment assignment and assessment result recording.                                                                                                                        |
| **HRM-RON-023** | System shall support automated candidate communications for application received, interview invitation, rejection, offer, withdrawal, and onboarding start.                                        |
| **HRM-RON-024** | System shall support offer creation with proposed role, salary, start date, employment type, manager, location, and conditions.                                                                    |
| **HRM-RON-025** | System shall route offer proposals through approval workflow.                                                                                                                                      |
| **HRM-RON-026** | System shall generate or link offer letters after approval.                                                                                                                                        |
| **HRM-RON-027** | System shall track offer status including draft, pending approval, approved, sent, accepted, declined, withdrawn, and expired.                                                                     |
| **HRM-RON-028** | System shall support pre-employment checks such as reference check, background check, right-to-work check, and medical check reference.                                                            |
| **HRM-RON-029** | System shall convert accepted candidates into employee records.                                                                                                                                    |
| **HRM-RON-030** | System shall trigger onboarding workflow after candidate conversion or accepted offer.                                                                                                             |
| **HRM-RON-031** | System shall generate onboarding tasks based on legal entity, department, role, employment type, location, and employee category.                                                                  |
| **HRM-RON-032** | System shall assign onboarding tasks to new hire, HR, manager, IT, payroll, admin, and document owners.                                                                                            |
| **HRM-RON-033** | System shall track onboarding task status including pending, in progress, completed, overdue, blocked, waived, and cancelled.                                                                      |
| **HRM-RON-034** | System shall collect required onboarding documents and forms.                                                                                                                                      |
| **HRM-RON-035** | System shall track policy acknowledgments required during onboarding.                                                                                                                              |
| **HRM-RON-036** | System shall expose onboarding readiness status to Employee Records, Payroll, IAM, Document Management, and Employee Lifecycle Management.                                                         |
| **HRM-RON-037** | System shall prevent onboarding completion when blocking mandatory tasks are incomplete.                                                                                                           |
| **HRM-RON-038** | System shall preserve recruitment and onboarding history after employee activation.                                                                                                                |
| **HRM-RON-039** | System shall provide recruitment and onboarding reports by requisition, source, stage, recruiter, hiring manager, department, onboarding status, and period.                                       |
| **HRM-RON-040** | System shall restrict access to candidate, offer, and onboarding data based on recruiter, hiring manager, interviewer, HR, finance, IT, and auditor permissions.                                   |
| **HRM-RON-041** | System shall maintain audit trail for requisition, posting, application, screening, interview, scoring, offer, conversion, onboarding task, readiness check, completion, and cancellation actions. |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                                      |
| --: | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Job requisition can be created with role, department, legal entity, location, hiring manager, employment type, and headcount requirement.                |
|   2 | Requisition can be classified as new headcount, replacement, temporary, contract, internship, or internal transfer.                                      |
|   3 | Requisition approval workflow is triggered where required.                                                                                               |
|   4 | Job cannot be posted before requisition approval where approval is mandatory.                                                                            |
|   5 | Approved job can be published to internal career page or external job board integration where enabled.                                                   |
|   6 | Candidate can submit application online with resume and required information.                                                                            |
|   7 | Candidate profile is created from application submission.                                                                                                |
|   8 | Candidate source is captured for recruitment reporting.                                                                                                  |
|   9 | Resume parsing extracts candidate information where enabled.                                                                                             |
|  10 | Screening questions can be configured for a requisition.                                                                                                 |
|  11 | Candidate can be moved through hiring pipeline stages.                                                                                                   |
|  12 | Candidate status is visible throughout the hiring process.                                                                                               |
|  13 | Interview can be scheduled with interviewer, date, time, and interview type.                                                                             |
|  14 | Interviewers can submit scorecards, ratings, comments, and recommendations.                                                                              |
|  15 | Candidate evaluation can aggregate feedback from multiple interviewers.                                                                                  |
|  16 | Assessment results can be recorded where applicable.                                                                                                     |
|  17 | Candidate communications can be sent for application, interview, rejection, offer, withdrawal, and onboarding events.                                    |
|  18 | Offer can be created with role, salary, start date, employment type, location, and conditions.                                                           |
|  19 | Offer approval workflow is completed before offer is sent where required.                                                                                |
|  20 | Offer status can be tracked from draft to accepted, declined, withdrawn, or expired.                                                                     |
|  21 | Pre-employment check references can be recorded before hiring completion.                                                                                |
|  22 | Accepted candidate can be converted into employee record.                                                                                                |
|  23 | Onboarding workflow is triggered after candidate conversion or accepted offer.                                                                           |
|  24 | Onboarding checklist is generated based on employee role, legal entity, employment type, department, and location.                                       |
|  25 | Onboarding tasks can be assigned to new hire, HR, manager, IT, payroll, admin, and document owners.                                                      |
|  26 | New hire can complete assigned onboarding tasks.                                                                                                         |
|  27 | Required onboarding documents and policy acknowledgments can be tracked.                                                                                 |
|  28 | Onboarding readiness status clearly shows missing, completed, blocked, and overdue items.                                                                |
|  29 | Employee activation is blocked when mandatory onboarding tasks are incomplete.                                                                           |
|  30 | Recruitment and onboarding history remains available after employee activation.                                                                          |
|  31 | Recruitment and onboarding reports can be generated by source, stage, recruiter, hiring manager, department, onboarding status, and period.              |
|  32 | Unauthorized users cannot view or modify restricted candidate, offer, or onboarding data.                                                                |
|  33 | Every requisition, application, screening, interview, offer, conversion, onboarding task, readiness check, and completion action creates an audit event. |

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
| HRM-RON-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-RON-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-RON-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-talent-management-recruitment-onboarding typecheck`
2. `pnpm --filter @repo/features-talent-management-recruitment-onboarding lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
