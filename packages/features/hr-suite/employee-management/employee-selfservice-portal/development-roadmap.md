# Employee Self-Service Portal Development Roadmap

## Purpose

This document turns the Employee Self-Service Portal architecture into a 10-slice implementation roadmap for the package root. It follows the same governed HR-suite package direction used across the repo: durable state, explicit contracts, scoped queries, permission-aware reads, auditability, and route-ready execution surfaces.

Employee Self-Service Portal is not the system of record for employee master data, payroll, leave policy, attendance source data, or document storage. It is the governed self-service experience layer that exposes employee-safe views, submission flows, approval inbox behavior, request tracking, and acknowledgment/task completion surfaces across adjacent HR domains.

## Current Package Baseline

Audit date: `2026-06-10`.

The module now has a Slice 1 foundation in place, but remains early-stage overall:

| Area | Evidence | Current state |
| --- | --- | --- |
| Package scripts | `package.json` | Has `lint`, `format`, `typecheck`, and `test`. |
| Public exports | `src/index.ts`, `src/server.ts` | Exposes ESS-specific package barrels, route metadata, scoped create/list/get/update surfaces, and the employee self-profile read model. |
| Contracts | `src/contract.ts`, `src/schema.ts` | Defines ESS portal record, status, query, and create/update schemas instead of placeholder name/status types. |
| Actions | `src/actions.ts`, `src/policy.ts` | Enforces scoped write checks, persists governed portal records, and routes profile update approvals into Employee Records Management. |
| Queries | `src/queries.ts`, `src/queries/profile.query.ts`, `src/queries/profile-update-requests.query.ts`, `src/policy.ts` | Enforces scoped reads by tenant, company, and actor visibility, projects the employee self-profile from Employee Records Management, and exposes employee/HR request tracking views. |
| Repository | `src/repository.ts` | Provides file-backed repository load/save/mutate behavior for portal records and profile update request envelopes plus test hooks. |
| Projection and page models | `src/projector/profile.ts`, `src/detail-page-model.server.ts` | Projects the actor-scoped self profile and exposes a route-ready page-model helper. |
| Execution surface | `src/execution/index.ts`, `src/execution/action.ts` | Reuses scaffold execution wiring with ESS-aligned server functions. |
| Shared metadata | `src/metadata.ts`, `src/manifest.ts`, `src/shared/index.ts` | Package identity exists and now aligns to ESS-specific labels and route contracts. |
| API routes | `apps/api/app/api/hr/employee-selfservice-portal/*` | Exposes list/create, detail read/update, actor-scoped profile reads, and profile update request submission/review routes through request context helpers. |
| Tests | `test/ess-baseline.test.ts`, `test/profile-read.test.ts`, `test/profile-update-request.test.ts` | Covers persistence, self-only reads, denied writes, cross-company isolation, masked profile reads, elevated sensitive reads, cross-employee denial, request submission, approval application, and rejection tracking. |

## Delivery Strategy

Build the portal in 10 vertical slices. Each slice should move through the full delivery path:

`database/schema or integration contract -> domain schema -> contracts -> repository/query adapter -> policy -> actions -> queries -> projector -> route/execution surface -> tests -> architecture evidence`

The module should avoid becoming a clone of downstream domains. Its job is to:

- expose employee-safe read models
- accept governed self-service submissions
- track request and task state from the employee point of view
- provide manager approval surfaces where applicable
- enforce actor scope, sensitive masking, and auditability

## 10-Slice Delivery Plan

| Slice | Title | Goal |
| --- | --- | --- |
| 1 | Package Foundation And Portal Identity | Implemented on 2026-06-10. Replaced the placeholder scaffold with ESS-specific contracts, route surfaces, schemas, and testable package structure. |
| 2 | Authenticated My Profile Read Model | Implemented on 2026-06-10. Provides the employee-safe profile summary/detail view sourced from Employee Records Management. |
| 3 | Personal Information Update Requests | Implemented on 2026-06-10. Adds governed self-service profile update requests with employee submission, HR review, and canonical employee-record updates on approval. |
| 4 | Leave Balances, Leave Requests, And Request Tracking | Expose leave balances/history and allow request submission/cancel tracking through governed portal contracts. |
| 5 | Payroll Documents And Authorized Downloads | Add payslip/payroll statement listing and secure authorized download metadata surfaces. |
| 6 | Attendance, Schedule, And Work Calendar Views | Expose attendance and shift/calendar read models without taking ownership of attendance source data. |
| 7 | Claims Submission With Supporting Documents | Add expense/claim submission, receipt references, and reimbursement status tracking. |
| 8 | Documents, Resources, And Acknowledgements | Provide HR document/resource access plus policy/notice acknowledgement tracking. |
| 9 | Tasks, Notifications, And Manager Approval Inbox | Add onboarding/offboarding task views, notification center, and manager approval inbox workflows. |
| 10 | Audit, Mobile-Safe Read Models, And Integration Hardening | Consolidate audit, export-safe/mobile-safe projections, multilingual-ready labels, and downstream integration contracts. |

