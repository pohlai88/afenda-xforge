import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type SupabaseStorageKeys = {
  readonly SUPABASE_STORAGE_BUCKET?: string;
  readonly SUPABASE_STORAGE_SERVICE_ROLE_KEY?: string;
  readonly SUPABASE_STORAGE_URL?: string;
};

export const keys = (): SupabaseStorageKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      SUPABASE_STORAGE_BUCKET: z.string().min(1).optional(),
      SUPABASE_STORAGE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
      SUPABASE_STORAGE_URL: z.string().url().optional(),
    },
    runtimeEnv: {
      SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
      SUPABASE_STORAGE_SERVICE_ROLE_KEY:
        process.env.SUPABASE_STORAGE_SERVICE_ROLE_KEY,
      SUPABASE_STORAGE_URL: process.env.SUPABASE_STORAGE_URL,
    },
  });

let cachedSupabaseStorageKeys: SupabaseStorageKeys | null = null;

export const loadSupabaseStorageKeys = (): SupabaseStorageKeys =>
  (cachedSupabaseStorageKeys ??= keys());
