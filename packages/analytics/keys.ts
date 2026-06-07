import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type AnalyticsKeys = {
  NEXT_PUBLIC_POSTHOG_KEY?: string;
  NEXT_PUBLIC_POSTHOG_HOST?: string;
  NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;
  POSTHOG_API_KEY?: string;
  POSTHOG_HOST?: string;
};

export const keys = (): AnalyticsKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    client: {
      NEXT_PUBLIC_POSTHOG_KEY: z.string().startsWith("phc_").optional(),
      NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
      NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().startsWith("G-").optional(),
    },
    server: {
      POSTHOG_API_KEY: z.string().startsWith("phc_").optional(),
      POSTHOG_HOST: z.string().url().optional(),
    },
    runtimeEnv: {
      NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
      POSTHOG_HOST: process.env.POSTHOG_HOST,
    },
  }) as AnalyticsKeys;

let cachedAnalyticsKeys: AnalyticsKeys | null = null;

export const loadAnalyticsKeys = (): AnalyticsKeys =>
  (cachedAnalyticsKeys ??= keys());
