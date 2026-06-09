# Compliance & Regulatory Tracking

## Definition

**Compliance & Regulatory Tracking is the HRM function that monitors, records, and controls employee-related compliance obligations, including labor law requirements, workplace safety obligations, statutory employment rules, mandatory filings, work eligibility, policy compliance, and regulatory audit readiness.**

---

# Implementation Status

**Status:** Implemented

**Last audited:** 2026-06-09

The planning items in this document now have code, database, API, and test evidence in the workspace.

| Area | Evidence |
| --- | --- |
| Feature contracts and schemas | [`src/contracts/index.ts`](./src/contracts/index.ts), [`src/schema.ts`](./src/schema.ts) |
| Async compliance actions | [`src/actions.ts`](./src/actions.ts) |
| Query projections and filtering | [`src/queries/overview.query.ts`](./src/queries/overview.query.ts), [`src/queries/requirements.query.ts`](./src/queries/requirements.query.ts), [`src/queries/alerts.query.ts`](./src/queries/alerts.query.ts), [`src/queries/calendar.query.ts`](./src/queries/calendar.query.ts), [`src/queries/audit.query.ts`](./src/queries/audit.query.ts), [`src/queries/filings.query.ts`](./src/queries/filings.query.ts) |
| Database persistence boundary | [`src/repository.ts`](./src/repository.ts), [`packages/database/schema.ts`](../../../../../packages/database/schema.ts) |
| HR compliance permissions | [`packages/permissions/catalog.ts`](../../../../../packages/permissions/catalog.ts) |
| HTTP API routes | [`apps/api/app/api/hr/compliance/overview/route.ts`](../../../../../apps/api/app/api/hr/compliance/overview/route.ts), [`apps/api/app/api/hr/compliance/requirements/route.ts`](../../../../../apps/api/app/api/hr/compliance/requirements/route.ts), [`apps/api/app/api/hr/compliance/alerts/route.ts`](../../../../../apps/api/app/api/hr/compliance/alerts/route.ts), [`apps/api/app/api/hr/compliance/filings/route.ts`](../../../../../apps/api/app/api/hr/compliance/filings/route.ts), [`apps/api/app/api/hr/compliance/reports/export/route.ts`](../../../../../apps/api/app/api/hr/compliance/reports/export/route.ts) |
| Generated migration | [`packages/database/drizzle/0004_adorable_reavers.sql`](../../../../../packages/database/drizzle/0004_adorable_reavers.sql) |
| Verification tests | [`test/compliance-regulatory-tracking.test.ts`](./test/compliance-regulatory-tracking.test.ts), [`test/projector.test.ts`](./test/projector.test.ts) |

### Verification Summary

1. `pnpm --filter @repo/features-employee-management-compliance-regulatory-tracking typecheck`
2. `pnpm --filter @repo/features-employee-management-compliance-regulatory-tracking lint`
3. `pnpm --filter @repo/features-employee-management-compliance-regulatory-tracking test`
4. `pnpm --filter @repo/database typecheck`
5. `pnpm --filter @repo/database lint`
6. `pnpm --filter @repo/database db:generate`
7. `pnpm --filter api typecheck`

### Planning Mark

- `Planning status: complete`
- `Implementation status: verified in code`

---

# Compliance & Regulatory Tracking Includes

| Area                                | What It Covers                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Labor Law Compliance**            | Employment rules, working hours, rest days, overtime limits, minimum wage references, termination rules |
| **Statutory Employment Compliance** | Required employee registrations, statutory contribution readiness, employment classification compliance |
| **Work Eligibility Tracking**       | Right-to-work status, work permit, visa, passport, foreign worker eligibility                           |
| **Workplace Safety Compliance**     | Safety training, incident reporting reference, safety certification, safety policy acknowledgment       |
| **Mandatory Filing Requirements**   | Government filings, statutory reports, employment declarations, regulatory submissions                  |
| **Policy Compliance**               | Code of conduct, employee handbook, anti-harassment policy, IT policy, safety policy acknowledgment     |
| **Document Compliance Status**      | Missing, expired, pending, verified, rejected, renewed compliance documents                             |
| **Training Compliance**             | Mandatory compliance training, safety training, certification expiry, refresher training requirement    |
| **Audit Readiness**                 | Compliance checklist, evidence reference, filing status, control status                                 |
| **Compliance Alerts**               | Expiring permits, missing filings, overdue training, missing acknowledgments                            |
| **Regulatory Calendar**             | Filing deadlines, renewal dates, statutory submission due dates                                         |
| **Exception Tracking**              | Non-compliance case, waiver, corrective action, escalation status                                       |
| **Corrective Action Tracking**      | Action owner, due date, completion status, evidence reference                                           |
| **Compliance Reporting**            | Compliance dashboard, exception report, expiry report, filing report                                    |
| **Compliance Audit Trail**          | Created by, reviewed by, approved by, submitted by, timestamp, evidence, reason                         |

