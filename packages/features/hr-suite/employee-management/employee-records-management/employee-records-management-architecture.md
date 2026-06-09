# Employee Records Management

## Definition

Employee Records Management is the HR suite capability that maintains the official employee master profile and its governed lifecycle. It manages identity, personal and contact details, employment context, organizational assignments, status history, document references, profile completeness, and audit-ready change history so HR teams can rely on a single operational record for each worker.

## Architecture intent

This capability is designed for modern, multi-entity HR operations where employee data must be accurate, explainable, and safe to use across adjacent domains. The architecture must support:

- a canonical employee record that remains stable across hires, transfers, status changes, and rehires
- effective operational separation between core employee facts, derived read models, and sensitive data views
- assignment and status history that preserves traceability instead of overwriting workforce context
- permission-aware access to sensitive fields, document references, and audit information
- controlled mutations with auditability so downstream domains can trust the record lifecycle

The module should behave as the system of record for employee master data within the HR suite boundary, not as a temporary profile form or UI-only directory.

## Scope

### Included

- employee identity and master profile ownership
- personal information and contact information
- emergency contact references
- employment details and employment status
- organization, manager, and job assignment references
- assignment history and status history
- document references and profile coverage indicators
- records directory, detail view, and incomplete-record views
- archive and rehire lifecycle actions
- audit trail for governed record changes

### Excluded

- organization hierarchy design and stewardship
- document binary storage, upload orchestration, and version control
- employee self-service experience ownership
- recruiting and applicant tracking
- payroll calculation and statutory contribution processing
- leave, attendance, and time capture
- performance, learning, and disciplinary workflows
- offboarding asset recovery and clearance orchestration

## Core domain model

### Employee record

The employee record is the canonical master object for a worker within the HR suite. It should persist identity, employment context, and key references required by dependent domains.

It should carry:

- stable employee identifier
- legal or preferred name fields as policy allows
- contact and emergency contact references
- employment status
- hire, separation, and rehire context
- organizational and manager references
- job assignment references
- document-reference coverage state

### Assignment history

Assignment history captures how the employee record moves through organizational structure over time. It should preserve changes to manager, department, role, location, and related assignment context instead of flattening them into a single mutable record.

It should support:

- effective dating
- current versus prior assignment distinction
- manager and organization linkage
- reason or source of assignment change
- traceability for downstream consumers

### Employment status history

Employment status history tracks the worker lifecycle over time, including active, inactive, archived, separated, or rehired states as defined by policy.

It should maintain:

- status value
- effective timestamp
- transition reason
- actor or source
- linkage to related lifecycle actions

### Document reference set

Employee records should own references to required documents without becoming the binary document repository. The record layer should know what is linked, what is missing, and what affects profile completeness.

Document references can include:

- identity documents
- employment letters or contracts
- work eligibility references
- policy acknowledgments
- role-specific supporting records

### Audit event

Audit events represent the governed history of change to employee records and related lifecycle actions. They should cover both direct profile edits and operational events such as assignment changes, archival, and rehire.

## System architecture

### 1. Source-of-truth write layer

Employee Records Management should own the write path for employee master data inside the HR suite package boundary.

Common commands:

- create employee record
- update employee record
- record assignment change
- archive employee record
- rehire employee record

Writes should validate permissions, required fields, lifecycle rules, and sensitive-access constraints before mutating record state.

### 2. Record store and mutation orchestration

The architecture should separate mutation orchestration from raw data storage:

- actions execute governed commands
- a store persists employee records and their related state
- mutation helpers keep transition logic consistent

This makes lifecycle behavior explicit and reduces the risk of uncontrolled ad hoc updates across surfaces.

### 3. Read model layer

Employee record reads should be projection-oriented and optimized for HR operations rather than exposing raw storage objects everywhere.

Primary read surfaces:

- records directory
- employee detail page model
- overview and stats surfaces
- incomplete records view
- assignments list
- status history list
- document references list
- audit trail list

The read layer should answer operational questions quickly while preserving the governed semantics of the source record.

### 4. Access and sensitivity controls

Employee records typically contain sensitive personal data. The architecture should enforce capability-aware access for:

- standard record reads
- write actions
- sensitive-field reads
- audit visibility

Sensitive views should degrade safely. If a caller lacks permission, fields should be masked or omitted instead of exposed through a partially trusted read path.

