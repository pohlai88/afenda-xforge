import "server-only";

import { requireActiveTenantMembership } from "@repo/auth/server";
import type { SearchDocument } from "@repo/search";
import {
  createMeilisearchSearchClient,
  hasMeilisearchConfig,
} from "@repo/search/meilisearch";
import {
  isPostgresSearchAvailable,
  resolveSearchProvider,
  searchWorkspaceDocumentsPostgres,
} from "@repo/search/postgres";
import { z } from "zod";
import {
  WORKSPACE_SEARCH_DEFAULT_LIMIT,
  WORKSPACE_SEARCH_MAX_LIMIT,
  WORKSPACE_SEARCH_MIN_QUERY_LENGTH,
  type WorkspaceSearchResponse,
  type WorkspaceSearchResult,
} from "./contract.ts";
import { ensureWorkspaceSearchReady } from "./registry.server.ts";
import {
  getWorkspaceSearchIndexLabel,
  resolveWorkspaceSearchResultHref,
} from "./resolve-result.server.ts";

const workspaceSearchQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(WORKSPACE_SEARCH_MAX_LIMIT)
    .default(WORKSPACE_SEARCH_DEFAULT_LIMIT),
  q: z.string().trim().min(WORKSPACE_SEARCH_MIN_QUERY_LENGTH),
});

export type WorkspaceSearchQueryScope = {
  limit?: number;
  query: string;
  requestId?: string;
};

const toWorkspaceSearchResult = (
  result: {
    document: SearchDocument;
    formatted: Partial<SearchDocument>;
    id: string;
    indexKey: string;
    rankingScore: number | null;
  }
): WorkspaceSearchResult | null => {
  const title =
    result.formatted.title?.trim() ?? result.document.title?.trim() ?? "";
  const description =
    result.formatted.description?.trim() ??
    result.document.description?.trim() ??
    undefined;

  if (title.length === 0) {
    return null;
  }

  return {
    description,
    href: resolveWorkspaceSearchResultHref(result.indexKey, result.document),
    id: result.id,
    indexKey: result.indexKey,
    indexLabel: getWorkspaceSearchIndexLabel(result.indexKey),
    rankingScore: result.rankingScore,
    title,
  };
};

const queryWorkspaceSearchMeilisearch = async (
  tenantId: string,
  parsed: z.infer<typeof workspaceSearchQuerySchema>
): Promise<WorkspaceSearchResponse> => {
  if (!hasMeilisearchConfig()) {
    return {
      available: false,
      query: parsed.q,
      results: [],
    };
  }

  const searchReady = await ensureWorkspaceSearchReady();

  if (!searchReady) {
    return {
      available: false,
      query: parsed.q,
      results: [],
    };
  }

  const escapeFilterValue = (value: string): string =>
    value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');

  const searchClient = createMeilisearchSearchClient();
  const searchResults = await searchClient.search({
    filter: `tenantId = "${escapeFilterValue(tenantId)}"`,
    limit: parsed.limit,
    query: parsed.q,
  });

  const results = searchResults
    .map(toWorkspaceSearchResult)
    .filter((result): result is WorkspaceSearchResult => result !== null);

  return {
    available: true,
    query: parsed.q,
    results,
  };
};

const queryWorkspaceSearchPostgres = async (
  tenantId: string,
  parsed: z.infer<typeof workspaceSearchQuerySchema>
): Promise<WorkspaceSearchResponse> => {
  if (!isPostgresSearchAvailable()) {
    return {
      available: false,
      query: parsed.q,
      results: [],
    };
  }

  const searchReady = await ensureWorkspaceSearchReady();

  if (!searchReady) {
    return {
      available: false,
      query: parsed.q,
      results: [],
    };
  }

  const searchResults = await searchWorkspaceDocumentsPostgres({
    limit: parsed.limit,
    query: parsed.q,
    tenantId,
  });

  const results = searchResults
    .map(toWorkspaceSearchResult)
    .filter((result): result is WorkspaceSearchResult => result !== null);

  return {
    available: true,
    query: parsed.q,
    results,
  };
};

export const queryWorkspaceSearch = async (
  scope: WorkspaceSearchQueryScope
): Promise<WorkspaceSearchResponse> => {
  const parsed = workspaceSearchQuerySchema.parse({
    limit: scope.limit,
    q: scope.query,
  });
  const membership = await requireActiveTenantMembership();
  const provider = resolveSearchProvider();

  if (provider === "postgres") {
    return queryWorkspaceSearchPostgres(membership.tenantId, parsed);
  }

  return queryWorkspaceSearchMeilisearch(membership.tenantId, parsed);
};
