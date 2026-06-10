# Field Worker & Remote Workforce Management
## Business Definition
**Field Worker & Remote Workforce Management is the HRM function that manages distributed, mobile, field-based, remote, and site-based employees, including mobile attendance capture, worksite assignment, GPS verification, travel status, per diem eligibility, remote task visibility, field attendance exceptions, and travel compliance monitoring.**

---
# Field Worker & Remote Workforce Management Includes

| Area                               | What It Covers                                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Field Workforce Assignment**     | Field worker assignment, project site assignment, client site assignment, temporary worksite    |
| **Remote Workforce Tracking**      | Remote employee status, distributed team, offsite work arrangement, mobile work location        |
| **Mobile Time Capture**            | Mobile clock-in, mobile clock-out, break start, break end, field attendance submission          |
| **GPS Verification Reference**     | GPS location, geofence result, location accuracy, check-in site validation                      |
| **Worksite Management**            | Approved worksite, project location, client location, branch, field zone, service area          |
| **Field Schedule Reference**       | Assigned site schedule, route schedule, field duty date, planned visit window                   |
| **Travel Status Tracking**         | Business travel, outstation work, overnight travel, local field visit, cross-border travel      |
| **Per Diem Eligibility**           | Daily allowance eligibility, meal allowance, lodging allowance, travel allowance                |
| **Per Diem Calculation Reference** | Eligible days, rate table, location rate, overnight rule, partial-day rule                      |
| **Travel Compliance**              | Travel approval, travel policy, destination restriction, required document, duty-of-care status |
| **Field Expense Reference**        | Fuel, toll, parking, meals, accommodation, travel reimbursement reference                       |
| **Remote Work Authorization**      | Approved remote site, approved home office, approved client site, temporary remote approval     |
| **Field Attendance Exception**     | Outside geofence, missing check-in, late check-in, incomplete checkout, manual correction       |
| **Field Safety Check-In**          | Arrival confirmation, site departure confirmation, emergency contact reference                  |
| **Offline Mobile Capture**         | Offline attendance capture, delayed sync, offline task submission, sync reconciliation          |
| **Manager Visibility**             | Team field status, location status, attendance exception, travel status, availability           |
| **Payroll Reference**              | Per diem reference, shift premium reference, travel allowance reference, attendance outcome     |
| **Audit Trail**                    | Assigned by, checked in by, approved by, adjusted by, synced by, timestamp, location evidence   |

---
# Field Worker & Remote Workforce Management Does Not Include

| Excluded Area                       | Owned By                             |
| ----------------------------------- | ------------------------------------ |
| Employee master profile             | Employee Records Management          |
| Standard leave application workflow | Leave & Attendance Management        |
| Leave balance calculation           | Leave & Attendance Management        |
| Core attendance policy ownership    | Leave & Attendance Management        |
| GPS check-in engine                 | Geolocation & Remote Check-In        |
| Physical time clock integration     | Time Clock Integration               |
| Standard shift schedule creation    | Shift Scheduling                     |
| Overtime approval and calculation   | Overtime Management                  |
| Payroll calculation                 | Payroll Processing                   |
| Expense claim processing            | Expense Reimbursement                |
| Travel booking procurement          | Travel Management / Procurement      |
| Asset assignment                    | Asset Management                     |
| Safety incident investigation       | Health & Safety / Compliance         |
| Continuous employee surveillance    | Not part of HRM workforce management |
| Route optimization                  | Field Service / Logistics            |
| Customer work order execution       | Field Service / Operations           |

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
# Field Worker & Remote Workforce Management Requirement Statement