---

# Element-by-Element Evaluation

This evaluation reflects the actual codebase as of 2026-06-09. Use these rows as reference patterns for the next sub-feature work: sub-features should create or sync source records into the compliance obligation, worker snapshot, evidence, exception, filing, alert, calendar, report, and audit surfaces listed below.

| Element | Current Status | Code Evidence | Reference for Next Sub-Feature Development |
| --- | --- | --- | --- |
| Labor Law Compliance | Implemented as configurable obligations and derived employee requirements. The package stores scoped obligations; it does not hard-code labor law rule catalogs. | [`src/schema.ts`](./src/schema.ts), [`src/actions.ts`](./src/actions.ts), [`src/queries/obligations.query.ts`](./src/queries/obligations.query.ts), [`src/projector/requirement.ts`](./src/projector/requirement.ts) | Build labor-law sub-features by upserting obligations with jurisdiction, scope, severity, evidence type, and version metadata, then rely on requirement projections for worker applicability. |
| Statutory Employment Compliance | Implemented as the `statutory` requirement kind plus obligation scope, evidence, requirement projection, and reporting. Source statutory calculation remains outside this feature. | [`src/schema.ts`](./src/schema.ts), [`src/projector/read-models.ts`](./src/projector/read-models.ts), [`src/queries/requirements.query.ts`](./src/queries/requirements.query.ts), [`src/actions.ts`](./src/actions.ts) | Model statutory registration or contribution-readiness checks as compliance obligations; keep payroll/statutory calculation logic in Payroll-owned sub-features. |
| Work Eligibility Tracking | Implemented as `work_eligibility` obligations evaluated against compliance worker snapshots and evidence references. Employee master data is referenced, not owned. | [`src/schema.ts`](./src/schema.ts), [`src/actions.ts`](./src/actions.ts), [`src/queries/worker-profiles.query.ts`](./src/queries/worker-profiles.query.ts), [`src/queries/evidence.query.ts`](./src/queries/evidence.query.ts) | Sync worker snapshots from Employee Records, then attach permit, visa, passport, or right-to-work evidence artifacts with expiry metadata. |
| Workplace Safety Compliance | Implemented as `safety` obligations, evidence, calendar projection, alerts, exceptions, and corrective actions. Incident investigation remains outside this feature. | [`src/schema.ts`](./src/schema.ts), [`src/projector/calendar.ts`](./src/projector/calendar.ts), [`src/projector/alert.ts`](./src/projector/alert.ts), [`src/queries/corrective-actions.query.ts`](./src/queries/corrective-actions.query.ts) | Safety sub-features should publish safety training, certification, or policy obligations and attach external incident or training evidence references. |
| Mandatory Filing Requirements | Implemented as first-class filing records with record, submit, query, export, and audit workflows. | [`src/actions.ts`](./src/actions.ts), [`src/queries/filings.query.ts`](./src/queries/filings.query.ts), [`apps/api/app/api/hr/compliance/filings/route.ts`](../../../../../apps/api/app/api/hr/compliance/filings/route.ts), [`apps/api/app/api/hr/compliance/filings/[filingId]/submit/route.ts`](../../../../../apps/api/app/api/hr/compliance/filings/[filingId]/submit/route.ts) | Filing sub-features should call `recordComplianceFiling` and `submitComplianceFiling`, then store confirmation references and evidence IDs rather than owning document storage. |
| Policy Compliance | Implemented as `policy_acknowledgment` obligations and evidence-backed requirement status. Policy authoring and policy version ownership remain outside this feature. | [`src/schema.ts`](./src/schema.ts), [`src/projector/requirement.ts`](./src/projector/requirement.ts), [`src/queries/requirements.query.ts`](./src/queries/requirements.query.ts), [`src/queries/alerts.query.ts`](./src/queries/alerts.query.ts) | Policy sub-features should publish policy-version obligations and create acknowledgment evidence references for each worker. |
| Document Compliance Status | Implemented as evidence artifact references with status, sensitivity, issue date, expiry date, and verification workflow. File/object storage is explicitly outside this feature. | [`src/schema.ts`](./src/schema.ts), [`src/actions.ts`](./src/actions.ts), [`src/queries/evidence.query.ts`](./src/queries/evidence.query.ts), [`apps/api/app/api/hr/compliance/evidence/[evidenceId]/verify/route.ts`](../../../../../apps/api/app/api/hr/compliance/evidence/[evidenceId]/verify/route.ts) | Document-driven sub-features should provide `sourceDocumentId`, document number, sensitivity, expiry, and notes; document upload and storage stay in the document-management boundary. |
| Training Compliance | Implemented as `training` obligations with evidence, due-date derivation, renewal intervals, calendar items, alerts, and reports. Course content is outside this feature. | [`src/schema.ts`](./src/schema.ts), [`src/projector/requirement.ts`](./src/projector/requirement.ts), [`src/projector/calendar.ts`](./src/projector/calendar.ts), [`src/queries/alerts.query.ts`](./src/queries/alerts.query.ts) | Learning sub-features should sync training completion evidence and obligation renewal rules; this package should remain the compliance status and alerting layer. |
| Audit Readiness | Implemented through overview, requirements, evidence, exceptions, filings, corrective actions, audit trail, and report export read models. | [`src/queries/overview.query.ts`](./src/queries/overview.query.ts), [`src/queries/audit.query.ts`](./src/queries/audit.query.ts), [`src/actions.ts`](./src/actions.ts), [`apps/api/app/api/hr/compliance/audit-trail/route.ts`](../../../../../apps/api/app/api/hr/compliance/audit-trail/route.ts) | New sub-features should emit auditable compliance mutations and keep enough metadata to reconstruct who changed what, why, when, and under which company scope. |
| Compliance Alerts | Implemented as derived alerts plus persisted alert-state overrides for acknowledge and close actions. | [`src/projector/alert.ts`](./src/projector/alert.ts), [`src/queries/alerts.query.ts`](./src/queries/alerts.query.ts), [`src/actions.ts`](./src/actions.ts), [`apps/api/app/api/hr/compliance/alerts/route.ts`](../../../../../apps/api/app/api/hr/compliance/alerts/route.ts) | Sub-features should not persist duplicate alert rows; publish obligations, evidence, exceptions, and due dates so the shared alert projector can derive the alert. |
| Regulatory Calendar | Implemented as derived due and expiry calendar items from requirements. Filing deadlines are persisted through filing records and exposed separately. | [`src/projector/calendar.ts`](./src/projector/calendar.ts), [`src/queries/calendar.query.ts`](./src/queries/calendar.query.ts), [`src/queries/filings.query.ts`](./src/queries/filings.query.ts), [`apps/api/app/api/hr/compliance/regulatory-calendar/route.ts`](../../../../../apps/api/app/api/hr/compliance/regulatory-calendar/route.ts) | Sub-features should express deadlines as obligation initial due days, renewal intervals, evidence expiries, or filing due dates. |
| Exception Tracking | Implemented as persisted exceptions with open, waived, resolved, and rejected states plus waiver approval audit. | [`src/schema.ts`](./src/schema.ts), [`src/actions.ts`](./src/actions.ts), [`src/queries/exceptions.query.ts`](./src/queries/exceptions.query.ts), [`src/registry/action-registry.ts`](./src/registry/action-registry.ts) | Sub-features should open exceptions against requirement IDs and use the shared waiver and resolution workflows instead of creating separate exception models. |
| Corrective Action Tracking | Implemented as persisted corrective actions with owner, due date, status, completion timestamp, and evidence links. | [`src/schema.ts`](./src/schema.ts), [`src/actions.ts`](./src/actions.ts), [`src/queries/corrective-actions.query.ts`](./src/queries/corrective-actions.query.ts), [`src/projector/requirement.ts`](./src/projector/requirement.ts) | Sub-features should attach corrective actions to requirement and exception IDs, then use shared status values to keep dashboard and audit behavior consistent. |
| Compliance Reporting | Implemented as CSV export for overview, requirements, alerts, calendar, exceptions, and filings, with audit logging for export events. | [`src/actions.ts`](./src/actions.ts), [`src/contracts/query.contract.ts`](./src/contracts/query.contract.ts), [`apps/api/app/api/hr/compliance/reports/export/route.ts`](../../../../../apps/api/app/api/hr/compliance/reports/export/route.ts), [`src/queries/overview.query.ts`](./src/queries/overview.query.ts) | New sub-features should make their compliance state visible through shared queries first; report export should consume read models rather than bespoke report tables. |
| Compliance Audit Trail | Implemented through mutation-created audit events, audit query projection, sensitive redaction, and API route exposure. | [`src/actions.ts`](./src/actions.ts), [`src/execution.ts`](./src/execution.ts), [`src/queries/audit.query.ts`](./src/queries/audit.query.ts), [`src/registry/audit.ts`](./src/registry/audit.ts) | Sub-features should use the existing mutation context and audit helpers so actor, company scope, before/after state, reason, and metadata remain consistent. |

