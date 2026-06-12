import type { SearchDocument, SearchQueryOptions } from "../types.ts";

export const DEFAULT_POSTGRES_SEARCH_LIMIT = 10;
export const MAX_POSTGRES_SEARCH_LIMIT = 25;
export const MIN_POSTGRES_SEARCH_QUERY_LENGTH = 2;

const SEARCH_TENANT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const assertSearchTenantId = (tenantId: string): string => {
  const normalized = tenantId.trim();

  if (!SEARCH_TENANT_ID_PATTERN.test(normalized)) {
    throw new Error("Search tenantId must be a UUID");
  }

  return normalized;
};

export type PostgresSearchQueryOptions = Pick<
  SearchQueryOptions,
  "limit" | "query"
> & {
  tenantId: string;
  companyId?: string | null;
};

export type PostgresSearchRow = {
  company_id: string | null;
  description: string | null;
  entity_id: string;
  entity_type: string;
  id: string;
  rank: number | null;
  title: string;
  url: string | null;
};

export const normalizePostgresSearchQuery = (query: string): string =>
  query.trim();

export const assertPostgresSearchQuery = (query: string): string => {
  const normalized = normalizePostgresSearchQuery(query);

  if (normalized.length < MIN_POSTGRES_SEARCH_QUERY_LENGTH) {
    throw new Error(
      `Search query must be at least ${MIN_POSTGRES_SEARCH_QUERY_LENGTH} characters`
    );
  }

  return normalized;
};

export const clampPostgresSearchLimit = (
  limit: number | undefined,
  defaultLimit = DEFAULT_POSTGRES_SEARCH_LIMIT
): number => {
  const resolvedLimit = limit ?? defaultLimit;

  if (!Number.isInteger(resolvedLimit) || resolvedLimit <= 0) {
    return defaultLimit;
  }

  return Math.min(resolvedLimit, MAX_POSTGRES_SEARCH_LIMIT);
};

export const mapSearchDocumentToUpsert = (
  entityType: string,
  document: SearchDocument
): {
  companyId: string | null;
  description: string | null;
  entityId: string;
  entityType: string;
  metadata: Record<string, unknown>;
  tenantId: string;
  title: string;
  url: string | null;
} => {
  const title = document.title?.trim() ?? "";

  if (title.length === 0) {
    throw new Error("Search document title is required for Postgres indexing");
  }

  return {
    companyId:
      typeof document.companyId === "string" ? document.companyId : null,
    description: document.description?.trim() ?? null,
    entityId: String(document.id),
    entityType,
    metadata:
      document.metadata !== undefined && document.metadata !== null
        ? document.metadata
        : {},
    tenantId: assertSearchTenantId(document.tenantId),
    title,
    url: typeof document.url === "string" ? document.url.trim() : null,
  };
};
