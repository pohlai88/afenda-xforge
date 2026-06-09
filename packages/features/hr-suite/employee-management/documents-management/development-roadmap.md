# Documents Management Development Roadmap

## Purpose

This document turns the Documents Management architecture into a 10-slice implementation roadmap. It follows the upgraded HR suite implementation advice and uses `compliance-regulatory-tracking` as the reference implementation pattern.

Documents Management is the HR suite capability that governs employee-related document metadata, document references, document state, expiry tracking, verification state, and audit history. It must not become the employee master record, the binary file store, or a compliance-rule engine.

## Current Code Evidence

Audit date: 2026-06-09.

| Area | Evidence | Current state |
| --- | --- | --- |
| Package scripts | `package.json` | Has `lint`, `format`, `clean`, `test`, and `typecheck`. |
| Public contract | `src/contract.ts`, `src/index.ts` | Exposes the stable contract layer, route constants, permissions, and package feature id. |
| Write actions | `src/actions.ts` | Provides create/update commands that persist through the repository layer. |
| Document registration | `src/registration.ts`, `src/server.ts` | Registers employee-linked document metadata, updates document facts, and appends audit trail events. |
| Binary storage integration | `apps/api/app/api/hr/documents/route.ts`, `apps/api/app/api/hr/documents/[documentId]/download/route.ts`, `apps/api/app/api/hr/documents/_lib/storage.ts`, `packages/storage/blob/index.ts` | Uploads document binaries through Vercel Blob, persists only metadata and storage references in the aggregate, and serves secure downloads through the API layer. |
| Document lifecycle | `src/registration.ts`, `src/server.ts`, `src/contracts/command.contract.ts`, `src/schema.ts`, `test/document-lifecycle.test.ts` | Verifies, rejects, expires, archives, and updates retention metadata through versioned audit-safe transitions. |
| Query surface | `src/queries.ts` | Lists and gets repository-backed records plus document summary, readiness, and expiring projections with paging, search, and scope filtering. |
| Audit trail | `src/registration.ts`, `src/repository.ts`, `test/document-registration.test.ts` | Persists and reads document registration audit events with tenant/company scoping. |
| Schema foundation | `src/schema.ts`, `package.json` | Defines document category, type, status, visibility, versioning, retention, acknowledgment, query, and context schemas using `zod`. |
| Contract layer | `src/contracts/*`, `src/contract.ts`, `src/index.ts`, `src/manifest.ts`, `src/metadata.ts`, `package.json` | Exposes public command, query, projection, permission, route, manifest, and metadata contracts through stable barrels. |
| Repository and tests | `src/repository.ts`, `test/repository.test.ts` | Provides file-backed persistence, deterministic record IDs, scope-aware accessors, and testing hooks for reset and path overrides. |
| Policy and execution helpers | `src/policy.ts`, `src/execution/action.ts`, `src/execution/index.ts` | Enforce fail-closed write access, tenant-scoped read access, sensitive-field redaction, actor normalization, and audit metadata cleanup. |
| Versioning and replacement | `src/registration.ts`, `src/repository.ts`, `src/server.ts`, `test/document-versioning.test.ts` | Creates durable version records, resolves latest versions, preserves replacement history, and keeps superseded versions queryable. |
| Shared context | `src/shared/index.ts` | Defines a minimal feature context and package scope metadata. |
| Manifest and metadata | `src/manifest.ts`, `src/metadata.ts` | Declare the feature identity and legacy source label. |
| Architecture doc | `documents-management-architecture.md` | States the feature scope, includes/excludes, requirement statement, functional requirements, and acceptance criteria. |

## Slice 1 Status

Status: implemented on 2026-06-09.

Slice 1 did not require runtime code changes. The work for this slice is the documented boundary and ownership audit, now captured in:

- `documents-management-architecture.md`
- `development-roadmap.md`

Evidence recorded:

- Documents Management owns document metadata, document references, verification state, expiry state, retention metadata, and audit history.
- Employee master identity and employment status remain owned by Employee Records Management.
- Binary document storage remains outside the package boundary.
- Binary upload/download orchestration now lives in the API/storage integration layer while the feature package persists only references and metadata.
- Compliance rule monitoring remains owned by Compliance & Regulatory Tracking.
- Tenant/company scoping remains a required constraint for all future writes and reads.

## Slice 2 Status

Status: implemented on 2026-06-09.

Slice 2 introduced the schema foundation for Documents Management in:

- `src/schema.ts`
- `package.json`

Evidence recorded:

- Document category, type, status, visibility, version state, retention, acknowledgment, query, and context schemas now exist.
- Enum inputs accept snake_case and kebab-case forms through preprocessing.
- The package now declares its `zod` dependency explicitly, so the schema foundation is self-contained.

Validation:

- `pnpm --filter @repo/features-employee-management-documents-management typecheck`
- `pnpm --filter @repo/features-employee-management-documents-management lint`

## Slice 3 Status

Status: implemented on 2026-06-09.

Slice 3 introduced the public contract layer for Documents Management in:

- `src/contracts/*`
- `src/contract.ts`
- `src/index.ts`
- `src/manifest.ts`
- `src/metadata.ts`
- `package.json`

Evidence recorded:

- The package now exposes command, query, projection, permission, route, manifest, and metadata contracts from explicit contract files.
- The legacy package barrels now re-export the new contract surface instead of hand-maintained placeholder types.
- `./contracts` is now an explicit package export.

Validation:

- `pnpm --filter @repo/features-employee-management-documents-management typecheck`
- `pnpm --filter @repo/features-employee-management-documents-management lint`

## Slice 4 Status

Status: implemented on 2026-06-09.

Slice 4 introduced the repository and persistence boundary for Documents Management in:

- `src/repository.ts`
- `src/actions.ts`
- `src/queries.ts`
- `test/repository.test.ts`

Evidence recorded:

- Document records now persist through a file-backed repository instead of a transient in-memory Map.
- Repository entries keep tenant and company scope metadata alongside each record for scoped reads.
- The package exposes deterministic ID generation and testing hooks for repository path overrides and resets.
- A repository test now verifies persistence, scoped reads, update behavior, and reset behavior.

Validation:

- `pnpm --filter @repo/features-employee-management-documents-management typecheck`
- `pnpm --filter @repo/features-employee-management-documents-management lint`
- `pnpm --filter @repo/features-employee-management-documents-management test`

## Slice 7 Status

Status: implemented on 2026-06-09.

Slice 7 introduced document versioning and replacement history in:

- `src/registration.ts`
- `src/repository.ts`
- `src/server.ts`
- `src/index.ts`
- `src/policy.ts`
- `src/execution/index.ts`
- `src/contracts/query.contract.ts`
- `test/document-versioning.test.ts`

Evidence recorded:

- Registering a document now creates version 1 and links the document record to the latest version.
- Updating a document creates a new version instead of overwriting the prior version record.
- The previous version is retired as `superseded` and linked to the replacement version id.
- Latest-version and version-history queries remain scoped and redact sensitive source notes when needed.

Validation:

- `pnpm --filter @repo/features-employee-management-documents-management typecheck`
- `pnpm --filter @repo/features-employee-management-documents-management test`

## Slice 8 Status

Status: implemented on 2026-06-09.

Slice 8 introduced verification, expiry, archive, and retention transitions in:

- `src/registration.ts`
- `src/server.ts`
- `src/contracts/command.contract.ts`
- `src/schema.ts`
- `test/document-lifecycle.test.ts`

Evidence recorded:

- Authorized callers can verify and reject documents with explicit timestamps and rejection reasons.
- Expiry transitions require a meaningful expiry date and can record renewal markers.
- Archiving stores an archive timestamp without losing the version chain or audit history.
- Retention updates remain versioned so retention-rule changes are tracked alongside document state.

Validation:

- `pnpm --filter @repo/features-employee-management-documents-management typecheck`
- `pnpm --filter @repo/features-employee-management-documents-management lint`
- `pnpm --filter @repo/features-employee-management-documents-management test`

## Slice 9 Status

Status: implemented on 2026-06-09.

Slice 9 introduced the read-model and API surface for Documents Management in:

- `src/projector.ts`
- `src/queries.ts`
- `src/contracts/projection.contract.ts`
- `src/contracts/route.contract.ts`
- `src/contracts/index.ts`
- `src/server.ts`
- `src/index.ts`
- `apps/api/app/api/hr/documents/_lib/context.ts`
- `apps/api/app/api/hr/documents/route.ts`
- `apps/api/app/api/hr/documents/[documentId]/route.ts`
- `apps/api/app/api/hr/documents/readiness/route.ts`
- `apps/api/app/api/hr/documents/expiring/route.ts`
- `test/document-read-models.test.ts`

Evidence recorded:

- Document summaries can be listed, searched, paginated, and read back by id through the package server surface.
- Readiness summaries aggregate document counts per employee and expose the missing-mandatory, verified, pending, rejected, expired, and archived counts.
- Expiring-document projections surface expiry windows, expiry-state flags, and renewal markers without exposing repository internals.
- The API app now exposes thin GET routes for summaries, detail, readiness, and expiring views, each delegating to the package server surface.
- The read-model test covers search/paging, readiness aggregation, and expiring-document behavior with scoped repository fixtures.

Validation:

- `pnpm --filter @repo/features-employee-management-documents-management typecheck`
- `pnpm --filter @repo/features-employee-management-documents-management lint`
- `pnpm --filter @repo/features-employee-management-documents-management test`
- `pnpm --filter api typecheck`

## Slice 10 Status

Status: implemented on 2026-06-09.

Slice 10 hardened the Documents Management implementation in:

- `apps/api/package.json`
- `apps/api/test/hr-documents-routes.test.ts`
- `development-roadmap.md`
- `documents-management-architecture.md`

Evidence recorded:

- The API app now exposes a runnable `test` script for route-level coverage.
- The route test suite exercises the list, detail, readiness, expiring, upload, and download document routes directly.
- The route tests verify successful projections, paging behavior, invalid-query handling, read-denial fail-closed behavior, binary upload/download behavior, and storage-failure handling.
- The roadmap and architecture docs now record the implemented hardening surface alongside the earlier slices.

Validation:

- `pnpm --filter @repo/features-employee-management-documents-management lint`
- `pnpm --filter api typecheck`
- `pnpm --filter api test`

## Slice 5 Status

Status: implemented on 2026-06-09.

Slice 5 introduced the policy and execution helpers for Documents Management in:

- `src/policy.ts`
- `src/execution/action.ts`
- `src/execution/index.ts`

Evidence recorded:

- Write paths now fail closed unless the caller has tenant-scoped write access.
- Read paths return empty or null when tenant-scoped read access is missing.
- Sensitive document projections can be redacted through a dedicated helper instead of leaking raw values.
- Actor normalization and audit metadata cleanup helpers are available for future audit events.

Validation:

- `pnpm --filter @repo/features-employee-management-documents-management typecheck`
- `pnpm --filter @repo/features-employee-management-documents-management lint`
- `pnpm --filter @repo/features-employee-management-documents-management test`

## Slice 6 Status

Status: implemented on 2026-06-09.

Slice 6 introduced the first real document registration vertical slice for Documents Management in:

- `src/registration.ts`
- `src/server.ts`
- `src/contracts/command.contract.ts`
- `src/contracts/query.contract.ts`
- `src/schema.ts`
- `test/document-registration.test.ts`

Evidence recorded:

- Authorized callers can register employee-linked document metadata with category, type, title, visibility, status, and retention metadata.
- Document updates preserve existing history while changing the mutable metadata fields that the slice is allowed to own.
- Every register and update action appends an audit event that can be queried back by document id.
- Read-back paths return redacted data when sensitive visibility is not granted.

Validation:

- `pnpm --filter @repo/features-employee-management-documents-management typecheck`
- `pnpm --filter @repo/features-employee-management-documents-management lint`
- `pnpm --filter @repo/features-employee-management-documents-management test`

## Slice 1 Outcome

Slice 1 is the boundary and ownership audit. The result of that audit is captured below so later slices can use it as a source-of-truth guardrail.

### Ownership boundary

| Concern | Owned by Documents Management | Referenced from another domain |
| --- | --- | --- |
| Employee master identity | No | Employee Records Management |
| Employee employment status | No | Employee Records Management |
| Employee organization hierarchy | No | Organizational Chart & Hierarchy |
| Document metadata and state | Yes | N/A |
| Document binary storage | No | Storage/object file service |
| Document references and links | Yes | N/A |
| Verification and rejection state | Yes | N/A |
| Expiry and retention metadata | Yes | N/A |
| Compliance rule monitoring | No | Compliance & Regulatory Tracking |
| Policy acknowledgment metadata | Yes, as document metadata | Policy source remains external |
| Audit history for document actions | Yes | N/A |

### Source-of-truth map

| Data | Source-of-truth owner | Documents Management responsibility |
| --- | --- | --- |
| Employee profile facts | Employee Records Management | Reference employee id, do not duplicate profile storage |
| Tenant and company scope | Platform database / HR suite boundary | Require scoped reads and writes |
| Document file bytes | Storage layer | Persist only references and metadata |
| Document classification | Documents Management | Own document type, group, sensitivity, and state |
| Document lifecycle state | Documents Management | Own versioning, verification, expiry, archive, and retention metadata |
| Compliance obligations | Compliance & Regulatory Tracking | Reference readiness or linked evidence only |
| Policy authoring | Policy / governance domain | Store acknowledgment references only |

