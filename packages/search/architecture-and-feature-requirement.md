# Search Architecture

## Business Definition

**Search is the XForge infrastructure capability that owns tenant-safe full-text read models, indexing contracts, and query adapters for the ERP ecosystem. Search surfaces ranked results to workspace UI (command palette, global search, entity pickers) and governed API routes without becoming the source of truth for business records.**

This document extends the current `@repo/search` implementation (registry, `SearchDocument` contracts, Meilisearch adapter, language presets) and defines the **north-star Postgres architecture** with **dual read transports: Neon direct SQL and Supabase PostgREST over materialized search APIs**.

---

# Search Includes

| Area | What It Covers |
| --- | --- |
| **Search contracts** | `SearchDocument`, `SearchQueryOptions`, `SearchResult`, `SearchSuggestion`, index registry |
| **Read models** | Tenant-scoped search document rows, FTS vectors, materialized read APIs |
| **Indexing** | Post-commit document upserts, batch reindex, index registration metadata |
| **Query adapters** | Provider-neutral search client; Meilisearch (current), Postgres FTS (north star) |
| **Postgres dual transport** | Neon direct SQL for writes and governed server reads; Supabase PostgREST for materialized read API |
| **Workspace integration** | `/api/me/workspace-search`, cmdK quick search utility, future global ERP search |

---

# Search Does Not Include

| Excluded Area | Owned By |
| --- | --- |
| Canonical business records | Feature repositories in owning feature packages |
| Permission finality | `@repo/permissions` and execution pipeline |
| Mutation authority | `@repo/execution` and feature `server.ts` entrypoints |
| Audit evidence | `@repo/audit` |
| App route handlers | `apps/app`, `apps/api` (orchestration only) |
| Business ranking rules per domain | Owning feature packages (via indexer metadata only) |

---

# Current State (Implemented)

| Component | Location | Notes |
| --- | --- | --- |
| Registry and types | `packages/search/registry.ts`, `types.ts` | Index definitions, `SearchDocument` shape |
| Language presets | `packages/search/language.ts` | EN/VN stop words |
| Meilisearch adapter | `packages/search/meilisearch/*` | Client, indexer, `search()`, `suggest()` |
| Feature indexer example | `employee-records-management/src/search.ts` | HR employee records Meilisearch index |
| Workspace query API | `apps/app/lib/workspace-search/*` | Tenant-scoped Meilisearch query today |
| cmdK wiring | `workspace-command-palette.tsx` | Debounced autocomplete → workspace search API |
| Integration tests | `packages/search/tests/meilisearch.integration.test.ts` | Requires `MEILISEARCH_INTEGRATION=true` |

Meilisearch remains a **supported adapter** during migration. It is **not** the long-term north star.

---

# North Star

| Principle | Requirement |
| --- | --- |
| **Single search contract** | All ERP surfaces call `@repo/search` (or app orchestration that calls it), not provider SDKs directly |
| **Postgres FTS default** | Primary search read model lives in Postgres (`packages/database` migrations) |
| **Lowest cost** | No mandatory search SaaS; one database bill; optional self-hosted engines only if Postgres limits are proven |
| **Read model only** | Features index after successful audited mutations; search never writes canonical domain state |
| **Tenant first** | Every query and index row carries `tenant_id`; company scope applied when applicable |
| **Dual Postgres transport** | Neon direct SQL for indexing and governed writes; Supabase PostgREST for materialized read API where configured |

---

# Postgres Read Model

## Canonical table: `workspace_search_documents`

Owned by `packages/database` (Drizzle migration). Suggested columns:

| Column | Purpose |
| --- | --- |
| `id` | Stable document id (uuid or text) |
| `tenant_id` | Required tenant scope |
| `company_id` | Optional company scope |
| `entity_type` | Registry key / feature entity (e.g. `hr_employee_record`) |
| `entity_id` | Source record id |
| `title` | Primary display label |
| `description` | Secondary text |
| `url` | Deep link for cmdK / navigation |
| `metadata` | JSONB for feature-specific facets (non-authoritative) |
| `search_vector` | `tsvector` generated from title + description + indexed metadata text |
| `indexed_at` | Last indexer touch |
| `deleted_at` | Soft delete for stale index rows |

Indexes:

- GIN on `search_vector`
- Btree on `(tenant_id, entity_type)`
- Unique on `(tenant_id, entity_type, entity_id)` where `deleted_at IS NULL`

## Materialized read API (Supabase / PostgREST)

To reduce hot-path cost and keep reads efficient:

| Object | Role |
| --- | --- |
| `workspace_search_documents_read` | **Materialized view** or security-barrier **view** over active search rows with precomputed `search_vector` and display columns |
| `search_workspace_documents` | **RPC** (optional) encapsulating `websearch_to_tsquery` + `ts_rank` + tenant filter |
| PostgREST exposure | Read-only grants for `anon`/`authenticated` via RLS policies matching tenant membership |

Refresh strategy:

- **Incremental**: feature indexers upsert canonical table (Neon path); materialized view refreshed on schedule or `REFRESH MATERIALIZED VIEW CONCURRENTLY` after batch reindex
- **Never** treat the materialized API as the write target

---

# Dual Adapter Architecture

```txt
Feature mutation (success + audit)
        │
        ▼
Post-commit indexer (feature or orchestration)
        │
        ▼
┌───────────────────────────────────────┐
│  workspace_search_documents (Neon)    │  ← source FTS table (@repo/database)
└───────────────────────────────────────┘
        │
        ├─ WRITE path: Neon direct (Drizzle)
        │     packages/search/postgres/neon
        │     - upsert / soft-delete index rows
        │     - batch reindex jobs
        │
        └─ READ path (selectable):
              A) Neon direct — governed server queries (Drizzle + raw FTS SQL)
              B) Supabase PostgREST — materialized read API
                    packages/search/postgres/postgrest
                    - GET /rest/v1/workspace_search_documents_read
                    - or POST /rest/v1/rpc/search_workspace_documents
```

## Neon adapter (`postgres/neon`)

| Use | Transport |
| --- | --- |
| Index upsert / delete | `@repo/database` Drizzle or parameterized SQL |
| Batch reindex | Server jobs, `timeDatabaseQuery` metadata |
| Governed reads when PostgREST disabled | Same connection as ERP OLTP |
| Migrations | `packages/database/drizzle` only |

Environment: existing `DATABASE_URL` (Neon pooler-friendly host per `@repo/database` README).

## Supabase PostgREST adapter (`postgres/postgrest`)

| Use | Transport |
| --- | --- |
| Workspace quick search reads | PostgREST over materialized view / RPC |
| High-volume autocomplete | Edge-adjacent reads without hammering OLTP connection pool |
| Client-adjacent read models | Only through **server orchestration** in v1 (no browser PostgREST keys for search) |

Environment (read API):

- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` for server-side PostgREST client, **or**
- Dedicated `SEARCH_POSTGREST_URL` + `SEARCH_POSTGREST_KEY` when search read API is isolated

RLS: apply policies in `supabase/sql/` (same pattern as `notifications_rls.sql`). Search read API must not bypass tenant membership checks.

## Provider selection

| Variable | Values | Default |
| --- | --- | --- |
| `SEARCH_PROVIDER` | `postgres`, `meilisearch` | `postgres` (target); `meilisearch` until migration complete |
| `SEARCH_POSTGRES_WRITE_ADAPTER` | `neon` | `neon` |
| `SEARCH_POSTGRES_READ_ADAPTER` | `neon`, `supabase-postgrest` | `neon` in dev; `supabase-postgrest` when materialized API is deployed |

Read adapter falls back to Neon direct when PostgREST is not configured.

---

# Package Layout (Target)

```txt
packages/search/
  architecture-and-feature-requirement.md   ← this document
  index.ts                                  ← contracts + registry (existing)
  types.ts
  registry.ts
  language.ts
  meilisearch/                              ← legacy / optional adapter (existing)
  postgres/
    index.ts                                ← createPostgresSearchClient()
    neon/
      indexer.ts                            ← upsert/delete/reindex
      search.ts                             ← FTS queries via @repo/database
      keys.ts
    postgrest/
      search.ts                             ← read-only materialized API client
      keys.ts
    internal.ts                             ← shared FTS SQL builders, tenant filters
