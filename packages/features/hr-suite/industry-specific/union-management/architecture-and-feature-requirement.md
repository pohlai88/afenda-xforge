# Union & Collective Bargaining Management
## Business Definition
**Union & Collective Bargaining Management is the HRM function that tracks union membership, manages collective bargaining agreements, applies seniority-based employment rules, supports grievance handling, monitors union-related obligations, and maintains labor-relations compliance records.**

---
# Union & Collective Bargaining Management Includes

| Area                                 | What It Covers                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------- |
| **Union Membership Tracking**        | Union membership status, union name, membership effective date, membership end date         |
| **Bargaining Unit Assignment**       | Bargaining unit, employee group, covered role, covered department, covered location         |
| **Collective Bargaining Agreement**  | Agreement title, agreement period, applicable workforce, terms, clauses, renewal date       |
| **CBA Rule Management**              | Pay rules, overtime rules, leave rules, working-hour rules, allowance rules, rest-day rules |
| **Seniority Rules**                  | Seniority date, service length, ranking, priority rule, tie-break rule                      |
| **Seniority-Based Decisions**        | Shift preference, overtime priority, layoff order, recall order, promotion consideration    |
| **Union Dues Reference**             | Deduction eligibility, dues amount reference, payroll deduction reference                   |
| **Grievance Process**                | Grievance submission, grievance category, step level, hearing date, decision, escalation    |
| **Dispute Tracking**                 | Labor dispute, complaint, unresolved issue, mediation reference, arbitration reference      |
| **CBA Compliance Monitoring**        | Rule breach, missed deadline, non-compliant assignment, agreement exception                 |
| **Union Representative Management**  | Union rep, steward, representative role, assigned department/site                           |
| **Labor Relations Meetings**         | Meeting schedule, minutes reference, participants, action items                             |
| **Agreement Renewal Tracking**       | Expiry date, negotiation status, renewal reminder, new agreement version                    |
| **Employee Communication Reference** | Notice, announcement, agreement update, policy communication                                |
| **Reporting**                        | Union membership report, grievance report, CBA compliance report, seniority report          |
| **Audit Trail**                      | Created by, updated by, approved by, reviewed by, escalated by, timestamp, reason           |

---
# Union & Collective Bargaining Management Does Not Include

| Excluded Area                    | Owned By                         |
| -------------------------------- | -------------------------------- |
| Employee master profile          | Employee Records Management      |
| Organization hierarchy           | Organizational Chart & Hierarchy |
| Payroll calculation              | Payroll Processing               |
| Payroll run finalization         | Payroll Processing               |
| Leave application workflow       | Leave & Attendance Management    |
| Overtime calculation engine      | Overtime Management              |
| Shift schedule creation          | Shift Scheduling                 |
| Performance appraisal scoring    | Performance Appraisals           |
| Compensation planning            | Compensation Planning & Modeling |
| Recruitment pipeline             | Recruitment & Applicant Tracking |
| Legal case litigation            | Legal / External Counsel         |
| Document storage engine          | Document Management              |
| General HR policy library        | HR Policy Management             |
| Workplace incident investigation | Health & Safety / Compliance     |
| Employee disciplinary workflow   | Employee Relations / Compliance  |

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
# Union & Collective Bargaining Management Requirement Statement

