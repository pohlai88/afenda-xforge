# Manufacturing Safety Training & OSHA Compliance
## Business Definition
**Manufacturing Safety Training & OSHA Compliance is the HRM function that tracks mandatory workplace safety training, manufacturing hazard awareness, safety certification completion, OSHA or local occupational safety compliance records, incident reporting references, hazard assessments, corrective actions, and audit readiness for manufacturing employees.**

OSHA materials confirm that workplace safety training requirements vary by standard, that injury and illness recordkeeping commonly uses OSHA Forms **300, 300A, and 301**, and that PPE hazard assessment is a recognized safety control area. For Malaysia, the Occupational Safety and Health Act 1994 is the local baseline reference for workplace safety and health obligations. ([osha.gov][1])

---
# Manufacturing Safety Training & OSHA Compliance Includes

| Area                                | What It Covers                                                                            |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| **Mandatory Safety Training**       | Required safety training by role, department, machine, work area, risk exposure           |
| **OSHA / OSH Compliance Reference** | OSHA standard reference, local OSH act reference, regulatory training obligation          |
| **Manufacturing Hazard Training**   | Machine safety, lockout/tagout reference, chemical handling, PPE, fire safety, ergonomics |
| **PPE Training**                    | PPE requirement, PPE usage training, PPE fit/reference, PPE acknowledgment                |
| **Hazard Assessment**               | Workplace hazard assessment, PPE hazard assessment, job hazard analysis, risk area review |
| **Incident Reporting**              | Workplace injury, near miss, unsafe condition, property damage, safety observation        |
| **OSHA Recordkeeping Reference**    | OSHA 300, 300A, 301 reference where applicable                                            |
| **Safety Certification Tracking**   | Forklift training, machine authorization, confined-space reference, first-aid reference   |
| **Training Completion Status**      | Assigned, completed, overdue, expired, failed, renewed, waived                            |
| **Certification Expiry Tracking**   | Issue date, expiry date, renewal date, renewal status                                     |
| **Corrective Action Tracking**      | Root cause reference, action owner, due date, completion status, evidence                 |
| **Work Restriction Reference**      | Restrict employee from machine, area, or duty if training/certification is missing        |
| **Audit Evidence**                  | Training proof, attendance sheet, certificate, acknowledgment, inspection evidence        |
| **Safety Dashboard**                | Training compliance, incident trends, overdue actions, high-risk departments              |
| **Reporting**                       | Safety training report, incident report, hazard assessment report, OSHA log reference     |
| **Audit Trail**                     | Assigned by, completed by, reported by, reviewed by, closed by, timestamp, evidence       |

---
# Manufacturing Safety Training & OSHA Compliance Does Not Include

| Excluded Area                          | Owned By                               |
| -------------------------------------- | -------------------------------------- |
| Employee master profile                | Employee Records Management            |
| Training course delivery               | Learning Management System             |
| General training administration        | Training & Development                 |
| Document storage engine                | Document Management                    |
| General compliance obligation library  | Compliance & Regulatory Tracking       |
| Daily attendance records               | Leave & Attendance Management          |
| Shift scheduling                       | Shift Scheduling                       |
| Payroll calculation                    | Payroll Processing                     |
| Workers’ compensation claim processing | Insurance / Claims / Finance           |
| Safety equipment inventory             | Asset Management / EHS                 |
| Machine maintenance                    | Maintenance / Asset Management         |
| Production quality control             | Manufacturing / Quality Management     |
| Legal dispute handling                 | Legal / Compliance                     |
| Medical diagnosis or treatment records | Occupational Health / Medical Provider |

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
# Manufacturing Safety Training & OSHA Compliance Requirement Statement

| Requirement                                         | Description                                                                                                                                                                                                                                                                              |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Manufacturing Safety Training & OSHA Compliance** | Tracks manufacturing safety training, OSHA or local occupational safety compliance references, PPE training, hazard assessments, safety certifications, incident reporting references, corrective actions, work restriction status, compliance dashboards, reporting, and audit history. |

