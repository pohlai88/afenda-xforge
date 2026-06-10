# Overtime Management
## Business Definition
**Overtime Management is the HRM function that tracks, validates, approves, and calculates overtime hours, overtime eligibility, overtime rates, pay multipliers, overtime requests, overtime exceptions, and payroll-ready overtime outcomes based on configured policies and statutory rules.**

---
# Overtime Management Includes

| Area                            | What It Covers                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Overtime Request**            | Employee overtime request, manager-created overtime request, overtime reason, planned overtime        |
| **Overtime Approval**           | Manager approval, HR approval, department approval, exception approval                                |
| **Overtime Eligibility**        | Eligibility by employee type, grade, job category, location, legal entity, policy group               |
| **Overtime Hours Tracking**     | Approved hours, actual hours, payable hours, rejected hours, adjusted hours                           |
| **Overtime Type**               | Normal day overtime, rest day overtime, off day overtime, public holiday overtime, emergency overtime |
| **Overtime Rate Rules**         | 1.0x, 1.5x, 2.0x, 3.0x, fixed rate, statutory rate, company rate                                      |
| **Pay Rate Multipliers**        | Multiplier by day type, shift type, overtime type, country, employee group                            |
| **Overtime Calculation**        | Overtime amount, payable overtime, capped overtime, rounded overtime                                  |
| **Overtime Policy Enforcement** | Minimum overtime, maximum overtime, approval requirement, cutoff date, claim deadline                 |
| **Overtime Rounding Rules**     | Round up, round down, nearest interval, grace period                                                  |
| **Overtime Cap Rules**          | Daily cap, weekly cap, monthly cap, statutory cap, budget cap                                         |
| **Attendance Integration**      | Compare approved overtime with actual clock-in/out records                                            |
| **Shift Schedule Reference**    | Scheduled shift, planned hours, excess hours, rest day work, holiday work                             |
| **Compensatory Time Reference** | Time-off-in-lieu, replacement leave, overtime converted to leave                                      |
| **Payroll Integration**         | Payroll-ready overtime hours, overtime amount, overtime earning code                                  |
| **Exception Handling**          | Unapproved overtime, exceeded cap, missing attendance, late submission                                |
| **Overtime Reporting**          | Overtime by employee, department, manager, location, cost center, period                              |
| **Audit Trail**                 | Requested by, approved by, rejected by, adjusted by, calculated by, timestamp, reason                 |

---
# Overtime Management Does Not Include

| Excluded Area                     | Owned By                                 |
| --------------------------------- | ---------------------------------------- |
| Employee master profile           | Employee Records Management              |
| Organization hierarchy            | Organizational Chart & Hierarchy         |
| Shift pattern creation            | Shift Scheduling                         |
| Attendance clock-in/out capture   | Time Clock Integration                   |
| Daily attendance status           | Leave & Attendance Management            |
| Payroll final calculation         | Payroll Processing                       |
| Salary master data                | Payroll Processing / Employee Records    |
| Public holiday calendar ownership | Leave & Attendance / Calendar Management |
| GPS clock-in verification         | Geolocation & Remote Check-In            |
| Absence trend analytics           | Absence Analytics & Trends               |
| Flexible work arrangement policy  | Flexible Work Arrangement Tracking       |
| Expense reimbursement             | Expense Reimbursement                    |
| Performance management            | Performance Management                   |
| Compliance rule monitoring        | Compliance & Regulatory Tracking         |

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
# Overtime Management Requirement Statement

