import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type DatabaseKeys = {
  readonly DATABASE_URL: string;
};

export const keys = (): DatabaseKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      DATABASE_URL: z.string().url(),
    },
    runtimeEnv: {
      DATABASE_URL: process.env.DATABASE_URL,
    },
  });

let cachedDatabaseKeys: DatabaseKeys | null = null;

export const loadDatabaseKeys = (): DatabaseKeys =>
  (cachedDatabaseKeys ??= keys());
