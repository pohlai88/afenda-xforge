# Leave & Attendance Management
## Business Definition
**Leave & Attendance Management is the HRM function that tracks employee attendance, manages leave entitlement, leave applications, leave balances, attendance exceptions, absence records, approval workflows, policy enforcement, and payroll-ready attendance outcomes.**

---
# Leave & Attendance Management Includes

| Area                              | What It Covers                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Attendance Records**            | Daily attendance status, present, absent, late, early out, half-day, missing punch                                  |
| **Leave Entitlement**             | Annual leave, medical leave, unpaid leave, maternity leave, paternity leave, compassionate leave, replacement leave |
| **Leave Balance**                 | Opening balance, earned leave, used leave, pending leave, adjusted leave, forfeited leave, carried-forward leave    |
| **Leave Application**             | Leave request, leave type, leave dates, reason, supporting document, approval status                                |
| **Leave Approval Workflow**       | Manager approval, HR approval, multi-level approval, delegation, escalation                                         |
| **Leave Policy Enforcement**      | Eligibility, entitlement rules, minimum notice period, blackout dates, maximum consecutive days                     |
| **Attendance Policy Enforcement** | Lateness rule, early departure rule, absence rule, grace period, workday rule                                       |
| **Holiday Calendar Reference**    | Public holiday, company holiday, regional holiday, replacement holiday                                              |
| **Work Calendar Reference**       | Working day, rest day, off day, weekend, company calendar                                                           |
| **Attendance Exception Handling** | Missing clock-in, missing clock-out, late arrival, early departure, unapproved absence                              |
| **Leave Adjustment**              | Manual adjustment, carry-forward adjustment, forfeiture, correction, encashment reference                           |
| **Medical Leave Tracking**        | Medical certificate reference, panel clinic reference, hospitalization reference                                    |
| **Unpaid Leave Tracking**         | Unpaid leave duration, payroll deduction reference, approval status                                                 |
| **Absence Tracking**              | Approved absence, unapproved absence, no-show, emergency leave, extended absence                                    |
| **Attendance Summary**            | Days worked, leave taken, absent days, late count, early-out count                                                  |
| **Payroll Integration**           | Approved unpaid leave, attendance deductions, overtime reference, absence deduction reference                       |
| **Audit Trail**                   | Submitted by, approved by, rejected by, adjusted by, timestamp, reason, evidence                                    |

---
# Leave & Attendance Management Does Not Include

| Excluded Area                               | Owned By                           |
| ------------------------------------------- | ---------------------------------- |
| Employee master profile                     | Employee Records Management        |
| Organization hierarchy                      | Organizational Chart & Hierarchy   |
| Payroll calculation                         | Payroll Processing                 |
| Overtime rate configuration and calculation | Overtime Management                |
| Shift pattern design                        | Shift Scheduling                   |
| Physical time clock device integration      | Time Clock Integration             |
| GPS-based clock-in/out                      | Geolocation & Remote Check-In      |
| Absence trend analytics                     | Absence Analytics & Trends         |
| Hybrid/remote work schedule policy          | Flexible Work Arrangement Tracking |
| Final salary computation                    | Payroll Processing                 |
| Benefits enrollment                         | Benefits Administration            |
| Expense claims                              | Expense Reimbursement              |
| Performance review                          | Performance Management             |
| Compliance case handling                    | Compliance & Regulatory Tracking   |

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
# Leave & Attendance Management Requirement Statement

