import "server-only";

import { database, timeDatabaseQuery } from "@repo/database";
import { sql } from "drizzle-orm";
import type { SearchResult } from "../../types.ts";
import {
  assertPostgresSearchQuery,
  clampPostgresSearchLimit,
  type PostgresSearchQueryOptions,
  type PostgresSearchRow,
} from "../internal.ts";

const mapPostgresRowToSearchResult = (
  row: PostgresSearchRow,
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
      metadata: {
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

export const searchWorkspaceDocumentsNeon = async (
  options: PostgresSearchQueryOptions
): Promise<SearchResult[]> => {
  const query = assertPostgresSearchQuery(options.query);
  const limit = clampPostgresSearchLimit(options.limit);

  const rows = await timeDatabaseQuery(
    async (): Promise<PostgresSearchRow[]> => {
      const result = await database.execute(sql`
        SELECT
          documents.id,
          documents.entity_type,
          documents.entity_id,
          documents.title,
          documents.description,
          documents.url,
          documents.company_id,
          ts_rank(
            documents.search_vector,
            websearch_to_tsquery('english', ${query})
          ) AS rank
        FROM xforge.workspace_search_documents AS documents
        WHERE documents.tenant_id = ${options.tenantId}::uuid
          AND documents.deleted_at IS NULL
          AND documents.search_vector @@ websearch_to_tsquery('english', ${query})
        ORDER BY rank DESC, documents.title ASC
        LIMIT ${limit}
      `);

      return [...result] as PostgresSearchRow[];
    },
    {
      operation: "select",
      resource: "workspace_search_documents",
      metadata: {
        tenantId: options.tenantId,
      },
    }
  );

  return rows
    .map((row) => mapPostgresRowToSearchResult(row, options.tenantId))
    .filter((result): result is SearchResult => result !== null);
};