## Workflow architecture

### Record creation and onboarding handoff

A new employee record is created when a worker enters the managed workforce scope. The package should accept the initial profile, create the canonical record, and establish the first assignment and status state required by downstream HR operations.

### Change management

Employee data changes should be handled through explicit commands rather than direct object replacement.

Typical change events:

- personal or contact detail update
- manager or department change
- job assignment change
- status transition
- document-reference update

Each change should preserve enough history for downstream domains to understand how the current state was reached.

### Archive and rehire lifecycle

Archive and rehire are first-class lifecycle operations, not generic edits.

The system should support:

- archiving records no longer operationally active
- preserving prior assignments and history
- rehiring a worker without losing the historical record
- clearly separating current active state from historical employment continuity

## Security and privacy

Employee master data is highly sensitive and should be treated accordingly.

Required controls:

- role-based access control for read and write capabilities
- sensitive-read gating for protected profile fields
- least-privilege access to document references
- controlled exposure of audit history
- safe default behavior for unauthorized access
- export restrictions where bulk employee data is involved

The package should assume that some callers can view directory-safe data but cannot access full personal detail.

## Audit and traceability

Every meaningful change to the employee record should be traceable.

Audit should capture:

- who performed the action
- what changed
- when the change occurred
- the previous and new state where relevant
- the source command or operational event
- affected employee record and assignment context

Traceability is essential because many downstream HR processes depend on the integrity of employee master data.

## Data governance

The module should treat employee data as governed master data rather than disposable UI state.

Key rules:

- preserve historical status and assignment context
- keep sensitive data access explicit
- avoid orphaning document references
- separate current profile state from derived read-model views
- maintain stable identifiers for cross-domain integrations

Retention, archival, and deletion behavior should follow company policy and applicable labor or privacy requirements.

## Integrations

Employee Records Management should integrate with adjacent HR domains while remaining the owner of the employee master profile.

Primary integrations:

- organization management for department, entity, and reporting references
- document management for stored evidence and document metadata
- compliance tracking for worker obligations and eligibility context
- payroll for employee identity and employment references
- time and attendance for worker and manager lookups
- access control for permission enforcement
- reporting and analytics for workforce reporting

The package should expose stable contracts so downstream modules consume employee records without duplicating profile ownership.

## Operational model

### Performance

Directory and detail reads should be fast enough for daily HR operations. Common filters such as status, manager, organizational scope, and completeness should be supported through projection-friendly query design.

### Reliability

The system should preserve record integrity during lifecycle changes. Failure to load optional integrations such as document metadata should not corrupt the employee master record.

### Explainability

HR operators should be able to understand why a record is incomplete, archived, rehired, or assigned to a given organizational context.

### Scalability

The design should support:

- large employee populations
- frequent profile changes
- multiple entities and organizational units
- high-volume directory and detail reads
- downstream integrations that depend on stable record semantics

## UX surfaces

Modern HR suites should expose employee records through a small set of consistent surfaces:

- employee records directory
- employee detail profile
- overview statistics
- incomplete records queue
- assignments history
- status history
- document references view
- audit trail view

Each surface should answer one operational question quickly:

- who the employee is
- where they sit in the organization
- what changed
- what is missing
- whether the record is active
- whether sensitive detail can be shown

## Non-goals

This capability should not become a general document-management system, an employee self-service frontend, or a workflow engine for every HR lifecycle process. It should own the employee master record and expose governed operational views around that record.

## Notes

The package is more implementation-rich than a minimal scaffold. This document describes the target architecture and also maps that architecture to the current Xforge package, which already contains domain-specific contracts, actions, query surfaces, and server models.

## Codebase mapping

The current package already includes employee-record-specific structures and server-side orchestration. It is closer to a governed domain package than the compliance placeholder package, but it still stops short of a full enterprise master-data subsystem.

### What exists today

