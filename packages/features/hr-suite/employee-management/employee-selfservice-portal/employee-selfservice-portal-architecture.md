# Employee Self-Service Portal

## Definition

Employee Self-Service Portal is the HR suite capability that exposes employee-safe HR experiences for reading personal HR information, submitting governed requests, acknowledging HR notices, completing assigned tasks, and tracking request outcomes without making the portal the source of truth for the underlying HR domains.

The package should behave as a governed system of engagement, not as a duplicate HR system of record. It coordinates employee-facing reads and submissions across employee records, leave, payroll, attendance, claims, document, onboarding, offboarding, and approval domains.

## Architecture Intent

This capability is designed for modern multi-entity HR operations where employees, managers, and HR teams need a secure digital interaction layer over multiple underlying systems. The architecture must support:

- actor-scoped self-service reads so employees can access their own data safely
- governed self-service mutations that produce requests, not uncontrolled master-data edits
- consistent request tracking across heterogeneous HR domains
- permission-aware masking of sensitive payroll, identity, and personal data
- mobile-friendly and localization-ready read models for employee-facing surfaces
- auditability for submissions, approvals, acknowledgements, and document access

The portal should unify employee-facing interaction patterns while preserving ownership boundaries with adjacent domains.

## Scope

### Included

- authenticated self-service profile views
- personal-information update request submission
- leave balance and leave-request portal flows
- payroll-document listing and authorized download references
- attendance, schedule, and work-calendar views
- claims submission and reimbursement-status views
- HR document and resource-center access
- policy, consent, and notice acknowledgement
- onboarding, offboarding, compliance, and HR task views
- employee notification center
- manager approval inbox for relevant employee requests
- request tracking and status-history views
- audit-ready event capture for portal actions

### Excluded

- employee master record ownership
- organization hierarchy management
- payroll calculation or payroll-run orchestration
- leave policy configuration
- attendance device integration or attendance-record ownership
- claims policy configuration and finance posting
- document binary storage and signed-URL infrastructure ownership
- training-course management
- offboarding workflow ownership
- IAM policy authoring and role governance

## Core Domain Model

### Portal actor context

Every read and write must be scoped to an authenticated actor context. The context should distinguish:

- employee self-access
- manager access to authorized subordinates or approval queues
- HR or administrator elevated access
- localization and presentation preferences where applicable

The package should fail closed when actor scope or capability is missing.

### Self-service profile view

The self-service profile view is a projection of employee-record data shaped for employee-safe display. It should include:

- employee identity summary
- employment context
- reporting context
- allowed personal detail
- masked or omitted sensitive fields
- portal actions available to the actor

The projection should not become a second master profile.

### Request envelope

Portal submissions should be modeled as governed request envelopes rather than direct writes into source domains. A request envelope should carry:

- request id
- request type
- actor context
- target employee id
- submitted payload
- current status
- approval or review requirements
- timestamps
- status history

This model allows a consistent tracking surface across profile updates, leave, claims, acknowledgements, and other employee actions.

### Document access reference

The portal should reference authorized employee documents and resources without owning file binaries. A document access reference should support:

- resource or document identifier
- type and category
- display metadata
- authorization scope
- view and download capability flags
- sensitivity classification

### Task item

Task items represent actionable work assigned to the employee or manager through adjacent HR domains. Tasks may come from onboarding, offboarding, compliance, document acknowledgement, or request follow-up. A task item should support:

- source domain reference
- task category
- assignee context
- due date
- status
- evidence or completion note references
- escalation and overdue indicators

### Notification item

Notifications should provide a unified employee-facing signal layer across the portal. A notification item should support:

- notification type
- title and body reference
- actor scope
- related object reference
- urgency or severity
- unread/read state
- localization-friendly message keys where needed

### Audit event

Audit events represent the governed history of employee self-service activity. They should cover:

- submissions
- approvals
- rejections
- returns for correction
- acknowledgements
- sensitive document access
- manager decisions

## System Architecture

### 1. System-of-engagement layer