---

# Compliance & Regulatory Tracking Does Not Include

| Excluded Area                             | Owned By                              |
| ----------------------------------------- | ------------------------------------- |
| Employee master profile                   | Employee Records Management           |
| Organization structure                    | Organizational Chart & Hierarchy      |
| Employee self-service portal              | Employee Self-Service Portal          |
| Document storage engine                   | Document Management                   |
| Employee lifecycle workflow               | Employee Lifecycle Management         |
| Payroll calculation                       | Payroll                               |
| Statutory contribution calculation        | Payroll                               |
| Leave application                         | Leave Management                      |
| Attendance clocking records               | Time & Attendance                     |
| Workplace incident investigation workflow | Health & Safety / Incident Management |
| Legal case management                     | Legal / Compliance Case Management    |
| Training course content creation          | Learning / Training Management        |
| Offboarding clearance workflow            | Offboarding & Exit Management         |
| Asset recovery                            | Asset Management / Offboarding        |

---

# Persistence & Storage Boundary

Compliance & Regulatory Tracking owns compliance business records and read models through a feature repository boundary. Repository adapters may start feature-local during scaffolding, but production source-of-truth persistence should be backed by the governed database layer.

Compliance evidence files, uploaded documents, object keys, buckets, signed URLs, and provider-specific blob operations are not owned by this feature. Those belong to the document-management flow and the canonical `packages/storage` object/file storage package. This feature should store evidence artifact references only.

