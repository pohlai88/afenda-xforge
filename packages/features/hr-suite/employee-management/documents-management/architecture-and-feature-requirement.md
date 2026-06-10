# Document Management
## Business Definition
Document Management is the HRM function that stores, organizes, secures, tracks, and controls employee-related documents, including employment contracts, identity documents, certifications, HR letters, policy acknowledgments, statutory documents, and document expiry records.

---
# Document Management Includes

| Area                             | What It Covers                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| **Employee Document Repository** | Central storage of employee-related documents                                               |
| **Employment Documents**         | Offer letter, appointment letter, employment contract, contract renewal letter              |
| **Identity Documents**           | NRIC, passport, work permit, visa, national ID                                              |
| **Qualification Documents**      | Degree certificate, professional certificate, license, training certificate                 |
| **Payroll-Related Documents**    | Bank form, tax form, statutory registration form, payroll declaration reference             |
| **Policy Acknowledgments**       | Employee handbook acknowledgment, code of conduct, IT policy, safety policy                 |
| **HR Letters**                   | Confirmation letter, promotion letter, transfer letter, warning letter, disciplinary letter |
| **Medical / Leave Documents**    | Medical certificate, fitness certificate, hospitalization document, maternity document      |
| **Compliance Documents**         | Consent forms, statutory declarations, right-to-work documents, regulatory forms            |
| **Document Categories**          | Document type, document group, mandatory/optional flag                                      |
| **Document Versioning**          | Version number, latest version, previous version, replacement record                        |
| **Document Expiry Tracking**     | Expiry date, renewal due date, expired document status                                      |
| **Document Verification**        | Pending verification, verified, rejected, expired                                           |
| **Access Control**               | Role-based access, field/document-level permission, secure download control                 |
| **Retention Control**            | Retention period, archive rule, deletion/anonymization rule                                 |
| **Audit Trail**                  | Uploaded by, viewed by, downloaded by, verified by, replaced by, timestamp                  |

---

---
# Document Management Does Not Include

| Excluded Area                         | Owned By                                         |
| ------------------------------------- | ------------------------------------------------ |
| Employee master profile               | Employee Records Management                      |
| Employee employment status            | Employee Records Management                      |
| Organization hierarchy                | Organizational Chart & Hierarchy                 |
| Employee self-service portal          | Employee Self-Service                            |
| Payroll calculation                   | Payroll                                          |
| Leave approval workflow               | Leave Management                                 |
| Attendance records                    | Time & Attendance                                |
| Performance review documents creation | Performance Management                           |
| Training course management            | Learning / Training Management                   |
| Compliance rule monitoring            | Compliance & Regulatory Tracking                 |
| Offboarding checklist workflow        | Offboarding & Exit Management                    |
| Asset assignment documents            | Asset Management / Document Management link only |
| Legal case handling                   | Legal / Compliance Management                    |

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
# Document Management Requirement Statement

| Requirement             | Description                                                                                                                                                                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Document Management** | Stores, organizes, secures, versions, tracks, and manages employee-related documents such as employment contracts, identity documents, certifications, HR letters, statutory forms, medical certificates, and policy acknowledgments, with expiry tracking, verification status, access control, retention rules, and audit history. |

---

---
# Enterprise Functional Requirements

