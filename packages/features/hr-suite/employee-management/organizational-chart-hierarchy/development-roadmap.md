# Organizational Chart Hierarchy Development Roadmap

## Purpose

This roadmap turns Organizational Chart & Hierarchy from the current lightweight package into a mature HR suite feature using the compliance-regulatory-tracking package as the implementation reference.

The target package owns governed organizational structure facts and derived operational views. It does not own employee master data, payroll calculation, document binary storage, workflow execution, or training content.

## Reference Inputs

- Architecture: `organizational-chart-hierarchy-architecture.md`
- HR suite advice: `../../implemenation-advice.md`
- Implementation reference: `../compliance-regulatory-tracking/src`

## Current Evidence

- The package now exposes the compliance-style `schema`, grouped `contracts`, `repository`, `policy`, `execution`, `queries`, `projector`, and `registry` surfaces through the package barrels.
- The store is separated by units, positions, reporting relationships, and audit events: `src/store.ts`
- The write layer uses scoped mutation helpers and normalized audit metadata: `src/actions.server.ts`, `src/execution.ts`
- The query layer now returns dedicated windows for units, positions, reporting lines, vacancies, headcount, and audit trail: `src/queries/read-models.ts`
- Package-level tests exercise schemas, policy, execution helpers, repository shape, registry compatibility, and live page-model loading: `test/organizational-chart-hierarchy.test.ts`

## Slice Plan

### Slice 1: Mature Package Frame

Establish the package shape used by mature HR suite features while preserving legacy imports.

Status: complete

Deliverables:

- `src/schema.ts`
- `src/contracts/*`
- `src/repository.ts`
- `src/policy.ts`
- `src/execution.ts`
- `src/queries/index.ts`
- `src/projector/index.ts`
- `src/registry/*`
- package-level `test` script and schema export
- initial tests for schemas, policy, execution helpers, and compatibility exports

Acceptance criteria:

- Existing legacy exports continue to work.
- Canonical schemas parse unit, position, reporting-line, audit, context, query, and projection shapes.
- Read and write policy helpers fail closed.
- Initial tests run through the package test command.

Validation evidence:

- `npm run typecheck`
- `npm run lint`
- `npm test`

### Slice 2: Database Schema

Add durable owned tables for organization facts and audit references.

Status: complete

Deliverables:

- `hr_org_units`
- `hr_org_positions`
- `hr_org_reporting_relationships`
- `hr_org_structure_audit_references`
- tenant and company indexes
- uniqueness rules for scoped codes and relationship identity
- generated database migration

Acceptance criteria:

- Database package typecheck and lint pass.
- Migration is generated.
- Schema preserves tenant/company scoping and effective-date fields.

Validation evidence:

- `pnpm --filter @repo/database typecheck`
- `pnpm --filter @repo/database lint`
- `pnpm --filter @repo/database db:generate`
- Generated migration: `packages/database/drizzle/0007_awesome_roxanne_simpson.sql`

### Slice 3: Canonical Schemas and Contracts Hardening

Promote canonical contracts from slice 1 into the source of truth for commands, queries, projections, policy, routes, and registry metadata.

Status: complete

Acceptance criteria:

- Legacy form schemas delegate to canonical schemas where practical.
- Public contract barrels expose stable schema and type names.
- No raw repository row is exposed as a public API projection.

Validation evidence:

- `pnpm --filter @repo/features-employee-management-organizational-chart-hierarchy typecheck`
- `pnpm --filter @repo/features-employee-management-organizational-chart-hierarchy lint`
- `pnpm --filter @repo/features-employee-management-organizational-chart-hierarchy test`

### Slice 4: Scoped Repository

Replace the legacy in-memory store with a compliance-style repository.

Status: complete

Acceptance criteria:

- File-backed test mode exists.
- Database-backed mode activates when `DATABASE_URL` and tenant scope are available.
- Units, positions, reporting lines, and audit events are stored separately.
- Test reset hooks exist.

Validation evidence:

- `pnpm --filter @repo/features-employee-management-organizational-chart-hierarchy typecheck`
- `pnpm --filter @repo/features-employee-management-organizational-chart-hierarchy lint`
- `pnpm --filter @repo/features-employee-management-organizational-chart-hierarchy test`

### Slice 5: Policy and Execution

Enforce scoped read/write access and normalized mutation outcomes.

Acceptance criteria:

- Reads fail closed without read context.
- Writes fail closed without write context.
- All write helpers normalize actor, company, tenant, and audit metadata.
- Denied writes do not mutate state.

### Slice 6: Organization Unit Vertical Slice

Implement governed organization-unit upsert, list, get, chart projection, and audit behavior.

Acceptance criteria:

- Unit upsert validates code, name, type, status, effective dates, and parent reference.
- Self-parenting and hierarchy loops are rejected.
- Unit list supports search, status, type, location, and legal-entity filters.
- Audit event is appended in the same mutation.

### Slice 7: Position Vertical Slice

Implement distinct position persistence and position-derived operational views.

Acceptance criteria:

- Positions no longer masquerade as chart nodes.
- Position department references validate against organization units.
- Vacancy and headcount projections derive from position facts.

### Slice 8: Reporting-Line Vertical Slice

Implement separate employee-manager relationship facts.

Acceptance criteria:

- Reporting lines are separate from the organization-unit tree.
- Self-manager relationships are rejected.
- Reporting-line views are queryable and audited.

### Slice 9: Read Models and Page Model

Build pure projections for all architecture surfaces.

Acceptance criteria:

- Org chart, units, positions, reporting lines, vacancies, headcount, overview, and audit windows derive from facts.
- Projections are schema validated.
- Page model consumes canonical query functions instead of direct store reads.

### Slice 10: API Routes, Registry, and Documentation Evidence

Expose the mature server and HTTP surfaces, then update architecture evidence.

Acceptance criteria:

- API routes delegate to package server functions.
- Route contracts document methods and paths.
- Registry covers capabilities, actions, audit events, navigation, classification, dashboards, and requirement coverage.
- Architecture doc is updated only after code, tests, routes, and validation evidence exist.

## Validation Commands

```powershell
pnpm --filter @repo/features-employee-management-organizational-chart-hierarchy typecheck
pnpm --filter @repo/features-employee-management-organizational-chart-hierarchy lint
pnpm --filter @repo/features-employee-management-organizational-chart-hierarchy test
pnpm --filter @repo/database typecheck
pnpm --filter @repo/database lint
pnpm --filter api typecheck
```

If database schema changes:

```powershell
pnpm --filter @repo/database db:generate
```
