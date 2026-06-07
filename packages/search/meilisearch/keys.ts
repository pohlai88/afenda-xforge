import "server-only";

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = (): {
  MEILISEARCH_API_KEY?: string;
  MEILISEARCH_DEFAULT_LIMIT: number;
  MEILISEARCH_INDEX_PREFIX: string;
  MEILISEARCH_TIMEOUT_MS: number;
  MEILISEARCH_URL?: string;
} =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      MEILISEARCH_URL: z.string().url().optional(),
      MEILISEARCH_API_KEY: z.string().min(1).optional(),
      MEILISEARCH_INDEX_PREFIX: z.string().min(1).default("xforge"),
      MEILISEARCH_TIMEOUT_MS: z.coerce
        .number()
        .int()
        .positive()
        .default(30_000),
      MEILISEARCH_DEFAULT_LIMIT: z.coerce.number().int().positive().default(20),
    },
    runtimeEnv: {
      MEILISEARCH_URL: process.env.MEILISEARCH_URL,
      MEILISEARCH_API_KEY: process.env.MEILISEARCH_API_KEY,
      MEILISEARCH_INDEX_PREFIX: process.env.MEILISEARCH_INDEX_PREFIX,
      MEILISEARCH_TIMEOUT_MS: process.env.MEILISEARCH_TIMEOUT_MS,
      MEILISEARCH_DEFAULT_LIMIT: process.env.MEILISEARCH_DEFAULT_LIMIT,
    },
  });

export type MeilisearchKeys = ReturnType<typeof keys>;

let cachedMeilisearchKeys: MeilisearchKeys | null = null;

export const loadMeilisearchKeys = (): MeilisearchKeys =>
  (cachedMeilisearchKeys ??= keys());

export const hasMeilisearchConfig = (): boolean =>
  Boolean(loadMeilisearchKeys().MEILISEARCH_URL);