---
# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HRM-MSC-001** | System shall maintain manufacturing safety training requirements by legal entity, country, site, department, role, machine, work area, and risk category.                                                                                |
| **HRM-MSC-002** | System shall identify employees who require mandatory safety training based on role, worksite, machine assignment, or hazard exposure.                                                                                                   |
| **HRM-MSC-003** | System shall track safety training completion status.                                                                                                                                                                                    |
| **HRM-MSC-004** | System shall track OSHA, OSH, or local occupational safety compliance references where applicable.                                                                                                                                       |
| **HRM-MSC-005** | System shall track machine safety training requirements.                                                                                                                                                                                 |
| **HRM-MSC-006** | System shall track PPE training and PPE acknowledgment requirements.                                                                                                                                                                     |
| **HRM-MSC-007** | System shall track chemical handling, fire safety, emergency response, ergonomics, and workplace hazard training.                                                                                                                        |
| **HRM-MSC-008** | System shall track safety certification issue date, expiry date, renewal date, and status.                                                                                                                                               |
| **HRM-MSC-009** | System shall flag missing mandatory safety training.                                                                                                                                                                                     |
| **HRM-MSC-010** | System shall flag expired or expiring safety certifications.                                                                                                                                                                             |
| **HRM-MSC-011** | System shall prevent or flag assignment to restricted machines, work areas, or duties when required safety training is incomplete.                                                                                                       |
| **HRM-MSC-012** | System shall support workplace hazard assessment records.                                                                                                                                                                                |
| **HRM-MSC-013** | System shall support PPE hazard assessment records.                                                                                                                                                                                      |
| **HRM-MSC-014** | System shall support job hazard analysis records by role, task, machine, or work area.                                                                                                                                                   |
| **HRM-MSC-015** | System shall classify hazard assessment status as draft, active, reviewed, expired, superseded, or closed.                                                                                                                               |
| **HRM-MSC-016** | System shall support workplace incident reporting.                                                                                                                                                                                       |
| **HRM-MSC-017** | System shall support incident types including injury, near miss, unsafe condition, property damage, exposure event, and safety observation.                                                                                              |
| **HRM-MSC-018** | System shall capture incident date, site, department, involved employee reference, incident type, severity, description, and evidence reference.                                                                                         |
| **HRM-MSC-019** | System shall support OSHA recordkeeping references including OSHA 300, 300A, and 301 where applicable.                                                                                                                                   |
| **HRM-MSC-020** | System shall classify incident status as reported, under review, corrective action pending, closed, or recordable reference.                                                                                                             |
| **HRM-MSC-021** | System shall support corrective action assignment for incidents, hazards, training gaps, or audit findings.                                                                                                                              |
| **HRM-MSC-022** | System shall track corrective action owner, due date, priority, status, and completion evidence.                                                                                                                                         |
| **HRM-MSC-023** | System shall notify HR, safety officers, managers, and compliance users of overdue safety training, expiring certifications, reported incidents, and overdue corrective actions.                                                         |
| **HRM-MSC-024** | System shall expose safety training completion status to Compliance & Regulatory Tracking.                                                                                                                                               |
| **HRM-MSC-025** | System shall expose learning requirements to LMS or Training & Development.                                                                                                                                                              |
| **HRM-MSC-026** | System shall expose safety eligibility or work restriction status to Shift Scheduling where required.                                                                                                                                    |
| **HRM-MSC-027** | System shall link training evidence, certificates, incident evidence, and hazard assessment documents to Document Management.                                                                                                            |
| **HRM-MSC-028** | System shall provide safety compliance dashboards by site, department, role, manager, training type, incident type, hazard status, and risk level.                                                                                       |
| **HRM-MSC-029** | System shall provide reports for safety training completion, overdue training, certification expiry, incident records, OSHA log reference, hazard assessments, and corrective actions.                                                   |
| **HRM-MSC-030** | System shall restrict safety, incident, health-related, and compliance records based on HR, safety officer, manager, compliance, auditor, and legal permissions.                                                                         |
| **HRM-MSC-031** | System shall maintain audit trail for safety requirement setup, training assignment, completion, certificate renewal, incident report, hazard assessment, corrective action, work restriction, reporting, and compliance review actions. |

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                                                                                  |
| --: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|   1 | Safety training requirements can be configured by site, department, role, machine, work area, and risk category.                                                                     |
|   2 | Employees requiring safety training are automatically identified based on role, site, machine assignment, or hazard exposure.                                                        |
|   3 | Safety training completion status can be tracked as assigned, completed, overdue, expired, failed, renewed, or waived.                                                               |
|   4 | OSHA, OSH, or local occupational safety compliance reference can be attached where applicable.                                                                                       |
|   5 | PPE training and PPE acknowledgment can be tracked.                                                                                                                                  |
|   6 | Machine safety, chemical handling, fire safety, emergency response, ergonomics, and workplace hazard training can be tracked.                                                        |
|   7 | Safety certification issue date, expiry date, renewal date, and status can be recorded.                                                                                              |
|   8 | Missing mandatory safety training is flagged.                                                                                                                                        |
|   9 | Expiring or expired safety certifications are flagged.                                                                                                                               |
|  10 | Employee can be flagged as restricted from specific machine, work area, or duty when required safety training is incomplete.                                                         |
|  11 | Workplace hazard assessment can be recorded and linked to work area, machine, role, or task.                                                                                         |
|  12 | PPE hazard assessment can be recorded and reviewed.                                                                                                                                  |
|  13 | Job hazard analysis can be maintained by role, task, machine, or work area.                                                                                                          |
|  14 | Workplace incident can be reported with date, site, department, involved employee reference, incident type, severity, description, and evidence reference.                           |
|  15 | Incident type can include injury, near miss, unsafe condition, property damage, exposure event, and safety observation.                                                              |
|  16 | OSHA 300, 300A, and 301 references can be maintained where applicable.                                                                                                               |
|  17 | Incident status can be tracked from reported to closed.                                                                                                                              |
|  18 | Corrective actions can be created from incidents, hazards, training gaps, or audit findings.                                                                                         |
|  19 | Corrective action owner, due date, priority, status, and evidence can be recorded.                                                                                                   |
|  20 | Overdue safety training, expiring certifications, reported incidents, and overdue corrective actions generate notifications.                                                         |
|  21 | Safety training completion status is available to Compliance & Regulatory Tracking.                                                                                                  |
|  22 | Learning requirements are available to LMS or Training & Development.                                                                                                                |
|  23 | Safety eligibility or work restriction status is available to Shift Scheduling where required.                                                                                       |
|  24 | Safety evidence documents can be linked to Document Management.                                                                                                                      |
|  25 | Safety compliance dashboard can show status by site, department, role, manager, training type, incident type, hazard status, and risk level.                                         |
|  26 | Reports can be generated for training completion, overdue training, certification expiry, incidents, OSHA log reference, hazard assessments, and corrective actions.                 |
|  27 | Sensitive safety, incident, or health-related records are hidden from unauthorized users.                                                                                            |
|  28 | Every safety requirement setup, training assignment, completion, renewal, incident, hazard assessment, corrective action, restriction, and compliance review creates an audit event. |

[1]: https://www.osha.gov/sites/default/files/publications/OSHA2254.pdf?utm_source=chatgpt.com "Training Requirements in OSHA Standards"

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
| HRM-MSC-001 | Partial | [`src/contract.ts`](./src/contract.ts) |
| HRM-MSC-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-MSC-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

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

1. `pnpm --filter @repo/features-industry-specific-manufacturing-safety-training-osha-compliance typecheck`
2. `pnpm --filter @repo/features-industry-specific-manufacturing-safety-training-osha-compliance lint`
3. Package-level automated tests are not currently declared in `package.json`.
---
