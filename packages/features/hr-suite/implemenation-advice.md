Use this prompt when starting the next sub-feature:

```text
You are implementing the next HR compliance sub-feature in afenda-Xforge.

First, audit the actual codebase before writing code. Do not assume the architecture doc is complete or current.

Primary reference:
C:\JackProject\afenda-bolt\afenda-Xforge\packages\features\hr-suite\employee-management\compliance-regulatory-tracking\compliance-regulatory-tracking-architecture.md

Rules:
1. Identify the source-of-truth owner before adding data.
2. Do not duplicate employee master data, document storage, payroll calculation, training content, or policy authoring.
3. Use compliance obligations, worker snapshots, evidence references, exceptions, corrective actions, filings, alert states, reports, and audit events as the compliance surfaces.
4. Implement one vertical slice at a time: schema, contract, repository, action/query, API route, tests, docs.
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

**Best Sequence**
1. `Audit first`
Read the architecture doc, `src/schema.ts`, `src/actions.ts`, `src/repository.ts`, `src/queries/*`, `src/projector/*`, API routes, permissions, and tests before coding.

2. `Define ownership`
Ask: does this sub-feature own the data, or only reference/sync it?  
For this compliance package, most future sub-features should publish compliance facts into obligations, worker snapshots, evidence, filings, exceptions, or corrective actions.

3. `Design the vertical slice`
For every sub-feature, implement in this order:
`schema -> contracts -> repository mapping -> actions/queries -> API route -> tests -> doc evidence`.

4. `Use derived read models`
Avoid creating mutable stored rows for things that should be projected, such as requirement status, alerts, calendars, dashboards, and risk summaries.

5. `Guard mutations`
Every write should have:
`companyId` scoping, permission check, audit event, validation schema, and test coverage.

6. `Keep evidence as references`
Use `sourceDocumentId`, document number, metadata, sensitivity, status, issue date, expiry date. Do not add file upload, blob, bucket, or signed URL logic here.

7. `Update docs last`
Only update the architecture status after the code and tests exist. This avoids documentation drift.

**Anti-Drift Rules**
- Never let docs become the source of truth without checking code.
- Never add a new status enum without checking projectors, queries, filters, tests, and reports.
- Never add a route without updating route contracts/tests.
- Never add database tables without repository mapping and generated migration.
- Never add a business workflow without audit events.
- Never add sensitive fields without masking behavior.
- Never mark `Implemented` unless evidence links point to real code.

**Validation Commands**
Use targeted checks first:

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

The main efficiency gain is this: do not build broad systems in one pass. Build one compliance sub-feature as a complete, tested vertical slice, then update the architecture doc with exact evidence.