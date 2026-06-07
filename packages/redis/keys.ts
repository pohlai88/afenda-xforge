import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type RedisKeys = {
  readonly REDIS_KEY_PREFIX: string;
  readonly REDIS_URL?: string;
};

export const keys = (): RedisKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      REDIS_KEY_PREFIX: z.string().min(1).default("xforge"),
      REDIS_URL: z.string().url().optional(),
    },
    runtimeEnv: {
      REDIS_KEY_PREFIX: process.env.REDIS_KEY_PREFIX,
      REDIS_URL: process.env.REDIS_URL,
    },
  });

let cachedRedisKeys: RedisKeys | null = null;

export const loadRedisKeys = (): RedisKeys => (cachedRedisKeys ??= keys());

export const hasRedisConfig = (): boolean => Boolean(loadRedisKeys().REDIS_URL);
