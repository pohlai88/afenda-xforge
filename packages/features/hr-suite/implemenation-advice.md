# HR Suite Implementation Advice

Use this when starting or upgrading an HR suite sub-feature. The current best in-repo reference is the compliance-regulatory-tracking package.

Primary reference:

```text
C:\JackProject\afenda-bolt\afenda-Xforge\packages\features\hr-suite\employee-management\compliance-regulatory-tracking
```

Architecture reference:

```text
C:\JackProject\afenda-bolt\afenda-Xforge\packages\features\hr-suite\employee-management\compliance-regulatory-tracking\architecture-and-feature-requirement.md
```

## Starter Prompt

```text
You are implementing the next HR suite sub-feature in afenda-Xforge.

First, audit the actual codebase before writing code. Do not assume the architecture doc is complete or current.

Use the compliance-regulatory-tracking package as the implementation pattern unless the target package already has a stronger local convention.

Rules:
1. Identify the source-of-truth owner before adding data.
2. Do not duplicate employee master data, document binary storage, organization hierarchy stewardship, payroll calculation, training content, policy authoring, or workflow ownership from adjacent domains.
3. Implement one vertical slice at a time: database schema, package schema, contracts, repository, policy/execution helpers, actions, queries, projector/read models, API route, tests, docs.
4. Store facts and project operational read models. Do not store mutable derived rows for statuses, alerts, calendars, dashboards, coverage, or risk summaries unless there is a clear persistence reason.
5. Do not mark a requirement as implemented unless code, tests, route or callable API, and documentation evidence exist.
6. Preserve tenant/company scoping, permissions, audit, and sensitive-field redaction.
7. Prefer existing package patterns over new abstractions.

Before implementation, produce:
- Current code evidence.
- Gap list.
- Exact files to change.
- Acceptance criteria.
- Validation commands.

Then implement only the agreed slice and update the architecture doc with evidence.
```

## Reference Package Pattern

The compliance package is the clearest current implementation model.

| Concern | Pattern |
| --- | --- |
| Feature identity | `src/identity.ts`, `src/feature-scope.ts`, `src/metadata.ts`, `src/manifest.ts` |
| Domain schema | `src/schema.ts` defines enum value arrays, Zod schemas, context schemas, query schemas, and inferred domain types. |
| Public contracts | `src/contracts/*.contract.ts` groups command, query, projection, permission, policy, route, metadata, manifest, bounded-context, action, audit, and navigation contracts. |
| Contract barrels | `src/contracts/index.ts`, `src/contract.ts`, and `src/index.ts` re-export public types and schemas. |
| Repository | `src/repository.ts` owns the state shape, scoped load/save/mutate functions, repository ids, file-backed test mode, database mode, and test reset hooks. |
| Policy | `src/policy.ts` centralizes read/write/sensitive capability checks and fail-closed decisions. |
| Execution helpers | `src/execution.ts` owns mutation context, denied mutation shape, actor normalization, audit metadata, audit event creation, and sensitive audit redaction. |
| Commands | `src/actions.ts` parses input/context, resolves company scope, builds canonical schema objects, mutates the repository, and appends audit events in the same mutation. |
| Queries | `src/queries.ts` re-exports from `src/queries/index.ts`; query modules use `listXRecords` and `getXById` names, parse query contracts, load scoped snapshots, filter, redact, project, and paginate. |
| Read models | `src/projector.ts` re-exports from `src/projector/index.ts`; projector modules are pure and schema-validate projections. |
| Registry | `src/registry/*` declares capabilities, actions, audit events, bounded context, navigation, dashboard metrics, classification, and requirement coverage. |
| Server API | `src/server.ts` is the server-only barrel for callable actions and queries. |
| HTTP API | `apps/api/app/api/hr/<feature>/_lib/context.ts` creates read/write context from headers; each route delegates to package server functions and returns `NextResponse.json`. |
| Tests | Package tests use `tsx --conditions=react-server --test test/**/*.test.ts` and Node `node:test` assertions. |

