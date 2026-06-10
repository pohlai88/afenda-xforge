# Offboarding & Exit Management
## Business Definition
**Offboarding & Exit Management is the HRM function that controls, tracks, and automates the employee exit process, including resignation, termination, retirement, contract end, exit clearance, exit interview, asset recovery, access revocation, knowledge handover, final payroll settlement reference, and post-employment record closure.**

---
# Offboarding & Exit Management Includes

| Area                               | What It Covers                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| **Exit Initiation**                | Resignation, termination, retirement, contract expiry, mutual separation               |
| **Exit Reason Tracking**           | Resignation reason, termination reason, retirement reason, contract-end reason         |
| **Notice Period Tracking**         | Notice start date, notice end date, required notice days, waived notice, short notice  |
| **Last Working Date**              | Final working day, effective separation date, adjusted last day                        |
| **Exit Approval Workflow**         | Manager approval, HR approval, management approval, legal review where required        |
| **Exit Checklist**                 | HR tasks, manager tasks, employee tasks, IT tasks, finance tasks, admin tasks          |
| **Exit Interview**                 | Exit interview scheduling, questionnaire, feedback, interview outcome                  |
| **Handover Management**            | Work handover, project handover, customer handover, document handover                  |
| **Asset Recovery**                 | Laptop, phone, access card, uniform, vehicle, tools, company property                  |
| **Access Revocation**              | System access, email access, building access, application access, badge access         |
| **Document Completion**            | Resignation letter, clearance form, release letter, experience letter, exit documents  |
| **Leave / Attendance Clearance**   | Outstanding leave, attendance correction, absence check, overtime reference            |
| **Claims / Advance Clearance**     | Outstanding claims, cash advance, reimbursement, employee debt reference               |
| **Final Settlement Reference**     | Final salary, unused leave payout, deductions, statutory payments, severance reference |
| **Replacement / Vacancy Trigger**  | Position vacancy update, replacement request, workforce planning reference             |
| **Post-Employment Record Closure** | Employee status update, record archive, retention rule, rehire eligibility             |
| **Audit Trail**                    | Submitted by, approved by, cleared by, revoked by, recovered by, timestamp, evidence   |

---
# Offboarding & Exit Management Does Not Include

| Excluded Area                      | Owned By                         |
| ---------------------------------- | -------------------------------- |
| Employee master profile            | Employee Records Management      |
| Employee lifecycle stage tracking  | Employee Lifecycle Management    |
| Organization hierarchy             | Organizational Chart & Hierarchy |
| Employee document storage engine   | Document Management              |
| Employee self-service portal       | Employee Self-Service Portal     |
| Payroll calculation                | Payroll                          |
| Final payroll computation          | Payroll                          |
| Statutory contribution calculation | Payroll                          |
| Leave balance calculation          | Leave Management                 |
| Attendance record ownership        | Time & Attendance                |
| Asset inventory master             | Asset Management                 |
| User account provisioning rules    | IAM / Access Control             |
| Legal dispute handling             | Legal / Compliance               |
| Recruitment replacement process    | Recruitment Management           |
| Performance review records         | Performance Management           |

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
# Offboarding & Exit Management Requirement Statement

