# Offboarding & Exit Management Development Roadmap

## Purpose

This document turns the Offboarding & Exit Management architecture into a 10-slice implementation roadmap. It follows the upgraded HR suite implementation advice, uses `compliance-regulatory-tracking` as the package-shape reference, and starts from the actual audited codebase instead of the architecture text alone.

The package should become the governed post-exit orchestration capability for employee separation. It should own offboarding cases, task/checklist facts, clearance progress, handover and interview records, asset/access recovery references, settlement-readiness references, closure decisions, and audit history. It must not become the source of truth for employee master data, exit lifecycle initiation, payroll calculations, asset inventory, IAM account provisioning, organization hierarchy, or document binaries.

## Architecture Alignment Note

The current offboarding architecture doc is broader than the implemented neighboring package boundaries. The roadmap follows the in-repo ownership evidence:

- `employee-lifecycle-management` already owns resignation, termination, retirement, notice-period tracking, last-working-date tracking, and the offboarding trigger handoff.
- `employee-records-management` owns the employee master record and employment-status history.
- `documents-management` owns document metadata and file/storage references.
- `organizational-chart-hierarchy` owns org structure and vacancy/headcount reference data.

Because of that, Offboarding & Exit Management should begin when a lifecycle handoff exists. It may persist an immutable trigger snapshot for auditability, but it should not become a second write owner for exit initiation or status-transition facts.

## Reference Inputs

- Architecture: `offboarding-exit-architecture.md`
- HR suite advice: `../../implemenation-advice.md`
- Implementation reference: `../compliance-regulatory-tracking/src`
- Upstream lifecycle owner: `../employee-lifecycle-management/src`

## Current Code Evidence

Audit date: 2026-06-10.

| Area | Evidence | Current state |
| --- | --- | --- |
| Package scripts | `package.json` | Has `lint`, `format`, `clean`, `typecheck`, and package-level `test`. |
| Feature foundation | `src/schema.ts`, `src/identity.ts`, `src/feature-scope.ts`, `src/contracts/*`, `src/contract.ts`, `src/index.ts` | Slice 1 foundation is implemented with canonical schema, grouped contracts, feature identity, validated metadata/manifest, and compatibility barrels. |
| Repository and policy | `src/repository.ts`, `src/policy.ts` | Slice 2 adds a scoped repository with file-backed test mode, database mode when `DATABASE_URL` and tenant/company scope exist, deterministic case ids, and basic read/write scope checks. |
| Write actions | `src/actions.ts` | Case open and update now persist through the scoped repository, preserve lifecycle trigger snapshots, and prevent duplicate lifecycle-event cases per tenant/company scope. |
| Query surface | `src/queries.ts`, `src/queries/index.ts`, `src/queries/cases.query.ts`, `src/projector/case.ts`, `src/server.ts` | Lists and gets cases through repository-backed queries and the first case projector instead of the process-local `Map`. |
| Execution surface | `src/execution.ts`, `src/execution/index.ts`, `src/execution/action.ts` | Slice 2 keeps the compatibility execution barrels and promotes the top-level helper to async for repository-backed actions. |
| Metadata and manifest | `src/metadata.ts`, `src/manifest.ts`, `src/shared/index.ts` | Metadata and manifest are now validated against contract schemas and publish the bounded-context-aware foundation for the feature. |
| API routes | `apps/api/app/api/hr/offboarding/*` | Slice 2 adds `GET /api/hr/offboarding`, `POST /api/hr/offboarding`, and `GET /api/hr/offboarding/[caseId]` with scoped request-context helpers. |
| Database schema | `packages/database/schema.ts`, `packages/database/drizzle/0009_parallel_snowbird.sql` | Slice 2 adds the first `hr_offboarding_cases` table and generated migration for scoped case persistence. |
| Tests | `test/public-api.test.ts`, `test/offboarding-case-baseline.test.ts` | Slice 2 validates the public case contract plus create/list/get/update, denied read, denied write, and cross-company isolation. |
| Adjacent lifecycle ownership | `packages/features/hr-suite/employee-management/employee-lifecycle-management/src/actions.ts`, `packages/features/hr-suite/employee-management/employee-lifecycle-management/test/exit.test.ts` | Exit initiation, notice tracking, and offboarding trigger are already implemented upstream and must be consumed rather than duplicated. |

## Current Gap List

