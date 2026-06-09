# Employee Records Management Development Roadmap

## Purpose

This document turns the Employee Records Management architecture into a 10-slice implementation roadmap. It follows the upgraded HR suite implementation advice and uses `compliance-regulatory-tracking` as the reference implementation pattern.

Employee Records Management is the HR suite source of truth for employee master profiles. It owns employee identity, profile facts, assignment history, status history, document references, completeness projections, and employee-record audit events. It must not own organization hierarchy stewardship, document binary storage, payroll calculations, compliance obligations, training content, attendance capture, or employee self-service workflow ownership.

Phase 2 of the architecture plan is implemented through slices 3, 4, and 5. The evidence for temporal assignment modeling, status history, lifecycle invariants, and completeness projections is recorded in the architecture doc.

## Current Code Evidence

Audit date: 2026-06-09.

| Area | Evidence | Current state |
| --- | --- | --- |
| Package scripts | `package.json` | Has `lint`, `format`, `test`, and `typecheck`. |
| Public contract | `src/index.ts`, `src/hr.workforce.records.contract.ts`, `src/hr.workforce.records-form.shared.ts`, `src/contracts/*.contract.ts` | Defines core record types, assignment projection/query contracts, permissions, search params, create/update/archive/assignment/rehire schemas, and exports the create-input and assignment schemas for API validation. |
| Write actions | `src/hr.workforce.records.actions.server.ts` | Provides create, update, archive, assignment, and rehire commands with `canWrite` checks and Zod parsing. |
| Repository | `src/repository.ts` | File-backed persistence with scoped load/save/mutate, assignment-history facts, test hooks, and organization filtering. |
| Store | `src/hr.workforce.records.store.ts` | Compatibility wrapper that delegates to the repository and accepts optional read/write scope context. |
| Mutation helper | `src/hr.workforce.records.mutation.shared.server.ts` | Defines audit metadata shape and wraps mutation failure handling, but does not orchestrate repository persistence or audit writes. |
| Queries | `src/hr.workforce.records.queries.ts`, `src/queries/assignments.query.ts` | Lists and gets records from the repository, and now respects read access, organization scope, and assignment-history filtering. |
| Page models | `src/hr.workforce.records.page-model.server.ts`, `src/hr.workforce.records.detail.page-model.server.ts`, `src/projector/read-models.ts` | Builds overview/detail models and assignment read models from scoped repository reads. |
| Access policy | `src/hr.workforce.records.access.policy.server.ts`, `src/hr.workforce.records-sensitive-access.shared.ts` | Has write gating and masking helpers, but read gating, capability checks, and export-safe redaction are not centralized. |
| Audit events | `src/hr.workforce.records.event.ts` | Defines employee, assignment, profile, and emergency-contact audit action names. |
| Execution surface | `src/execution/index.ts` | Exposes package commands and queries as a callable feature surface. |
| Database | `packages/database/schema.ts` | Contains tenants, companies, company grants, compliance tables, employee assignment history, and `audit_events`. |
| API routes | `apps/api/app/api/hr/records/*` | GET/POST routes and the employee assignments route now delegate to the feature server surface with request-scoped read/write context. |
| Tests | `test/public-api.test.ts`, `test/records-baseline.test.ts`, `test/profile-sensitive-read.test.ts`, `test/assignment-history.test.ts` | Package-level coverage exists for public exports, parsing, repository persistence, scope isolation, read denial, write denial, profile masking, assignment-history append behavior, current derivation, and cross-company isolation. |

## Reference Pattern From Compliance

The compliance package shows the target shape for mature HR domain packages:

