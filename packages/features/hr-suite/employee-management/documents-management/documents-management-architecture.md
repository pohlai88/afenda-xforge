# Document Management

## Definition

**Document Management is the HRM function that stores, organizes, secures, tracks, and controls employee-related documents, including employment contracts, identity documents, certifications, HR letters, policy acknowledgments, statutory documents, and document expiry records.**

## Architecture intent

This capability is the governed document-metadata boundary for the HR suite. It should support employee-related document references, document lifecycle state, expiry tracking, verification state, retention metadata, and audit-ready history.

The module should not become the employee master record, the binary file store, or a compliance-rule engine. Those concerns remain owned by adjacent domains and should only be referenced by stable identifiers or metadata.

## Ownership boundary

| Concern | Owned by Document Management | Referenced from another domain |
| --- | --- | --- |
| Employee master identity | No | Employee Records Management |
| Employee employment status | No | Employee Records Management |
| Employee organization hierarchy | No | Organizational Chart & Hierarchy |
| Document metadata and state | Yes | N/A |
| Document binary storage | No | Storage / object-file layer |
| Document references and links | Yes | N/A |
| Verification and rejection state | Yes | N/A |
| Expiry and retention metadata | Yes | N/A |
| Compliance rule monitoring | No | Compliance & Regulatory Tracking |
| Policy authoring | No | Policy governance domain |
| Audit history for document actions | Yes | N/A |

## Source-of-truth map

| Data | Source-of-truth owner | Document Management responsibility |
| --- | --- | --- |
| Employee profile facts | Employee Records Management | Reference `employeeId`, do not duplicate profile storage |
| Tenant and company scope | HR platform boundary | Require scoped reads and writes |
| Document file bytes | Storage layer | Persist only references and metadata |
| Document classification | Document Management | Own document type, group, sensitivity, and state |
| Document lifecycle state | Document Management | Own versioning, verification, expiry, archive, and retention metadata |
| Compliance obligations | Compliance & Regulatory Tracking | Reference readiness or linked evidence only |
| Policy acknowledgments | Document Management for acknowledgment metadata | Policy definition remains external |

## Scope rules

- Keep employee master data owned by Employee Records Management.
- Keep binary file storage and download mechanics outside the domain model unless they are just references.
- Keep company and tenant scoping explicit in every write and read path.
- Store facts and project read models instead of storing mutable dashboards, alerts, or derived status rows.
- Do not add compliance monitoring logic here; that remains in Compliance & Regulatory Tracking.

## Domain model foundation

The schema layer should model the document boundary with explicit, reusable vocabularies for:

- document category
- document type
- document lifecycle status
- document visibility
- version state
- retention action
- acknowledgment method

The canonical record should carry document metadata, employee reference, legal-entity reference, versioning state, expiry dates, verification dates, retention metadata, and acknowledgment metadata. It should not carry file bytes or own the storage provider.

## Contract layer

The package should expose a stable public contract surface through dedicated contract barrels rather than ad hoc type exports from implementation files.

Contract groups should cover:

- command contracts for write inputs
- query contracts for list/filter inputs
- projection contracts for record and read-model shapes
- permission contracts for read/write gating
- route contracts for public paths and feature identity
- manifest and metadata contracts for package identity and labels

The compatibility barrels in `src/contract.ts` and `src/index.ts` should re-export these contracts so consumers can depend on a stable public API while the implementation evolves.

## Repository and persistence

The package now persists document record projections through `src/repository.ts` instead of an in-memory Map.

- The repository stores records in a JSON file under `.cache/hr-suite/documents-management.repository.json` by default.
- Repository entries keep tenant and company scope metadata alongside each document record so reads can be filtered by feature context.
- `src/actions.ts` writes through repository helpers instead of mutating local state directly.
- `src/queries.ts` reads through repository helpers and applies pagination and search on top of the scoped repository output.
- The repository exposes deterministic record ID generation plus testing hooks for repository path overrides and reset behavior.
- `test/repository.test.ts` covers persistence, scoped reads, update behavior, and reset behavior.

## Policy and execution helpers

The package now enforces tenant-scoped access through `src/policy.ts` and the execution helper in `src/execution/action.ts`.

