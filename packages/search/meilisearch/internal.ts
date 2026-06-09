import type { SearchParams, Settings } from "meilisearch";
import { ErrorStatusCode, MeiliSearchApiError } from "meilisearch";
import type {
  SearchDocument,
  SearchIndexDefinition,
  SearchQueryOptions,
} from "../types.ts";

export const DEFAULT_SEARCH_ATTRIBUTES_TO_HIGHLIGHT = [
  "title",
  "description",
] as const;

const sortObjectKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, nestedValue]) => [key, sortObjectKeys(nestedValue)])
    );
  }

  return value;
};

export const buildIndexSettings = (
  definition: SearchIndexDefinition
): Settings => {
  const settings: Settings = {
    searchableAttributes: definition.searchableAttributes,
  };

  if (definition.stopWords !== undefined) {
    settings.stopWords = definition.stopWords;
  }

  if (definition.displayedAttributes !== undefined) {
    settings.displayedAttributes = definition.displayedAttributes;
  }

  if (definition.distinctAttribute !== undefined) {
    settings.distinctAttribute = definition.distinctAttribute;
  }

  if (definition.filterableAttributes !== undefined) {
    settings.filterableAttributes = definition.filterableAttributes;
  }

  if (definition.maxTotalHits !== undefined) {
    settings.pagination = {
      maxTotalHits: definition.maxTotalHits,
    };
  }

  if (definition.rankingRules !== undefined) {
    settings.rankingRules = definition.rankingRules;
  }

  if (definition.sortableAttributes !== undefined) {
    settings.sortableAttributes = definition.sortableAttributes;
  }

  if (definition.synonyms !== undefined) {
    settings.synonyms = definition.synonyms;
  }

  return settings;
};

export const buildSettingsSignature = (settings: Settings): string =>
  JSON.stringify(sortObjectKeys(settings));

const formatNumericValidationError = (
  label: string,
  expectation: string,
  received: number
): Error => new Error(`${label} must be ${expectation}. Received ${received}.`);

export const assertPositiveInteger = (value: number, label: string): number => {
  if (!Number.isInteger(value) || value <= 0) {
    throw formatNumericValidationError(label, "a positive integer", value);
  }

  return value;
};

export const assertNonNegativeInteger = (
  value: number,
  label: string
): number => {
  if (!Number.isInteger(value) || value < 0) {
    throw formatNumericValidationError(label, "a non-negative integer", value);
  }

  return value;
};

export const buildSearchParams = (
  options: Pick<
    SearchQueryOptions,
    | "attributesToHighlight"
    | "filter"
    | "highlightPostTag"
    | "highlightPreTag"
    | "sort"
  >,
  limit: number,
  offset: number
): SearchParams => ({
  attributesToHighlight: options.attributesToHighlight ?? [
    ...DEFAULT_SEARCH_ATTRIBUTES_TO_HIGHLIGHT,
  ],
  filter: options.filter,
  highlightPostTag: options.highlightPostTag,
  highlightPreTag: options.highlightPreTag,
  limit,
  offset,
  showRankingScore: true,
  sort: options.sort,
});

export const extractFormattedDocument = <TDocument>(
  document: { _formatted?: Partial<TDocument> } & Record<string, unknown>
): Partial<TDocument> => {
  const formatted = document._formatted;

  if (formatted !== null && typeof formatted === "object") {
    return formatted;
  }

  return {};
};

export const extractRankingScore = (
  document: Record<string, unknown> & {
    _rankingScore?: number;
    _score?: number;
  }
): number | null => {
  const candidate = document._rankingScore ?? document._score;
  return typeof candidate === "number" ? candidate : null;
};

export const extractSuggestionText = (
  document: SearchDocument
): string | null => {
  const candidates = [document.title, document.description];

  for (const candidate of candidates) {
    const normalizedCandidate = candidate?.trim();
    if (normalizedCandidate) {
      return normalizedCandidate;
    }
  }

  return null;
};

export const isMissingIndexError = (error: unknown): boolean =>
  error instanceof MeiliSearchApiError &&
  error.response.status === 404 &&
  (error.cause?.code === ErrorStatusCode.INDEX_NOT_FOUND ||
    error.cause?.code === ErrorStatusCode.INDEX_NOT_ACCESSIBLE);