- No offboarding approvals, checklist tasks, handover items, exit interviews, asset/access recovery references, clearance items, settlement blockers, closure decisions, or audit records are persisted.
- No audit-event persistence or audit query surface exists yet; the runtime is still pre-audit even though the public contract language is aligned with the governed offboarding boundary.
- No sensitive-field runtime redaction exists yet, although the contract layer now defines the expected policy surfaces.
- Package tests currently validate the file-backed repository mode only; the database path is typechecked and migration-generated but not yet integration-tested against a live scoped database.

## Owned Facts And References

| Concern | Offboarding owns | Reference only |
| --- | --- | --- |
| Offboarding case | Yes | N/A |
| Lifecycle trigger origin | Immutable snapshot/reference only | Employee Lifecycle Management |
| Employee identity and employment record | No | Employee Records Management |
| Notice period and last working date | Snapshot/reference only | Employee Lifecycle Management |
| Approval and case progression for offboarding work | Yes | N/A |
| Checklist task generation and completion | Yes | N/A |
| Handover records and evidence references | Yes | Documents Management for document ids |
| Exit interview scheduling and feedback | Yes | N/A |
| Asset inventory master | No | Asset Management |
| Access account/system master | No | IAM / Access Control |
| Asset-recovery and access-revocation references/status | Yes | Asset Management / IAM |
| Leave, attendance, claims, advances, loan balances | No | Leave, Time & Attendance, Finance/Claims |
| Final settlement calculation | No | Payroll |
| Final settlement readiness and blockers | Yes | Payroll consumes readiness |
| Vacancy or replacement request ownership | No | Org / Recruitment |
| Vacancy-trigger reference from case closure | Yes | Downstream owner handles actual vacancy object |
| Rehire eligibility classification | Yes | Rehire execution stays with Employee Records or Lifecycle |
| Audit history for offboarding mutations | Yes | Shared audit package remains the persistence authority |

## Target Package Shape

Implement the mature package surface with explicit public entry points and internal folders only where they hold real modules:

- `src/identity.ts`
- `src/feature-scope.ts`
- `src/schema.ts`
- `src/contracts/index.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/query.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/contracts/permission.contract.ts`
- `src/contracts/policy.contract.ts`
- `src/contracts/route.contract.ts`
- `src/contracts/audit.contract.ts`
- `src/contracts/action.contract.ts`
- `src/contracts/bounded-context.contract.ts`
- `src/contracts/metadata.contract.ts`
- `src/contracts/manifest.contract.ts`
- `src/contracts/integration.contract.ts`
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

Keep the current `src/shared/index.ts` and `src/execution/index.ts` only if they remain deliberate compatibility barrels to the mature modules. Do not preserve empty scaffold folders as first-class boundaries.

## Slice Rules

Each slice must be implemented as a complete vertical increment:

`database schema -> src/schema.ts -> contracts -> repository -> policy/execution -> actions -> queries -> projector -> API route -> tests -> architecture evidence`

Do not mark a slice implemented until it has:

- code evidence in the package and, when applicable, `packages/database` and `apps/api`
- tests for success, denial, tenant/company isolation, sensitive redaction, and projection validity
- a callable package server surface or API route
- validation commands run and recorded
- architecture-doc evidence updated with exact file references

Store durable facts. Do not persist mutable dashboard rows, reminder rows, or derived status summaries unless there is a clear persistence reason.

## Slice 1: Package Foundation And Contract Alignment

Objective: replace the scaffold with the canonical XForge feature shape and make the boundary explicit at the contract level.

Status: implemented on 2026-06-10.

Files to inspect/change:

- `package.json`
- `src/schema.ts`
- `src/contracts/*.contract.ts`
- `src/contracts/index.ts`
- `src/identity.ts`
- `src/feature-scope.ts`
- `src/metadata.ts`
- `src/manifest.ts`
- `src/contract.ts`
- `src/index.ts`
- `src/server.ts`
- `src/shared/index.ts`
- `src/execution/index.ts`
- `test/public-api.test.ts`
- `offboarding-exit-architecture.md`

Acceptance criteria:

- Package adds `test` using `tsx --conditions=react-server --test test/**/*.test.ts`.
- Public entry points match the repo contract: `index.ts`, `contract.ts`, `schema.ts`, `metadata.ts`, `server.ts`, and `manifest.ts`.
- Contracts define the offboarding case, task, approval, checklist, interview, clearance, asset/access reference, audit, route, action, bounded-context, manifest, and metadata surfaces.
- Public contracts make lifecycle handoff explicit and do not expose resignation, termination, retirement, or employee-status mutation as offboarding-owned writes.
- Compatibility exports remain stable for existing imports.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-offboarding-exit-management typecheck
pnpm --filter @repo/features-employee-management-offboarding-exit-management lint
pnpm --filter @repo/features-employee-management-offboarding-exit-management test
```

Evidence:

- `package.json`
- `src/schema.ts`
- `src/identity.ts`
- `src/feature-scope.ts`
- `src/contracts/*`
- `src/contract.ts`
- `src/index.ts`
- `src/metadata.ts`
- `src/manifest.ts`
- `src/execution.ts`
- `src/execution/index.ts`
- `src/execution/action.ts`
- `src/shared/index.ts`
- `test/public-api.test.ts`
- Validation completed on 2026-06-10 with:
  - `corepack pnpm --filter @repo/features-employee-management-offboarding-exit-management typecheck`
  - `corepack pnpm --filter @repo/features-employee-management-offboarding-exit-management lint`
  - `corepack pnpm --filter @repo/features-employee-management-offboarding-exit-management test`

## Slice 2: Offboarding Case Baseline And Scoped Repository

Objective: implement the first durable offboarding case vertical slice and replace the in-memory `Map`.

Status: implemented on 2026-06-10.

Files to inspect/change:

- `packages/database/schema.ts`
- `src/schema.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/query.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/repository.ts`
- `src/policy.ts`
- `src/execution.ts`
- `src/actions.ts`
- `src/queries/index.ts`
- `src/queries/cases.query.ts`
- `src/projector/case.ts`
- `src/server.ts`
- `apps/api/app/api/hr/offboarding/_lib/context.ts`
- `apps/api/app/api/hr/offboarding/route.ts`
- `apps/api/app/api/hr/offboarding/[caseId]/route.ts`
- `test/offboarding-case-baseline.test.ts`
- `offboarding-exit-architecture.md`

Acceptance criteria:

- Database schema adds an offboarding-case table with `tenantId`, `companyId`, case id, employee id/reference, lifecycle trigger reference, exit type snapshot, case status, owner/coordinator reference, effective-separation snapshot, last-working-date snapshot, timestamps, and indexes.
- Repository supports scoped load/save/mutate, deterministic ids, file-backed test mode, database mode, and reset hooks.
- Opening a case requires an upstream lifecycle handoff reference and preserves the trigger snapshot immutably for auditability.
- List/get/open/update case flows enforce tenant/company scope and basic read/write permissions.
- API supports `GET /api/hr/offboarding`, `POST /api/hr/offboarding`, and `GET /api/hr/offboarding/[caseId]`.
- Tests prove create/list/get, denied read, denied write, and cross-company isolation.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-offboarding-exit-management typecheck
pnpm --filter @repo/features-employee-management-offboarding-exit-management lint
pnpm --filter @repo/features-employee-management-offboarding-exit-management test
pnpm --filter @repo/database typecheck
pnpm --filter @repo/database lint
pnpm --filter @repo/database db:generate
pnpm --filter api typecheck
```

Evidence:

- `src/schema.ts`
- `src/policy.ts`
- `src/repository.ts`
- `src/actions.ts`
- `src/queries.ts`
- `src/queries/index.ts`
- `src/queries/cases.query.ts`
- `src/projector.ts`
- `src/projector/index.ts`
- `src/projector/case.ts`
- `src/server.ts`
- `packages/database/schema.ts`
- `packages/database/drizzle/0009_parallel_snowbird.sql`
- `apps/api/app/api/hr/offboarding/_lib/context.ts`
- `apps/api/app/api/hr/offboarding/route.ts`
- `apps/api/app/api/hr/offboarding/[caseId]/route.ts`
- `test/public-api.test.ts`
- `test/offboarding-case-baseline.test.ts`
- Validation completed on 2026-06-10 with:
  - `corepack pnpm --filter @repo/features-employee-management-offboarding-exit-management typecheck`
  - `corepack pnpm --filter @repo/features-employee-management-offboarding-exit-management lint`
  - `corepack pnpm --filter @repo/features-employee-management-offboarding-exit-management test`
  - `corepack pnpm --filter @repo/database typecheck`
  - `corepack pnpm --filter @repo/database lint`
  - `corepack pnpm --filter @repo/database db:generate`
  - `corepack pnpm --filter api typecheck`

## Slice 3: Policy, Execution, And Audit Baseline

Objective: formalize fail-closed access decisions, canonical mutation helpers, and audit persistence for the case baseline.

Files to inspect/change:

- `src/contracts/policy.contract.ts`
- `src/contracts/permission.contract.ts`
- `src/contracts/audit.contract.ts`
- `src/policy.ts`
- `src/execution.ts`
- `src/repository.ts`
- `src/actions.ts`
- `src/queries/audit.query.ts`
- `src/projector/audit.ts`
- `src/registry/audit.ts`
- `src/registry/action-registry.ts`
- `apps/api/app/api/hr/offboarding/audit-trail/route.ts`
- `test/policy-audit.test.ts`
- `offboarding-exit-architecture.md`

Acceptance criteria:

- Reads fail closed without read access; writes fail closed without write access.
- Sensitive fields such as exit feedback, termination rationale snapshots, and private notes are masked or omitted unless sensitive-read access is granted.
- Every successful mutation writes an audit event with tenant/company/actor/action/target/reason/request metadata.
- Denied writes and failed mutations do not mutate repository state.
- Audit query supports case id, action, actor, date range, and pagination.
- Tests cover denied read, denied write, audit write, audit redaction, and cross-company isolation.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-offboarding-exit-management typecheck
pnpm --filter @repo/features-employee-management-offboarding-exit-management lint
pnpm --filter @repo/features-employee-management-offboarding-exit-management test
pnpm --filter api typecheck
```

## Slice 4: Case Intake Approval And Progression Workflow

Objective: govern how an offboarding case moves from intake through approval, rejection, hold, and active execution.

Files to inspect/change:

- `src/schema.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/query.contract.ts`
- `src/repository.ts`
- `src/policy.ts`
- `src/actions.ts`
- `src/queries/approvals.query.ts`
- `src/projector/approval.ts`
- `src/projector/case.ts`
- `src/registry/action-registry.ts`
- `apps/api/app/api/hr/offboarding/[caseId]/approvals/route.ts`
- `test/case-approval-workflow.test.ts`
- `offboarding-exit-architecture.md`

Acceptance criteria:

- Offboarding approval records can capture manager, HR, legal, or management decisions when policy requires them.
- Workflow rules can branch by exit type, legal entity, department, employee grade, or risk classification without claiming ownership of the original exit authorization.
- Case progression supports hold, reject, approve, reopen, and cancel decisions with actor and reason metadata.
- Query surface returns current approval state and decision history.
- Tests cover approval success, rejection, hold/reopen, unauthorized decision, and cross-company isolation.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-offboarding-exit-management typecheck
pnpm --filter @repo/features-employee-management-offboarding-exit-management lint
pnpm --filter @repo/features-employee-management-offboarding-exit-management test
pnpm --filter api typecheck
```

## Slice 5: Checklist Task Generation And Operational Ownership

Objective: generate and track the offboarding checklist as durable task facts instead of UI-only derived state.

Files to inspect/change:

- `packages/database/schema.ts`
- `src/schema.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/query.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/repository.ts`
- `src/actions.ts`
- `src/queries/tasks.query.ts`
- `src/projector/task.ts`
- `src/projector/checklist.ts`
- `src/registry/action-registry.ts`
- `apps/api/app/api/hr/offboarding/[caseId]/tasks/route.ts`
- `test/checklist-tasks.test.ts`
- `offboarding-exit-architecture.md`

Acceptance criteria:

- Offboarding case can generate checklist tasks automatically based on exit type, employee profile references, company, and policy.
- Tasks support owner role, explicit assignee, due date, status, blocked reason, evidence reference, and completion timestamp.
- HR, manager, employee, IT, finance, payroll, admin, and asset-owner task types are supported.
- Task completion, reopen, block, and waive flows are audited.
- Tests cover generation, assignment, completion, blocker handling, due-date ordering, and cross-company isolation.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-offboarding-exit-management typecheck
pnpm --filter @repo/features-employee-management-offboarding-exit-management lint
pnpm --filter @repo/features-employee-management-offboarding-exit-management test
pnpm --filter @repo/database db:generate
pnpm --filter api typecheck
```

## Slice 6: Handover, Exit Interview, And Document References

Objective: capture operational offboarding evidence around handover, exit interviews, and document completion without owning document binaries.

Files to inspect/change:

- `packages/database/schema.ts`
- `src/schema.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/query.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/repository.ts`
- `src/actions.ts`
- `src/queries/handover.query.ts`
- `src/queries/exit-interview.query.ts`
- `src/projector/handover.ts`
- `src/projector/exit-interview.ts`
- `apps/api/app/api/hr/offboarding/[caseId]/handover/route.ts`
- `apps/api/app/api/hr/offboarding/[caseId]/exit-interview/route.ts`
- `test/handover-exit-interview.test.ts`
- `offboarding-exit-architecture.md`

Acceptance criteria:

- Handover items can be created, assigned, tracked, and linked to evidence/document references.
- Exit interview can be scheduled, rescheduled, completed, and recorded with questionnaire/feedback structure.
- Document completion stores references such as document id, document type, and status only; no binary upload logic is introduced.
- Sensitive interview feedback is redacted by default.
- Tests cover handover tracking, interview scheduling, feedback redaction, document-reference linking, and cross-company isolation.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-offboarding-exit-management typecheck
pnpm --filter @repo/features-employee-management-offboarding-exit-management lint
pnpm --filter @repo/features-employee-management-offboarding-exit-management test
pnpm --filter @repo/database db:generate
pnpm --filter api typecheck
```

## Slice 7: Asset Recovery And Access Revocation References

Objective: track asset return and access revocation as offboarding-owned operational references while leaving master ownership with external domains.

Files to inspect/change:

- `packages/database/schema.ts`
- `src/schema.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/query.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/repository.ts`
- `src/actions.ts`
- `src/queries/assets.query.ts`
- `src/queries/access.query.ts`
- `src/projector/asset.ts`
- `src/projector/access.ts`
- `apps/api/app/api/hr/offboarding/[caseId]/assets/route.ts`
- `apps/api/app/api/hr/offboarding/[caseId]/access/route.ts`
- `test/asset-access-recovery.test.ts`
- `offboarding-exit-architecture.md`

Acceptance criteria:

- Offboarding case can track outstanding asset references, returned/damaged/missing/waived/deducted outcomes, and supporting notes/evidence.
- Offboarding case can track access-revocation tasks for systems, email, building access, applications, and devices.
- Asset and access records reference external source ids rather than recreating asset or identity masters.
- Query surfaces show outstanding versus cleared items at case and dashboard level.
- Tests cover reference creation, status transitions, unauthorized updates, and cross-company isolation.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-offboarding-exit-management typecheck
pnpm --filter @repo/features-employee-management-offboarding-exit-management lint
pnpm --filter @repo/features-employee-management-offboarding-exit-management test
pnpm --filter @repo/database db:generate
pnpm --filter api typecheck
```

## Slice 8: Clearance And Final Settlement Readiness

Objective: implement governed clearance checks and settlement-readiness references without taking over payroll or adjacent source-of-truth balances.

Files to inspect/change:

- `packages/database/schema.ts`
- `src/schema.ts`
- `src/contracts/domain.contract.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/query.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/repository.ts`
- `src/actions.ts`
- `src/queries/clearance.query.ts`
- `src/queries/settlement.query.ts`
- `src/projector/clearance.ts`
- `src/projector/settlement.ts`
- `apps/api/app/api/hr/offboarding/[caseId]/clearance/route.ts`
- `apps/api/app/api/hr/offboarding/[caseId]/settlement/route.ts`
- `test/clearance-settlement.test.ts`
- `offboarding-exit-architecture.md`

Acceptance criteria:

- Clearance items can represent outstanding leave, attendance, claims, advances, loans, deductions, company property, and other blockers as referenced facts.
- Payroll can read settlement readiness and return blockers back into the case checklist without the package calculating payroll.
- Case can declare ready-for-settlement only when required blockers are resolved or explicitly waived according to policy.
- Query surfaces separate factual blockers from derived readiness summaries.
- Tests cover blocker creation, blocker resolution, readiness gating, payroll-blocker return path, and cross-company isolation.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-offboarding-exit-management typecheck
pnpm --filter @repo/features-employee-management-offboarding-exit-management lint
pnpm --filter @repo/features-employee-management-offboarding-exit-management test
pnpm --filter @repo/database db:generate
pnpm --filter api typecheck
```

## Slice 9: Operational Read Models, Dashboards, Notifications, And API Surface

Objective: expose the feature through stable operational read models, thin API handlers, and notification-friendly projections.

Files to inspect/change:

- `src/contracts/query.contract.ts`
- `src/contracts/projection.contract.ts`
- `src/contracts/route.contract.ts`
- `src/queries/index.ts`
- `src/queries/*.query.ts`
- `src/projector/index.ts`
- `src/projector/*.ts`
- `src/projector/dashboard.ts`
- `src/projector/overview.ts`
- `src/server.ts`
- `apps/api/app/api/hr/offboarding/*`
- `test/offboarding-read-models.test.ts`
- `apps/api/test/hr-offboarding-routes.test.ts`
- `offboarding-exit-architecture.md`

Acceptance criteria:

- Public reads go through query functions and projector schemas rather than raw repository rows.
- Dashboard projections cover case status, exit type, department, manager, company/legal entity, last working date, overdue tasks, blocked cases, settlement readiness, and audit window summaries.
- Notification triggers are derived from successful mutations or overdue projections rather than stored as mutable dashboard rows.
- Route contracts document all supported offboarding endpoints and versions.
- Tests cover paging, filtering, dashboard aggregation, sensitive redaction, read denial, and route behavior.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-offboarding-exit-management typecheck
pnpm --filter @repo/features-employee-management-offboarding-exit-management lint
pnpm --filter @repo/features-employee-management-offboarding-exit-management test
pnpm --filter api typecheck
pnpm --filter api test
```

## Slice 10: Closure, Integration Contracts, Rehire Eligibility, And Documentation Evidence

Objective: finish the domain with governed case closure, downstream-safe integration contracts, registry metadata, and exact implementation evidence.

Files to inspect/change:

- `src/contracts/action.contract.ts`
- `src/contracts/bounded-context.contract.ts`
- `src/contracts/metadata.contract.ts`
- `src/contracts/manifest.contract.ts`
- `src/contracts/integration.contract.ts`
- `src/registry/action-registry.ts`
- `src/registry/audit.ts`
- `src/registry/bounded-context.ts`
- `src/registry/capability.ts`
- `src/registry/classification.ts`
- `src/registry/navigation.ts`
- `src/registry/requirement-coverage.ts`
- `src/registry/integration.ts`
- `src/projector/integration.ts`
- `src/server.ts`
- `src/contract.ts`
- `src/index.ts`
- `apps/api/app/api/hr/offboarding/[caseId]/close/route.ts`
- `test/closure-integration-contracts.test.ts`
- `offboarding-exit-architecture.md`
- `development-roadmap.md`

Acceptance criteria:

- Closing a case records closure reason, rehire eligibility classification, downstream vacancy/replacement trigger reference, and final completion metadata.
- Offboarding completion publishes or exposes a stable downstream-safe snapshot without mutating employee status directly inside this package.
- Registry covers capabilities, actions, audit events, classification, navigation, bounded context, requirement coverage, and integration-event contracts.
- Route contracts, metadata, and manifest are versioned and validated.
- Architecture doc is updated only with slices that have real code, route, test, and validation evidence.
- Tests cover case closure, rehire-eligibility capture, integration snapshot redaction, registry shape, and downstream-safe contract validation.

Validation commands:

```powershell
pnpm --filter @repo/features-employee-management-offboarding-exit-management typecheck
pnpm --filter @repo/features-employee-management-offboarding-exit-management lint
pnpm --filter @repo/features-employee-management-offboarding-exit-management test
pnpm --filter api typecheck
pnpm --filter api test
```

## Recommended Slice Order

1. Package foundation and contract alignment.
2. Offboarding case baseline and scoped repository.
3. Policy, execution, and audit baseline.
4. Case intake approval and progression workflow.
5. Checklist task generation and operational ownership.
6. Handover, exit interview, and document references.
7. Asset recovery and access revocation references.
8. Clearance and final settlement readiness.
9. Operational read models, dashboards, notifications, and API surface.
10. Closure, integration contracts, rehire eligibility, and documentation evidence.

## Validation Commands

```powershell
pnpm --filter @repo/features-employee-management-offboarding-exit-management typecheck
pnpm --filter @repo/features-employee-management-offboarding-exit-management lint
pnpm --filter @repo/features-employee-management-offboarding-exit-management test
pnpm --filter @repo/database typecheck
pnpm --filter @repo/database lint
pnpm --filter @repo/database db:generate
pnpm --filter api typecheck
pnpm --filter api test
```

## Documentation Update Rule

After each slice is implemented and validated, update `offboarding-exit-architecture.md` with:

- implemented status for that slice only
- exact code evidence paths
- test files and commands
- route or server-surface evidence
- generated migration evidence when database schema changes
- remaining gaps or boundary clarifications discovered during implementation

Do not mark future slices implemented based on planned work.