| Code | Requirement | Status | Notes |
| --- | --- | --- | --- |
| **HRM-DOC-001** | System shall allow authorized users to upload employee-related documents. | Implemented | API supports multipart upload and pre-uploaded storage references. |
| **HRM-DOC-002** | System shall categorize documents by document type, document group, employee, legal entity, and status. | Implemented | Category, type, employee, legal entity, and status are modeled and queryable. |
| **HRM-DOC-003** | System shall link documents to employee records. | Implemented | Documents store `employeeId` and readiness groups by employee. |
| **HRM-DOC-004** | System shall support mandatory and optional document classification. | Implemented | `mandatory` is part of the document model and projections. |
| **HRM-DOC-005** | System shall support document versioning. | Implemented | Version chain is persisted and queryable. |
| **HRM-DOC-006** | System shall identify the latest active version of a document. | Implemented | Latest version resolution exists in the server surface. |
| **HRM-DOC-007** | System shall preserve previous document versions based on retention rules. | Partial | Previous versions are preserved, but retention rules are metadata only and are not enforced by a retention executor. |
| **HRM-DOC-008** | System shall support document verification status: pending, verified, rejected, expired, archived. | Implemented | Status model and lifecycle transitions are present. |
| **HRM-DOC-009** | System shall allow authorized HR users to approve or reject submitted documents. | Implemented | Verify/reject actions exist behind write access checks. |
| **HRM-DOC-010** | System shall capture rejection reason for rejected documents. | Implemented | Reject flow requires and stores a rejection reason. |
| **HRM-DOC-011** | System shall support document expiry date tracking. | Implemented | Expiry and renewal dates are modeled and projected. |
| **HRM-DOC-012** | System shall generate alerts for documents approaching expiry. | Partial | Expiring-document projections exist, but no alerting or notification workflow exists. |
| **HRM-DOC-013** | System shall flag expired documents. | Implemented | Expired status and expiring projections surface expired documents. |
| **HRM-DOC-014** | System shall support renewal or replacement of expired documents. | Implemented | Replacement/versioning and renewal markers exist. |
| **HRM-DOC-015** | System shall support policy acknowledgment records. | Partial | Acknowledgment shape exists in schema, but no command or route creates or updates acknowledgment records. |
| **HRM-DOC-016** | System shall record employee acknowledgment date, acknowledgment version, and acknowledgment method. | Not implemented | The schema supports these fields, but no implemented workflow persists them. |
| **HRM-DOC-017** | System shall restrict access to confidential documents based on role and permission. | Partial | Access is boolean capability based with sensitive-field redaction, not role-aware or document-level policy enforcement. |
| **HRM-DOC-018** | System shall support secure document download permissions. | Partial | Download is gated by the read context, but there is no separate download permission or download audit event. |
| **HRM-DOC-019** | System shall prevent unauthorized users from viewing sensitive employee documents. | Partial | Sensitive fields are redacted without sensitive-view permission, but the document record itself is still discoverable to authorized readers. |
| **HRM-DOC-020** | System shall support document search by employee, document type, expiry status, verification status, and upload date. | Partial | Search/filter supports employee, type, status, verification, and expiry windows, but not explicit upload-date filtering. |
| **HRM-DOC-021** | System shall support document retention rules. | Partial | Retention metadata and versioned updates exist, but no retention execution flow exists. |
| **HRM-DOC-022** | System shall support document archiving after employee separation. | Partial | Manual archive exists; no separation-triggered archive workflow exists. |
| **HRM-DOC-023** | System shall maintain audit trail for upload, view, download, verify, reject, replace, archive, and delete actions. | Partial | Audit exists for register/update/verify/reject/expire/archive, but not for view, download, or delete actions. |
| **HRM-DOC-024** | System shall support employee-submitted documents through Employee Self-Service where enabled. | Not implemented | No self-service-specific command, route, or enablement path exists in this package. |
| **HRM-DOC-025** | System shall expose document readiness status to Employee Records Management, Compliance, Payroll, and Offboarding modules. | Partial | Readiness projections and API routes exist, but no verified downstream module integrations are implemented here. |

---

---
# Enterprise Acceptance Criteria

| No. | Acceptance Criteria | Status | Notes |
| --: | --- | --- | --- |
| 1 | Authorized HR user can upload a document and link it to an employee record. | Implemented | Covered by API route tests. |
| 2 | Uploaded document must have document type, employee reference, upload date, and status. | Implemented | Stored document has type, employee reference, created timestamp, and status. |
| 3 | Mandatory documents are clearly identified. | Implemented | `mandatory` is stored and projected. |
| 4 | Missing mandatory documents are flagged. | Partial | Readiness projections expose missing mandatory counts, but there is no explicit required-document catalog or per-document missing list. |
| 5 | Document can be marked as pending verification, verified, rejected, expired, or archived. | Implemented | Covered by schema and lifecycle actions. |
| 6 | Rejected document stores rejection reason. | Implemented | Covered by lifecycle tests. |
| 7 | Document expiry date can be recorded. | Implemented | Supported in registration and lifecycle flows. |
| 8 | Expiring documents are flagged before expiry. | Partial | Expiring projections exist, but no alerting workflow exists. |
| 9 | Expired documents are clearly shown as expired. | Implemented | Expired state and expiring projection are present. |
| 10 | Document replacement creates a new version without losing previous version history. | Implemented | Covered by versioning tests. |
| 11 | Latest document version is clearly identified. | Implemented | Current/latest version queries exist. |
| 12 | Employees can submit permitted documents through self-service where enabled. | Not implemented | No self-service enablement or submission flow exists. |
| 13 | Employees can acknowledge required policies. | Not implemented | No acknowledgment command or route exists. |
| 14 | Policy acknowledgment records store employee, policy version, date, and timestamp. | Not implemented | Only the schema shape exists. |
| 15 | Sensitive documents are hidden from unauthorized users. | Partial | Sensitive fields are redacted; the full document is not fully hidden from authorized readers without sensitive clearance. |
| 16 | Document download is restricted based on permission. | Partial | Download requires read access, but there is no dedicated download permission layer. |
| 17 | HR can search documents by employee, type, status, expiry, and verification state. | Implemented | Supported by query filters and projections. |
| 18 | Employee record can display linked document readiness without owning the document workflow. | Implemented | Readiness projections and route exist. |
| 19 | Document records remain available after employee separation according to retention policy. | Partial | Retention metadata and archive actions exist, but no separation-driven retention automation exists. |
| 20 | Every document action creates an audit event. | Partial | Core lifecycle actions do; view/download/delete do not. |

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
| Feature contracts and schemas | Implemented | [`src/contract.ts`](./src/contract.ts), [`src/contracts/index.ts`](./src/contracts/index.ts), [`src/schema.ts`](./src/schema.ts) |
| Authorization and policy boundary | Partial | [`src/policy.ts`](./src/policy.ts), [`src/manifest.ts`](./src/manifest.ts) |
| Source-of-truth integration | Partial | [`src/metadata.ts`](./src/metadata.ts), [`src/repository.ts`](./src/repository.ts) |
| Repository and persistence | Implemented | [`src/repository.ts`](./src/repository.ts), [`src/repository.file.ts`](./src/repository.file.ts) |
| Queries, projections, or read models | Implemented | [`src/queries.ts`](./src/queries.ts) |
| Actions, workflows, or mutations | Implemented | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts) |
| HTTP or API routes | Not implemented in package boundary | App-layer routes are not defined inside this package. |
| Requirement coverage registry | Not started | [`src/manifest.ts`](./src/manifest.ts) |
| Verification tests | Implemented | [`test/document-lifecycle.test.ts`](./test/document-lifecycle.test.ts), [`test/document-read-models.test.ts`](./test/document-read-models.test.ts), [`test/document-registration.test.ts`](./test/document-registration.test.ts), [`test/document-versioning.test.ts`](./test/document-versioning.test.ts), [`test/policy.test.ts`](./test/policy.test.ts), [`test/repository.test.ts`](./test/repository.test.ts) |

