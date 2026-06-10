# Time Clock Integration
## Business Definition
**Time Clock Integration is the HRM function that connects physical, digital, biometric, web, mobile, kiosk, and third-party time clock systems to automatically capture employee clock-in, clock-out, break, attendance, and work-hour records for attendance processing, exception handling, overtime validation, and payroll readiness.**

---
# Time Clock Integration Includes

| Area                                | What It Covers                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| **Physical Time Clock Integration** | Biometric device, fingerprint scanner, face recognition terminal, card reader, RFID terminal |
| **Digital Time Clock Integration**  | Web clock, mobile clock, tablet kiosk, desktop clock-in, browser-based attendance capture    |
| **Clock-In / Clock-Out Capture**    | Start work, end work, break start, break end, meal break, shift start, shift end             |
| **Device Management**               | Device ID, device name, location, status, assigned site, connectivity status                 |
| **Employee Device Mapping**         | Employee badge ID, biometric ID, device user ID, employee reference                          |
| **Attendance Data Import**          | Automated sync, manual import, API import, file import, scheduled data pull                  |
| **Real-Time Attendance Sync**       | Near real-time punch capture, sync status, last sync timestamp                               |
| **Offline Punch Handling**          | Offline device storage, delayed sync, duplicate prevention, sync reconciliation              |
| **Punch Validation**                | Valid employee check, active employment check, shift match, duplicate punch check            |
| **Punch Classification**            | Clock-in, clock-out, break-in, break-out, transfer punch, correction punch                   |
| **Exception Detection**             | Missing punch, duplicate punch, early clock-in, late clock-in, early clock-out               |
| **Device Location Reference**       | Office, branch, site, plant, warehouse, project location                                     |
| **Shift Matching Reference**        | Match punch record against scheduled shift                                                   |
| **Attendance Integration**          | Send validated punch records to Leave & Attendance Management                                |
| **Overtime Reference**              | Provide actual work time for overtime validation                                             |
| **Payroll Readiness Reference**     | Provide approved attendance data for payroll processing                                      |
| **Security Control**                | Device authorization, API key, sync credential, tamper detection                             |
| **Audit Trail**                     | Captured by device, imported by system, edited by user, sync timestamp, correction reason    |

---
# Time Clock Integration Does Not Include

| Excluded Area                     | Owned By                           |
| --------------------------------- | ---------------------------------- |
| Employee master profile           | Employee Records Management        |
| Leave application workflow        | Leave & Attendance Management      |
| Leave balance calculation         | Leave & Attendance Management      |
| Attendance policy ownership       | Leave & Attendance Management      |
| Shift pattern creation            | Shift Scheduling                   |
| Overtime approval and calculation | Overtime Management                |
| Payroll calculation               | Payroll Processing                 |
| GPS-based mobile verification     | Geolocation & Remote Check-In      |
| Absence trend analytics           | Absence Analytics & Trends         |
| Flexible work arrangement policy  | Flexible Work Arrangement Tracking |
| Biometric legal compliance policy | Compliance & Regulatory Tracking   |
| Physical security access control  | IAM / Physical Access Control      |
| Device hardware procurement       | IT / Facilities                    |
| Device maintenance contract       | IT / Vendor Management             |

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
# Time Clock Integration Requirement Statement

