# Employee Lifecycle Management
## Business Definition
**Employee Lifecycle Management is the HRM function that tracks, controls, and automates the complete employee journey from pre-boarding, hiring, onboarding, probation, confirmation, movement, promotion, transfer, suspension, resignation, termination, retirement, and post-employment record closure.**

---
# Employee Lifecycle Management Includes

| Area                           | What It Covers                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Pre-Employment Stage**       | Candidate conversion, pre-boarding preparation, employee record initiation                          |
| **Hiring Stage**               | Hiring confirmation, employment start preparation, offer-to-employee transition                     |
| **Onboarding Stage**           | Onboarding checklist, required forms, document submission, policy acknowledgment, orientation tasks |
| **Probation Stage**            | Probation tracking, probation review, extension, confirmation, failed probation outcome             |
| **Confirmation Stage**         | Confirmation approval, confirmation letter trigger, employment status update                        |
| **Active Employment Stage**    | Active employee monitoring, profile readiness, role assignment, HR task tracking                    |
| **Employee Movement**          | Promotion, transfer, demotion, job change, department change, location change                       |
| **Contract Lifecycle**         | Contract start, contract renewal, contract expiry, fixed-term employment review                     |
| **Manager / Reporting Change** | Reporting line change, manager reassignment, approval path update                                   |
| **Employment Status Change**   | Active, probation, confirmed, suspended, notice period, separated, retired                          |
| **Suspension / Hold Stage**    | Suspension tracking, employment restriction, investigation reference                                |
| **Resignation Stage**          | Resignation submission reference, notice period tracking, last working date trigger                 |
| **Termination Stage**          | Termination process trigger, termination reason, approval reference                                 |
| **Retirement Stage**           | Retirement eligibility, retirement notice, retirement workflow trigger                              |
| **Offboarding Trigger**        | Exit workflow initiation, clearance trigger, final access and payroll readiness reference           |
| **Workflow Automation**        | Automatic tasks, approvals, notifications, reminders, status transitions                            |
| **Lifecycle Audit Trail**      | Stage changes, action owner, approval reference, timestamp, reason, evidence reference              |

---

---
# Employee Lifecycle Management Does Not Include

| Excluded Area                    | Owned By                         |
| -------------------------------- | -------------------------------- |
| Employee master profile          | Employee Records Management      |
| Employee personal information    | Employee Records Management      |
| Organization hierarchy design    | Organizational Chart & Hierarchy |
| Employee document storage engine | Document Management              |
| Employee self-service portal UI  | Employee Self-Service Portal     |
| Payroll calculation              | Payroll                          |
| Final settlement calculation     | Payroll / Offboarding            |
| Leave balance calculation        | Leave Management                 |
| Attendance records               | Time & Attendance                |
| Performance review scoring       | Performance Management           |
| Training course management       | Learning / Training Management   |
| Compliance rule monitoring       | Compliance & Regulatory Tracking |
| Asset inventory ownership        | Asset Management                 |
| Exit interview execution         | Offboarding & Exit Management    |
| Access control permission design | IAM / Access Control             |

---

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
# Employee Lifecycle Management Requirement Statement

| Requirement                       | Description                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Employee Lifecycle Management** | Tracks and controls the complete employee journey from hire to retire, including pre-boarding, onboarding, probation, confirmation, employee movement, contract renewal, suspension, resignation, termination, retirement, and offboarding trigger, with automated workflows, notifications, approvals, status transitions, and audit history. |

