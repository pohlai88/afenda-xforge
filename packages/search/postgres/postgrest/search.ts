import "server-only";

import type { SearchResult } from "../../types.ts";
import {
  assertPostgresSearchQuery,
  clampPostgresSearchLimit,
  type PostgresSearchQueryOptions,
} from "../internal.ts";
import { loadPostgresSearchKeys } from "../keys.ts";

type PostgrestSearchRpcRow = {
  company_id: string | null;
  description: string | null;
  entity_id: string;
  entity_type: string;
  id: string;
  metadata?: Record<string, unknown>;
  rank: number | null;
  title: string;
  url: string | null;
};

const mapPostgrestRowToSearchResult = (
  row: PostgrestSearchRpcRow,
  tenantId: string
): SearchResult | null => {
  const title = row.title.trim();

  if (title.length === 0) {
    return null;
  }

  return {
    document: {
      id: row.entity_id,
      tenantId,
      companyId: row.company_id,
      title,
      description: row.description ?? undefined,
      url: row.url ?? undefined,
      metadata: row.metadata ?? {
        entityType: row.entity_type,
        workspaceSearchDocumentId: row.id,
      },
    },
    formatted: {
      title,
      description: row.description ?? undefined,
    },
    id: row.entity_id,
    indexKey: row.entity_type,
    indexName: row.entity_type,
    rankingScore: row.rank,
  };
};

const resolvePostgrestConfig = (): {
  key: string;
  url: string;
} => {
  const config = loadPostgresSearchKeys();
  const url = config.SEARCH_POSTGREST_URL?.trim();
  const key = config.SEARCH_POSTGREST_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      "PostgREST search is not configured. Set SEARCH_POSTGREST_URL and SEARCH_POSTGREST_KEY."
    );
  }

  return { key, url };
};

export const searchWorkspaceDocumentsPostgrest = async (
  options: PostgresSearchQueryOptions
): Promise<SearchResult[]> => {
  const query = assertPostgresSearchQuery(options.query);
  const limit = clampPostgresSearchLimit(options.limit);
  const { key, url } = resolvePostgrestConfig();
  const endpoint = new URL("/rest/v1/rpc/search_workspace_documents", url);

  const response = await fetch(endpoint, {
    body: JSON.stringify({
      p_limit: limit,
      p_query: query,
      p_tenant_id: options.tenantId,
    }),
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `PostgREST workspace search failed with status ${response.status}`
    );
  }

  const rows = (await response.json()) as PostgrestSearchRpcRow[];

  return rows
    .map((row) => mapPostgrestRowToSearchResult(row, options.tenantId))
    .filter((result): result is SearchResult => result !== null);
};