| Area | Code location | Current behavior |
| --- | --- | --- |
| Feature identity | [`src/metadata.ts`](src/metadata.ts), [`src/manifest.ts`](src/manifest.ts), [`src/shared/index.ts`](src/shared/index.ts) | Declares package metadata, feature scope, package name, and legacy source provenance |
| Public contracts | [`src/contract.ts`](src/contract.ts) | Re-exports employee-record types, forms, permissions, status schema, and route contracts |
| Public door | [`src/index.ts`](src/index.ts), [`src/server.ts`](src/server.ts) | Exposes the server-only package API and page-model builders |
| Write actions | [`src/actions.ts`](src/actions.ts), [`src/hr.workforce.records.actions.server.ts`](src/hr.workforce.records.actions.server.ts) | Provides explicit employee lifecycle commands including create, update, assignment, archive, and rehire |
| Queries | [`src/queries.ts`](src/queries.ts), [`src/hr.workforce.records.queries.ts`](src/hr.workforce.records.queries.ts) | Exposes governed record lookup and listing flows |
| Store and mutation support | [`src/hr.workforce.records.store.ts`](src/hr.workforce.records.store.ts), [`src/hr.workforce.records.mutation.shared.server.ts`](src/hr.workforce.records.mutation.shared.server.ts) | Maintains the underlying employee record state and shared mutation logic |
| Page models | [`src/hr.workforce.records.page-model.server.ts`](src/hr.workforce.records.page-model.server.ts), [`src/hr.workforce.records.detail.page-model.server.ts`](src/hr.workforce.records.detail.page-model.server.ts) | Builds overview and detail read models for HR surfaces |
| Access control | [`src/hr.workforce.records.access.policy.server.ts`](src/hr.workforce.records.access.policy.server.ts), [`src/hr.workforce.records-sensitive-access.shared.ts`](src/hr.workforce.records-sensitive-access.shared.ts) | Defines access policy and sensitive-read behavior |
| Domain surfaces | `src/hr.workforce.records-*.surface.ts`, `src/hr.workforce.records-*.shared.ts` | Provides domain-specific list, stats, metadata, coverage, and audit surface definitions |
| Execution surface | [`src/execution/index.ts`](src/execution/index.ts) | Packages the operational commands and queries into a callable feature surface |

### What the code does not yet fully implement

- no persistent database-backed repository is evident from the public package shape
- no explicit effective-dated assignment model with enterprise-grade temporal querying
- no cross-package integration enforcement for organization, payroll, or compliance dependencies
- no retention-policy or privacy-rule orchestration beyond package-local access controls
- no event-driven synchronization model for downstream consumers
- no full document-management lifecycle, only document-reference-oriented surfaces

### Mapping judgment

The package already models the employee-records domain with meaningful server-side types and operations. The architecture doc should therefore be read as a governed target design with partial implementation already present, not as a purely aspirational scaffold.

## Upgrade plan

### Phase 1: Harden persistence and lifecycle invariants

Objective: move from package-local record management toward durable master-data behavior.

Deliverables:

- persistent repository for employee records and history
- stronger lifecycle invariants for archive and rehire transitions
- stable audit persistence for record mutations
- consistency rules for assignment and status history

### Phase 2: Formalize temporal and organizational modeling

Objective: improve traceability of employee state over time.

Deliverables:

- effective-dated assignment history
- clearer current-versus-historical state derivation
- organization and manager reference validation
- deterministic completeness and coverage derivation

### Phase 3: Tighten sensitive-data governance

Objective: make sensitive access enforceable across all read surfaces.

Deliverables:

- unified sensitive-field policy enforcement
- export-safe read models
- field-level masking rules
- stronger auditability for sensitive access and mutation paths

### Phase 4: Strengthen cross-domain integration contracts

Objective: make the package a reliable source of truth for dependent HR modules.

Deliverables:

- stable integration contracts for compliance, payroll, and time-attendance
- downstream-safe employee identifiers and reference models
- event publication or change-notification strategy
- clearer ownership boundaries for document references and organization context

### Phase 5: Operational hardening

Objective: make the capability enterprise-ready at scale.

Deliverables:

- indexed and projection-friendly directory queries
- bulk read and export controls
- data-retention and archival policy implementation
- test coverage for lifecycle rules, permissions, and history integrity

## Repair priorities

These are the highest-value fixes to bring the current package closer to the target architecture.

1. Back the current record store and mutation path with durable persistence.
2. Make assignment and status history explicitly effective-dated and queryable.
3. Centralize sensitive-field masking across every page-model and query surface.
4. Persist audit events as first-class records instead of relying only on package-local behavior.
5. Add integration tests for create, update, archive, rehire, and permission boundaries.