| Requirement                       | Description                                                                                                                                                                                                                                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Offboarding & Exit Management** | Automates and controls employee exit processes, including resignation, termination, retirement, contract end, notice period tracking, exit approvals, exit checklist, exit interview, handover, asset recovery, access revocation, clearance, final settlement reference, employee status update, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-OFF-001** | System shall allow authorized users or employees to initiate an offboarding process.                                                                                |
| **HRM-OFF-002** | System shall support exit types including resignation, termination, retirement, contract expiry, redundancy, death, and mutual separation.                          |
| **HRM-OFF-003** | System shall capture exit reason, effective date, notice start date, notice end date, and last working date.                                                        |
| **HRM-OFF-004** | System shall calculate or validate notice period based on employment terms or policy reference.                                                                     |
| **HRM-OFF-005** | System shall support exit approval workflow based on exit type, employee grade, legal entity, department, and risk level.                                           |
| **HRM-OFF-006** | System shall generate offboarding checklist tasks automatically.                                                                                                    |
| **HRM-OFF-007** | System shall assign offboarding tasks to HR, manager, employee, IT, finance, payroll, admin, and asset owners.                                                      |
| **HRM-OFF-008** | System shall track completion status of every offboarding checklist item.                                                                                           |
| **HRM-OFF-009** | System shall support exit interview scheduling.                                                                                                                     |
| **HRM-OFF-010** | System shall support exit interview questionnaire and feedback capture.                                                                                             |
| **HRM-OFF-011** | System shall support work handover checklist and handover evidence.                                                                                                 |
| **HRM-OFF-012** | System shall track company asset recovery status.                                                                                                                   |
| **HRM-OFF-013** | System shall identify outstanding assets assigned to the employee.                                                                                                  |
| **HRM-OFF-014** | System shall track returned, damaged, missing, waived, or deducted asset status.                                                                                    |
| **HRM-OFF-015** | System shall trigger access revocation tasks for IT and security teams.                                                                                             |
| **HRM-OFF-016** | System shall track access revocation status for systems, email, physical access, applications, and devices.                                                         |
| **HRM-OFF-017** | System shall check outstanding leave, attendance, claims, advances, loans, deductions, and company property before clearance.                                       |
| **HRM-OFF-018** | System shall expose final settlement readiness to Payroll.                                                                                                          |
| **HRM-OFF-019** | System shall allow Payroll to return final settlement blockers to the offboarding checklist.                                                                        |
| **HRM-OFF-020** | System shall generate or link exit documents such as clearance form, acceptance of resignation, termination letter, release letter, and experience letter.          |
| **HRM-OFF-021** | System shall update employee employment status after offboarding completion.                                                                                        |
| **HRM-OFF-022** | System shall trigger position vacancy or replacement request where applicable.                                                                                      |
| **HRM-OFF-023** | System shall support rehire eligibility classification.                                                                                                             |
| **HRM-OFF-024** | System shall preserve offboarding history after employee separation.                                                                                                |
| **HRM-OFF-025** | System shall restrict sensitive exit information based on role and authorization.                                                                                   |
| **HRM-OFF-026** | System shall provide offboarding dashboard by status, exit type, department, manager, legal entity, and last working date.                                          |
| **HRM-OFF-027** | System shall send notifications for pending, overdue, blocked, and completed offboarding tasks.                                                                     |
| **HRM-OFF-028** | System shall maintain audit trail for offboarding initiation, approval, rejection, clearance, asset recovery, access revocation, settlement readiness, and closure. |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                |
| --: | ------------------------------------------------------------------------------------------------------------------ |
|   1 | Offboarding process can be initiated for resignation, termination, retirement, or contract end.                    |
|   2 | Exit reason, notice period, effective separation date, and last working date can be recorded.                      |
|   3 | Exit approval workflow is triggered based on exit type and employee profile.                                       |
|   4 | Offboarding checklist is automatically generated.                                                                  |
|   5 | Checklist tasks can be assigned to HR, manager, employee, IT, finance, payroll, admin, and asset owners.           |
|   6 | Each checklist task has owner, due date, status, and completion evidence.                                          |
|   7 | Exit interview can be scheduled and recorded.                                                                      |
|   8 | Exit interview feedback can be captured.                                                                           |
|   9 | Work handover tasks can be tracked.                                                                                |
|  10 | Outstanding company assets assigned to the employee are visible.                                                   |
|  11 | Asset recovery status can be marked as returned, damaged, missing, waived, or deducted.                            |
|  12 | Access revocation tasks are created for relevant systems and physical access.                                      |
|  13 | Access revocation status can be tracked.                                                                           |
|  14 | Outstanding leave, attendance, claims, advances, loans, deductions, and assets are checked before final clearance. |
|  15 | Final settlement readiness is exposed to Payroll.                                                                  |
|  16 | Final settlement calculation remains owned by Payroll.                                                             |
|  17 | Exit documents can be generated or linked.                                                                         |
|  18 | Employee status is updated after offboarding completion.                                                           |
|  19 | Position vacancy or replacement request can be triggered where applicable.                                         |
|  20 | Rehire eligibility can be recorded.                                                                                |
|  21 | Separated employee records remain historically available according to retention policy.                            |
|  22 | Sensitive exit information is hidden from unauthorized users.                                                      |
|  23 | Overdue offboarding tasks generate alerts.                                                                         |
|  24 | Every offboarding action creates an audit event.                                                                   |

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

---
# Requirement Coverage

This package does not yet carry a complete row-by-row requirement audit in code unless explicitly linked below. The table records the currently auditable package-owned slice and should be expanded as implementation evidence becomes more precise.

| Requirement | Status | Evidence |
| --- | --- | --- |
| HRM-OFF-001 | Partial | [`src/contract.ts`](./src/contract.ts), [`src/contracts/index.ts`](./src/contracts/index.ts), [`src/schema.ts`](./src/schema.ts) |
| HRM-OFF-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-OFF-003 | Partial | [`src/registry/requirement-coverage.ts`](./src/registry/requirement-coverage.ts) |

---
---
# Element-by-Element Code Evaluation

This evaluation reflects the current package codebase as of 2026-06-10. It records the implementation surfaces that future slices should preserve and extend rather than bypass.

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| Feature manifest and metadata | Implemented as package-owned manifest and metadata surfaces. | [`src/manifest.ts`](./src/manifest.ts), [`src/metadata.ts`](./src/metadata.ts) | Preserve the exported package identity, manifest surface, and metadata contract when adding routes or UI integrations. |
| Contract and schema boundary | Implemented through explicit contract or schema files. | [`src/contract.ts`](./src/contract.ts), [`src/contracts/index.ts`](./src/contracts/index.ts), [`src/schema.ts`](./src/schema.ts) | Add new inputs and outputs through stable contracts and schemas instead of ad hoc object shapes. |
| Query and read-model surface | Implemented through package-owned query or projection surfaces. | [`src/queries.ts`](./src/queries.ts) | Keep UI and API consumers on read models or query surfaces rather than repository internals. |
| Action and execution surface | Implemented through action or execution files. | [`src/actions.ts`](./src/actions.ts) | Route mutations through explicit actions and execution helpers so policy, audit, and validation can be enforced centrally. |
| Repository or store boundary | Implemented through repository or store modules. | [`src/repository.ts`](./src/repository.ts), [`src/repository.database.ts`](./src/repository.database.ts) | Preserve a single persistence boundary so future storage changes do not leak into contracts or UI surfaces. |
| Verification surface | Implemented through package-level tests. | [`test/offboarding-exit-management.test.ts`](./test/offboarding-exit-management.test.ts) | Add targeted tests as feature slices become production-critical, especially around policies, actions, and read-model correctness. |

---
---
# Verification Summary

1. `pnpm --filter @repo/features-employee-management-offboarding-exit-management typecheck`
2. `pnpm --filter @repo/features-employee-management-offboarding-exit-management lint`
3. `pnpm --filter @repo/features-employee-management-offboarding-exit-management test`