| Requirement                                  | Description                                                                                                                                                                                                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Union & Collective Bargaining Management** | Tracks union membership, bargaining unit assignment, collective bargaining agreements, CBA rules, seniority-based rules, grievance processes, dispute references, union dues references, labor-relations meetings, agreement renewals, compliance monitoring, reporting, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-UCB-001** | System shall maintain union records.                                                                                                                                                                                                            |
| **HRM-UCB-002** | System shall maintain collective bargaining agreement records.                                                                                                                                                                                  |
| **HRM-UCB-003** | System shall track agreement title, agreement version, effective date, expiry date, status, and applicable workforce.                                                                                                                           |
| **HRM-UCB-004** | System shall assign employees to bargaining units where applicable.                                                                                                                                                                             |
| **HRM-UCB-005** | System shall track employee union membership status.                                                                                                                                                                                            |
| **HRM-UCB-006** | System shall track membership start date, end date, union reference, and bargaining unit reference.                                                                                                                                             |
| **HRM-UCB-007** | System shall restrict access to union membership data based on role and authorization.                                                                                                                                                          |
| **HRM-UCB-008** | System shall maintain CBA rule references for pay, overtime, leave, work hours, rest days, holidays, allowances, and benefits.                                                                                                                  |
| **HRM-UCB-009** | System shall expose CBA pay and deduction references to Payroll Processing.                                                                                                                                                                     |
| **HRM-UCB-010** | System shall expose CBA overtime rule references to Overtime Management.                                                                                                                                                                        |
| **HRM-UCB-011** | System shall expose CBA leave and attendance rule references to Leave & Attendance Management.                                                                                                                                                  |
| **HRM-UCB-012** | System shall expose CBA scheduling rule references to Shift Scheduling.                                                                                                                                                                         |
| **HRM-UCB-013** | System shall maintain seniority date for employees covered by seniority rules.                                                                                                                                                                  |
| **HRM-UCB-014** | System shall calculate or reference seniority ranking by bargaining unit, role, department, location, or agreement.                                                                                                                             |
| **HRM-UCB-015** | System shall support seniority-based rules for shift preference, overtime priority, layoff order, recall order, vacation bidding, and promotion consideration.                                                                                  |
| **HRM-UCB-016** | System shall flag actions that conflict with applicable CBA or seniority rules.                                                                                                                                                                 |
| **HRM-UCB-017** | System shall support union dues deduction references.                                                                                                                                                                                           |
| **HRM-UCB-018** | System shall expose approved union dues deduction references to Payroll Processing.                                                                                                                                                             |
| **HRM-UCB-019** | System shall support grievance case creation.                                                                                                                                                                                                   |
| **HRM-UCB-020** | System shall classify grievances by category, agreement clause, employee, department, location, and severity.                                                                                                                                   |
| **HRM-UCB-021** | System shall support grievance process steps, deadlines, meetings, decisions, and escalation levels.                                                                                                                                            |
| **HRM-UCB-022** | System shall track grievance status including submitted, under review, meeting scheduled, pending decision, escalated, resolved, withdrawn, and closed.                                                                                         |
| **HRM-UCB-023** | System shall support mediation, arbitration, or legal reference where applicable.                                                                                                                                                               |
| **HRM-UCB-024** | System shall maintain union representative or steward records.                                                                                                                                                                                  |
| **HRM-UCB-025** | System shall support labor-relations meeting records, participants, minutes reference, and action items.                                                                                                                                        |
| **HRM-UCB-026** | System shall track CBA renewal dates and negotiation status.                                                                                                                                                                                    |
| **HRM-UCB-027** | System shall generate alerts for expiring agreements, grievance deadlines, unresolved disputes, and overdue labor-relations actions.                                                                                                            |
| **HRM-UCB-028** | System shall provide reports for union membership, bargaining units, CBA coverage, seniority ranking, grievances, disputes, dues references, and agreement renewals.                                                                            |
| **HRM-UCB-029** | System shall restrict union, grievance, dispute, and labor-relations records based on HR, labor-relations, manager, legal, payroll, auditor, and executive permissions.                                                                         |
| **HRM-UCB-030** | System shall maintain audit trail for union setup, membership update, bargaining unit assignment, CBA setup, rule reference change, grievance action, dispute escalation, seniority update, dues reference, renewal, and report export actions. |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                                                                                              |
| --: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Union record can be created with name, code, status, and representative reference.                                                                                                                               |
|   2 | Collective bargaining agreement can be created with title, version, effective date, expiry date, status, and applicable workforce.                                                                               |
|   3 | Employee can be assigned to bargaining unit where applicable.                                                                                                                                                    |
|   4 | Employee union membership status can be recorded.                                                                                                                                                                |
|   5 | Membership start date, end date, union reference, and bargaining unit reference can be tracked.                                                                                                                  |
|   6 | Union membership data is hidden from unauthorized users.                                                                                                                                                         |
|   7 | CBA rules can be referenced for pay, overtime, leave, work hours, rest days, holidays, allowances, and benefits.                                                                                                 |
|   8 | CBA rule references are available to Payroll Processing, Overtime Management, Leave & Attendance Management, and Shift Scheduling where required.                                                                |
|   9 | Seniority date can be maintained for covered employees.                                                                                                                                                          |
|  10 | Seniority ranking can be calculated or referenced by bargaining unit, role, department, location, or agreement.                                                                                                  |
|  11 | Seniority-based rules can support shift preference, overtime priority, layoff order, recall order, vacation bidding, and promotion consideration.                                                                |
|  12 | System flags actions that conflict with applicable CBA or seniority rules.                                                                                                                                       |
|  13 | Union dues deduction reference can be maintained.                                                                                                                                                                |
|  14 | Approved union dues deduction reference can be sent to Payroll Processing.                                                                                                                                       |
|  15 | Grievance case can be created and linked to employee, department, bargaining unit, and agreement clause.                                                                                                         |
|  16 | Grievance process can track step level, deadline, meeting, decision, and escalation.                                                                                                                             |
|  17 | Grievance status can be tracked from submitted to closed.                                                                                                                                                        |
|  18 | Mediation, arbitration, or legal reference can be recorded where applicable.                                                                                                                                     |
|  19 | Union representative or steward record can be maintained.                                                                                                                                                        |
|  20 | Labor-relations meeting can store participants, minutes reference, and action items.                                                                                                                             |
|  21 | CBA expiry and negotiation status can be tracked.                                                                                                                                                                |
|  22 | Expiring agreements, grievance deadlines, unresolved disputes, and overdue actions generate alerts.                                                                                                              |
|  23 | Reports can be generated for union membership, bargaining units, CBA coverage, seniority, grievances, disputes, dues references, and renewals.                                                                   |
|  24 | Unauthorized users cannot view or modify restricted union, grievance, dispute, or labor-relations records.                                                                                                       |
|  25 | Every union setup, membership update, bargaining unit assignment, CBA rule reference, grievance action, dispute escalation, seniority update, dues reference, renewal, and report export creates an audit event. |

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
| HRM-UCB-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-UCB-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-UCB-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-industry-specific-union-management typecheck`
2. `pnpm --filter @repo/features-industry-specific-union-management lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