### Boundary rules

- Keep employee master data owned by Employee Records Management.
- Keep binary file storage and download mechanics outside the domain model unless they are just references.
- Keep company and tenant scoping explicit in every write and read path.
- Store facts and project read models instead of storing mutable dashboards, alerts, or derived status rows.
- Do not add compliance monitoring logic here; that remains in compliance-regulatory-tracking.
- Do not mark a slice complete until code, tests, callable surfaces, and documentation evidence all exist.

## 10-Slice Roadmap

| Slice | Focus | Main Deliverables | Exit Criteria |
| --- | --- | --- | --- |
| 1 | Boundary and ownership audit | Capture the owned data set, non-owned adjacent domains, terminology, package naming, and source-of-truth map. | Implemented in the package docs on 2026-06-09. |
| 2 | Domain schema foundation | Add a proper schema module for document records, document types, categories, statuses, visibility, retention, expiry, versioning, and acknowledgment metadata. Define query schemas and reusable enums. | Implemented in `src/schema.ts` on 2026-06-09. |
| 3 | Public contracts and barrels | Add command, query, projection, permission, route, manifest, and metadata contracts. Replace placeholder exports with stable public barrels that match the package shape expected by the rest of the repo. | Implemented in the package contract layer on 2026-06-09. |
| 4 | Repository and persistence | Implement the repository layer with scoped load/save/mutate behavior, test reset hooks, and a deterministic record ID strategy. Preserve tenant/company scoping in repository access. | Document state is persisted in a real repository abstraction instead of only an in-memory Map. |
| 5 | Policy and execution helpers | Add write/read/sensitive access checks, actor normalization, audit metadata helpers, and redaction rules. Ensure denied operations fail closed. | Every read and write has an enforceable policy path and sensitive fields are masked when required. |
| 6 | Document registration slice | Implement the first real vertical slice for document registration: create/update metadata, link to employee reference, capture document type/group/status, and write audit events. | Implemented in the registration module and audit trail on 2026-06-09. |
| 7 | Versioning and replacement | Add version records, latest-version resolution, replacement history, and retirement of superseded versions without losing historical evidence. | Replacing a document creates a durable history instead of overwriting prior facts. |
| 8 | Verification, expiry, and retention | Implement verification status transitions, rejection reasons, expiry dates, renewal markers, archive state, and retention metadata. | Implemented with versioned lifecycle transitions and retention updates on 2026-06-09. |
| 9 | Read models and API surface | Build list/get/search projections, readiness summaries, expiring-document views, and server/API routes that delegate to the package server surface. Include pagination and filtering that match the package conventions. | Consumers can query document data through stable read surfaces instead of reading repository internals. |
| 10 | Tests, docs, and hardening | Add unit tests, package-level integration tests, route tests, and architecture evidence updates. Validate scoping, redaction, permission denial, and audit coverage. | The slice is considered complete only when code, tests, route/callable access, and docs all agree. |

## Recommended Build Order

1. Finish slices 1 to 5 before adding business-heavy workflows.
2. Implement slice 6 as the first end-to-end vertical slice.
3. Add slices 7 and 8 before exposing broad search or reporting.
4. Complete slice 9 only after the domain model is stable.
5. Close with slice 10 and update the architecture doc with implementation evidence.

## Scope Guardrails

- Do not add blob upload or file versioning logic in the feature package.
- Do not duplicate employee profile storage.
- Do not turn derived UI states into persisted source-of-truth rows.
- Do not add compliance monitoring logic here; that remains in compliance-regulatory-tracking.
- Do not mark a requirement complete until it is backed by code and tests.

## Validation Targets

When implementation begins, validate the feature package with targeted checks first:

- `pnpm --filter @repo/features-employee-management-documents-management typecheck`
- `pnpm --filter @repo/features-employee-management-documents-management lint`
- `pnpm --filter @repo/features-employee-management-documents-management test`

If the roadmap expands into database-backed persistence, add the relevant database generation and validation commands at that point.

## Audit Outcome

Audit date: 2026-06-09.

No remaining implementation slices were identified in the Documents Management feature package after slice 10.

Evidence:

- The roadmap now records slices 1 through 10 as implemented with code references.
- The package test suite passes with 12/12 tests green.
- The API app typechecks cleanly and its route test suite passes.
- The feature package lint check passes cleanly with Biome.
- The package has no remaining `TODO` or `FIXME` markers in the Documents Management subtree based on the repository search performed during this audit.