- `src/schema.ts` defines enum values, Zod schemas, read/write context schemas, query schemas, and inferred domain types.
- `src/contracts/*.contract.ts` groups command, query, projection, permission, policy, route, metadata, manifest, audit, action, and bounded-context contracts.
- `src/repository.ts` owns scoped repository state, `load...Repository`, `save...Repository`, `mutate...Repository`, id creation, database mode, file-backed test mode, and reset hooks.
- `src/policy.ts` centralizes read/write/sensitive access checks and fails closed.
- `src/execution.ts` owns mutation context, denied mutation result, actor normalization, audit metadata creation, audit event construction, and sensitive audit redaction.
- `src/actions.ts` parses input/context, resolves scoped company, builds canonical schema objects, mutates the repository, and appends audit events in the same mutation.
- `src/queries/*.query.ts` uses `listXRecords` and `getXById` names, parses query contracts, loads scoped snapshots, filters, redacts, projects, and paginates.
- `src/projector/*` contains pure projection functions that schema-validate read models.
- `src/registry/*` declares capabilities, actions, audit events, bounded context, navigation, dashboards, classification, and coverage.
- `src/server.ts` is the server-only action/query barrel; `src/contract.ts` and `src/index.ts` are public barrels.
- API routes live under `apps/api/app/api/hr/<feature>` and delegate to package server functions.
- Tests use `tsx --conditions=react-server --test test/**/*.test.ts` with Node `node:test`.

Employee Records should move toward this shape. Existing `hr.workforce.records-*` files should remain as compatibility barrels or surface-specific files until callers are migrated.

## Current Gap List

- Durable persistence is missing; production behavior currently depends on an in-memory store.
- Employee records are not tenant/company scoped in storage or queries.
- Create/update schemas accept fields that the store drops, including employment context, identity details, emergency contact, and organization references.
- Assignment and status history are not modeled as effective-dated facts.
- Current assignment, current status, overview stats, and completeness should be projected read models, not manually maintained view state.
- Archive and rehire are broad status/new-record operations, not full lifecycle transitions with history continuity.
- Document references are architectural surfaces only; no persisted reference set exists.
- Audit events are named but not persisted into `audit_events` or a feature audit reference.
- Query filters, pagination, incomplete-record derivation, separated views, and export-safe reads are not repository-backed.
- Sensitive-field governance is applied in the detail page model but not uniformly across all reads, routes, exports, and audit payloads.
- API routes, route contracts, registry metadata, and package integration tests are missing.

## Target Package Shape

Implement the new durable core using the compliance-style names:

- `src/schema.ts`
- `src/contracts/index.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/query.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/contracts/permission.contract.ts`
- `src/contracts/policy.contract.ts`
- `src/contracts/route.contract.ts`
- `src/contracts/audit.contract.ts`
- `src/contracts/action.contract.ts`
- `src/contracts/bounded-context.contract.ts`
- `src/repository.ts`
- `src/policy.ts`
- `src/execution.ts`
- `src/actions.ts`
- `src/queries.ts`
- `src/queries/index.ts`
- `src/queries/*.query.ts`
- `src/projector.ts`
- `src/projector/index.ts`
- `src/projector/*.ts`
- `src/registry/*.ts`
- `src/server.ts`
- `src/contract.ts`
- `src/index.ts`

Keep these existing files only as needed for compatibility or UI/surface metadata:

- `src/hr.workforce.records-*.surface.ts`
- `src/hr.workforce.records-*.shared.ts`
- `src/hr.workforce.records.actions.server.ts`
- `src/hr.workforce.records.queries.ts`
- `src/hr.workforce.records.store.ts`
- `src/hr.workforce.records.mutation.shared.server.ts`
- `src/execution/index.ts`

## Slice Rules

Each slice should be implemented as a full vertical increment:

`database schema -> src/schema.ts -> contracts -> repository -> policy/execution -> actions -> queries -> projector -> API route -> tests -> architecture doc evidence`

Do not update the architecture status to `Implemented` until the slice has:

- code evidence in the package and, where applicable, `packages/database` and `apps/api`
- tests for success, denial, tenant/company isolation, sensitive redaction, and projection validity
- callable API route or exported server/execution surface
- validation commands run and recorded
- architecture doc evidence updated with exact file links

## Slice 1: Package Foundation And Durable Record Baseline

