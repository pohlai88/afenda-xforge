export * from "./meilisearch/index.ts";
export {
  buildSearchIndexName,
  clearSearchIndexRegistry,
  getSearchIndexDefinition,
  listSearchIndexDefinitions,
  registerSearchIndex,
  registerSearchIndices,
  requireSearchIndexDefinition,
} from "./registry.ts";
export type {
  MeilisearchConfig,
  SearchDocument,
  SearchIndexDefinition,
  SearchIndexStats,
  SearchQueryOptions,
  SearchResult,
  SearchSuggestion,
} from "./types.ts";
