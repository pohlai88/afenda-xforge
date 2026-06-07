import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type ObservabilityKeys = Readonly<{
  BETTERSTACK_API_KEY?: string;
  BETTERSTACK_URL?: string;
  NEXT_PUBLIC_SENTRY_DSN?: string;
  VERCEL_DRAIN_SIGNATURE_SECRET?: string;
  SENTRY_ORG?: string;
  SENTRY_PROJECT?: string;
}>;

export const keys = (): ObservabilityKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      BETTERSTACK_API_KEY: z.string().optional(),
      BETTERSTACK_URL: z.url().optional(),
      SENTRY_ORG: z.string().optional(),
      SENTRY_PROJECT: z.string().optional(),
      VERCEL_DRAIN_SIGNATURE_SECRET: z.string().optional(),
    },
    client: {
      NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
    },
    runtimeEnv: {
      BETTERSTACK_API_KEY: process.env.BETTERSTACK_API_KEY,
      BETTERSTACK_URL: process.env.BETTERSTACK_URL,
      SENTRY_ORG: process.env.SENTRY_ORG,
      SENTRY_PROJECT: process.env.SENTRY_PROJECT,
      VERCEL_DRAIN_SIGNATURE_SECRET: process.env.VERCEL_DRAIN_SIGNATURE_SECRET,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
  });

let cachedObservabilityKeys: ObservabilityKeys | null = null;

export const loadObservabilityKeys = (): ObservabilityKeys =>
  (cachedObservabilityKeys ??= keys());
