export type SearchDocument = {
  id: string | number;
  tenantId: string;
  companyId?: string | null;
  title?: string;
  description?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

export type SearchIndexDefinition = {
  key: string;
  name?: string;
  primaryKey?: string;
  searchableAttributes: string[];
  filterableAttributes?: string[];
  sortableAttributes?: string[];
  displayedAttributes?: string[];
  rankingRules?: string[];
  stopWords?: string[];
  synonyms?: Record<string, string[]>;
  distinctAttribute?: string;
  maxTotalHits?: number;
};

export type SearchQueryOptions = {
  query: string;
  indices?: string[];
  filter?: string | string[];
  sort?: string[];
  limit?: number;
  offset?: number;
  attributesToHighlight?: string[];
  highlightPreTag?: string;
  highlightPostTag?: string;
};

export type SearchResult<TDocument extends SearchDocument = SearchDocument> = {
  id: string;
  indexKey: string;
  indexName: string;
  document: TDocument;
  formatted: Partial<TDocument>;
  rankingScore: number | null;
};

export type SearchSuggestion = {
  id: string;
  indexKey: string;
  indexName: string;
  text: string;
  rankingScore: number | null;
};

export type SearchIndexStats = {
  indexKey: string;
  indexName: string;
  numberOfDocuments: number;
  isIndexing: boolean;
  fieldDistribution: Record<string, number>;
};

export type MeilisearchConfig = {
  host: string;
  apiKey?: string;
  timeoutMs?: number;
  indexPrefix?: string;
  defaultLimit?: number;
};
