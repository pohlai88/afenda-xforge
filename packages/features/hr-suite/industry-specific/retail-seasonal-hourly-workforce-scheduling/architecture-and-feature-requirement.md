# Retail Seasonal & Hourly Workforce Scheduling
## Business Definition
**Retail Seasonal & Hourly Workforce Scheduling is the HRM function that plans, assigns, optimizes, and controls schedules for retail hourly, part-time, temporary, and seasonal workers, including availability preferences, shift swaps, labor demand, store coverage, labor budget limits, overtime risk, compliance rules, and payroll-ready schedule references.**

---
# Retail Seasonal & Hourly Workforce Scheduling Includes

| Area                                | What It Covers                                                                                       |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Hourly Workforce Scheduling**     | Hourly employee roster, part-time schedule, daily shift assignment, weekly store roster              |
| **Seasonal Workforce Scheduling**   | Peak season staffing, holiday staffing, temporary worker schedule, campaign-based staffing           |
| **Retail Store Coverage**           | Store opening coverage, closing coverage, cashier coverage, sales floor coverage, stockroom coverage |
| **Labor Demand Planning Reference** | Forecasted demand, sales volume reference, footfall reference, promotion period, holiday period      |
| **Availability Preferences**        | Employee available days, unavailable days, preferred shifts, maximum weekly hours                    |
| **Shift Swap Request**              | Employee shift swap, replacement employee validation, manager approval                               |
| **Open Shift Management**           | Open shift posting, employee pickup, manager assignment, first-come or approval-based claiming       |
| **Part-Time Scheduling**            | Minimum hours, maximum hours, contract hours, student worker schedule                                |
| **Temporary Worker Scheduling**     | Fixed-term worker, agency worker reference, temporary assignment schedule                            |
| **Labor Budget Control**            | Planned labor cost, scheduled labor cost, approved labor budget, over-budget warning                 |
| **Overtime Risk Control**           | Overtime forecast, scheduled overtime warning, weekly hour threshold, approval requirement           |
| **Break & Rest Compliance**         | Meal break, rest break, minimum rest period, maximum shift length                                    |
| **Minor / Student Worker Rules**    | Age-based restriction, school-hour restriction, maximum working hours where applicable               |
| **Skills / Role Coverage**          | Cashier, supervisor, key holder, stock handler, visual merchandiser, certified operator              |
| **Store Manager Workspace**         | Roster view, coverage gaps, over-budget alerts, availability conflicts, pending swaps                |
| **Employee Schedule View**          | Personal schedule, upcoming shifts, swap status, open shifts, schedule notifications                 |
| **Payroll Reference**               | Scheduled hours, actual hours reference, shift premium reference, holiday work reference             |
| **Audit Trail**                     | Created by, assigned by, swapped by, approved by, changed by, published by, timestamp                |

---
# Retail Seasonal & Hourly Workforce Scheduling Does Not Include

| Excluded Area                     | Owned By                               |
| --------------------------------- | -------------------------------------- |
| Employee master profile           | Employee Records Management            |
| Standard organization hierarchy   | Organizational Chart & Hierarchy       |
| Generic shift pattern engine      | Shift Scheduling                       |
| Daily attendance records          | Leave & Attendance Management          |
| Clock-in/out capture              | Time Clock Integration                 |
| GPS remote check-in               | Geolocation & Remote Check-In          |
| Overtime approval and calculation | Overtime Management                    |
| Payroll calculation               | Payroll Processing                     |
| Retail sales forecasting engine   | Retail Operations / Sales Forecasting  |
| Store operations task management  | Retail Operations                      |
| Recruitment of seasonal workers   | Recruitment & Onboarding               |
| Temporary worker contract records | Employee Records / Document Management |
| Labor budget ownership            | Finance / Workforce Planning           |
| Employee performance scoring      | Performance Appraisals                 |
| Expense reimbursement             | Expense Reimbursement                  |

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
# Retail Seasonal & Hourly Workforce Scheduling Requirement Statement