Do not name compliance business-record persistence `storage.ts`; use `repository.ts` or a `repository/` directory. Reserve storage terminology for object/file storage.

---

# Compliance & Regulatory Tracking Requirement Statement

| Requirement                          | Description                                                                                                                                                                                                                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Compliance & Regulatory Tracking** | Monitors and tracks employee-related compliance obligations, including labor law adherence, statutory employment requirements, workplace safety obligations, mandatory filings, work eligibility, policy acknowledgments, compliance documents, regulatory deadlines, exceptions, corrective actions, and audit history. |

---

# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **HRM-CMP-001** | System shall maintain HR compliance obligations by legal entity, country, location, employment type, and worker category.                  |
| **HRM-CMP-002** | System shall track labor law compliance requirements applicable to employees.                                                              |
| **HRM-CMP-003** | System shall track statutory employment compliance requirements.                                                                           |
| **HRM-CMP-004** | System shall track employee work eligibility status.                                                                                       |
| **HRM-CMP-005** | System shall track work permit, visa, passport, and right-to-work document status.                                                         |
| **HRM-CMP-006** | System shall track workplace safety compliance requirements.                                                                               |
| **HRM-CMP-007** | System shall track mandatory safety training and certification requirements.                                                               |
| **HRM-CMP-008** | System shall track mandatory HR policy acknowledgments.                                                                                    |
| **HRM-CMP-009** | System shall track mandatory filing requirements and filing deadlines.                                                                     |
| **HRM-CMP-010** | System shall maintain a regulatory calendar for HR compliance deadlines.                                                                   |
| **HRM-CMP-011** | System shall flag missing compliance documents.                                                                                            |
| **HRM-CMP-012** | System shall flag expired or expiring compliance documents.                                                                                |
| **HRM-CMP-013** | System shall flag overdue compliance training.                                                                                             |
| **HRM-CMP-014** | System shall flag missing mandatory policy acknowledgments.                                                                                |
| **HRM-CMP-015** | System shall classify compliance status as compliant, pending, at risk, overdue, expired, waived, or non-compliant.                        |
| **HRM-CMP-016** | System shall generate alerts for compliance deadlines, renewals, expiries, and overdue actions.                                            |
| **HRM-CMP-017** | System shall create compliance exceptions for missing, expired, overdue, or failed compliance items.                                       |
| **HRM-CMP-018** | System shall assign corrective action owners and due dates.                                                                                |
| **HRM-CMP-019** | System shall track corrective action progress and completion.                                                                              |
| **HRM-CMP-020** | System shall link compliance records to supporting evidence documents.                                                                     |
| **HRM-CMP-021** | System shall support compliance review and approval workflow where required.                                                               |
| **HRM-CMP-022** | System shall provide compliance dashboards by legal entity, department, location, employee category, and risk status.                      |
| **HRM-CMP-023** | System shall provide compliance reports for filings, expiries, exceptions, training, acknowledgments, and work eligibility.                |
| **HRM-CMP-024** | System shall restrict access to sensitive compliance records based on role and authorization.                                              |
| **HRM-CMP-025** | System shall maintain audit trail for compliance checks, alerts, exceptions, filings, reviews, approvals, waivers, and corrective actions. |

