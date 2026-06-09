# Customization Package Definition Of Done

This Definition of Done applies to changes in `@repo/customization` and to consuming packages that rely on customization contracts.

## Scope

A customization change is done only when it is safe for tenant/company ERP customization without weakening platform governance.

This DoD covers:

- contracts
- schemas
- validation
- resolution
- tests
- documentation
- integration boundaries
- future admin and persistence readiness

This DoD does not require building the admin UI or database adapter before those packages exist.

## Architecture DoD

- The change keeps `@repo/customization` independent from UI, metadata-ui, database, auth, permissions, audit, execution, apps, and feature internals.
- The change remains an overlay on feature-owned metadata.
- The change cannot alter tenant enforcement, company enforcement, permission finality, audit obligations, execution pipeline behavior, or business rules.
- The change is compatible with `skills/reference/architecture.md`, `skills/reference/packages.md`, and `skills/reference/customization.md`.
- Any new dependency is justified in `architecture.md` before it is added.

## Contract DoD

- Public types are exported through a stable package export path.
- Contract names describe governance intent, not UI implementation.
- Tenant and company scope behavior is explicit.
- Lifecycle fields are present when the change affects persisted or publishable customization.
- Any new customizable surface is listed as allowed in `architecture.md`.
- Any new forbidden surface is documented if it closes a governance gap.

## Schema DoD

- Runtime schema validates every public contract accepted from storage, import, or admin input.
- Schemas are strict.
- String ids are trimmed and non-empty.
- Unknown properties are rejected.
- Scope rules are enforced: tenant scope rejects `companyId`; company scope requires `companyId`.
- Duplicate override keys are rejected.
- Error messages are specific enough for admin preview and publish diagnostics.

## Metadata-Aware Validation DoD

Before customization can be published, validation must confirm:

- target `featureId` matches metadata id
- target `entity` matches metadata entity
- field override keys exist
- section override keys exist
- section `fieldKeys` exist
- form override keys exist
- form `sectionKeys` exist
- table override keys exist
- table column override keys exist
- table column `field` references exist
- filter override keys exist
- action override keys exist and target safe actions only
- `defaultSort` references a known allowed sort key
- hidden fields are not required/system fields unless metadata explicitly allows it
- company-scoped customization is allowed only for company-aware metadata

## Resolution DoD

- Resolution is deterministic.
- Missing customization returns base metadata unchanged.
- Mismatched feature id or entity is rejected.
- Tenant customization is applied before company customization.
- Hidden items are removed only from approved presentation surfaces.
- Override ordering is stable when no explicit order is provided.
- Base metadata is not mutated.
- Draft customization is never used for normal runtime rendering.

## Lifecycle DoD

Publishable customization supports:

- draft state
- published state
- archived state
- version number
- base metadata version or fingerprint
- actor metadata for create, update, publish, archive, and rollback
- timestamps for create, update, publish, archive, and rollback

Runtime consumers must load only published customization unless using a trusted admin preview path.

## Repository Port DoD

If persistence contracts are added:

- they are interfaces or type contracts only
- they do not import database clients
- they do not import app code
- they do not bypass execution or permission checks
- they model tenant id, optional company id, feature id, entity, status, and version
- they support rollback and version listing

Persistence implementation belongs outside `@repo/customization`.

## Admin Integration DoD

Future admin integration is done only when:

- admin mutation paths use the canonical execution pipeline
- publish and rollback are permission-gated
- validation runs before save and before publish
- preview uses trusted server context
- every publish, archive, import, and rollback operation is auditable
- admin UI shows validation diagnostics before publish

Until the admin package exists, package-level work may provide contracts and validation helpers only.

## Audit DoD

Customization operations must be auditable by the consuming layer.

Audit-ready changes include:

- stable operation names
- tenant id
- optional company id
- feature id
- entity
- customization id
- version
- actor id
- result
- reason or validation summary for failures

`@repo/customization` must not emit audit events directly unless architecture is changed to allow an audit dependency.

## Import And Export DoD

Import/export support is done only when:

- exported fixtures are deterministic
- exported fixtures include lifecycle and metadata fingerprint data
- imported fixtures are schema-validated
- imported fixtures are metadata-validated
- stale metadata fingerprints produce explicit warnings or rejection
- import never publishes automatically without a trusted admin operation
- secrets and runtime-only context are excluded

## Test DoD

Every customization change must include tests for the behavior it changes.

Minimum test coverage:

- schema accepts valid contracts
- schema rejects invalid scope combinations
- schema rejects unknown properties
- schema rejects duplicate keys
- validation rejects unknown metadata keys
- validation rejects unsafe hidden required/system fields
- resolution applies labels, visibility, order, sections, forms, tables, filters, actions, and presentation safely
- resolution does not mutate base metadata
- layering order is stable
- mismatch rejection covers feature id and entity

Run:

```txt
pnpm --filter @repo/customization lint
pnpm --filter @repo/customization typecheck
pnpm --filter @repo/customization test
pnpm lint:ui-boundaries
```

If architecture rules are affected, also run:

```txt
pnpm lint:architecture
```

## Documentation DoD

- `architecture.md` is updated for every new customization surface, lifecycle state, dependency, or integration boundary.
- This `dod.md` is updated when the acceptance bar changes.
- Consuming packages document how they use customization contracts.
- Any assumption about future admin or persistence packages is labelled as future integration, not current behavior.

## Release Readiness DoD

Before tenant customization is enabled in production:

- metadata-aware validation is implemented
- lifecycle status and versioning are implemented
- runtime loads only published customization
- tenant/company layering is implemented
- admin publish uses execution and permission gates
- audit integration is wired by the consuming layer
- rollback path is tested
- invalid customization fails closed to base metadata or an explicit safe error state

## Current Package Status

Current status: package foundations and governance contracts are implemented; admin, persistence, and consuming-layer enforcement remain external.

Already present:

- strict schemas
- tenant/company scope validation
- duplicate-key rejection
- metadata-aware validation
- lifecycle/status/version contracts
- tenant/company layering resolver
- repository port contracts
- audit operation descriptors
- import/export fixture contracts
- metadata resolver
- package boundary isolation
- baseline tests

Still needed:

- admin integration through a future admin package
- consuming-layer publish/rollback orchestration
- trusted runtime loading of published customization from persistence
