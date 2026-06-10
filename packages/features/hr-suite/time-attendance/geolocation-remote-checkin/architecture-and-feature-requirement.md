# Geolocation & Remote Check-In
## Business Definition
**Geolocation & Remote Check-In is the HRM function that enables employees to clock in and clock out remotely using mobile or web devices with GPS verification, location validation, geofence rules, remote work authorization, exception handling, attendance integration, and audit history.**

---
# Geolocation & Remote Check-In Includes

| Area                            | What It Covers                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| **Mobile Clock-In / Clock-Out** | Employee mobile check-in, check-out, break start, break end                                  |
| **Remote Attendance Capture**   | Remote work attendance, field worker attendance, offsite attendance                          |
| **GPS Verification**            | Latitude, longitude, location accuracy, timestamp, device reference                          |
| **Geofence Validation**         | Approved worksite radius, office boundary, project site boundary, client site boundary       |
| **Remote Work Location**        | Home office, field site, customer location, project location, branch, temporary location     |
| **Location Permission Control** | Device location permission, location capture consent, denied permission handling             |
| **Device Verification**         | Registered device, device ID, mobile app session, browser/device fingerprint reference       |
| **Employee Eligibility**        | Remote check-in eligibility by role, department, location, employment type, policy group     |
| **Check-In Policy Rules**       | Allowed location, allowed time window, shift match, remote work approval requirement         |
| **Exception Handling**          | Outside geofence, weak GPS signal, missing location, spoofing risk, manual review            |
| **Photo / Selfie Verification** | Optional photo capture, face reference, identity confirmation where policy allows            |
| **Supervisor Approval**         | Manager approval for remote check-in exception or offsite attendance                         |
| **Field Worker Support**        | Multi-site visits, route-based attendance, job-site check-in, client-site check-in           |
| **Attendance Integration**      | Send verified remote check-in records to Leave & Attendance Management                       |
| **Overtime Reference**          | Provide actual remote work time for overtime validation                                      |
| **Payroll Readiness Reference** | Provide approved remote attendance outcomes for payroll processing                           |
| **Privacy Control**             | Capture only required attendance location, restrict map access, mask sensitive location data |
| **Audit Trail**                 | Checked in by, location captured, device used, validation result, approved by, timestamp     |

---
# Geolocation & Remote Check-In Does Not Include

| Excluded Area                          | Owned By                           |
| -------------------------------------- | ---------------------------------- |
| Employee master profile                | Employee Records Management        |
| Leave application workflow             | Leave & Attendance Management      |
| Leave balance calculation              | Leave & Attendance Management      |
| Attendance policy ownership            | Leave & Attendance Management      |
| Physical time clock device integration | Time Clock Integration             |
| Shift pattern creation                 | Shift Scheduling                   |
| Overtime approval and calculation      | Overtime Management                |
| Payroll calculation                    | Payroll Processing                 |
| Absence trend analytics                | Absence Analytics & Trends         |
| Flexible work policy setup             | Flexible Work Arrangement Tracking |
| Device hardware ownership              | IT / Device Management             |
| Mobile device management               | IT / MDM                           |
| Employee surveillance tracking         | Not part of HRM attendance         |
| Travel route optimization              | Field Service / Logistics          |
| Health and safety incident tracking    | Health & Safety / Compliance       |

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
# Geolocation & Remote Check-In Requirement Statement

