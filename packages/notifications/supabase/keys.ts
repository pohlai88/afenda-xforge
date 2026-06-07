import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = (): {
  NEXT_PUBLIC_SUPABASE_NOTIFICATIONS_CHANNEL_PREFIX?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_NOTIFICATIONS_EDGE_FUNCTION?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
} =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      SUPABASE_NOTIFICATIONS_EDGE_FUNCTION: z.string().min(1).optional(),
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    },
    client: {
      NEXT_PUBLIC_SUPABASE_NOTIFICATIONS_CHANNEL_PREFIX: z
        .string()
        .min(1)
        .optional(),
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
      NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    },
    runtimeEnv: {
      NEXT_PUBLIC_SUPABASE_NOTIFICATIONS_CHANNEL_PREFIX:
        process.env.NEXT_PUBLIC_SUPABASE_NOTIFICATIONS_CHANNEL_PREFIX,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_NOTIFICATIONS_EDGE_FUNCTION:
        process.env.SUPABASE_NOTIFICATIONS_EDGE_FUNCTION,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });

export type SupabaseNotificationsKeys = ReturnType<typeof keys>;

let cachedSupabaseNotificationsKeys: SupabaseNotificationsKeys | null = null;

export const loadSupabaseNotificationsKeys = (): SupabaseNotificationsKeys =>
  (cachedSupabaseNotificationsKeys ??= keys());