| Requirement                       | Description                                                                                                                                                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Leave & Attendance Management** | Tracks employee attendance, manages leave entitlement, leave requests, leave balances, attendance exceptions, absence records, approval workflows, policy enforcement, payroll-ready attendance outcomes, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-LAM-001** | System shall maintain employee attendance records by employee, date, work calendar, and attendance status.                                                                                                              |
| **HRM-LAM-002** | System shall support attendance statuses including present, absent, late, early out, half-day, rest day, off day, public holiday, and missing punch.                                                                    |
| **HRM-LAM-003** | System shall maintain leave types such as annual leave, medical leave, unpaid leave, maternity leave, paternity leave, compassionate leave, emergency leave, study leave, replacement leave, and hospitalization leave. |
| **HRM-LAM-004** | System shall configure leave entitlement rules by legal entity, country, location, employee type, grade, tenure, and policy group.                                                                                      |
| **HRM-LAM-005** | System shall calculate employee leave entitlement based on configured policy rules.                                                                                                                                     |
| **HRM-LAM-006** | System shall maintain leave balances including opening, earned, used, pending, adjusted, forfeited, carried-forward, and remaining balance.                                                                             |
| **HRM-LAM-007** | System shall allow employees to submit leave applications.                                                                                                                                                              |
| **HRM-LAM-008** | System shall allow employees to attach supporting documents where required.                                                                                                                                             |
| **HRM-LAM-009** | System shall validate leave applications against available leave balance.                                                                                                                                               |
| **HRM-LAM-010** | System shall validate leave applications against leave eligibility rules.                                                                                                                                               |
| **HRM-LAM-011** | System shall validate leave applications against minimum notice period, maximum consecutive leave days, blackout dates, and overlapping leave.                                                                          |
| **HRM-LAM-012** | System shall route leave applications through approval workflow.                                                                                                                                                        |
| **HRM-LAM-013** | System shall support approval routing by manager, HR, department, leave type, duration, and employee grade.                                                                                                             |
| **HRM-LAM-014** | System shall allow approvers to approve, reject, return, or request clarification for leave applications.                                                                                                               |
| **HRM-LAM-015** | System shall require rejection reason for rejected leave applications.                                                                                                                                                  |
| **HRM-LAM-016** | System shall update leave balance after leave approval, cancellation, adjustment, or reversal.                                                                                                                          |
| **HRM-LAM-017** | System shall support leave cancellation and amendment based on policy.                                                                                                                                                  |
| **HRM-LAM-018** | System shall support manual leave balance adjustment with reason and authorization.                                                                                                                                     |
| **HRM-LAM-019** | System shall support leave carry-forward and forfeiture rules.                                                                                                                                                          |
| **HRM-LAM-020** | System shall track unpaid leave and expose payroll deduction reference to Payroll Processing.                                                                                                                           |
| **HRM-LAM-021** | System shall track medical leave with medical certificate reference where required.                                                                                                                                     |
| **HRM-LAM-022** | System shall detect attendance exceptions such as late arrival, early departure, absence, and missing punch.                                                                                                            |
| **HRM-LAM-023** | System shall allow attendance exception correction requests where enabled.                                                                                                                                              |
| **HRM-LAM-024** | System shall route attendance correction requests through approval workflow.                                                                                                                                            |
| **HRM-LAM-025** | System shall summarize attendance by employee, department, manager, legal entity, work location, and period.                                                                                                            |
| **HRM-LAM-026** | System shall expose approved leave, unpaid leave, absence, lateness, and attendance deduction references to Payroll Processing.                                                                                         |
| **HRM-LAM-027** | System shall restrict leave and attendance records based on employee, manager, HR, payroll, and auditor permissions.                                                                                                    |
| **HRM-LAM-028** | System shall notify employees and approvers of submitted, approved, rejected, cancelled, overdue, and returned leave or attendance requests.                                                                            |
| **HRM-LAM-029** | System shall provide leave and attendance reports by employee, department, leave type, attendance status, manager, location, legal entity, and period.                                                                  |
| **HRM-LAM-030** | System shall maintain audit trail for leave entitlement, leave application, approval, rejection, cancellation, adjustment, attendance correction, exception handling, and payroll integration.                          |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                          |
| --: | ---------------------------------------------------------------------------------------------------------------------------- |
|   1 | Employee attendance record can be maintained by employee and date.                                                           |
|   2 | Attendance status can show present, absent, late, early out, half-day, rest day, off day, holiday, or missing punch.         |
|   3 | Leave types can be configured by policy group.                                                                               |
|   4 | Leave entitlement can be calculated based on employee category, grade, tenure, location, legal entity, and country.          |
|   5 | Leave balance shows earned, used, pending, adjusted, carried-forward, forfeited, and remaining balance.                      |
|   6 | Employee can submit leave application online.                                                                                |
|   7 | Leave application validates available balance before submission or approval.                                                 |
|   8 | Leave application validates eligibility, minimum notice period, maximum duration, blackout dates, and overlapping leave.     |
|   9 | Supporting document is required when leave policy requires it.                                                               |
|  10 | Leave application follows configured approval workflow.                                                                      |
|  11 | Approver can approve, reject, return, or request clarification.                                                              |
|  12 | Rejected leave application stores rejection reason.                                                                          |
|  13 | Approved leave updates leave balance.                                                                                        |
|  14 | Leave cancellation or amendment updates leave balance correctly.                                                             |
|  15 | Manual leave balance adjustment requires authorization and reason.                                                           |
|  16 | Leave carry-forward and forfeiture can be processed according to policy.                                                     |
|  17 | Unpaid leave is exposed to Payroll Processing for deduction reference.                                                       |
|  18 | Attendance exceptions such as late, early out, absent, and missing punch are flagged.                                        |
|  19 | Attendance correction request can be submitted and approved where enabled.                                                   |
|  20 | Approved attendance and leave outcomes are available for payroll processing.                                                 |
|  21 | Employees can view their own leave balance, leave history, and attendance summary.                                           |
|  22 | Managers can view team leave calendar and attendance exceptions where authorized.                                            |
|  23 | Unauthorized users cannot view or modify restricted leave and attendance records.                                            |
|  24 | Leave and attendance reports can be generated by employee, department, leave type, status, location, and period.             |
|  25 | Every leave, attendance, correction, approval, rejection, adjustment, and payroll integration action creates an audit event. |

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
| Feature contracts and schemas | Implemented | [`src/contract.ts`](./src/contract.ts), [`src/schema.ts`](./src/schema.ts) |
| Authorization and policy boundary | Partial | [`src/manifest.ts`](./src/manifest.ts) |
| Source-of-truth integration | Partial | [`src/metadata.ts`](./src/metadata.ts), [`src/repository.ts`](./src/repository.ts) |
| Repository and persistence | Implemented | [`src/repository.ts`](./src/repository.ts) |
| Queries, projections, or read models | Implemented | [`src/queries.ts`](./src/queries.ts) |
| Actions, workflows, or mutations | Implemented | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts) |
| HTTP or API routes | Not implemented in package boundary | App-layer routes are not defined inside this package. |
| Requirement coverage registry | Not started | [`src/manifest.ts`](./src/manifest.ts) |
| Verification tests | Implemented | [`test/leave-read.test.ts`](./test/leave-read.test.ts) |