| Requirement                | Description                                                                                                                                                                                                                                                                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Time Clock Integration** | Integrates with physical and digital time clock systems to automatically capture employee clock-in, clock-out, break, and attendance punch data, with device mapping, automated sync, offline handling, validation, exception detection, attendance integration, overtime reference, payroll readiness, security control, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **HRM-TCI-001** | System shall integrate with physical and digital time clock sources.                                                                                         |
| **HRM-TCI-002** | System shall support biometric terminals, card readers, RFID devices, kiosk clocks, web clocks, and mobile clocks where enabled.                             |
| **HRM-TCI-003** | System shall maintain time clock device records.                                                                                                             |
| **HRM-TCI-004** | System shall capture device ID, device name, device type, location, status, and last sync timestamp.                                                         |
| **HRM-TCI-005** | System shall map device user IDs, badge IDs, biometric IDs, or clock IDs to employee records.                                                                |
| **HRM-TCI-006** | System shall capture clock-in and clock-out punch records.                                                                                                   |
| **HRM-TCI-007** | System shall capture break start and break end punch records where enabled.                                                                                  |
| **HRM-TCI-008** | System shall support automated punch data synchronization.                                                                                                   |
| **HRM-TCI-009** | System shall support manual attendance data import where required.                                                                                           |
| **HRM-TCI-010** | System shall support API-based attendance data ingestion where enabled.                                                                                      |
| **HRM-TCI-011** | System shall support scheduled sync from external time clock systems.                                                                                        |
| **HRM-TCI-012** | System shall support offline punch synchronization from devices that temporarily lose connection.                                                            |
| **HRM-TCI-013** | System shall prevent duplicate punch records from repeated sync.                                                                                             |
| **HRM-TCI-014** | System shall validate punch records against active employee status.                                                                                          |
| **HRM-TCI-015** | System shall validate punch records against employee-device mapping.                                                                                         |
| **HRM-TCI-016** | System shall classify punch records as clock-in, clock-out, break-in, break-out, transfer punch, or correction punch.                                        |
| **HRM-TCI-017** | System shall detect missing punch records.                                                                                                                   |
| **HRM-TCI-018** | System shall detect duplicate punch records.                                                                                                                 |
| **HRM-TCI-019** | System shall detect abnormal punch records such as early clock-in, late clock-in, early clock-out, and unmatched punch.                                      |
| **HRM-TCI-020** | System shall match punch records against assigned shift schedules where available.                                                                           |
| **HRM-TCI-021** | System shall expose validated punch records to Leave & Attendance Management.                                                                                |
| **HRM-TCI-022** | System shall expose actual work-hour records to Overtime Management for overtime validation.                                                                 |
| **HRM-TCI-023** | System shall expose approved attendance outcomes to Payroll Processing through Leave & Attendance Management.                                                |
| **HRM-TCI-024** | System shall support correction workflow for invalid, missing, duplicate, or unmatched punch records.                                                        |
| **HRM-TCI-025** | System shall restrict punch record correction to authorized users.                                                                                           |
| **HRM-TCI-026** | System shall support device sync monitoring and failure alerts.                                                                                              |
| **HRM-TCI-027** | System shall restrict device configuration and integration credentials to authorized administrators.                                                         |
| **HRM-TCI-028** | System shall provide time clock reports by employee, device, location, department, date, exception type, and sync status.                                    |
| **HRM-TCI-029** | System shall maintain raw punch records separately from approved attendance outcomes.                                                                        |
| **HRM-TCI-030** | System shall maintain audit trail for device setup, employee mapping, punch capture, sync, import, validation, correction, deletion, and exception handling. |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                      |
| --: | ---------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Time clock device can be registered with device ID, device type, location, status, and sync configuration.                               |
|   2 | Employee can be mapped to device user ID, badge ID, biometric ID, or clock ID.                                                           |
|   3 | Clock-in and clock-out punch records can be captured from connected devices.                                                             |
|   4 | Break start and break end punch records can be captured where enabled.                                                                   |
|   5 | Attendance punch data can be synchronized automatically.                                                                                 |
|   6 | Attendance punch data can be imported manually where required.                                                                           |
|   7 | API-based punch ingestion can be supported where enabled.                                                                                |
|   8 | Offline punch records can be synchronized after device reconnection.                                                                     |
|   9 | Duplicate punch records are prevented or flagged.                                                                                        |
|  10 | Punch records are validated against active employee records.                                                                             |
|  11 | Punch records are validated against employee-device mapping.                                                                             |
|  12 | Punch records are classified as clock-in, clock-out, break-in, break-out, transfer, or correction punch.                                 |
|  13 | Missing punch records are flagged.                                                                                                       |
|  14 | Unmatched punch records are flagged.                                                                                                     |
|  15 | Early clock-in, late clock-in, and early clock-out are flagged based on policy reference.                                                |
|  16 | Punch records can be matched against assigned shift schedules.                                                                           |
|  17 | Validated punch records are available to Leave & Attendance Management.                                                                  |
|  18 | Actual work-hour records are available to Overtime Management for overtime validation.                                                   |
|  19 | Raw punch records are preserved separately from approved attendance outcomes.                                                            |
|  20 | Invalid or missing punch records can be corrected only by authorized users.                                                              |
|  21 | Device sync failures generate alerts for responsible administrators.                                                                     |
|  22 | Time clock reports can be generated by employee, device, location, department, date, exception, and sync status.                         |
|  23 | Unauthorized users cannot modify device configuration, employee-device mapping, or punch records.                                        |
|  24 | Every device setup, mapping, punch capture, sync, import, validation, correction, deletion, and exception action creates an audit event. |

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
| HRM-TCI-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-TCI-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-TCI-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-time-attendance-time-clock-integration typecheck`
2. `pnpm --filter @repo/features-time-attendance-time-clock-integration lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