| Requirement                                       | Description                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Retail Seasonal & Hourly Workforce Scheduling** | Optimizes scheduling for hourly, part-time, temporary, and seasonal retail workers with store coverage planning, availability preferences, open shifts, shift swaps, labor demand references, labor budget controls, overtime risk monitoring, break/rest compliance, employee notifications, payroll references, reporting, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-RWS-001** | System shall create and manage schedules for hourly, part-time, temporary, and seasonal retail workers.                                                                                                       |
| **HRM-RWS-002** | System shall support store, branch, department, team, role, and legal entity scheduling.                                                                                                                      |
| **HRM-RWS-003** | System shall support daily, weekly, bi-weekly, monthly, seasonal, and campaign-based schedules.                                                                                                               |
| **HRM-RWS-004** | System shall allow store managers to create draft schedules before publication.                                                                                                                               |
| **HRM-RWS-005** | System shall support schedule publication to employees.                                                                                                                                                       |
| **HRM-RWS-006** | System shall support employee availability preferences by day, time window, shift type, and maximum hours.                                                                                                    |
| **HRM-RWS-007** | System shall support employee unavailable dates and blocked dates.                                                                                                                                            |
| **HRM-RWS-008** | System shall validate schedule assignments against employee availability.                                                                                                                                     |
| **HRM-RWS-009** | System shall support required coverage by store, department, role, hour, day, and period.                                                                                                                     |
| **HRM-RWS-010** | System shall identify understaffed and overstaffed schedule periods.                                                                                                                                          |
| **HRM-RWS-011** | System shall support role-based coverage such as cashier, supervisor, key holder, sales associate, stockroom, and visual merchandising.                                                                       |
| **HRM-RWS-012** | System shall support skill or certification-based assignment validation.                                                                                                                                      |
| **HRM-RWS-013** | System shall support open shift creation and employee pickup.                                                                                                                                                 |
| **HRM-RWS-014** | System shall support open shift approval where required.                                                                                                                                                      |
| **HRM-RWS-015** | System shall allow employees to request shift swaps.                                                                                                                                                          |
| **HRM-RWS-016** | System shall validate shift swap eligibility based on availability, role, skill, scheduled hours, rest rules, and policy.                                                                                     |
| **HRM-RWS-017** | System shall route shift swap requests through approval workflow where required.                                                                                                                              |
| **HRM-RWS-018** | System shall allow managers to approve, reject, return, or override shift swap requests.                                                                                                                      |
| **HRM-RWS-019** | System shall require reason for rejected or overridden shift swaps.                                                                                                                                           |
| **HRM-RWS-020** | System shall support labor demand references from sales volume, footfall, promotion period, holiday period, or store forecast where enabled.                                                                  |
| **HRM-RWS-021** | System shall calculate scheduled labor hours.                                                                                                                                                                 |
| **HRM-RWS-022** | System shall calculate scheduled labor cost using employee rate or labor cost reference where authorized.                                                                                                     |
| **HRM-RWS-023** | System shall compare scheduled labor cost against labor budget.                                                                                                                                               |
| **HRM-RWS-024** | System shall flag schedules that exceed labor budget.                                                                                                                                                         |
| **HRM-RWS-025** | System shall identify scheduled overtime risk before schedule publication.                                                                                                                                    |
| **HRM-RWS-026** | System shall enforce or flag maximum daily hours, maximum weekly hours, minimum rest period, meal break, and rest break rules.                                                                                |
| **HRM-RWS-027** | System shall support minor, student, or restricted worker scheduling rules where applicable.                                                                                                                  |
| **HRM-RWS-028** | System shall support holiday, weekend, late-night, and peak-season scheduling rules.                                                                                                                          |
| **HRM-RWS-029** | System shall notify employees of published schedules, schedule changes, open shifts, swap requests, approvals, and cancellations.                                                                             |
| **HRM-RWS-030** | System shall compare scheduled hours with actual attendance records.                                                                                                                                          |
| **HRM-RWS-031** | System shall expose scheduled hours, shift premium reference, holiday work reference, and actual attendance reference to Payroll Processing through attendance outcomes.                                      |
| **HRM-RWS-032** | System shall provide retail workforce scheduling reports by store, department, employee, manager, role, shift, labor cost, budget variance, coverage gap, and period.                                         |
| **HRM-RWS-033** | System shall restrict schedule creation, labor cost visibility, budget controls, swaps, overrides, and reports based on employee, store manager, area manager, HR, payroll, finance, and auditor permissions. |
| **HRM-RWS-034** | System shall maintain audit trail for schedule creation, assignment, publication, change, open shift, pickup, swap, approval, rejection, override, budget warning, and payroll reference actions.             |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                                                              |
| --: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Store manager can create schedule for hourly, part-time, temporary, and seasonal retail employees.                                                                               |
|   2 | Schedule can be created by store, department, role, team, date, and period.                                                                                                      |
|   3 | Draft schedule can be prepared before publication.                                                                                                                               |
|   4 | Published schedule is visible to assigned employees.                                                                                                                             |
|   5 | Employee availability preferences can be recorded by day, time window, shift type, and maximum hours.                                                                            |
|   6 | Employee unavailable or blocked dates can be recorded.                                                                                                                           |
|   7 | Schedule assignment validates employee availability.                                                                                                                             |
|   8 | Required coverage can be defined by store, department, role, hour, and date.                                                                                                     |
|   9 | Understaffed and overstaffed periods are flagged.                                                                                                                                |
|  10 | Role coverage can be validated for cashier, supervisor, key holder, sales associate, stockroom, and other retail roles.                                                          |
|  11 | Skill or certification requirements can be validated before shift assignment.                                                                                                    |
|  12 | Open shifts can be created and offered to eligible employees.                                                                                                                    |
|  13 | Employee can pick up open shift where eligible.                                                                                                                                  |
|  14 | Open shift pickup can require manager approval where configured.                                                                                                                 |
|  15 | Employee can request shift swap.                                                                                                                                                 |
|  16 | Shift swap validates availability, role, skill, scheduled hours, rest rules, and policy.                                                                                         |
|  17 | Shift swap follows approval workflow where required.                                                                                                                             |
|  18 | Manager can approve, reject, return, or override shift swap.                                                                                                                     |
|  19 | Rejected or overridden shift swap stores reason.                                                                                                                                 |
|  20 | Schedule can reference sales volume, footfall, promotion, holiday, or store demand forecast where enabled.                                                                       |
|  21 | Scheduled labor hours are calculated.                                                                                                                                            |
|  22 | Scheduled labor cost is calculated where the user is authorized to view labor cost.                                                                                              |
|  23 | Scheduled labor cost is compared against labor budget.                                                                                                                           |
|  24 | Over-budget schedules are flagged before publication.                                                                                                                            |
|  25 | Scheduled overtime risk is flagged before publication.                                                                                                                           |
|  26 | Maximum daily hours, maximum weekly hours, minimum rest period, meal break, and rest break rules are enforced or flagged.                                                        |
|  27 | Minor, student, or restricted worker rules can be applied where applicable.                                                                                                      |
|  28 | Holiday, weekend, late-night, and peak-season rules can be applied.                                                                                                              |
|  29 | Employees receive notifications for published schedules, changes, open shifts, swaps, approvals, and cancellations.                                                              |
|  30 | Scheduled hours can be compared with actual attendance.                                                                                                                          |
|  31 | Payroll-relevant schedule references are available to Payroll Processing through attendance outcomes.                                                                            |
|  32 | Scheduling reports can be generated by store, department, employee, manager, role, labor cost, budget variance, coverage gap, and period.                                        |
|  33 | Unauthorized users cannot view restricted labor cost, budget, schedule, swap, or override data.                                                                                  |
|  34 | Every schedule creation, assignment, publication, change, open shift, pickup, swap, approval, rejection, override, budget warning, and payroll reference creates an audit event. |

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
| HRM-RWS-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-RWS-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-RWS-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-industry-specific-retail-seasonal-hourly-workforce-scheduling typecheck`
2. `pnpm --filter @repo/features-industry-specific-retail-seasonal-hourly-workforce-scheduling lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