### Planning Mark

- `Current audited slices: package surface, contracts, queries, actions, repository, and verification assets`
- `Slice status: partial`
- `Feature status: partially implemented`

---
# Requirement Coverage

This package does not yet carry a complete row-by-row requirement audit in code unless explicitly linked below. The table records the currently auditable package-owned slice and should be expanded as implementation evidence becomes more precise.

| Requirement | Status | Evidence |
| --- | --- | --- |
| HRM-LAM-001 | Partial | [`src/contract.ts`](./src/contract.ts), [`src/schema.ts`](./src/schema.ts), [`src/repository.ts`](./src/repository.ts) |
| HRM-LAM-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-LAM-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

---
# Element-by-Element Code Evaluation

This evaluation reflects the current package codebase as of 2026-06-10. It records the implementation surfaces that future slices should preserve and extend rather than bypass.

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| Feature manifest and metadata | Implemented as package-owned manifest and metadata surfaces. | [`src/manifest.ts`](./src/manifest.ts), [`src/metadata.ts`](./src/metadata.ts) | Preserve the exported package identity, manifest surface, and metadata contract when adding routes or UI integrations. |
| Contract and schema boundary | Implemented through explicit contract or schema files. | [`src/contract.ts`](./src/contract.ts), [`src/schema.ts`](./src/schema.ts) | Add new inputs and outputs through stable contracts and schemas instead of ad hoc object shapes. |
| Query and read-model surface | Implemented through package-owned query or projection surfaces. | [`src/queries.ts`](./src/queries.ts) | Keep UI and API consumers on read models or query surfaces rather than repository internals. |
| Action and execution surface | Implemented through action or execution files. | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts) | Route mutations through explicit actions and execution helpers so policy, audit, and validation can be enforced centrally. |
| Repository or store boundary | Implemented through repository or store modules. | [`src/repository.ts`](./src/repository.ts) | Preserve a single persistence boundary so future storage changes do not leak into contracts or UI surfaces. |
| Verification surface | Implemented through package-level tests. | [`test/leave-read.test.ts`](./test/leave-read.test.ts) | Add targeted tests as feature slices become production-critical, especially around policies, actions, and read-model correctness. |

---
# Verification Summary

1. `pnpm --filter @repo/features-time-attendance-leave-attendance-management typecheck`
2. `pnpm --filter @repo/features-time-attendance-leave-attendance-management lint`
3. `pnpm --filter @repo/features-time-attendance-leave-attendance-management test`
---