---

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-LCY-001** | System shall define employee lifecycle stages.                                                                                                                                   |
| **HRM-LCY-002** | System shall track each employee’s current lifecycle stage.                                                                                                                      |
| **HRM-LCY-003** | System shall support lifecycle stages including pre-boarding, onboarding, probation, confirmed, active, suspended, notice period, offboarding, separated, retired, and archived. |
| **HRM-LCY-004** | System shall trigger onboarding workflow when a candidate is converted or an employee is created.                                                                                |
| **HRM-LCY-005** | System shall trigger required onboarding tasks based on employment type, legal entity, department, location, and role.                                                           |
| **HRM-LCY-006** | System shall track onboarding task completion status.                                                                                                                            |
| **HRM-LCY-007** | System shall trigger probation review before probation end date.                                                                                                                 |
| **HRM-LCY-008** | System shall support probation outcomes including confirmation, extension, or termination recommendation.                                                                        |
| **HRM-LCY-009** | System shall trigger confirmation workflow after probation approval.                                                                                                             |
| **HRM-LCY-010** | System shall trigger employee status update after confirmed lifecycle actions.                                                                                                   |
| **HRM-LCY-011** | System shall support promotion workflow.                                                                                                                                         |
| **HRM-LCY-012** | System shall support transfer workflow.                                                                                                                                          |
| **HRM-LCY-013** | System shall support demotion workflow.                                                                                                                                          |
| **HRM-LCY-014** | System shall support job, grade, manager, department, and location change workflows.                                                                                             |
| **HRM-LCY-015** | System shall support contract renewal workflow before contract expiry.                                                                                                           |
| **HRM-LCY-016** | System shall notify responsible users of upcoming contract expiry.                                                                                                               |
| **HRM-LCY-017** | System shall support suspension lifecycle state with reason, effective date, and approval reference.                                                                             |
| **HRM-LCY-018** | System shall support resignation lifecycle initiation.                                                                                                                           |
| **HRM-LCY-019** | System shall track notice period and last working date.                                                                                                                          |
| **HRM-LCY-020** | System shall trigger offboarding workflow after resignation, termination, retirement, or end of contract.                                                                        |
| **HRM-LCY-021** | System shall support termination lifecycle initiation with reason and approval reference.                                                                                        |
| **HRM-LCY-022** | System shall support retirement lifecycle initiation.                                                                                                                            |
| **HRM-LCY-023** | System shall prevent invalid lifecycle transitions.                                                                                                                              |
| **HRM-LCY-024** | System shall support effective-dated lifecycle transitions.                                                                                                                      |
| **HRM-LCY-025** | System shall preserve lifecycle history for every employee.                                                                                                                      |
| **HRM-LCY-026** | System shall send notifications and reminders for lifecycle tasks, approvals, and overdue actions.                                                                               |
| **HRM-LCY-027** | System shall expose lifecycle status to Employee Records, Payroll, Leave, Attendance, IAM, Compliance, and Offboarding modules.                                                  |
| **HRM-LCY-028** | System shall maintain audit trail for lifecycle stage changes, approvals, rejections, and automated triggers.                                                                    |

---

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                         |
| --: | --------------------------------------------------------------------------------------------------------------------------- |
|   1 | Employee lifecycle stage can be assigned and viewed.                                                                        |
|   2 | Employee lifecycle stage changes are historically traceable.                                                                |
|   3 | Onboarding workflow is triggered when an employee enters onboarding stage.                                                  |
|   4 | Onboarding tasks are generated based on employee attributes.                                                                |
|   5 | Probation review is triggered before probation end date.                                                                    |
|   6 | Probation can result in confirmation, extension, or termination recommendation.                                             |
|   7 | Confirmation approval updates the employee lifecycle stage.                                                                 |
|   8 | Promotion, transfer, demotion, department change, manager change, and location change can be processed as lifecycle events. |
|   9 | Contract expiry triggers renewal review before expiry date.                                                                 |
|  10 | Suspension lifecycle state requires reason, effective date, and authorization.                                              |
|  11 | Resignation creates notice period and last working date tracking.                                                           |
|  12 | Termination requires reason, approval reference, and effective date.                                                        |
|  13 | Retirement can be tracked as a lifecycle event.                                                                             |
|  14 | Offboarding workflow is triggered when employee enters resignation, termination, retirement, or contract-end stage.         |
|  15 | Invalid lifecycle transitions are blocked.                                                                                  |
|  16 | Future-dated lifecycle changes can be scheduled.                                                                            |
|  17 | Lifecycle status is available to payroll, leave, attendance, compliance, IAM, and offboarding modules.                      |
|  18 | Automated notifications are sent for pending, overdue, and completed lifecycle actions.                                     |
|  19 | Every lifecycle transition creates an audit event.                                                                          |
|  20 | Separated or retired employees retain lifecycle history after record archival.                                              |

---

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

**Status:** Implemented

**Last audited:** 2026-06-10

This section reflects the package surface that exists in code today. Unless a row says otherwise, the evidence below confirms package-owned contracts, actions, queries, repository boundaries, and tests rather than a complete end-to-end application audit.

