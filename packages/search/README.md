# `@repo/search`

Tenant-safe search contracts, index registry, and provider adapters for the XForge ERP ecosystem.

## North star

**Postgres full-text search** with a unified `workspace_search_documents` read model. Meilisearch (`meilisearch/`) is supported today and will remain optional during migration.

Read transports (target):

| Adapter | Path | Role |
| --- | --- | --- |
| Neon direct | `postgres/neon` (planned) | Index writes, reindex jobs, governed server reads via `@repo/database` |
| Supabase PostgREST | `postgres/postgrest` (planned) | Read-only queries against materialized search APIs |

Configure with `SEARCH_PROVIDER`, `SEARCH_POSTGRES_WRITE_ADAPTER`, and `SEARCH_POSTGRES_READ_ADAPTER`.

## Architecture

See **[architecture-and-feature-requirement.md](./architecture-and-feature-requirement.md)** for:

- Current Meilisearch implementation and workspace cmdK wiring
- Postgres schema and materialized read API design
- Neon vs Supabase PostgREST dual-adapter rules
- Indexing and query governance (SRCH-001–SRCH-014)
- Migration plan from Meilisearch

## Commands

```bash
pnpm --filter @repo/search test
pnpm --filter @repo/search test:integration   # Meilisearch; requires MEILISEARCH_INTEGRATION=true
pnpm --filter @repo/search typecheck
```

## Environment (current Meilisearch adapter)

See `.env.example` for `MEILISEARCH_URL`, `MEILISEARCH_API_KEY`, and `MEILISEARCH_INDEX_PREFIX`.

Postgres adapter env vars will be documented when `postgres/` ships.