Objective: introduce the compliance-style package foundation and replace the production in-memory create/list/get path with a scoped repository.

Ownership boundary:

- Own employee master identity and baseline employment profile facts.
- Reference tenants and companies from `packages/database/schema.ts`.
- Do not duplicate compliance worker profile ownership; compliance should later consume employee snapshots.

Files to inspect/change:

- `packages/database/schema.ts`
- `package.json`
- `src/schema.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/query.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/contracts/permission.contract.ts`
- `src/contracts/route.contract.ts`
- `src/contracts/index.ts`
- `src/repository.ts`
- `src/policy.ts`
- `src/execution.ts`
- `src/actions.ts`
- `src/queries/index.ts`
- `src/queries/records.query.ts`
- `src/server.ts`
- `src/contract.ts`
- `src/index.ts`
- compatibility updates in `src/hr.workforce.records.*`
- `apps/api/app/api/hr/records/_lib/context.ts`
- `apps/api/app/api/hr/records/route.ts`
- `test/employee-records-management.test.ts`
- `employee-records-management-architecture.md`

Acceptance criteria:

- Database schema includes an employee records table with `tenantId`, `companyId`, stable id, employee number, legal name, preferred name, display name, employment status, timestamps, and indexes for tenant/company/status/search.
- Package has a `test` script using `tsx --conditions=react-server --test test/**/*.test.ts`.
- `src/repository.ts` supports scoped load/save/mutate, id creation, file-backed test mode, and database mode following the compliance pattern.
- Create action persists through `mutateEmployeeRecordsRepository` and returns a durable record id.
- List/get queries use clear names such as `listEmployeeRecords`, `listEmployeeRecordSummaries`, and `getEmployeeRecordById`; avoid doubled names such as `listEmployeeRecordsRecords`.
- Queries parse query contracts, enforce read access, and scope by tenant/company.
- API supports `GET /api/hr/records` and `POST /api/hr/records`.
- Existing public exports continue to work through compatibility barrels.
- Tests prove create/list/get, denied write, denied read, and cross-company isolation.

Status: implemented on 2026-06-09.

Evidence:

- `packages/features/hr-suite/employee-management/employee-records-management/src/repository.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/src/hr.workforce.records.store.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/src/hr.workforce.records.queries.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/src/index.ts`
- `apps/api/app/api/hr/records/_lib/context.ts`
- `apps/api/app/api/hr/records/route.ts`
- `apps/api/app/api/hr/records/[employeeId]/route.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/test/public-api.test.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/test/records-baseline.test.ts`
- Validation: `pnpm --filter @repo/features-employee-management-employee-records-management lint`, `pnpm --filter @repo/features-employee-management-employee-records-management test`, `pnpm --filter api typecheck`

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-employee-records-management typecheck
pnpm --filter @repo/features-employee-management-employee-records-management lint
pnpm --filter @repo/features-employee-management-employee-records-management test
pnpm --filter @repo/database typecheck
pnpm --filter @repo/database lint
pnpm --filter @repo/database db:generate
pnpm --filter api typecheck
```

## Slice 2: Full Profile Persistence And Sensitive Read Policy

Objective: persist the employee profile fields already accepted by create/update schemas and make all detail reads sensitive-policy aware.

Ownership boundary:

- Own personal, contact, emergency contact, and employment-context fields on the employee master record.
- Do not own document binaries, organization hierarchy, or payroll calculations.

Files to inspect/change:

- `packages/database/schema.ts`
- `src/schema.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/policy.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/policy.ts`
- `src/execution.ts`
- `src/repository.ts`
- `src/actions.ts`
- `src/queries/records.query.ts`
- `src/projector/record-detail.ts`
- `src/hr.workforce.records-sensitive-access.shared.ts`
- `src/hr.workforce.records.detail.page-model.server.ts`
- `apps/api/app/api/hr/records/[employeeId]/route.ts`
- `test/profile-sensitive-read.test.ts`
- `employee-records-management-architecture.md`

Acceptance criteria:

- Repository persists every profile field that remains in create/update contracts.
- Out-of-scope fields are removed from contracts instead of being silently dropped.
- `policy.ts` exposes read, write, and sensitive-read decisions.
- Detail projection masks or omits sensitive fields unless sensitive access is granted.
- Audit payload construction redacts sensitive fields before persistence.
- API supports `GET /api/hr/records/[employeeId]` and `PATCH /api/hr/records/[employeeId]`.
- Tests cover profile update, default masking, sensitive access grant, unauthorized update, and audit redaction.

Status: implemented on 2026-06-09.

Evidence:

- `packages/features/hr-suite/employee-management/employee-records-management/src/hr.workforce.records.contract.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/src/policy.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/src/repository.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/src/projector/record-detail.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/src/hr.workforce.records.detail.page-model.server.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/src/hr.workforce.records.actions.server.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/test/profile-sensitive-read.test.ts`
- `apps/api/app/api/hr/records/[employeeId]/route.ts`
- Validation: `pnpm --filter @repo/features-employee-management-employee-records-management lint`, `pnpm --filter @repo/features-employee-management-employee-records-management test`, `pnpm --filter api typecheck`

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-employee-records-management typecheck
pnpm --filter @repo/features-employee-management-employee-records-management lint
pnpm --filter @repo/features-employee-management-employee-records-management test
pnpm --filter @repo/database typecheck
pnpm --filter @repo/database lint
pnpm --filter api typecheck
```