## Slice 1: Package Foundation And Portal Identity

Objective: replace the placeholder `name/status` scaffold with ESS-specific package contracts and a durable foundation.

Files to inspect/change:

- `package.json`
- `src/schema.ts`
- `src/contracts/index.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/query.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/contracts/permission.contract.ts`
- `src/contracts/route.contract.ts`
- `src/contracts/action.contract.ts`
- `src/policy.ts`
- `src/repository.ts` or `src/integration-adapter.ts`
- `src/actions.ts`
- `src/queries.ts`
- `src/server.ts`
- `src/contract.ts`
- `src/index.ts`
- `src/metadata.ts`
- `src/manifest.ts`
- `test/**/*.test.ts`
- `architecture-and-feature-requirement.md`

Acceptance criteria:

- Package has a `test` script and real package-level tests.
- Placeholder record contracts are replaced by ESS domain contracts.
- Feature identity, permissions, route paths, and execution surfaces are ESS-specific.
- Reads and writes are actor-scoped rather than global in-memory behavior.
- Public exports remain stable and package-local names are coherent.

Status: implemented on `2026-06-10`.

Evidence:

- `src/schema.ts`
- `src/contract.ts`
- `src/repository.ts`
- `src/policy.ts`
- `src/actions.ts`
- `src/queries.ts`
- `src/server.ts`
- `src/index.ts`
- `src/metadata.ts`
- `src/manifest.ts`
- `test/ess-baseline.test.ts`

Validation:

- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal typecheck`
- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal test`
- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal lint`

## Slice 2: Authenticated My Profile Read Model

Objective: provide secure employee-self profile viewing backed by Employee Records Management.

Scope:

- employee can view own profile summary and permitted detail
- manager or delegated viewer access is explicitly scoped
- sensitive fields are masked or omitted by policy

Files to inspect/change:

- `src/schema.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/query.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/policy.ts`
- `src/queries/profile.query.ts`
- `src/projector/profile.ts`
- `src/detail-page-model.server.ts`
- `src/page-model.server.ts`
- `src/server.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/profile/route.ts`
- `test/profile-read.test.ts`

Acceptance criteria:

- employee can only read their own profile unless elevated access exists
- profile is projected from employee-record data, not duplicated as source-of-truth state
- masked detail is enforced consistently
- read denial and cross-employee access denial are tested

Status: implemented on `2026-06-10`.

Evidence:

- `src/schema.ts`
- `src/projector/profile.ts`
- `src/queries/profile.query.ts`
- `src/detail-page-model.server.ts`
- `src/server.ts`
- `src/index.ts`
- `test/profile-read.test.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/_lib/context.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/route.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/[portalRecordId]/route.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/profile/route.ts`
- `apps/api/package.json`

Review and hardening completed on `2026-06-10`:

- API request context now fails closed for `canRead`, `canWrite`, and `canViewSensitive`.
- Self-profile reads now require tenant, company, organization, actor scope, and a matching ESS portal record before joining Employee Records data.
- Duplicate ESS portal records are now rejected within the same tenant/company/employee scope.
- Profile projection schemas now tolerate masked empty-string values without rejecting valid reads.

Validation:

- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal typecheck`
- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal test`
- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal lint`
- `pnpm --filter api typecheck`

## Slice 3: Personal Information Update Requests

Objective: allow employees to submit governed requests for permitted personal-information changes.

Scope:

- address, phone, personal email, marital status, dependents, emergency contacts
- sensitive changes routed to HR approval before master-record update
- request status visible to employee