| Requirement                       | Description                                                                                                                                                                                                                                                                                  |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Geolocation & Remote Check-In** | Enables mobile or web-based employee clock-in and clock-out with GPS verification, geofence validation, remote work location control, device verification, eligibility rules, exception handling, attendance integration, payroll readiness references, privacy controls, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **HRM-GEO-001** | System shall allow eligible employees to clock in and clock out remotely using mobile or web devices.                                                                                |
| **HRM-GEO-002** | System shall capture timestamp, latitude, longitude, location accuracy, device reference, and employee reference for remote check-ins.                                               |
| **HRM-GEO-003** | System shall support check-in, check-out, break start, and break end actions.                                                                                                        |
| **HRM-GEO-004** | System shall define approved remote work locations.                                                                                                                                  |
| **HRM-GEO-005** | System shall support geofence rules by office, branch, project site, client site, field location, or home office.                                                                    |
| **HRM-GEO-006** | System shall validate check-in location against approved geofence radius.                                                                                                            |
| **HRM-GEO-007** | System shall validate check-in time against assigned shift or allowed attendance window.                                                                                             |
| **HRM-GEO-008** | System shall validate employee eligibility for remote check-in.                                                                                                                      |
| **HRM-GEO-009** | System shall restrict remote check-in based on employment type, department, role, location, legal entity, or policy group.                                                           |
| **HRM-GEO-010** | System shall support registered device verification where enabled.                                                                                                                   |
| **HRM-GEO-011** | System shall detect check-in attempts from unregistered or suspicious devices where enabled.                                                                                         |
| **HRM-GEO-012** | System shall detect missing, denied, inaccurate, or unavailable GPS location.                                                                                                        |
| **HRM-GEO-013** | System shall flag check-ins outside approved geofence.                                                                                                                               |
| **HRM-GEO-014** | System shall flag weak GPS accuracy based on configured threshold.                                                                                                                   |
| **HRM-GEO-015** | System shall flag potential location spoofing where detection is enabled.                                                                                                            |
| **HRM-GEO-016** | System shall support exception submission for failed or outside-geofence check-ins.                                                                                                  |
| **HRM-GEO-017** | System shall route remote check-in exceptions through approval workflow.                                                                                                             |
| **HRM-GEO-018** | System shall allow managers or HR to approve, reject, return, or correct remote check-in exceptions.                                                                                 |
| **HRM-GEO-019** | System shall require reason for rejected, corrected, or manually approved remote check-ins.                                                                                          |
| **HRM-GEO-020** | System shall support optional photo or selfie verification where policy allows.                                                                                                      |
| **HRM-GEO-021** | System shall support field worker multi-location check-ins.                                                                                                                          |
| **HRM-GEO-022** | System shall support client-site or project-site check-in references.                                                                                                                |
| **HRM-GEO-023** | System shall preserve raw geolocation check-in records separately from approved attendance outcomes.                                                                                 |
| **HRM-GEO-024** | System shall expose verified remote attendance records to Leave & Attendance Management.                                                                                             |
| **HRM-GEO-025** | System shall expose actual remote work-hour references to Overtime Management where required.                                                                                        |
| **HRM-GEO-026** | System shall expose approved remote attendance outcomes to Payroll Processing through Leave & Attendance Management.                                                                 |
| **HRM-GEO-027** | System shall restrict access to detailed geolocation data based on role and authorization.                                                                                           |
| **HRM-GEO-028** | System shall mask or reduce location precision for users without detailed location permission.                                                                                       |
| **HRM-GEO-029** | System shall prevent continuous location tracking outside explicit check-in/check-out events.                                                                                        |
| **HRM-GEO-030** | System shall provide remote check-in reports by employee, department, manager, location, site, exception type, and period.                                                           |
| **HRM-GEO-031** | System shall notify employees and approvers of failed, outside-geofence, pending, approved, rejected, or corrected check-ins.                                                        |
| **HRM-GEO-032** | System shall maintain audit trail for remote check-in, location validation, device validation, exception submission, approval, rejection, correction, and payroll reference actions. |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                                             |
| --: | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Eligible employee can clock in and clock out remotely using mobile or web device.                                                                               |
|   2 | Remote check-in captures employee, timestamp, latitude, longitude, location accuracy, and device reference.                                                     |
|   3 | Break start and break end can be captured where enabled.                                                                                                        |
|   4 | Approved remote work locations can be configured.                                                                                                               |
|   5 | Geofence radius can be configured for office, branch, project site, client site, field site, or home office.                                                    |
|   6 | Remote check-in is validated against approved geofence.                                                                                                         |
|   7 | Remote check-in is validated against assigned shift or allowed time window.                                                                                     |
|   8 | Ineligible employees are blocked from remote check-in unless authorized exception is approved.                                                                  |
|   9 | Unregistered or suspicious device check-ins are flagged where device verification is enabled.                                                                   |
|  10 | Missing, denied, inaccurate, or unavailable GPS location is flagged.                                                                                            |
|  11 | Outside-geofence check-ins are flagged for review.                                                                                                              |
|  12 | Weak GPS accuracy is flagged based on configured threshold.                                                                                                     |
|  13 | Potential location spoofing is flagged where detection is enabled.                                                                                              |
|  14 | Failed or outside-geofence check-in can be submitted as an exception.                                                                                           |
|  15 | Remote check-in exception follows approval workflow.                                                                                                            |
|  16 | Manager or HR can approve, reject, return, or correct remote check-in exceptions.                                                                               |
|  17 | Rejected, corrected, or manually approved check-in stores reason.                                                                                               |
|  18 | Optional selfie or photo verification can be required where policy allows.                                                                                      |
|  19 | Field workers can check in at multiple approved work locations.                                                                                                 |
|  20 | Client-site or project-site check-in reference can be captured.                                                                                                 |
|  21 | Raw geolocation records are preserved separately from approved attendance outcomes.                                                                             |
|  22 | Verified remote check-ins are available to Leave & Attendance Management.                                                                                       |
|  23 | Actual remote work-hour references are available to Overtime Management where required.                                                                         |
|  24 | Approved remote attendance outcomes are available for payroll processing through Leave & Attendance Management.                                                 |
|  25 | Detailed geolocation data is hidden from unauthorized users.                                                                                                    |
|  26 | Location precision is masked or reduced for users without detailed permission.                                                                                  |
|  27 | System does not continuously track employee location outside explicit check-in/check-out events.                                                                |
|  28 | Remote check-in reports can be generated by employee, department, manager, site, exception type, and period.                                                    |
|  29 | Notifications are sent for failed, outside-geofence, pending, approved, rejected, or corrected check-ins.                                                       |
|  30 | Every remote check-in, location validation, device validation, exception, approval, rejection, correction, and payroll reference action creates an audit event. |

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
| HRM-GEO-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-GEO-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-GEO-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-time-attendance-geolocation-remote-checkin typecheck`
2. `pnpm --filter @repo/features-time-attendance-geolocation-remote-checkin lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
