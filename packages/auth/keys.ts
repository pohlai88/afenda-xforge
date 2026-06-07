import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type AuthKeys = {
  readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly NEXT_PUBLIC_SUPABASE_URL?: string;
  readonly SUPABASE_SERVICE_ROLE_KEY?: string;
};

export const keys = (): AuthKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    },
    client: {
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
      NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    },
    runtimeEnv: {
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });

let cachedAuthKeys: AuthKeys | null = null;

export const loadAuthKeys = (): AuthKeys => (cachedAuthKeys ??= keys());