- Write operations require tenant-scoped write access and fail closed when the context is missing or denied.
- Read operations return empty or null when tenant-scoped read access is missing.
- Sensitive document projections can be redacted through a dedicated helper so future document views can mask sensitive fields without changing the underlying record shape.
- Actor normalization and audit metadata cleanup helpers are available for future audit event recording.
- The public execution barrel in `src/execution/index.ts` now exposes these helpers for future slices.

## Document registration

The first end-to-end document registration slice now lives in `src/registration.ts` and the server barrel in `src/server.ts`.

- Authorized callers can register employee-linked document metadata with category, type, title, status, visibility, and retention data.
- Updates preserve the stored document record and append a new audit event instead of overwriting the trail.
- Read-back uses the policy layer to redact sensitive fields when the caller cannot view sensitive data.
- Audit history is queryable by document id and filtered within the current tenant/company scope.
- The slice is covered by `test/document-registration.test.ts`.

## Versioning and replacement

Versioning is now part of the document lifecycle instead of an overwrite-only update path.

- Registering a document creates version 1 and stores the aggregate's current version id and version count.
- Updating a document creates a new version record and retires the prior version as `superseded`.
- Latest-version resolution is scope-aware and can be queried directly from the server barrel.
- Version history keeps sensitive source notes behind the same redaction rules used for document reads.
- The slice is covered by `test/document-versioning.test.ts`.

## Verification, expiry, and retention

Lifecycle transitions now own the document state fields that sit on top of the version chain.

- `verifyDocumentsManagementDocument` sets the document to `verified`, records `verifiedAt`, and can stamp a renewal marker.
- `rejectDocumentsManagementDocument` stores a required rejection reason and rejection timestamp.
- `expireDocumentsManagementDocument` moves the document to `expired` and requires a meaningful expiry date to be present.
- `archiveDocumentsManagementDocument` marks the document as `archived` and records an archive timestamp.
- `updateDocumentsManagementDocumentRetention` changes retention rules through a versioned revision instead of mutating history in place.
- The lifecycle audit trail uses explicit `verify`, `reject`, `expire`, `archive`, and `update` actions so state transitions are visible.
- The slice is covered by `test/document-lifecycle.test.ts`.

## Read Models and API Surface

The package now exposes explicit read projections and HTTP GET routes instead of leaking repository internals.

- `src/projector.ts` turns canonical document records into summary, readiness, and expiring projections.
- `src/queries.ts` applies scoped filtering, search, pagination, and projection assembly for document read models.
- `src/contracts/projection.contract.ts` and `src/contracts/route.contract.ts` define the projection schemas and route contracts for the read surface.
- `src/server.ts` and `src/index.ts` export the read-model helpers through the public package API.
- `apps/api/app/api/hr/documents/*` provides thin routes for list, detail, readiness, and expiring views.
- `test/document-read-models.test.ts` covers search, paging, employee readiness aggregation, and expiring-document behavior.
- Read paths still fail closed when tenant-scoped read access is missing, and the projections stay separate from the repository storage shape.

## Upload and Download Integration

The route surface now supports binary document ingress and egress without moving blob ownership into the feature package.

- `apps/api/app/api/hr/documents/route.ts` accepts multipart uploads, persists the binary through `@repo/storage`, and registers only the resulting storage reference plus file metadata in the document aggregate.
- `apps/api/app/api/hr/documents/[documentId]/download/route.ts` resolves the stored document reference, retrieves the binary from blob storage, and enforces secure download behavior through the existing read context.
- The canonical record continues to own metadata, version history, retention, and lifecycle state. It still does not own raw file bytes or a storage provider implementation.

## Tests and Hardening

The final slice adds route-level coverage and a dedicated API test script so the read surface is exercised end to end.

- `apps/api/package.json` now includes a `test` script for route-level checks.
- `apps/api/test/hr-documents-routes.test.ts` exercises the list, detail, readiness, expiring, upload, and download routes directly.
- The route tests cover valid list/detail responses, paging behavior, invalid query rejection, denied-read fail-closed behavior, binary upload/download behavior, and storage-failure service responses.
- The package test suite and API test suite both pass after the hardening changes.

## Audit Sign-Off

Audit date: 2026-06-09.

The Documents Management implementation is complete for the current 10-slice roadmap.

Evidence:

- The roadmap records slices 1 through 10 as implemented with code references.
- The feature package passes typecheck, lint, and its full test suite.
- The API app passes typecheck, lint, and its route-level test suite, including upload/download coverage.
- The package subtree audit found no remaining `TODO` or `FIXME` markers.

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