## Naming Rules

- Use package-level generic file names for new mature packages: `schema.ts`, `repository.ts`, `policy.ts`, `execution.ts`, `actions.ts`, `queries.ts`, `projector.ts`, `server.ts`, `contract.ts`, `index.ts`.
- Use grouped folders when a surface grows: `contracts/`, `queries/`, `projector/`, `registry/`.
- Use command names that describe intent: `upsertX`, `recordX`, `verifyX`, `openX`, `approveX`, `resolveX`, `submitX`, `acknowledgeX`, `closeX`, `exportX`.
- Use read names consistently: `listXRecords`, `getXById`, `getXSnapshot`. If the entity name already ends in `Records`, avoid doubled names such as `listEmployeeRecordsRecords`; prefer a clear domain name such as `listEmployeeRecords`, `listEmployeeRecordSummaries`, or `getEmployeeRecordById`.
- Use Zod schemas named after the exported contract: `upsertXInputSchema`, `listXQuerySchema`, `xProjectionSchema`.
- Use domain event and audit names as stable dotted strings in registry/event modules.
- Keep legacy feature-specific filenames only as compatibility barrels when a package already exposes them.

## Best Sequence

1. `Audit first`
Read the architecture doc, `package.json`, `src/schema.ts` or current schema files, `src/contracts/*`, `src/repository.ts`, `src/actions.ts`, `src/queries/*`, `src/projector/*`, `src/policy.ts`, `src/execution.ts`, registry files, API routes, and tests before coding.

2. `Define ownership`
Ask whether the sub-feature owns the data or only references/syncs it. For compliance, owned facts are obligations, worker snapshots, evidence references, exceptions, corrective actions, filings, alert states, reports, and audit events. For employee records, owned facts are employee master profiles, assignment history, status history, document references, and employee-record audit events.

3. `Design the vertical slice`
Implement in this order:
`database schema -> src/schema.ts -> contracts -> repository -> policy/execution -> actions -> queries -> projector -> API route -> tests -> doc evidence`.

4. `Store facts, derive read models`
Avoid creating mutable stored rows for things that should be projected, such as requirement status, alerts, calendars, dashboards, risk summaries, profile completeness, and current assignment summaries.

5. `Guard reads and mutations`
Every write should have `tenantId` or `companyId` scoping, permission check, validation schema, audit event, and test coverage. Every read should fail closed when read access is missing and should redact sensitive fields unless sensitive access is granted.

6. `Keep references as references`
Document-related features should use `sourceDocumentId`, document number, metadata, sensitivity, status, issue date, and expiry date. Do not add file upload, blob, bucket, signed URL, or binary versioning logic outside the document-storage owner.

7. `Update docs last`
Only update architecture status after code and tests exist. This prevents documentation drift.

## Anti-Drift Rules

- Never let docs become the source of truth without checking code.
- Never add a new status enum without checking projectors, queries, filters, tests, reports, and route contracts.
- Never add a route without updating route contracts and route tests or API-level evidence.
- Never add database tables without repository mapping and generated migration.
- Never add a business workflow without audit events.
- Never add sensitive fields without masking behavior and tests.
- Never expose raw repository rows as public API read models.
- Never mark `Implemented` unless evidence links point to real code.

## Validation Commands

Use targeted checks first. Replace the package filter with the target package when working outside compliance.

```powershell
pnpm --filter @repo/features-employee-management-compliance-regulatory-tracking typecheck
pnpm --filter @repo/features-employee-management-compliance-regulatory-tracking lint
pnpm --filter @repo/features-employee-management-compliance-regulatory-tracking test
pnpm --filter @repo/database typecheck
pnpm --filter @repo/database lint
pnpm --filter api typecheck
```

If database schema changes:

```powershell
pnpm --filter @repo/database db:generate
```

The main efficiency gain is this: do not build broad systems in one pass. Build one complete, tested vertical slice, then update the architecture doc with exact evidence.