| Requirement                                    | Description                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Field Worker & Remote Workforce Management** | Manages distributed field and remote employees with worksite assignment, mobile time capture, GPS validation references, travel status tracking, per diem eligibility, field attendance exceptions, remote workforce visibility, travel compliance monitoring, payroll references, reporting, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-FRM-001** | System shall maintain field worker and remote workforce assignments.                                                                                                                                                         |
| **HRM-FRM-002** | System shall support assignment to project sites, client sites, branches, field zones, service areas, and approved remote locations.                                                                                         |
| **HRM-FRM-003** | System shall capture assignment start date, end date, location, manager, department, legal entity, and assignment type.                                                                                                      |
| **HRM-FRM-004** | System shall support temporary, recurring, project-based, client-based, and travel-based field assignments.                                                                                                                  |
| **HRM-FRM-005** | System shall allow eligible field workers to submit mobile clock-in and clock-out records.                                                                                                                                   |
| **HRM-FRM-006** | System shall support mobile break start and break end records where enabled.                                                                                                                                                 |
| **HRM-FRM-007** | System shall reference GPS validation results from Geolocation & Remote Check-In.                                                                                                                                            |
| **HRM-FRM-008** | System shall validate field check-in against assigned worksite or approved remote location.                                                                                                                                  |
| **HRM-FRM-009** | System shall detect field attendance exceptions including outside-site check-in, missing check-in, missing checkout, late check-in, and incomplete attendance.                                                               |
| **HRM-FRM-010** | System shall support offline mobile attendance capture where enabled.                                                                                                                                                        |
| **HRM-FRM-011** | System shall reconcile offline records after mobile sync.                                                                                                                                                                    |
| **HRM-FRM-012** | System shall support field schedule references by employee, site, date, project, route, or client.                                                                                                                           |
| **HRM-FRM-013** | System shall track business travel status for field workers.                                                                                                                                                                 |
| **HRM-FRM-014** | System shall classify travel as local field visit, outstation travel, overnight travel, cross-border travel, or temporary relocation.                                                                                        |
| **HRM-FRM-015** | System shall determine per diem eligibility based on travel type, location, duration, employee category, and policy group.                                                                                                   |
| **HRM-FRM-016** | System shall support per diem rate references by country, city, region, project, grade, or travel category.                                                                                                                  |
| **HRM-FRM-017** | System shall support partial-day, full-day, overnight, meal, lodging, and travel allowance references.                                                                                                                       |
| **HRM-FRM-018** | System shall expose approved per diem references to Payroll Processing or Expense Reimbursement.                                                                                                                             |
| **HRM-FRM-019** | System shall track travel approval reference before travel-based field assignment begins where required.                                                                                                                     |
| **HRM-FRM-020** | System shall monitor travel compliance requirements including approval, destination restriction, required documents, insurance reference, and duty-of-care status.                                                           |
| **HRM-FRM-021** | System shall flag non-compliant travel or field assignment records.                                                                                                                                                          |
| **HRM-FRM-022** | System shall support field safety check-in such as arrival confirmation and site departure confirmation where enabled.                                                                                                       |
| **HRM-FRM-023** | System shall allow managers to view field team availability, site assignment, travel status, and attendance exceptions.                                                                                                      |
| **HRM-FRM-024** | System shall notify employees, managers, HR, payroll, and compliance users of field assignment changes, attendance exceptions, travel non-compliance, and overdue check-ins.                                                 |
| **HRM-FRM-025** | System shall expose validated field attendance outcomes to Leave & Attendance Management.                                                                                                                                    |
| **HRM-FRM-026** | System shall expose actual field work-hour references to Overtime Management where required.                                                                                                                                 |
| **HRM-FRM-027** | System shall expose payroll-relevant travel allowance, per diem, and field attendance references to Payroll Processing.                                                                                                      |
| **HRM-FRM-028** | System shall provide field workforce reports by employee, manager, department, legal entity, site, project, client, travel type, exception, and period.                                                                      |
| **HRM-FRM-029** | System shall restrict field workforce location, travel, attendance, and per diem data based on employee, manager, HR, payroll, compliance, and auditor permissions.                                                          |
| **HRM-FRM-030** | System shall prevent continuous location tracking outside explicit check-in, check-out, travel, or safety confirmation events.                                                                                               |
| **HRM-FRM-031** | System shall maintain audit trail for field assignment, mobile check-in, GPS validation reference, offline sync, travel status, per diem reference, exception handling, approval, correction, and payroll reference actions. |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                                                                             |
| --: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Field worker can be assigned to project site, client site, branch, field zone, service area, or approved remote location.                                                                       |
|   2 | Field assignment captures employee, location, assignment type, start date, end date, manager, department, and legal entity.                                                                     |
|   3 | Temporary, recurring, project-based, client-based, and travel-based field assignments are supported.                                                                                            |
|   4 | Eligible field worker can clock in and clock out using mobile device.                                                                                                                           |
|   5 | Mobile break start and break end can be captured where enabled.                                                                                                                                 |
|   6 | Field check-in can reference GPS validation result.                                                                                                                                             |
|   7 | Field check-in is validated against assigned worksite or approved remote location.                                                                                                              |
|   8 | Outside-site check-in, missing check-in, missing checkout, late check-in, and incomplete attendance are flagged.                                                                                |
|   9 | Offline mobile attendance can be captured where enabled.                                                                                                                                        |
|  10 | Offline records are reconciled after sync.                                                                                                                                                      |
|  11 | Field schedule can be referenced by employee, site, project, route, client, and date.                                                                                                           |
|  12 | Business travel status can be tracked for field workers.                                                                                                                                        |
|  13 | Travel can be classified as local field visit, outstation, overnight, cross-border, or temporary relocation.                                                                                    |
|  14 | Per diem eligibility can be determined from travel type, location, duration, employee category, and policy group.                                                                               |
|  15 | Per diem rate references can be maintained by country, city, region, project, grade, or travel category.                                                                                        |
|  16 | Partial-day, full-day, overnight, meal, lodging, and travel allowance references are supported.                                                                                                 |
|  17 | Approved per diem references are available to Payroll Processing or Expense Reimbursement.                                                                                                      |
|  18 | Travel approval reference can be required before travel-based field assignment starts.                                                                                                          |
|  19 | Travel compliance status can be monitored for approval, destination restriction, required documents, insurance reference, and duty-of-care.                                                     |
|  20 | Non-compliant travel or field assignment records are flagged.                                                                                                                                   |
|  21 | Arrival confirmation and site departure confirmation can be captured where enabled.                                                                                                             |
|  22 | Manager can view field team availability, site assignment, travel status, and attendance exceptions.                                                                                            |
|  23 | Validated field attendance outcomes are available to Leave & Attendance Management.                                                                                                             |
|  24 | Actual field work-hour references are available to Overtime Management where required.                                                                                                          |
|  25 | Payroll-relevant travel allowance, per diem, and field attendance references are available to Payroll Processing.                                                                               |
|  26 | Field workforce reports can be generated by employee, manager, department, site, project, client, travel type, exception, and period.                                                           |
|  27 | Unauthorized users cannot view or modify restricted field workforce location, travel, attendance, or per diem data.                                                                             |
|  28 | System does not continuously track employee location outside explicit check-in, check-out, travel, or safety confirmation events.                                                               |
|  29 | Notifications are sent for field assignment changes, attendance exceptions, travel non-compliance, and overdue check-ins.                                                                       |
|  30 | Every field assignment, mobile check-in, GPS validation reference, offline sync, travel status, per diem reference, exception, correction, and payroll reference action creates an audit event. |

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
| HRM-FRM-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-FRM-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-FRM-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-industry-specific-field-worker-remote-workforce-management typecheck`
2. `pnpm --filter @repo/features-industry-specific-field-worker-remote-workforce-management lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