Files to inspect/change:

- `src/schema.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/policy.ts`
- `src/repository.ts`
- `src/actions.ts`
- `src/queries/profile-update-requests.query.ts`
- `src/projector/profile-update-request.ts`
- `src/registry/action-registry.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/profile-update-requests/route.ts`
- `test/profile-update-request.test.ts`

Acceptance criteria:

- employee can submit permitted updates only for self
- sensitive updates remain pending until approved
- approval/rejection state and rejection reason are tracked
- master employee record is not mutated directly by unauthorized self-service writes

Status: implemented on `2026-06-10`.

Evidence:

- `src/schema.ts`
- `src/policy.ts`
- `src/repository.ts`
- `src/actions.ts`
- `src/projector/profile-update-request.ts`
- `src/queries/profile-update-requests.query.ts`
- `src/queries.ts`
- `src/server.ts`
- `src/execution/index.ts`
- `src/index.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/profile-update-requests/route.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/profile-update-requests/[requestId]/route.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/profile-update-requests/[requestId]/approve/route.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/profile-update-requests/[requestId]/reject/route.ts`
- `test/profile-update-request.test.ts`

Validation:

- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal typecheck`
- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal lint`
- `pnpm --filter @repo/features-employee-management-employee-selfservice-portal test`
- `pnpm --filter api typecheck`

## Slice 4: Leave Balances, Leave Requests, And Request Tracking

Objective: expose leave visibility and request submission from the employee-safe portal surface.

Scope:

- leave balance view
- leave history/status view
- leave request submission and cancellation/amendment request
- request tracking from employee and manager perspectives

Files to inspect/change:

- `src/contracts/query.contract.ts`
- `src/contracts/command.contract.ts`
- `src/queries/leave-balance.query.ts`
- `src/queries/leave-requests.query.ts`
- `src/actions.ts`
- `src/projector/leave.ts`
- `src/page-model.server.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/leave/*`
- `test/leave-selfservice.test.ts`

Acceptance criteria:

- portal consumes leave domain data without owning leave policy configuration
- employee can submit/cancel requests according to routed command contracts
- employee sees current status/history
- manager approval visibility is limited to authorized requests

## Slice 5: Payroll Documents And Authorized Downloads

Objective: expose secure payroll-document listing and download authorization metadata.

Scope:

- payslip/payroll statement list
- authorized download references only
- sensitive payroll visibility gating

Files to inspect/change:

- `src/schema.ts`
- `src/contracts/query.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/policy.ts`
- `src/queries/payroll-documents.query.ts`
- `src/projector/payroll-document.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/payroll-documents/route.ts`
- `test/payroll-documents.test.ts`

Acceptance criteria:

- employee can view only authorized payroll documents for self
- portal exposes metadata/download authorization, not payroll calculation logic
- sensitive payroll fields are redacted as required
- unauthorized document access is denied and tested

## Slice 6: Attendance, Schedule, And Work Calendar Views

Objective: provide attendance and schedule visibility without taking ownership of source attendance systems.

Scope:

- attendance summary/history
- shift schedule
- work calendar view

Files to inspect/change:

- `src/contracts/query.contract.ts`
- `src/queries/attendance.query.ts`
- `src/queries/schedule.query.ts`
- `src/projector/attendance.ts`
- `src/projector/schedule.ts`
- `src/page-model.server.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/attendance/route.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/schedule/route.ts`
- `test/attendance-schedule.test.ts`

Acceptance criteria:

- employee can only view own attendance/schedule unless elevated rights exist
- portal read models are projection-oriented and mobile-friendly
- attendance ownership remains in Time & Attendance
- pagination/date filtering is supported where needed

## Slice 7: Claims Submission With Supporting Documents

Objective: add self-service claims submission and reimbursement status tracking.

Scope:

- claim draft/submit flows
- supporting receipt/document references
- reimbursement status tracking

Files to inspect/change:

- `src/schema.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/domain.contract.ts`
- `src/queries/claims.query.ts`
- `src/actions.ts`
- `src/projector/claim.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/claims/route.ts`
- `test/claims-selfservice.test.ts`

Acceptance criteria:

- employee can submit claims only for self
- supporting documents are referenced safely, not stored as raw binary in-package
- claim status is visible and auditable
- approval/return/rejection states are represented clearly