---

# Requirement Coverage

The manifest now carries the requirement coverage registry through [`src/manifest.ts`](./src/manifest.ts) and [`src/registry/requirement-coverage.ts`](./src/registry/requirement-coverage.ts). The table below maps `HRM-CMP-001` through `HRM-CMP-025` to the code that implements each requirement as a derived read model or governed write workflow.

| Requirement | Status | Evidence |
| --- | --- | --- |
| HRM-CMP-001 | Implemented | [`src/registry/requirement-coverage.ts`](./src/registry/requirement-coverage.ts), [`src/schema.ts`](./src/schema.ts), [`src/queries/obligations.query.ts`](./src/queries/obligations.query.ts), [`packages/database/schema.ts`](../../../../../packages/database/schema.ts) |
| HRM-CMP-002 | Implemented | [`src/projector/requirement.ts`](./src/projector/requirement.ts), [`src/queries/requirements.query.ts`](./src/queries/requirements.query.ts), [`apps/api/app/api/hr/compliance/requirements/route.ts`](../../../../../apps/api/app/api/hr/compliance/requirements/route.ts) |
| HRM-CMP-003 | Implemented | [`src/projector/requirement.ts`](./src/projector/requirement.ts), [`src/queries/obligations.query.ts`](./src/queries/obligations.query.ts), [`src/queries/requirements.query.ts`](./src/queries/requirements.query.ts) |
| HRM-CMP-004 | Implemented | [`src/queries/worker-profiles.query.ts`](./src/queries/worker-profiles.query.ts), [`src/projector/read-models.ts`](./src/projector/read-models.ts), [`src/queries/requirements.query.ts`](./src/queries/requirements.query.ts) |
| HRM-CMP-005 | Implemented | [`src/queries/evidence.query.ts`](./src/queries/evidence.query.ts), [`src/actions.ts`](./src/actions.ts), [`apps/api/app/api/hr/compliance/evidence/[evidenceId]/verify/route.ts`](../../../../../apps/api/app/api/hr/compliance/evidence/[evidenceId]/verify/route.ts) |
| HRM-CMP-006 | Implemented | [`src/queries/obligations.query.ts`](./src/queries/obligations.query.ts), [`src/queries/requirements.query.ts`](./src/queries/requirements.query.ts), [`src/projector/read-models.ts`](./src/projector/read-models.ts) |
| HRM-CMP-007 | Implemented | [`src/projector/calendar.ts`](./src/projector/calendar.ts), [`src/queries/calendar.query.ts`](./src/queries/calendar.query.ts), [`src/queries/evidence.query.ts`](./src/queries/evidence.query.ts) |
| HRM-CMP-008 | Implemented | [`src/actions.ts`](./src/actions.ts), [`src/queries/requirements.query.ts`](./src/queries/requirements.query.ts), [`apps/api/app/api/hr/compliance/alerts/[alertId]/acknowledge/route.ts`](../../../../../apps/api/app/api/hr/compliance/alerts/[alertId]/acknowledge/route.ts) |
| HRM-CMP-009 | Implemented | [`src/actions.ts`](./src/actions.ts), [`src/queries/filings.query.ts`](./src/queries/filings.query.ts), [`apps/api/app/api/hr/compliance/filings/route.ts`](../../../../../apps/api/app/api/hr/compliance/filings/route.ts), [`apps/api/app/api/hr/compliance/filings/[filingId]/submit/route.ts`](../../../../../apps/api/app/api/hr/compliance/filings/[filingId]/submit/route.ts) |
| HRM-CMP-010 | Implemented | [`src/projector/calendar.ts`](./src/projector/calendar.ts), [`src/queries/calendar.query.ts`](./src/queries/calendar.query.ts), [`apps/api/app/api/hr/compliance/regulatory-calendar/route.ts`](../../../../../apps/api/app/api/hr/compliance/regulatory-calendar/route.ts) |
| HRM-CMP-011 | Implemented | [`src/projector/requirement.ts`](./src/projector/requirement.ts), [`src/queries/evidence.query.ts`](./src/queries/evidence.query.ts), [`src/queries/requirements.query.ts`](./src/queries/requirements.query.ts) |
| HRM-CMP-012 | Implemented | [`src/projector/requirement.ts`](./src/projector/requirement.ts), [`src/queries/calendar.query.ts`](./src/queries/calendar.query.ts), [`src/queries/evidence.query.ts`](./src/queries/evidence.query.ts) |
| HRM-CMP-013 | Implemented | [`src/projector/calendar.ts`](./src/projector/calendar.ts), [`src/queries/calendar.query.ts`](./src/queries/calendar.query.ts), [`src/queries/alerts.query.ts`](./src/queries/alerts.query.ts) |
| HRM-CMP-014 | Implemented | [`src/queries/requirements.query.ts`](./src/queries/requirements.query.ts), [`src/queries/alerts.query.ts`](./src/queries/alerts.query.ts), [`apps/api/app/api/hr/compliance/alerts/[alertId]/acknowledge/route.ts`](../../../../../apps/api/app/api/hr/compliance/alerts/[alertId]/acknowledge/route.ts) |
| HRM-CMP-015 | Implemented | [`src/contracts/domain.contract.ts`](./src/contracts/domain.contract.ts), [`src/projector/requirement.ts`](./src/projector/requirement.ts), [`src/schema.ts`](./src/schema.ts) |
| HRM-CMP-016 | Implemented | [`src/projector/alert.ts`](./src/projector/alert.ts), [`src/queries/alerts.query.ts`](./src/queries/alerts.query.ts), [`apps/api/app/api/hr/compliance/alerts/route.ts`](../../../../../apps/api/app/api/hr/compliance/alerts/route.ts) |
| HRM-CMP-017 | Implemented | [`src/actions.ts`](./src/actions.ts), [`src/queries/exceptions.query.ts`](./src/queries/exceptions.query.ts) |
| HRM-CMP-018 | Implemented | [`src/actions.ts`](./src/actions.ts), [`src/queries/corrective-actions.query.ts`](./src/queries/corrective-actions.query.ts) |
| HRM-CMP-019 | Implemented | [`src/actions.ts`](./src/actions.ts), [`src/queries/corrective-actions.query.ts`](./src/queries/corrective-actions.query.ts), [`src/queries/audit.query.ts`](./src/queries/audit.query.ts) |
| HRM-CMP-020 | Implemented | [`src/actions.ts`](./src/actions.ts), [`src/queries/evidence.query.ts`](./src/queries/evidence.query.ts), [`src/schema.ts`](./src/schema.ts) |
| HRM-CMP-021 | Implemented | [`src/registry/action-registry.ts`](./src/registry/action-registry.ts), [`packages/permissions/catalog.ts`](../../../../../packages/permissions/catalog.ts), [`apps/api/app/api/hr/compliance/evidence/[evidenceId]/verify/route.ts`](../../../../../apps/api/app/api/hr/compliance/evidence/[evidenceId]/verify/route.ts), [`apps/api/app/api/hr/compliance/filings/[filingId]/submit/route.ts`](../../../../../apps/api/app/api/hr/compliance/filings/[filingId]/submit/route.ts) |
| HRM-CMP-022 | Implemented | [`src/queries/overview.query.ts`](./src/queries/overview.query.ts), [`src/registry/dashboard.ts`](./src/registry/dashboard.ts), [`apps/api/app/api/hr/compliance/overview/route.ts`](../../../../../apps/api/app/api/hr/compliance/overview/route.ts) |
| HRM-CMP-023 | Implemented | [`src/actions.ts`](./src/actions.ts), [`src/contracts/domain.contract.ts`](./src/contracts/domain.contract.ts), [`apps/api/app/api/hr/compliance/reports/export/route.ts`](../../../../../apps/api/app/api/hr/compliance/reports/export/route.ts) |
| HRM-CMP-024 | Implemented | [`packages/permissions/catalog.ts`](../../../../../packages/permissions/catalog.ts), [`src/registry/capability.ts`](./src/registry/capability.ts), [`src/registry/action-registry.ts`](./src/registry/action-registry.ts), [`apps/api/app/api/hr/compliance/_lib/context.ts`](../../../../../apps/api/app/api/hr/compliance/_lib/context.ts) |
| HRM-CMP-025 | Implemented | [`src/actions.ts`](./src/actions.ts), [`src/queries/audit.query.ts`](./src/queries/audit.query.ts), [`apps/api/app/api/hr/compliance/audit-trail/route.ts`](../../../../../apps/api/app/api/hr/compliance/audit-trail/route.ts), [`src/registry/audit.ts`](./src/registry/audit.ts) |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                                                |
| --: | ------------------------------------------------------------------------------------------------------------------ |
|   1 | Compliance obligations can be configured by legal entity, country, location, employment type, and worker category. |
|   2 | Employee compliance status can be viewed from a central compliance dashboard.                                      |
|   3 | Work eligibility status can be tracked for applicable employees.                                                   |
|   4 | Work permit, visa, passport, and right-to-work expiry dates can be tracked.                                        |
|   5 | Missing compliance documents are flagged.                                                                          |
|   6 | Expiring compliance documents generate alerts before expiry.                                                       |
|   7 | Expired compliance documents are clearly marked as non-compliant or expired.                                       |
|   8 | Mandatory filing deadlines can be recorded and monitored.                                                          |
|   9 | Overdue mandatory filings are flagged.                                                                             |
|  10 | Mandatory policy acknowledgments can be tracked by employee and policy version.                                    |
|  11 | Missing policy acknowledgments are flagged.                                                                        |
|  12 | Mandatory safety or compliance training can be tracked.                                                            |
|  13 | Overdue compliance training is flagged.                                                                            |
|  14 | Compliance exceptions can be created for non-compliant items.                                                      |
|  15 | Corrective action owner, due date, and status can be assigned.                                                     |
|  16 | Compliance evidence can be linked to document records.                                                             |
|  17 | Compliance status can be filtered by company, department, location, employee category, and risk level.             |
|  18 | Sensitive compliance records are hidden from unauthorized users.                                                   |
|  19 | Compliance reports can be exported by authorized users.                                                            |
|  20 | Every compliance status change, filing update, exception, waiver, and corrective action creates an audit event.    |
