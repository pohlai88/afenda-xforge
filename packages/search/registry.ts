import type { SearchIndexDefinition } from "./types.ts";

const searchIndexRegistry = new Map<string, SearchIndexDefinition>();

const normalizeKey = (key: string): string =>
  key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/_+/g, "_");

export const buildSearchIndexName = (key: string, prefix = "xforge"): string =>
  `${normalizeKey(prefix)}_${normalizeKey(key)}`;

export const registerSearchIndex = (
  definition: SearchIndexDefinition
): SearchIndexDefinition => {
  const normalizedKey = normalizeKey(definition.key);

  if (searchIndexRegistry.has(normalizedKey)) {
    throw new Error(`Search index "${normalizedKey}" is already registered`);
  }

  const registeredDefinition: SearchIndexDefinition = {
    ...definition,
    key: normalizedKey,
  };

  searchIndexRegistry.set(normalizedKey, registeredDefinition);
  return registeredDefinition;
};

export const registerSearchIndices = (
  definitions: readonly SearchIndexDefinition[]
): SearchIndexDefinition[] => definitions.map(registerSearchIndex);

export const getSearchIndexDefinition = (
  key: string
): SearchIndexDefinition | undefined =>
  searchIndexRegistry.get(normalizeKey(key));

export const requireSearchIndexDefinition = (
  key: string
): SearchIndexDefinition => {
  const definition = getSearchIndexDefinition(key);

  if (!definition) {
    throw new Error(`Search index "${normalizeKey(key)}" is not registered`);
  }

  return definition;
};

export const listSearchIndexDefinitions = (): SearchIndexDefinition[] => [
  ...searchIndexRegistry.values(),
];

export const clearSearchIndexRegistry = (): void => {
  searchIndexRegistry.clear();
};