| Requirement             | Description                                                                                                                                                                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overtime Management** | Tracks, validates, approves, and calculates overtime hours with configurable eligibility rules, overtime types, pay rate multipliers, caps, rounding rules, attendance validation, exception handling, payroll integration, reporting, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-OTM-001** | System shall allow employees or authorized managers to submit overtime requests.                                                                                       |
| **HRM-OTM-002** | System shall capture overtime date, start time, end time, duration, overtime type, reason, and employee reference.                                                     |
| **HRM-OTM-003** | System shall support planned overtime and actual overtime.                                                                                                             |
| **HRM-OTM-004** | System shall define overtime eligibility by legal entity, country, location, employment type, grade, job category, department, and policy group.                       |
| **HRM-OTM-005** | System shall prevent ineligible employees from claiming overtime unless authorized override is approved.                                                               |
| **HRM-OTM-006** | System shall support overtime types including normal day, rest day, off day, public holiday, night overtime, and emergency overtime.                                   |
| **HRM-OTM-007** | System shall configure overtime rate multipliers by overtime type, day type, shift type, employee group, and country.                                                  |
| **HRM-OTM-008** | System shall calculate overtime hours from requested time range or attendance records.                                                                                 |
| **HRM-OTM-009** | System shall compare requested overtime against scheduled shift hours.                                                                                                 |
| **HRM-OTM-010** | System shall compare approved overtime against actual clock-in/out records where attendance integration is enabled.                                                    |
| **HRM-OTM-011** | System shall apply overtime rounding rules.                                                                                                                            |
| **HRM-OTM-012** | System shall apply minimum overtime duration rules.                                                                                                                    |
| **HRM-OTM-013** | System shall apply daily, weekly, monthly, statutory, and budget overtime caps where configured.                                                                       |
| **HRM-OTM-014** | System shall flag overtime that exceeds configured limits.                                                                                                             |
| **HRM-OTM-015** | System shall support overtime approval workflow.                                                                                                                       |
| **HRM-OTM-016** | System shall route overtime approvals by manager, department, cost center, location, overtime amount, employee grade, and exception status.                            |
| **HRM-OTM-017** | System shall allow approvers to approve, reject, return, or adjust overtime requests.                                                                                  |
| **HRM-OTM-018** | System shall require rejection or adjustment reason.                                                                                                                   |
| **HRM-OTM-019** | System shall support exception approval for late submission, exceeded cap, unplanned overtime, or missing attendance.                                                  |
| **HRM-OTM-020** | System shall calculate payable overtime hours after approval.                                                                                                          |
| **HRM-OTM-021** | System shall calculate overtime amount using applicable pay rate multiplier.                                                                                           |
| **HRM-OTM-022** | System shall support overtime conversion to compensatory time or replacement leave where policy allows.                                                                |
| **HRM-OTM-023** | System shall expose approved overtime hours, rate multiplier, earning code, and amount reference to Payroll Processing.                                                |
| **HRM-OTM-024** | System shall prevent payroll export of unapproved overtime.                                                                                                            |
| **HRM-OTM-025** | System shall track overtime status including draft, submitted, pending approval, approved, rejected, returned, cancelled, payroll-ready, and paid.                     |
| **HRM-OTM-026** | System shall notify employees and approvers of submitted, approved, rejected, returned, overdue, cancelled, and payroll-ready overtime.                                |
| **HRM-OTM-027** | System shall provide overtime reports by employee, department, manager, legal entity, location, cost center, overtime type, status, and period.                        |
| **HRM-OTM-028** | System shall restrict overtime records based on employee, manager, HR, payroll, finance, and auditor permissions.                                                      |
| **HRM-OTM-029** | System shall maintain audit trail for overtime request, validation, approval, rejection, adjustment, exception, calculation, payroll export, and cancellation actions. |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                                   |
| --: | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Employee or authorized manager can submit overtime request.                                                                                           |
|   2 | Overtime request captures date, start time, end time, duration, overtime type, and reason.                                                            |
|   3 | Overtime eligibility is validated before submission or approval.                                                                                      |
|   4 | Ineligible employees are blocked unless authorized override is approved.                                                                              |
|   5 | Normal day, rest day, off day, public holiday, night, and emergency overtime types can be configured.                                                 |
|   6 | Overtime rate multipliers can be configured by overtime type, day type, shift type, country, and employee group.                                      |
|   7 | Overtime hours can be calculated from request time range or attendance records.                                                                       |
|   8 | Requested overtime can be compared against scheduled shift hours.                                                                                     |
|   9 | Approved overtime can be validated against actual clock-in/out records where enabled.                                                                 |
|  10 | Overtime rounding rules are applied correctly.                                                                                                        |
|  11 | Daily, weekly, monthly, statutory, or budget overtime caps are enforced where configured.                                                             |
|  12 | Overtime exceeding configured limits is flagged.                                                                                                      |
|  13 | Overtime request follows configured approval workflow.                                                                                                |
|  14 | Approver can approve, reject, return, or adjust overtime request.                                                                                     |
|  15 | Rejected or adjusted overtime request stores reason.                                                                                                  |
|  16 | Late, over-cap, unplanned, or missing-attendance overtime requires exception approval where configured.                                               |
|  17 | Approved overtime calculates payable hours.                                                                                                           |
|  18 | Approved overtime calculates overtime amount using applicable multiplier.                                                                             |
|  19 | Approved overtime can be converted to compensatory time where policy allows.                                                                          |
|  20 | Only approved overtime can be sent to Payroll Processing.                                                                                             |
|  21 | Payroll-ready overtime includes hours, rate multiplier, earning code, and amount reference.                                                           |
|  22 | Overtime status is visible to employee, manager, HR, and payroll users where authorized.                                                              |
|  23 | Overtime reports can be generated by employee, department, manager, cost center, type, status, and period.                                            |
|  24 | Unauthorized users cannot view, approve, adjust, or export restricted overtime records.                                                               |
|  25 | Every overtime request, validation, approval, rejection, adjustment, calculation, exception, payroll export, and cancellation creates an audit event. |

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
| HRM-OTM-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-OTM-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-OTM-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-time-attendance-overtime-management typecheck`
2. `pnpm --filter @repo/features-time-attendance-overtime-management lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