Employee Self-Service Portal should be treated as a system-of-engagement layer over multiple HR systems of record. It must:

- consume profile, leave, payroll, attendance, claims, task, and document data through stable contracts
- project that data into employee-safe views
- avoid copying source-of-truth behavior into the portal

### 2. Command and query separation

The package should separate reads from submissions:

- queries build projection-oriented views for employees and managers
- commands create governed request records or call downstream workflows
- approvals and reviews are explicit actions, not ad hoc field edits

This makes actor scope, approval gating, and audit behavior easier to reason about.

### 3. Projection-first read model layer

Portal surfaces should consume purpose-built projections rather than raw downstream payloads. Primary projections include:

- my profile summary
- profile detail
- request list
- request detail with status history
- leave balance summary
- payroll document list
- attendance summary
- claims list
- resources and documents list
- tasks list
- notifications list
- manager approval inbox

Projection-first design keeps mobile, masking, localization, and UX composition concerns out of low-level integration shapes.

### 4. Actor and sensitivity policy layer

Policy must be explicit for:

- self-read access
- manager read access
- manager approval access
- employee self-submission rights
- sensitive profile and payroll visibility
- document access and download authorization
- audit visibility

Sensitive views should degrade safely by masking or omitting fields rather than partially leaking data.

### 5. Request orchestration layer

Portal writes should flow through request orchestration instead of raw record mutation. Common commands include:

- submit profile update request
- submit leave request
- cancel or amend request
- submit claim
- acknowledge policy or notice
- approve or reject employee request
- mark task complete where the source workflow allows employee completion

Request orchestration should normalize actor metadata, validate payload shape, apply policy, and emit audit information.

### 6. Integration adapter layer

The package will depend on adjacent HR systems. Those dependencies should be isolated behind adapters or stable contracts so the portal package does not absorb downstream domain complexity. Likely integration boundaries include:

- employee records for employee-safe profile views
- leave management for balances, requests, and status
- payroll for document references
- time and attendance for attendance and schedule reads
- claims management for claim submission and status
- document management for HR document/resource references
- onboarding/offboarding/compliance for tasks and acknowledgements
- IAM and notification systems for access and alerts

## Frontend and UX Architecture

The portal is employee-facing, so architecture must support usable, composable UI surfaces instead of a flat API wrapper.

### Composition principles

Following React composition guidance, the UI should prefer:

- explicit surface components over boolean-heavy mega-components
- compound components for complex request-detail or approval-inbox surfaces
- provider-scoped state interfaces that separate state, actions, and metadata
- employee and manager variants as explicit compositions, not mode booleans

Examples:

- `PortalRequestList`, `PortalRequestItem`, and `PortalRequestFilters`
- `ApprovalInbox`, `ApprovalInboxList`, and `ApprovalInboxDetail`
- `ProfileView` and `ProfileUpdateRequestForm` as distinct surfaces instead of one component with many flags

### Type-safe contract design

Following advanced TypeScript guidance, the package should use:

- discriminated unions for request types and request status transitions
- mapped and utility types for actor-safe projections
- template-literal or branded ids where that improves route and event consistency
- compile-time separation between raw integration payloads and portal projections

Type-level discipline matters here because the portal joins data from many adjacent domains and is a likely place for accidental shape drift.

### React and performance principles

Following Vercel React best practices, the portal should prefer:

- projection loading that avoids unnecessary request waterfalls
- parallel loading of independent portal widgets
- minimal client-side serialization of sensitive data
- server-side shaping of read models before they reach interactive components
- explicit boundaries between server-derived data and client interaction state
- mobile-friendly surfaces that avoid over-fetching and overly broad client bundles

## Workflow Architecture

### My profile flow

The employee authenticates, the actor scope is resolved, and the portal returns an employee-safe profile projection. Sensitive fields are masked unless policy permits access.

### Profile update request flow

The employee submits a permitted profile change. The request is validated, stored or forwarded as a governed request, routed to the appropriate reviewer if sensitive, and exposed back to the employee as a trackable request.