## Slice 3: Effective-Dated Assignment Facts And Projections

Objective: store assignment changes as effective-dated facts and project current assignment/read-list surfaces from history.

Ownership boundary:

- Own employee assignment history attached to the employee record.
- Reference organization, department, position, location, and manager ids; do not author organization hierarchy.

Files to inspect/change:

- `packages/database/schema.ts`
- `src/schema.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/query.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/repository.ts`
- `src/actions.ts`
- `src/queries/assignments.query.ts`
- `src/projector/assignment.ts`
- `src/projector/read-models.ts`
- `src/hr.workforce.records-assignments-list.surface.ts`
- `apps/api/app/api/hr/records/[employeeId]/assignments/route.ts`
- `test/assignment-history.test.ts`
- `employee-records-management-architecture.md`

Status: implemented on 2026-06-09.

Evidence:

- `packages/features/hr-suite/employee-management/employee-records-management/src/schema.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/src/contracts/index.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/src/repository.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/src/queries/assignments.query.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/src/projector/assignment.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/src/projector/read-models.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/src/hr.workforce.records-assignments-list.surface.ts`
- `packages/features/hr-suite/employee-management/employee-records-management/test/assignment-history.test.ts`
- `apps/api/app/api/hr/records/[employeeId]/assignments/route.ts`
- `packages/database/drizzle/0005_nebulous_stranger.sql`
- Validation: `pnpm --filter @repo/features-employee-management-employee-records-management lint`, `pnpm --filter @repo/features-employee-management-employee-records-management test`, `pnpm --filter @repo/features-employee-management-employee-records-management typecheck`, `pnpm --filter @repo/database db:generate`, `pnpm --filter api typecheck`

Acceptance criteria:

- Database schema includes assignment history with effective dates, source/reason, actor, and tenant/company/employee indexes.
- Assignment action appends a history fact and does not erase prior assignment context.
- Current assignment is derived by projector logic and schema-validated.
- Assignment list query supports employee, manager, department, location, current/as-of, and pagination filters.
- Tests prove append behavior, current derivation, prior preservation, invalid employee handling, and cross-company isolation.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-employee-records-management typecheck
pnpm --filter @repo/features-employee-management-employee-records-management lint
pnpm --filter @repo/features-employee-management-employee-records-management test
pnpm --filter @repo/database db:generate
pnpm --filter api typecheck
```

## Slice 4: Employment Status History And Lifecycle Invariants

Objective: store status changes as lifecycle facts and reject invalid transitions.

Status: implemented on 2026-06-09.

Ownership boundary:

- Own employment status history for employee master records.
- Do not own offboarding clearance, payroll finalization, asset recovery, or recruiting workflow orchestration.

Files to inspect/change:

- `packages/database/schema.ts`
- `src/schema.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/query.contract.ts`
- `src/repository.ts`
- `src/actions.ts`
- `src/queries/status-history.query.ts`
- `src/projector/status.ts`
- `src/projector/read-models.ts`
- `src/hr.workforce.records-employment-status.schema.ts`
- `src/hr.workforce.records-status-history-list.surface.ts`
- `apps/api/app/api/hr/records/[employeeId]/status-history/route.ts`
- `test/status-history.test.ts`
- `employee-records-management-architecture.md`

Acceptance criteria:

- Database schema includes status history with status, effective timestamp, source command, actor, reason, and tenant/company/employee indexes.
- Create writes the initial status history row.
- Status update action appends history and updates only canonical current facts needed for lookup.
- Invalid transitions are rejected with clear errors.
- Status history read model is ordered and schema-validated.
- Tests cover initial status, valid transitions, invalid transitions, ordering, read denial, and cross-company isolation.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-employee-records-management typecheck
pnpm --filter @repo/features-employee-management-employee-records-management lint
pnpm --filter @repo/features-employee-management-employee-records-management test
pnpm --filter @repo/database db:generate
pnpm --filter api typecheck
```

Implementation evidence:

- `src/schema.ts` defines the status-history record, projection view, query, and page-model schemas.
- `src/contracts/*.contract.ts` exposes the status-history domain, command, query, and projection contracts.
- `src/repository.ts` seeds the initial status fact, validates transitions, appends lifecycle history, and synthesizes legacy status rows on read.
- `src/projector/status.ts` and `src/projector/read-models.ts` derive ordered history views and the current status snapshot.
- `src/queries/status-history.query.ts` filters by employee, status, source, search text, current/as-of state, and organization scope.
- `src/hr.workforce.records-status-history-list.surface.ts` and `apps/api/app/api/hr/records/[employeeId]/status-history/route.ts` expose the status-history surface.
- `packages/database/schema.ts` adds `employee_record_status_history` with tenant/company/employee, status, source, and effective-time indexes.
- `packages/database/drizzle/0006_sloppy_crystal.sql` records the generated migration.
- `test/status-history.test.ts` covers initial status, valid transitions, invalid transitions, ordering, read denial, and cross-company isolation.

Validation completed on 2026-06-09:

- `pnpm --filter @repo/features-employee-management-employee-records-management lint`
- `pnpm --filter @repo/features-employee-management-employee-records-management test`
- `pnpm --filter @repo/features-employee-management-employee-records-management typecheck`
- `pnpm --filter @repo/database db:generate`
- `pnpm --filter @repo/database lint`
- `pnpm --filter @repo/database typecheck`
- `pnpm --filter api typecheck`

## Slice 5: Archive Lifecycle

Objective: implement archive as a governed lifecycle action with status history, audit, and operational read behavior.

Status: implemented on 2026-06-09.

Ownership boundary:

- Own archived employee record state and history preservation.
- Do not delete employee data or implement privacy retention erasure in this slice.

Files to inspect/change:

- `src/schema.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/audit.contract.ts`
- `src/registry/action-registry.ts`
- `src/registry/audit.ts`
- `src/repository.ts`
- `src/execution.ts`
- `src/actions.ts`
- `src/queries/records.query.ts`
- `src/projector/record-summary.ts`
- `src/hr.workforce.records-separated-list.surface.ts`
- `src/hr.workforce.records.page-model.server.ts`
- `apps/api/app/api/hr/records/[employeeId]/archive/route.ts`
- `test/archive-lifecycle.test.ts`
- `employee-records-management-architecture.md`

Acceptance criteria:

- Archive requires write permission, actor, company scope, employee id, and reason.
- Archive appends status history and audit event in the same repository mutation.
- Archived records are preserved in detail and separated/archived reads.
- Default directory reads exclude archived records unless explicitly filtered.
- Repeated archive behavior is either rejected or idempotent and documented.
- Tests cover archive success, missing reason, repeated archive, separated inclusion, directory exclusion, audit event, and cross-company isolation.

Implementation evidence:

- `src/schema.ts` adds the summary and audit-entry schemas used by archive read and audit surfaces.
- `src/contracts/command.contract.ts` and `src/contracts/audit.contract.ts` define the archive command and audit action contracts.
- `src/registry/action-registry.ts` and `src/registry/audit.ts` register the archive capability and build the audit record in a typed form.
- `src/repository.ts` appends the archive status fact and audit trail entry in the same repository mutation and keeps repeated archive behavior idempotent.
- `src/projector/record-summary.ts` and `src/queries/records.query.ts` exclude archived records from the default directory while allowing separated reads to include them.
- `src/hr.workforce.records-separated-list.surface.ts` and `src/hr.workforce.records.page-model.server.ts` expose the archive-aware operational read behavior.
- `apps/api/app/api/hr/records/[employeeId]/archive/route.ts` exposes the archive command as a request-scoped API route.
- `test/archive-lifecycle.test.ts` covers success, missing reason, idempotent repeat archive, separated inclusion, directory exclusion, audit trail persistence, and cross-company isolation.

Validation completed on 2026-06-09:

- `pnpm --filter @repo/features-employee-management-employee-records-management typecheck`
- `pnpm --filter @repo/features-employee-management-employee-records-management lint`
- `pnpm --filter @repo/features-employee-management-employee-records-management test`
- `pnpm --filter api typecheck`

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-employee-records-management typecheck
pnpm --filter @repo/features-employee-management-employee-records-management lint
pnpm --filter @repo/features-employee-management-employee-records-management test
pnpm --filter api typecheck
```

## Slice 6: Rehire Lifecycle And Employment Continuity

Objective: rehire a prior worker without losing historical continuity or creating ambiguous employee master data.

Ownership boundary:

- Own rehire linkage and lifecycle history.
- Do not own recruiting or onboarding workflow orchestration.

Files to inspect/change:

- `packages/database/schema.ts`
- `src/schema.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/registry/action-registry.ts`
- `src/registry/audit.ts`
- `src/repository.ts`
- `src/actions.ts`
- `src/projector/record-detail.ts`
- `src/hr.workforce.records.detail.page-model.server.ts`
- `apps/api/app/api/hr/records/[employeeId]/rehire/route.ts`
- `test/rehire-lifecycle.test.ts`
- `employee-records-management-architecture.md`

Acceptance criteria:

- Rehire validates that the prior employee exists in the same tenant/company scope.
- Rehire model is chosen and documented before coding: reactivate canonical record or create a linked employment instance.
- Rehire appends status history, optional initial assignment history, and audit event in one mutation.
- Detail projection exposes continuity safely without leaking unrelated prior data.
- Tests cover archived/separated rehire, active-state rejection, prior linkage, status history, assignment continuity, audit event, and cross-company isolation.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-employee-records-management typecheck
pnpm --filter @repo/features-employee-management-employee-records-management lint
pnpm --filter @repo/features-employee-management-employee-records-management test
pnpm --filter @repo/database db:generate
pnpm --filter api typecheck
```

## Slice 7: Document References And Completeness Projections

Objective: persist employee document references and derive completeness views without becoming a document-management system.

Ownership boundary:

- Own document references, coverage facts, and completeness projections on employee records.
- Do not upload files, manage blob storage, issue signed URLs, or version document binaries.

Files to inspect/change:

- `packages/database/schema.ts`
- `src/schema.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/query.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/repository.ts`
- `src/actions.ts`
- `src/queries/document-references.query.ts`
- `src/queries/incomplete-records.query.ts`
- `src/projector/document-reference.ts`
- `src/projector/completeness.ts`
- `src/projector/overview.ts`
- `src/hr.workforce.records-document-references-list.surface.ts`
- `src/hr.workforce.records-coverage.shared.ts`
- `src/hr.workforce.records-incomplete-list.surface.ts`
- `src/hr.workforce.records-overview.shared.ts`
- `apps/api/app/api/hr/records/[employeeId]/document-references/route.ts`
- `test/document-references-completeness.test.ts`
- `employee-records-management-architecture.md`

Acceptance criteria:

- Database schema includes document references with source document id, document number, type, sensitivity, status, issue date, expiry date, and metadata.
- Document writes store references only; no binary upload, bucket, or signed URL logic is added.
- Completeness, incomplete list, and overview stats are projected from employee profile and document-reference facts.
- Sensitive document metadata is redacted unless sensitive access is granted.
- Tests cover add/update reference, missing required reference derivation, overview counts, masking, and cross-company isolation.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-employee-records-management typecheck
pnpm --filter @repo/features-employee-management-employee-records-management lint
pnpm --filter @repo/features-employee-management-employee-records-management test
pnpm --filter @repo/database db:generate
pnpm --filter api typecheck
```

## Slice 8: Audit Persistence And Mutation Orchestration

Objective: make audit persistence and mutation orchestration first-class, following the compliance `execution.ts` and `actions.ts` pattern.

Ownership boundary:

- Use shared `audit_events` where it can answer employee-record audit queries.
- Add feature-specific audit references only when needed for employee-record query shape.

Files to inspect/change:

- `packages/database/schema.ts`
- `src/schema.ts`
- `src/contracts/audit.contract.ts`
- `src/contracts/policy.contract.ts`
- `src/registry/audit.ts`
- `src/execution.ts`
- `src/actions.ts`
- `src/repository.ts`
- `src/queries/audit.query.ts`
- `src/projector/audit.ts`
- `src/hr.workforce.records-audit-trail-list.surface.ts`
- `apps/api/app/api/hr/records/audit-trail/route.ts`
- `test/audit-persistence.test.ts`
- `employee-records-management-architecture.md`

Acceptance criteria:

- Every create, update, assignment, status, archive, rehire, and document-reference mutation writes an audit event with actor, action, target, before/after or diff, reason, request id, tenant id, and company id.
- Audit creation redacts sensitive fields before persistence.
- Mutation helper handles permission gating, repository mutation, audit event creation, and consistent result mapping.
- Audit query supports employee id, action, actor, date range, search, and pagination.
- Audit reads omit before/after payloads unless sensitive access is granted.
- Tests cover audit write, audit filters, before/after capture, redaction, denied read, failed mutation behavior, and cross-company isolation.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-employee-records-management typecheck
pnpm --filter @repo/features-employee-management-employee-records-management lint
pnpm --filter @repo/features-employee-management-employee-records-management test
pnpm --filter @repo/database typecheck
pnpm --filter @repo/database lint
pnpm --filter api typecheck
```

## Slice 9: Operational Read Models And Export-Safe Reads

Objective: make directory, detail, incomplete, assignments, status history, document references, separated records, overview, and audit trail reads repository-backed and projection-oriented.

Ownership boundary:

- Own employee-record operational read models.
- Do not expose raw repository rows as public API responses.

Files to inspect/change:

- `src/contracts/query.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/queries/index.ts`
- `src/queries/records.query.ts`
- `src/queries/assignments.query.ts`
- `src/queries/status-history.query.ts`
- `src/queries/document-references.query.ts`
- `src/queries/incomplete-records.query.ts`
- `src/queries/audit.query.ts`
- `src/projector/index.ts`
- `src/projector/read-models.ts`
- `src/projector/overview.ts`
- `src/projector/record-summary.ts`
- `src/projector/record-detail.ts`
- `src/hr.workforce.records-list.shared.ts`
- `src/hr.workforce.records-list-load.shared.ts`
- `src/hr.workforce.records-directory-list.surface.ts`
- `src/hr.workforce.records.page-model.server.ts`
- `src/hr.workforce.records.detail.page-model.server.ts`
- `apps/api/app/api/hr/records/*`
- `test/operational-read-models.test.ts`
- `employee-records-management-architecture.md`

