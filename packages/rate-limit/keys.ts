import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type RateLimitKeys = {
  readonly RATE_LIMIT_DEFAULT_LIMIT: number;
  readonly RATE_LIMIT_DEFAULT_WINDOW_SECONDS: number;
  readonly RATE_LIMIT_NAMESPACE: string;
};

export const keys = (): RateLimitKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      RATE_LIMIT_NAMESPACE: z.string().min(1).default("xforge"),
      RATE_LIMIT_DEFAULT_LIMIT: z.coerce.number().int().positive().default(100),
      RATE_LIMIT_DEFAULT_WINDOW_SECONDS: z.coerce
        .number()
        .int()
        .positive()
        .default(60),
    },
    runtimeEnv: {
      RATE_LIMIT_NAMESPACE: process.env.RATE_LIMIT_NAMESPACE,
      RATE_LIMIT_DEFAULT_LIMIT: process.env.RATE_LIMIT_DEFAULT_LIMIT,
      RATE_LIMIT_DEFAULT_WINDOW_SECONDS:
        process.env.RATE_LIMIT_DEFAULT_WINDOW_SECONDS,
    },
  });

let cachedRateLimitKeys: RateLimitKeys | null = null;

export const loadRateLimitKeys = (): RateLimitKeys =>
  (cachedRateLimitKeys ??= keys());