| Area | Status | Evidence |
| --- | --- | --- |
| Feature contracts and schemas | Implemented | [`src/contract.ts`](./src/contract.ts), [`src/contracts/index.ts`](./src/contracts/index.ts), [`src/schema.ts`](./src/schema.ts) |
| Authorization and policy boundary | Partial | [`src/policy.ts`](./src/policy.ts), [`src/feature-scope.ts`](./src/feature-scope.ts), [`src/registry/capability.ts`](./src/registry/capability.ts), [`src/manifest.ts`](./src/manifest.ts) |
| Source-of-truth integration | Partial | [`src/metadata.ts`](./src/metadata.ts), [`src/repository.ts`](./src/repository.ts) |
| Repository and persistence | Implemented | [`src/repository.ts`](./src/repository.ts) |
| Queries, projections, or read models | Implemented | [`src/queries.ts`](./src/queries.ts) |
| Actions, workflows, or mutations | Implemented | [`src/actions.ts`](./src/actions.ts) |
| HTTP or API routes | Not implemented in package boundary | App-layer routes are not defined inside this package. |
| Requirement coverage registry | Partial | [`src/registry/requirement-coverage.ts`](./src/registry/requirement-coverage.ts), [`src/manifest.ts`](./src/manifest.ts) |
| Verification tests | Implemented | [`test/automation.test.ts`](./test/automation.test.ts), [`test/contract.test.ts`](./test/contract.test.ts), [`test/exit.test.ts`](./test/exit.test.ts), [`test/foundation.test.ts`](./test/foundation.test.ts), [`test/integration-contracts.test.ts`](./test/integration-contracts.test.ts), [`test/lifecycle-state-model.test.ts`](./test/lifecycle-state-model.test.ts), [`test/movement.test.ts`](./test/movement.test.ts), [`test/onboarding.test.ts`](./test/onboarding.test.ts), [`test/probation.test.ts`](./test/probation.test.ts), [`test/read-surface.test.ts`](./test/read-surface.test.ts), [`test/repository.test.ts`](./test/repository.test.ts), [`test/suspension.test.ts`](./test/suspension.test.ts) |

### Planning Mark

- `Current audited slices: package surface, contracts, queries, actions, repository, and verification assets`
- `Slice status: complete`
- `Feature status: partially implemented with verified package surfaces`

---
# Requirement Coverage

This package does not yet carry a complete row-by-row requirement audit in code unless explicitly linked below. The table records the currently auditable package-owned slice and should be expanded as implementation evidence becomes more precise.

| Requirement | Status | Evidence |
| --- | --- | --- |
| HRM-LCY-001 | Partial | [`src/contract.ts`](./src/contract.ts), [`src/contracts/index.ts`](./src/contracts/index.ts), [`src/schema.ts`](./src/schema.ts) |
| HRM-LCY-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-LCY-003 | Partial | [`src/registry/requirement-coverage.ts`](./src/registry/requirement-coverage.ts) |

---
# Element-by-Element Code Evaluation

This evaluation reflects the current package codebase as of 2026-06-10. It records the implementation surfaces that future slices should preserve and extend rather than bypass.

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| Feature manifest and metadata | Implemented as package-owned manifest and metadata surfaces. | [`src/manifest.ts`](./src/manifest.ts), [`src/metadata.ts`](./src/metadata.ts) | Preserve the exported package identity, manifest surface, and metadata contract when adding routes or UI integrations. |
| Contract and schema boundary | Implemented through explicit contract or schema files. | [`src/contract.ts`](./src/contract.ts), [`src/contracts/index.ts`](./src/contracts/index.ts), [`src/schema.ts`](./src/schema.ts) | Add new inputs and outputs through stable contracts and schemas instead of ad hoc object shapes. |
| Query and read-model surface | Implemented through package-owned query or projection surfaces. | [`src/queries.ts`](./src/queries.ts) | Keep UI and API consumers on read models or query surfaces rather than repository internals. |
| Action and execution surface | Implemented through action or execution files. | [`src/actions.ts`](./src/actions.ts) | Route mutations through explicit actions and execution helpers so policy, audit, and validation can be enforced centrally. |
| Repository or store boundary | Implemented through repository or store modules. | [`src/repository.ts`](./src/repository.ts) | Preserve a single persistence boundary so future storage changes do not leak into contracts or UI surfaces. |
| Verification surface | Implemented through package-level tests. | [`test/automation.test.ts`](./test/automation.test.ts), [`test/contract.test.ts`](./test/contract.test.ts), [`test/exit.test.ts`](./test/exit.test.ts), [`test/foundation.test.ts`](./test/foundation.test.ts), [`test/integration-contracts.test.ts`](./test/integration-contracts.test.ts), [`test/lifecycle-state-model.test.ts`](./test/lifecycle-state-model.test.ts), [`test/movement.test.ts`](./test/movement.test.ts), [`test/onboarding.test.ts`](./test/onboarding.test.ts), [`test/probation.test.ts`](./test/probation.test.ts), [`test/read-surface.test.ts`](./test/read-surface.test.ts), [`test/repository.test.ts`](./test/repository.test.ts), [`test/suspension.test.ts`](./test/suspension.test.ts) | Add targeted tests as feature slices become production-critical, especially around policies, actions, and read-model correctness. |

---
# Verification Summary

1. `pnpm --filter @repo/features-employee-management-employee-lifecycle-management typecheck`
2. `pnpm --filter @repo/features-employee-management-employee-lifecycle-management lint`
3. `pnpm --filter @repo/features-employee-management-employee-lifecycle-management test`
---
