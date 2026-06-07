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

const resolveSearchDefinitions = (
  indices?: readonly string[]
): SearchIndexDefinition[] => {
  if (!indices || indices.length === 0) {
    return listSearchIndexDefinitions();
  }

  return indices.map(requireSearchIndexDefinition);
};

const getRankingScore = (document: Record<string, unknown>): number | null => {
  const candidate = document._rankingScore ?? document._score;
  return typeof candidate === "number" ? candidate : null;
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
    const limit = options.limit ?? this.defaultLimit;
    const offset = options.offset ?? 0;
    const definitions = resolveSearchDefinitions(options.indices);
    const attributesToHighlight = options.attributesToHighlight ?? [
      "title",
      "description",
    ];
    const perIndexLimit = Math.max(limit + offset, limit);

    const searchResults = await Promise.all(
      definitions.map(async (definition) => {
        const indexName =
          definition.name ??
          buildSearchIndexName(definition.key, this.indexPrefix);
        const index = this.client.index<TDocument>(indexName);
        const response = (await index.search(options.query, {
          attributesToHighlight,
          filter: options.filter,
          highlightPostTag: options.highlightPostTag,
          highlightPreTag: options.highlightPreTag,
          limit: perIndexLimit,
          offset: 0,
          showRankingScore: true,
          sort: options.sort,
        } as never)) as SearchResponse<TDocument>;

        return response.hits.map((hit) => {
          const document = hit as TDocument & Record<string, unknown>;
          const formatted =
            typeof document._formatted === "object" && document._formatted
              ? (document._formatted as Record<string, unknown>)
              : {};

          return {
            document: hit,
            formatted,
            id: String(hit.id),
            indexKey: definition.key,
            indexName,
            rankingScore: getRankingScore(document),
          } satisfies SearchResult<TDocument>;
        });
      })
    );

    return searchResults
      .flat()
      .sort((left, right) => {
        const leftScore = left.rankingScore ?? 0;
        const rightScore = right.rankingScore ?? 0;
        return rightScore - leftScore;
      })
      .slice(offset, offset + limit);
  }

  async suggest(
    query: string,
    options: Pick<SearchQueryOptions, "indices" | "limit"> = {}
  ): Promise<SearchSuggestion[]> {
    const results = await this.search({
      attributesToHighlight: [],
      indices: options.indices,
      limit: options.limit ?? 10,
      query,
    });

    return results
      .map((result) => {
        let text = "";

        if (typeof result.document.title === "string") {
          text = result.document.title;
        } else if (typeof result.document.description === "string") {
          text = result.document.description;
        }

        if (!text) {
          return null;
        }

        return {
          id: result.id,
          indexKey: result.indexKey,
          indexName: result.indexName,
          rankingScore: result.rankingScore,
          text,
        } satisfies SearchSuggestion;
      })
      .filter(
        (suggestion): suggestion is SearchSuggestion => suggestion !== null
      );
  }
}

export const createMeilisearchSearchClient = (
  config: Partial<MeilisearchConfig> = {}
): MeilisearchSearchClient => new MeilisearchSearchClient(config);
