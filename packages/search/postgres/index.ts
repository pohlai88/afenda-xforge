import "server-only";

import type { SearchQueryOptions, SearchResult } from "../types.ts";
import {
  hasPostgresPostgrestReadConfig,
  hasPostgresSearchConfig,
  loadPostgresSearchKeys,
  resolveSearchProvider,
} from "./keys.ts";
import { upsertWorkspaceSearchDocument, softDeleteWorkspaceSearchDocument } from "./neon/indexer.ts";
import { searchWorkspaceDocumentsNeon } from "./neon/search.ts";
import { searchWorkspaceDocumentsPostgrest } from "./postgrest/search.ts";

export {
  hasPostgresPostgrestReadConfig,
  hasPostgresSearchConfig,
  loadPostgresSearchKeys,
  resolveSearchProvider,
} from "./keys.ts";
export {
  upsertWorkspaceSearchDocument,
  softDeleteWorkspaceSearchDocument,
} from "./neon/indexer.ts";
export { searchWorkspaceDocumentsNeon } from "./neon/search.ts";
export { searchWorkspaceDocumentsPostgrest } from "./postgrest/search.ts";

export type PostgresWorkspaceSearchOptions = Pick<
  SearchQueryOptions,
  "limit" | "query"
> & {
  tenantId: string;
};

export const isPostgresSearchAvailable = (): boolean =>
  resolveSearchProvider() === "postgres" && hasPostgresSearchConfig();

export const searchWorkspaceDocumentsPostgres = async (
  options: PostgresWorkspaceSearchOptions
): Promise<SearchResult[]> => {
  if (!hasPostgresSearchConfig()) {
    return [];
  }

  const readAdapter = loadPostgresSearchKeys().SEARCH_POSTGRES_READ_ADAPTER;

  if (readAdapter === "supabase-postgrest") {
    if (!hasPostgresPostgrestReadConfig()) {
      throw new Error(
        "SEARCH_POSTGRES_READ_ADAPTER=supabase-postgrest requires SEARCH_POSTGREST_URL and SEARCH_POSTGREST_KEY"
      );
    }

    return searchWorkspaceDocumentsPostgrest(options);
  }

  return searchWorkspaceDocumentsNeon(options);
};