## Slice 8: Documents, Resources, And Acknowledgements

Objective: expose HR resources and acknowledgement workflows through the portal.

Scope:

- policy/resource center
- employee document listing
- acknowledgement/consent actions

Files to inspect/change:

- `src/contracts/query.contract.ts`
- `src/contracts/command.contract.ts`
- `src/queries/resource-center.query.ts`
- `src/queries/documents.query.ts`
- `src/actions.ts`
- `src/projector/resource.ts`
- `src/projector/document.ts`
- `src/projector/acknowledgement.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/resources/route.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/acknowledgements/route.ts`
- `test/resources-acknowledgements.test.ts`

Acceptance criteria:

- employee can access only authorized documents and resources
- acknowledgements are actor-bound, timestamped, and queryable
- policy/notice reads and acknowledgements are audited
- document storage remains owned by Document Management

## Slice 9: Tasks, Notifications, And Manager Approval Inbox

Objective: provide a unified work surface for employee tasks, portal notifications, and manager approvals.

Scope:

- onboarding/offboarding/compliance task list
- employee notification center
- manager approval inbox for relevant ESS requests

Files to inspect/change:

- `src/schema.ts`
- `src/contracts/query.contract.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/queries/tasks.query.ts`
- `src/queries/notifications.query.ts`
- `src/queries/approval-inbox.query.ts`
- `src/actions.ts`
- `src/projector/task.ts`
- `src/projector/notification.ts`
- `src/projector/approval.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/tasks/route.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/notifications/route.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/approvals/route.ts`
- `test/tasks-notifications-approvals.test.ts`

Acceptance criteria:

- employee sees assigned tasks only within authorized scope
- manager inbox shows only actionable approvals
- overdue/pending/rejected states are visible
- notification read models support mobile usage and status updates

## Slice 10: Audit, Mobile-Safe Read Models, And Integration Hardening

Objective: harden the portal for enterprise operation across audit, responsiveness, localization readiness, and cross-domain contracts.

Scope:

- audit trail for submissions, approvals, rejections, acknowledgements, and document access
- export-safe/mobile-safe read models
- multilingual-ready label/message contract support
- stable downstream integration and route contracts

Files to inspect/change:

- `src/contracts/audit.contract.ts`
- `src/contracts/metadata.contract.ts`
- `src/contracts/manifest.contract.ts`
- `src/contracts/route.contract.ts`
- `src/contracts/integration.contract.ts`
- `src/registry/action-registry.ts`
- `src/registry/audit.ts`
- `src/registry/navigation.ts`
- `src/projector/*.ts`
- `src/server.ts`
- `src/index.ts`
- `src/contract.ts`
- `apps/api/app/api/hr/employee-selfservice-portal/*`
- `test/audit-and-integration.test.ts`
- `architecture-and-feature-requirement.md`

Acceptance criteria:

- every governed submission/decision produces an audit event
- portal read models are safe for desktop, tablet, and mobile consumption
- route and manifest contracts are versioned and exported
- multilingual-ready labels/messages can be attached without rewriting domain contracts
- remaining architecture gaps are documented with exact evidence

## Recommended Execution Order

1. Package foundation and portal identity.
2. Authenticated my-profile read model.
3. Personal information update requests.
4. Leave balances, leave requests, and request tracking.
5. Payroll documents and authorized downloads.
6. Attendance, schedule, and work calendar views.
7. Claims submission with supporting documents.
8. Documents, resources, and acknowledgements.
9. Tasks, notifications, and manager approval inbox.
10. Audit, mobile-safe read models, and integration hardening.

## Validation Rule For Every Slice

Each slice should not be marked implemented until:

- code evidence exists in `src` and, where needed, `apps/api` or shared package integrations
- tests cover success, denial, actor scoping, masking, and projection validity
- the route or execution surface is callable
- package validation commands have been run and recorded
- `architecture-and-feature-requirement.md` is updated with exact implementation evidence

Recommended validation commands:

```powershell
pnpm --filter @repo/features-employee-management-employee-selfservice-portal typecheck
pnpm --filter @repo/features-employee-management-employee-selfservice-portal lint
pnpm --filter @repo/features-employee-management-employee-selfservice-portal test
pnpm --filter api typecheck
```
