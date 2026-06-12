import "server-only";

import { loadDatabaseKeys } from "@repo/database/keys";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const postgresReadAdapterSchema = z.enum(["neon", "supabase-postgrest"]);

export const keys = (): {
  DATABASE_URL?: string;
  SEARCH_POSTGRES_READ_ADAPTER: "neon" | "supabase-postgrest";
  SEARCH_POSTGRES_WRITE_ADAPTER: "neon";
  SEARCH_PROVIDER: "postgres" | "meilisearch";
  SEARCH_POSTGREST_URL?: string;
  SEARCH_POSTGREST_KEY?: string;
} => {
  const databaseKeys = loadDatabaseKeys();
  const searchEnv = createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      SEARCH_PROVIDER: z.enum(["postgres", "meilisearch"]).default("postgres"),
      SEARCH_POSTGRES_WRITE_ADAPTER: z.literal("neon").default("neon"),
      SEARCH_POSTGRES_READ_ADAPTER: postgresReadAdapterSchema.default("neon"),
      SEARCH_POSTGREST_URL: z.string().url().optional(),
      SEARCH_POSTGREST_KEY: z.string().min(1).optional(),
    },
    runtimeEnv: {
      SEARCH_PROVIDER: process.env.SEARCH_PROVIDER,
      SEARCH_POSTGRES_WRITE_ADAPTER: process.env.SEARCH_POSTGRES_WRITE_ADAPTER,
      SEARCH_POSTGRES_READ_ADAPTER: process.env.SEARCH_POSTGRES_READ_ADAPTER,
      SEARCH_POSTGREST_URL: process.env.SEARCH_POSTGREST_URL,
      SEARCH_POSTGREST_KEY: process.env.SEARCH_POSTGREST_KEY,
    },
  });

  return {
    DATABASE_URL: databaseKeys.DATABASE_URL,
    SEARCH_POSTGRES_READ_ADAPTER: searchEnv.SEARCH_POSTGRES_READ_ADAPTER,
    SEARCH_POSTGRES_WRITE_ADAPTER: searchEnv.SEARCH_POSTGRES_WRITE_ADAPTER,
    SEARCH_PROVIDER: searchEnv.SEARCH_PROVIDER,
    SEARCH_POSTGREST_URL: searchEnv.SEARCH_POSTGREST_URL,
    SEARCH_POSTGREST_KEY: searchEnv.SEARCH_POSTGREST_KEY,
  };
};

export type PostgresSearchKeys = ReturnType<typeof keys>;

let cachedPostgresSearchKeys: PostgresSearchKeys | null = null;

export const loadPostgresSearchKeys = (): PostgresSearchKeys =>
  (cachedPostgresSearchKeys ??= keys());

export const resetPostgresSearchKeysCache = (): void => {
  cachedPostgresSearchKeys = null;
};

export const hasPostgresSearchConfig = (): boolean =>
  Boolean(loadPostgresSearchKeys().DATABASE_URL);

export const hasPostgresPostgrestReadConfig = (): boolean => {
  const config = loadPostgresSearchKeys();

  return Boolean(config.SEARCH_POSTGREST_URL && config.SEARCH_POSTGREST_KEY);
};

export const resolveSearchProvider = (): "postgres" | "meilisearch" => {
  const configured = loadPostgresSearchKeys().SEARCH_PROVIDER;

  if (configured === "meilisearch") {
    return "meilisearch";
  }

  return "postgres";
};
