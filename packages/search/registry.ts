import type { SearchIndexDefinition } from "./types.ts";

const searchIndexRegistry = new Map<string, SearchIndexDefinition>();

const normalizeKey = (key: string): string =>
  key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/_+/g, "_");

const normalizeSearchIndexKey = (key: string, label: string): string => {
  const normalizedKey = normalizeKey(key);

  if (normalizedKey.length === 0 || !/[a-z0-9]/.test(normalizedKey)) {
    throw new Error(
      `${label} must contain at least one ASCII letter or number`
    );
  }

  return normalizedKey;
};

const normalizeSearchIndexDefinition = (
  definition: SearchIndexDefinition
): SearchIndexDefinition => {
  const key = normalizeSearchIndexKey(definition.key, "Search index key");
  const name = definition.name?.trim();

  if (name !== undefined && name.length === 0) {
    throw new Error(`Search index "${key}" has an empty custom name`);
  }

  const normalizedDefinition: SearchIndexDefinition = {
    ...definition,
    key,
  };

  if (name !== undefined) {
    normalizedDefinition.name = name;
  }

  return normalizedDefinition;
};

const cloneSearchIndexDefinition = (
  definition: SearchIndexDefinition
): SearchIndexDefinition => ({
  ...definition,
  displayedAttributes:
    definition.displayedAttributes === undefined
      ? undefined
      : [...definition.displayedAttributes],
  filterableAttributes:
    definition.filterableAttributes === undefined
      ? undefined
      : [...definition.filterableAttributes],
  rankingRules:
    definition.rankingRules === undefined
      ? undefined
      : [...definition.rankingRules],
  searchableAttributes: [...definition.searchableAttributes],
  sortableAttributes:
    definition.sortableAttributes === undefined
      ? undefined
      : [...definition.sortableAttributes],
  stopWords:
    definition.stopWords === undefined ? undefined : [...definition.stopWords],
  synonyms:
    definition.synonyms === undefined
      ? undefined
      : Object.fromEntries(
          Object.entries(definition.synonyms).map(([key, values]) => [
            key,
            [...values],
          ])
        ),
});

const prepareStoredSearchIndexDefinition = (
  definition: SearchIndexDefinition
): SearchIndexDefinition => cloneSearchIndexDefinition(definition);

export const buildSearchIndexName = (key: string, prefix = "xforge"): string =>
  `${normalizeSearchIndexKey(prefix, "Search index prefix")}_${normalizeSearchIndexKey(key, "Search index key")}`;

export const registerSearchIndex = (
  definition: SearchIndexDefinition
): SearchIndexDefinition => {
  const registeredDefinition = prepareStoredSearchIndexDefinition(
    normalizeSearchIndexDefinition(definition)
  );
  const normalizedKey = registeredDefinition.key;

  if (searchIndexRegistry.has(normalizedKey)) {
    throw new Error(`Search index "${normalizedKey}" is already registered`);
  }

  searchIndexRegistry.set(normalizedKey, registeredDefinition);
  return cloneSearchIndexDefinition(registeredDefinition);
};

export const registerSearchIndices = (
  definitions: readonly SearchIndexDefinition[]
): SearchIndexDefinition[] => {
  const preparedDefinitions = definitions.map((definition) =>
    prepareStoredSearchIndexDefinition(
      normalizeSearchIndexDefinition(definition)
    )
  );
  const seenKeys = new Set<string>();

  for (const definition of preparedDefinitions) {
    if (
      seenKeys.has(definition.key) ||
      searchIndexRegistry.has(definition.key)
    ) {
      throw new Error(`Search index "${definition.key}" is already registered`);
    }

    seenKeys.add(definition.key);
  }

  for (const definition of preparedDefinitions) {
    searchIndexRegistry.set(definition.key, definition);
  }

  return preparedDefinitions.map(cloneSearchIndexDefinition);
};

export const getSearchIndexDefinition = (
  key: string
): SearchIndexDefinition | undefined =>
  searchIndexRegistry.get(normalizeKey(key)) &&
  cloneSearchIndexDefinition(
    searchIndexRegistry.get(normalizeKey(key)) as SearchIndexDefinition
  );

export const requireSearchIndexDefinition = (
  key: string
): SearchIndexDefinition => {
  const definition = getSearchIndexDefinition(key);

  if (!definition) {
    throw new Error(`Search index "${normalizeKey(key)}" is not registered`);
  }

  return definition;
};

export const listSearchIndexDefinitions = (): SearchIndexDefinition[] =>
  [...searchIndexRegistry.values()].map(cloneSearchIndexDefinition);

export const clearSearchIndexRegistry = (): void => {
  searchIndexRegistry.clear();
};