Acceptance criteria:

- All public reads go through query functions and projection schemas, not direct repository/store access.
- Directory supports search, status, manager, department, company, and pagination filters.
- Detail model includes current assignment, status summary, document coverage, and masked sensitive fields.
- Overview stats are projected from repository state.
- Export-safe read models omit sensitive fields by default.
- Tests cover filters, pagination, projection schema validation, masking, export-safe reads, denied reads, and cross-company isolation.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-employee-records-management typecheck
pnpm --filter @repo/features-employee-management-employee-records-management lint
pnpm --filter @repo/features-employee-management-employee-records-management test
pnpm --filter api typecheck
```

## Slice 10: Registry, Manifest, And Cross-Domain Integration Contracts

Objective: expose stable employee-record metadata, route contracts, action registry, capabilities, and downstream-safe integration snapshots.

Ownership boundary:

- Publish employee identity, employment references, current assignment snapshot, status snapshot, and document-reference coverage.
- Adjacent domains consume references or snapshots; they do not own employee master profile fields.

Files to inspect/change:

- `src/identity.ts`
- `src/feature-scope.ts`
- `src/metadata.ts`
- `src/manifest.ts`
- `src/contracts/metadata.contract.ts`
- `src/contracts/manifest.contract.ts`
- `src/contracts/bounded-context.contract.ts`
- `src/contracts/action.contract.ts`
- `src/contracts/route.contract.ts`
- `src/registry/action-registry.ts`
- `src/registry/audit.ts`
- `src/registry/bounded-context.ts`
- `src/registry/capability.ts`
- `src/registry/classification.ts`
- `src/registry/navigation.ts`
- `src/registry/requirement-coverage.ts`
- `src/execution/index.ts`
- `src/server.ts`
- `src/contract.ts`
- `src/index.ts`
- `packages/features/hr-suite/employee-management/compliance-regulatory-tracking/src/*` only if a consumer contract test is added
- `apps/api/app/api/hr/records/integration/*` only if HTTP integration endpoints are required
- `test/integration-contracts.test.ts`
- `employee-records-management-architecture.md`

Acceptance criteria:

- Manifest and metadata follow the compliance package contract/registry pattern.
- Route contracts list the employee-record API surfaces and versions.
- Action registry captures create, update, assign, status transition, archive, rehire, document-reference, export, and sensitive actions with capabilities, risk, approvals, and audit events.
- Stable downstream-safe employee reference contract is exported.
- Change notification event names and payload contracts are versioned and documented.
- Integration snapshot excludes sensitive personal fields unless explicitly authorized.
- Compliance worker snapshot consumption is possible without duplicating employee master ownership.
- Tests cover manifest validity, route contract shape, action decisions, event payload validation, and downstream-safe redaction.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-employee-records-management typecheck
pnpm --filter @repo/features-employee-management-employee-records-management lint
pnpm --filter @repo/features-employee-management-employee-records-management test
pnpm --filter @repo/features-employee-management-compliance-regulatory-tracking typecheck
pnpm --filter api typecheck
```

## Recommended Slice Order

1. Package foundation and durable record baseline.
2. Full profile persistence and sensitive read policy.
3. Effective-dated assignment facts and projections.
4. Employment status history and lifecycle invariants.
5. Archive lifecycle.
6. Rehire lifecycle and employment continuity.
7. Document references and completeness projections.
8. Audit persistence and mutation orchestration.
9. Operational read models and export-safe reads.
10. Registry, manifest, and cross-domain integration contracts.

## Documentation Update Rule

After each slice is implemented and validated, update `employee-records-management-architecture.md` with:

- implemented status for that slice only
- exact code evidence paths
- test file and command evidence
- route or execution-surface evidence
- generated migration evidence when database schema changes
- remaining gaps discovered during implementation

Do not update future slices as implemented based on planned work.