### Leave and claims request flow

The employee submits leave or claims information through portal contracts. The portal creates or forwards a governed request, captures request status, and exposes the request lifecycle through the same tracking surface used elsewhere in the portal.

### Document and resource access flow

The portal lists authorized resources and documents for the actor. The package should validate access before exposing view or download metadata. Sensitive access should be audited where required.

### Acknowledgement and task completion flow

The portal shows required acknowledgements and tasks from upstream domains. Employee completion or acknowledgement events are captured, reflected in portal state, and written to audit history.

### Manager approval flow

Managers use a governed approval inbox that is scoped to their authorized approval surfaces. Approvals, rejections, and returns for correction should be explicit commands with reasons and audit capture.

## Security and Privacy

Employee-facing HR systems are sensitive by default. Required controls include:

- actor-scoped access controls
- self-only read constraints by default
- capability-aware manager and HR elevation
- sensitive-field masking for personal, identity, and payroll data
- authorized-document filtering
- request payload validation and sensitive-write gating
- audit capture for high-risk reads and writes
- safe defaults for missing scope or missing integration data

The portal should assume most employees can read only their own authorized HR data and should never infer broader access.

## Audit and Traceability

Every meaningful employee-facing action should be traceable. Audit should capture:

- who performed the action
- what request or object was affected
- when it occurred
- status transitions
- approval or rejection reasons where applicable
- sensitivity-aware before and after payloads when allowed
- related employee and manager context

Traceability is necessary because the portal is often the point where HR workflows are initiated or acknowledged.

## Data Governance

The portal should treat most data as referenced and projected rather than owned. Key rules:

- do not duplicate master data when a projection is sufficient
- separate raw integration payloads from employee-safe portal models
- keep actor scope explicit in every read and write
- prevent direct source-of-truth updates through self-service shortcuts
- preserve request and audit history even when source-domain state changes later

## Integrations

Primary integration boundaries:

- Employee Records Management for profile and employment context
- Leave Management for leave balance, history, and requests
- Payroll for payroll-document availability and settlement-facing references where relevant
- Time and Attendance for attendance, shift, and work-calendar reads
- Claims / Expense Management for claim submission and reimbursement state
- Document Management for authorized document/resource references
- Compliance / Onboarding / Offboarding for assigned tasks and acknowledgements
- IAM / Access Control for actor scope and authorization
- Notifications infrastructure for alert delivery

The portal should publish stable contracts for adjacent systems that need to drive task, request, or notification surfaces.

## Operational Model

### Performance

Portal reads should be optimized for frequent employee access on mobile and desktop. Independent widgets such as profile summary, notifications, balances, and tasks should be able to load in parallel where infrastructure permits.

### Reliability

A partial failure in one integration should degrade that slice of the portal safely rather than failing the whole self-service experience when possible.

### Explainability

Employees should be able to understand:

- what they can see
- what they can change
- why a request is pending, rejected, or blocked
- what tasks are overdue
- whether a document is available or restricted

### Scalability

The architecture should support:

- large employee populations
- multi-entity HR setups
- frequent read traffic
- heterogeneous integration response shapes
- localized labels and messages

## UX Surfaces

The portal should converge on a small set of consistent operational surfaces:

- my profile
- profile update requests
- request tracker
- leave center
- payroll documents
- attendance and schedule
- claims center
- resource and document center
- acknowledgement center
- tasks list
- notifications center
- manager approval inbox

Each surface should answer one employee-facing question quickly:

- what do I need to know
- what can I do
- what is waiting on someone else
- what is blocked or overdue

## Non-Goals

This package should not become:

- a replacement for downstream HR systems of record
- a generic workflow engine
- a document storage platform
- a payroll engine
- a leave policy engine
- a catch-all employee dashboard with uncontrolled cross-domain writes

## Notes

This document is the target architecture for the package. At audit time, Slices 1 through 3 are implemented as a scoped package foundation, an employee self-profile read path, and governed profile update request workflows, but the broader ESS domain model is still largely ahead of the code.