### Planning Mark

- `Current audited slices: package surface, contracts, queries, actions, repository, and verification assets`
- `Slice status: partial`
- `Feature status: partially implemented`

---
# Requirement Coverage

This package does not yet carry a complete row-by-row requirement audit in code unless explicitly linked below. The table records the currently auditable package-owned slice and should be expanded as implementation evidence becomes more precise.

| Requirement | Status | Evidence |
| --- | --- | --- |
| HRM-DOC-001 | Partial | [`src/contract.ts`](./src/contract.ts), [`src/contracts/index.ts`](./src/contracts/index.ts), [`src/schema.ts`](./src/schema.ts) |
| HRM-DOC-002 | Partial | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts), [`src/queries.ts`](./src/queries.ts) |
| HRM-DOC-003 | Not started | [`src/queries.ts`](./src/queries.ts), [`src/actions.ts`](./src/actions.ts) |

---
# Element-by-Element Code Evaluation

This evaluation reflects the current package codebase as of 2026-06-10. It records the implementation surfaces that future slices should preserve and extend rather than bypass.

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| Feature manifest and metadata | Implemented as package-owned manifest and metadata surfaces. | [`src/manifest.ts`](./src/manifest.ts), [`src/metadata.ts`](./src/metadata.ts) | Preserve the exported package identity, manifest surface, and metadata contract when adding routes or UI integrations. |
| Contract and schema boundary | Implemented through explicit contract or schema files. | [`src/contract.ts`](./src/contract.ts), [`src/contracts/index.ts`](./src/contracts/index.ts), [`src/schema.ts`](./src/schema.ts) | Add new inputs and outputs through stable contracts and schemas instead of ad hoc object shapes. |
| Query and read-model surface | Implemented through package-owned query or projection surfaces. | [`src/queries.ts`](./src/queries.ts) | Keep UI and API consumers on read models or query surfaces rather than repository internals. |
| Action and execution surface | Implemented through action or execution files. | [`src/actions.ts`](./src/actions.ts), [`src/execution/action.ts`](./src/execution/action.ts) | Route mutations through explicit actions and execution helpers so policy, audit, and validation can be enforced centrally. |
| Repository or store boundary | Implemented through repository or store modules. | [`src/repository.ts`](./src/repository.ts) | Preserve a single persistence boundary so future storage changes do not leak into contracts or UI surfaces. |
| Verification surface | Implemented through package-level tests. | [`test/document-lifecycle.test.ts`](./test/document-lifecycle.test.ts), [`test/document-read-models.test.ts`](./test/document-read-models.test.ts), [`test/document-registration.test.ts`](./test/document-registration.test.ts), [`test/document-versioning.test.ts`](./test/document-versioning.test.ts), [`test/policy.test.ts`](./test/policy.test.ts), [`test/repository.test.ts`](./test/repository.test.ts) | Add targeted tests as feature slices become production-critical, especially around policies, actions, and read-model correctness. |

---
# Verification Summary

1. `pnpm --filter @repo/features-employee-management-documents-management typecheck`
2. `pnpm --filter @repo/features-employee-management-documents-management lint`
3. `pnpm --filter @repo/features-employee-management-documents-management test`
---
