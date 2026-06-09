import "server-only";

import type { SearchResponse } from "meilisearch";
import {
  buildSearchIndexName,
  listSearchIndexDefinitions,
  requireSearchIndexDefinition,
} from "../registry.ts";
import type {
  MeilisearchConfig,
  SearchDocument,
  SearchIndexDefinition,
  SearchQueryOptions,
  SearchResult,
  SearchSuggestion,
} from "../types.ts";
import { getMeilisearchClient, getMeilisearchConfig } from "./client.ts";
import {
  assertNonNegativeInteger,
  assertPositiveInteger,
  buildSearchParams,
  extractFormattedDocument,
  extractRankingScore,
  extractSuggestionText,
} from "./internal.ts";

const resolveSearchDefinitions = (
  indices?: readonly string[]
): SearchIndexDefinition[] => {
  if (!indices || indices.length === 0) {
    const definitions = listSearchIndexDefinitions();

    if (definitions.length === 0) {
      throw new Error(
        "No search indices are registered. Register an index before searching."
      );
    }

    return definitions;
  }

  return indices.map(requireSearchIndexDefinition);
};

export class MeilisearchSearchClient {
  private readonly client: ReturnType<typeof getMeilisearchClient>;
  private readonly defaultLimit: number;
  private readonly indexPrefix: string;

  constructor(config: Partial<MeilisearchConfig> = {}) {
    const resolvedConfig = getMeilisearchConfig(config);
    this.client = getMeilisearchClient(config);
    this.defaultLimit = resolvedConfig.defaultLimit ?? 20;
    this.indexPrefix = resolvedConfig.indexPrefix ?? "xforge";
  }

  async search<TDocument extends SearchDocument = SearchDocument>(
    options: SearchQueryOptions
  ): Promise<SearchResult<TDocument>[]> {
    const query = options.query.trim();

    if (query.length === 0) {
      return [];
    }

    const limit = assertPositiveInteger(
      options.limit ?? this.defaultLimit,
      "Search limit"
    );
    const offset = assertNonNegativeInteger(
      options.offset ?? 0,
      "Search offset"
    );
    const definitions = resolveSearchDefinitions(options.indices);
    const perIndexLimit = Math.max(limit + offset, limit);
    const searchParams = buildSearchParams(
      {
        attributesToHighlight: options.attributesToHighlight,
        filter: options.filter,
        highlightPostTag: options.highlightPostTag,
        highlightPreTag: options.highlightPreTag,
        sort: options.sort,
      },
      perIndexLimit,
      0
    );

    const searchResults = await Promise.all(
      definitions.map(async (definition) => {
        const indexName =
          definition.name ??
          buildSearchIndexName(definition.key, this.indexPrefix);
        const index = this.client.index<TDocument>(indexName);
        let response: SearchResponse<TDocument>;

        try {
          response = await index.search<TDocument>(query, searchParams);
        } catch (error) {
          throw new Error(`Unable to search Meilisearch index "${indexName}"`, {
            cause: error,
          });
        }

        return response.hits.map(
          (hit) =>
            ({
              document: hit,
              formatted: extractFormattedDocument(hit),
              id: String(hit.id),
              indexKey: definition.key,
              indexName,
              rankingScore: extractRankingScore(hit),
            }) satisfies SearchResult<TDocument>
        );
      })
    );

    return searchResults
      .flat()
      .sort((left, right) => {
        const leftScore = left.rankingScore ?? Number.NEGATIVE_INFINITY;
        const rightScore = right.rankingScore ?? Number.NEGATIVE_INFINITY;

        if (leftScore !== rightScore) {
          return rightScore - leftScore;
        }

        const indexComparison = left.indexKey.localeCompare(right.indexKey);
        if (indexComparison !== 0) {
          return indexComparison;
        }

        return left.id.localeCompare(right.id);
      })
      .slice(offset, offset + limit);
  }

  async suggest(
    query: string,
    options: Pick<SearchQueryOptions, "indices" | "limit"> = {}
  ): Promise<SearchSuggestion[]> {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length === 0) {
      return [];
    }

    const results = await this.search({
      attributesToHighlight: [],
      indices: options.indices,
      limit: options.limit ?? 10,
      query: normalizedQuery,
    });

    const suggestions = new Map<string, SearchSuggestion>();

    for (const result of results) {
      const text = extractSuggestionText(result.document);

      if (text === null) {
        continue;
      }

      const suggestion = {
        id: result.id,
        indexKey: result.indexKey,
        indexName: result.indexName,
        rankingScore: result.rankingScore,
        text,
      } satisfies SearchSuggestion;

      suggestions.set(`${suggestion.indexKey}:${suggestion.id}`, suggestion);
    }

    return [...suggestions.values()];
  }
}

export const createMeilisearchSearchClient = (
  config: Partial<MeilisearchConfig> = {}
): MeilisearchSearchClient => new MeilisearchSearchClient(config);