## Codebase Mapping

The current package is now a Slice 1 and Slice 2 foundation rather than a pure placeholder shell.

### What exists today

| Area | Code location | Current behavior |
| --- | --- | --- |
| Feature identity | `src/metadata.ts`, `src/manifest.ts`, `src/shared/index.ts` | Provides ESS-specific package metadata, shared feature scope, and actor-context scaffolding |
| Public contracts | `src/contract.ts`, `src/schema.ts` | Exposes typed portal record, status, create/update, self-profile query, profile update request, permission, and route contracts |
| Public door | `src/index.ts`, `src/server.ts` | Re-exports scoped create, update, list, and get feature operations |
| Write actions | `src/actions.ts`, `src/policy.ts` | Creates and updates scoped portal records, accepts self-service profile update requests, and applies approved changes to employee records through policy-gated behavior |
| Queries | `src/queries.ts`, `src/queries/profile.query.ts`, `src/queries/profile-update-requests.query.ts`, `src/policy.ts` | Lists and gets records through actor-scoped read rules, projects self profile from employee records, and exposes request tracking views |
| Repository | `src/repository.ts` | Persists portal records and profile update request envelopes through file-backed load/save/mutate behavior with test hooks |
| Projection and page model | `src/projector/profile.ts`, `src/projector/profile-update-request.ts`, `src/detail-page-model.server.ts` | Builds the employee-safe self-profile read model, request tracking projections, and route-ready page model |
| Execution surface | `src/execution/index.ts`, `src/execution/action.ts` | Provides package execution wrapping over ESS-aligned server functions |
| API routes | `apps/api/app/api/hr/employee-selfservice-portal/*` | Exposes package list/create, detail, self-profile, and profile update request routes with request-scoped context |
| Tests | `test/ess-baseline.test.ts`, `test/profile-read.test.ts`, `test/profile-update-request.test.ts` | Covers persistence, self-read scope, denied writes, masked profile reads, elevated sensitive reads, request submission, approval application, rejection tracking, and cross-company isolation |

### What the code does not yet implement

- no integration adapters for employee, leave, payroll, attendance, claims, or documents yet
- no manager approval inbox
- no task or notification surfaces
- no audit persistence beyond basic package scaffolding
- no broader permission-aware sensitive portal projections beyond the self-profile and profile-update-request surfaces yet

### Mapping judgment

The package should be treated as an early foundation that still needs full domain shaping. The architecture doc therefore describes the governed target design while recording the current Slice 1 baseline.

## Slice 1 Implementation Evidence

Slice 1 is implemented as a durable baseline with scoped repository persistence and ESS-specific package contracts.

- `src/schema.ts` now defines the canonical portal record, summary, status, query, and create/update schemas.
- `src/contract.ts` now exposes ESS-specific route, permission, and type contracts instead of placeholder name/status records.
- `src/repository.ts` now owns file-backed load/save/mutate behavior plus repository test hooks.
- `src/policy.ts` now centralizes scoped read and write decisions using tenant, company, and actor context.
- `src/actions.ts` now validates scoped writes and persists ESS portal records through the repository.
- `src/queries.ts` now enforces tenant/company scope and self-versus-admin read visibility.
- `src/index.ts`, `src/server.ts`, `src/metadata.ts`, and `src/manifest.ts` now align the public package surface to the ESS foundation.
- `test/ess-baseline.test.ts` covers persistence, self-only reads, denied writes, updates, and cross-company isolation.

Validation completed on `2026-06-10`:

- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal typecheck`
- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal test`
- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal lint`

## Slice 2 Implementation Evidence

Slice 2 is implemented as an authenticated employee self-profile read path sourced from Employee Records Management.

- `src/queries/profile.query.ts` now resolves the actor-scoped target employee, delegates the employee-safe detail read to Employee Records Management, and joins portal status from the local repository.
- `src/projector/profile.ts` now normalizes the self-profile read model into an ESS-specific projection instead of leaking raw downstream detail objects.
- `src/detail-page-model.server.ts` now exposes a route-ready page-model helper for the self-profile surface.
- `src/schema.ts` now defines the self-profile query and projection contracts.
- `src/server.ts`, `src/index.ts`, and `src/execution/index.ts` now export the self-profile server and execution surface.
- `apps/api/app/api/hr/employee-selfservice-portal/_lib/context.ts` now builds request-scoped ESS read/write context from route headers.
- `apps/api/app/api/hr/employee-selfservice-portal/route.ts` and `apps/api/app/api/hr/employee-selfservice-portal/[portalRecordId]/route.ts` now expose list/create and detail read/update API routes for the package.
- `apps/api/app/api/hr/employee-selfservice-portal/profile/route.ts` now exposes the actor-scoped self-profile read route.
- `test/profile-read.test.ts` covers masked self reads, elevated sensitive reads, and cross-employee denial.
- Slice 2 hardening now fails closed at the API context layer and requires a matching ESS portal record plus tenant/company/org scope before joining employee-record data.

Validation completed on `2026-06-10`:

- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal typecheck`
- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal test`
- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal lint`
- `pnpm --filter api typecheck`

## Slice 3 Implementation Evidence

Slice 3 is implemented as a governed profile update request workflow instead of a direct self-service write path into employee master data.

- `src/schema.ts` now defines request-envelope contracts, review commands, request status, and list/detail query surfaces for profile updates.
- `src/policy.ts` now distinguishes self-submission, request visibility, and HR review permissions with tenant/company and sensitive-field checks.
- `src/repository.ts` now persists profile update request envelopes alongside portal records.
- `src/actions.ts` now accepts self-only submissions, tracks review metadata, rejects duplicate portal records per scope, and applies approved changes through Employee Records Management.
- `src/projector/profile-update-request.ts` now serializes request envelopes into route-safe request tracking views.
- `src/queries/profile-update-requests.query.ts` now exposes actor-scoped request list and detail reads.
- `src/server.ts`, `src/index.ts`, and `src/execution/index.ts` now export the request workflow surfaces.
- `apps/api/app/api/hr/employee-selfservice-portal/profile-update-requests/route.ts` and nested `[requestId]`, `approve`, and `reject` routes now expose submission and review endpoints.
- `test/profile-update-request.test.ts` covers self-only submission, approval-driven employee-record mutation, and rejection reason preservation.

Validation completed on `2026-06-10`:

- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal typecheck`
- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal test`
- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal lint`
- `pnpm --filter api typecheck`

## Upgrade Plan

The architecture should be implemented through the roadmap slices in `development-roadmap.md`.

### Phase 1: Replace scaffold contracts with ESS domain contracts

Objective: establish the package as a real ESS capability rather than a placeholder CRUD shell.

Deliverables:

- ESS-specific schema and contract layer
- actor-aware policy layer
- test harness and package test script
- route and execution contracts aligned to employee self-service use cases

### Phase 2: Build core employee-facing read and request flows

Objective: make the portal useful for common employee actions first.

Deliverables:

- my-profile read model
- profile update requests
- leave request and tracking surfaces
- payroll document list

### Phase 3: Expand operational self-service coverage

Objective: unify attendance, claims, resources, tasks, and manager workflows.

Deliverables:

- attendance and schedule views
- claims submission and tracking
- resources and acknowledgement surfaces
- tasks and notifications
- manager approval inbox

### Phase 4: Harden governance and integration contracts

Objective: make the portal enterprise-ready.

Deliverables:

- audit persistence and query surfaces
- mobile-safe and export-safe projections
- localization-ready message contracts
- stable downstream integration and route contracts

## Repair Priorities

These are the highest-value corrections for the current package:

1. Replace placeholder `name/status` contracts with ESS domain contracts.
2. Remove the global in-memory `Map` store and introduce actor-scoped query and request orchestration boundaries.
3. Add package tests before adding deeper integrations so the slice work remains verifiable.
