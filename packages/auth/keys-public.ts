import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type PublicAuthKeys = {
  readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly NEXT_PUBLIC_SUPABASE_URL?: string;
};

const publicKeys = (): PublicAuthKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    client: {
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
      NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    },
    runtimeEnv: {
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
  });

let cachedPublicAuthKeys: PublicAuthKeys | null = null;

export const loadPublicAuthKeys = (): PublicAuthKeys =>
  (cachedPublicAuthKeys ??= publicKeys());
