import "server-only";

import { Meilisearch } from "meilisearch";
import type { MeilisearchConfig } from "../types.ts";
import { loadMeilisearchKeys } from "./keys.ts";

let cachedClient: Meilisearch | null = null;

const resolveConfig = (
  overrides: Partial<MeilisearchConfig> = {}
): MeilisearchConfig => {
  const {
    MEILISEARCH_API_KEY,
    MEILISEARCH_DEFAULT_LIMIT,
    MEILISEARCH_INDEX_PREFIX,
    MEILISEARCH_TIMEOUT_MS,
    MEILISEARCH_URL,
  } = loadMeilisearchKeys();

  const host = overrides.host ?? MEILISEARCH_URL;

  if (!host) {
    throw new Error(
      "MEILISEARCH_URL is required to create the shared search client"
    );
  }

  return {
    apiKey: overrides.apiKey ?? MEILISEARCH_API_KEY,
    defaultLimit: overrides.defaultLimit ?? MEILISEARCH_DEFAULT_LIMIT,
    host,
    indexPrefix: overrides.indexPrefix ?? MEILISEARCH_INDEX_PREFIX,
    timeoutMs: overrides.timeoutMs ?? MEILISEARCH_TIMEOUT_MS,
  };
};

export const createMeilisearchClient = (
  overrides: Partial<MeilisearchConfig> = {}
): Meilisearch => {
  const config = resolveConfig(overrides);

  return new Meilisearch({
    apiKey: config.apiKey,
    host: config.host,
    timeout: config.timeoutMs,
  });
};

export const getMeilisearchClient = (
  overrides?: Partial<MeilisearchConfig>
): Meilisearch => {
  if (overrides && Object.keys(overrides).length > 0) {
    return createMeilisearchClient(overrides);
  }

  cachedClient ??= createMeilisearchClient();
  return cachedClient;
};

export const getMeilisearchConfig = (
  overrides: Partial<MeilisearchConfig> = {}
): MeilisearchConfig => resolveConfig(overrides);