# Document Management Requirement Statement

| Requirement             | Description                                                                                                                                                                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Document Management** | Stores, organizes, secures, versions, tracks, and manages employee-related documents such as employment contracts, identity documents, certifications, HR letters, statutory forms, medical certificates, and policy acknowledgments, with expiry tracking, verification status, access control, retention rules, and audit history. |

---

# Enterprise Functional Requirements

| Code            | Requirement                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **HRM-DOC-001** | System shall allow authorized users to upload employee-related documents.                                                   |
| **HRM-DOC-002** | System shall categorize documents by document type, document group, employee, legal entity, and status.                     |
| **HRM-DOC-003** | System shall link documents to employee records.                                                                            |
| **HRM-DOC-004** | System shall support mandatory and optional document classification.                                                        |
| **HRM-DOC-005** | System shall support document versioning.                                                                                   |
| **HRM-DOC-006** | System shall identify the latest active version of a document.                                                              |
| **HRM-DOC-007** | System shall preserve previous document versions based on retention rules.                                                  |
| **HRM-DOC-008** | System shall support document verification status: pending, verified, rejected, expired, archived.                          |
| **HRM-DOC-009** | System shall allow authorized HR users to approve or reject submitted documents.                                            |
| **HRM-DOC-010** | System shall capture rejection reason for rejected documents.                                                               |
| **HRM-DOC-011** | System shall support document expiry date tracking.                                                                         |
| **HRM-DOC-012** | System shall generate alerts for documents approaching expiry.                                                              |
| **HRM-DOC-013** | System shall flag expired documents.                                                                                        |
| **HRM-DOC-014** | System shall support renewal or replacement of expired documents.                                                           |
| **HRM-DOC-015** | System shall support policy acknowledgment records.                                                                         |
| **HRM-DOC-016** | System shall record employee acknowledgment date, acknowledgment version, and acknowledgment method.                        |
| **HRM-DOC-017** | System shall restrict access to confidential documents based on role and permission.                                        |
| **HRM-DOC-018** | System shall support secure document download permissions.                                                                  |
| **HRM-DOC-019** | System shall prevent unauthorized users from viewing sensitive employee documents.                                          |
| **HRM-DOC-020** | System shall support document search by employee, document type, expiry status, verification status, and upload date.       |
| **HRM-DOC-021** | System shall support document retention rules.                                                                              |
| **HRM-DOC-022** | System shall support document archiving after employee separation.                                                          |
| **HRM-DOC-023** | System shall maintain audit trail for upload, view, download, verify, reject, replace, archive, and delete actions.         |
| **HRM-DOC-024** | System shall support employee-submitted documents through Employee Self-Service where enabled.                              |
| **HRM-DOC-025** | System shall expose document readiness status to Employee Records Management, Compliance, Payroll, and Offboarding modules. |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria                                                                         |
| --: | ------------------------------------------------------------------------------------------- |
|   1 | Authorized HR user can upload a document and link it to an employee record.                 |
|   2 | Uploaded document must have document type, employee reference, upload date, and status.     |
|   3 | Mandatory documents are clearly identified.                                                 |
|   4 | Missing mandatory documents are flagged.                                                    |
|   5 | Document can be marked as pending verification, verified, rejected, expired, or archived.   |
|   6 | Rejected document stores rejection reason.                                                  |
|   7 | Document expiry date can be recorded.                                                       |
|   8 | Expiring documents are flagged before expiry.                                               |
|   9 | Expired documents are clearly shown as expired.                                             |
|  10 | Document replacement creates a new version without losing previous version history.         |
|  11 | Latest document version is clearly identified.                                              |
|  12 | Employees can submit permitted documents through self-service where enabled.                |
|  13 | Employees can acknowledge required policies.                                                |
|  14 | Policy acknowledgment records store employee, policy version, date, and timestamp.          |
|  15 | Sensitive documents are hidden from unauthorized users.                                     |
|  16 | Document download is restricted based on permission.                                        |
|  17 | HR can search documents by employee, type, status, expiry, and verification state.          |
|  18 | Employee record can display linked document readiness without owning the document workflow. |
|  19 | Document records remain available after employee separation according to retention policy.  |
|  20 | Every document action creates an audit event.                                               |