```

Public exports (target):

```txt
@repo/search
@repo/search/postgres
@repo/search/postgres/neon
@repo/search/postgres/postgrest
@repo/search/meilisearch          (existing, deprecated path)
```

---

# Indexing Rules

| Rule | Requirement |
| --- | --- |
| **Timing** | Index only after successful domain mutation and audit write |
| **Ownership** | Feature packages own indexer modules; they call `packages/search` postgres neon indexer |
| **Registry** | `registerSearchIndex` maps `entity_type` → searchable fields metadata (existing registry) |
| **Idempotency** | Upsert on `(tenant_id, entity_type, entity_id)` |
| **Deletion** | Soft-delete or hard-delete index row when source record archived |
| **No live OLTP joins on keystroke** | cmdK and autocomplete query the read model, not feature tables |

---

# Query Rules

| Rule | Requirement |
| --- | --- |
| **Authentication** | App routes resolve actor + tenant via `@repo/auth` before search |
| **Permission** | Sensitive entities enforce read permission in orchestration layer or RPC (fail closed) |
| **Minimum query length** | Client and server enforce minimum length (currently 2 for workspace search) |
| **Limit caps** | Server enforces max `limit` (e.g. 25) |
| **Response shape** | Stable `WorkspaceSearchResponse` / `SearchResult` regardless of adapter |
| **Highlighting** | Optional; Postgres path may use `ts_headline` in later iteration |

---

# ERP Ecosystem Surfaces

| Surface | Query path |
| --- | --- |
| cmdK quick search (utility) | `apps/app` → `/api/me/workspace-search` → `@repo/search` |
| Entity directory search | Feature page → feature API or shared search API with `entity_type` filter |
| Global ERP search (future) | Same API with multi-entity ranking |
| Admin reindex (future) | System admin route → neon adapter batch reindex |

All surfaces share the same Postgres read model and adapter selection.

---

# Cost And Operations Rationale

| Approach | Cost profile |
| --- | --- |
| **Postgres FTS (north star)** | No search SaaS; uses existing Neon/Supabase Postgres spend |
| **Supabase PostgREST read API** | Offloads read-heavy autocomplete to materialized endpoints; smaller OLTP pool pressure on Neon |
| **Meilisearch Cloud** | Subscription; not north star |
| **Self-hosted Meilisearch / OpenSearch** | Infra + ops time; escape hatch only |

**Target operating model:** Neon (or single Postgres) holds canonical rows; Supabase exposes a **materialized data API** for reads when the project already uses Supabase for auth, RLS, and edge functions.

---

# Migration From Meilisearch

| Phase | Action |
| --- | --- |
| 1 | Add `workspace_search_documents` migration + neon indexer |
| 2 | Implement `postgres/neon` search client; switch `queryWorkspaceSearch` behind `SEARCH_PROVIDER=postgres` |
| 3 | Add materialized view + `supabase/sql/search_rls.sql`; implement `postgres/postgrest` read adapter |
| 4 | Migrate feature indexers (HR employee records first) to neon upsert |
| 5 | Run parallel Meilisearch + Postgres in staging; compare results |
| 6 | Deprecate Meilisearch env vars in production when parity confirmed |

Workspace cmdK and API contract remain unchanged during migration.

---

# Enterprise Functional Requirements

| Code | Requirement |
| --- | --- |
| **SRCH-001** | System shall expose a provider-neutral search contract for query, suggest, index, and reindex operations. |
| **SRCH-002** | System shall store searchable ERP documents in a tenant-scoped Postgres read model, not in canonical feature tables. |
| **SRCH-003** | System shall index documents only after successful audited mutations. |
| **SRCH-004** | System shall enforce `tenant_id` on every index row and every query. |
| **SRCH-005** | System shall support company scope when the source entity is company-scoped. |
| **SRCH-006** | System shall provide a Neon direct SQL adapter for writes and governed server reads via `@repo/database`. |
| **SRCH-007** | System shall provide a Supabase PostgREST adapter for read-only queries against materialized search APIs. |
| **SRCH-008** | System shall select read transport via configuration without changing app or UI contracts. |
| **SRCH-009** | System shall keep Meilisearch as an optional adapter until Postgres parity is verified. |
| **SRCH-010** | System shall not expose search provider credentials or raw PostgREST access to browser clients in v1. |
| **SRCH-011** | System shall apply Supabase RLS policies for any PostgREST-exposed search views or RPCs. |
| **SRCH-012** | System shall cap query limits and validate input before executing search. |
| **SRCH-013** | Feature packages shall not import sibling feature packages for search; they publish index rows through `@repo/search`. |
| **SRCH-014** | Workspace command palette shall consume the same workspace search API as future global ERP search. |

---

# Non-Goals (v1)

- OpenSearch / Elasticsearch clusters
- Vector semantic search (future: `pgvector` in same Postgres before external engines)
- Browser-direct PostgREST search (server orchestration only)
- Search-driven mutations

---

# Related References

| Document | Purpose |
| --- | --- |
| `skills/reference/architecture.md` | Global dependency rules for `packages/search` |
| `skills/reference/packages.md` | Package ownership and read-model rules |
| `packages/database/README.md` | Migration governance and Neon connection notes |
| `supabase/README.md` | RLS apply order and Supabase scaffolding |
| `apps/app/lib/workspace-search/` | Workspace search orchestration (app layer) |

---

# Search Requirement Statement

| Requirement | Description |
| --- | --- |
| **Search north star** | Postgres FTS read model in `packages/database`, dual adapters (Neon write/direct read, Supabase PostgREST materialized read API), single `@repo/search` contract for the entire ERP ecosystem, lowest subscription and operational cost. |
