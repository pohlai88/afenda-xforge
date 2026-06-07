import { ConfigurationError } from "@repo/errors";
import type { XForgeRedisClient } from "@repo/redis";
import { getRedisClient, hasRedisConfig, loadRedisKeys } from "@repo/redis";
import { loadRateLimitKeys } from "./keys.js";

export type RateLimitProviderInput = {
  key: string;
  namespace: string;
  limit: number;
  windowSeconds: number;
};

export type RateLimitProviderResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds: number;
};

export type RateLimitProvider = {
  consume: (input: RateLimitProviderInput) => Promise<RateLimitProviderResult>;
};

const createMemoryStorageKey = (input: RateLimitProviderInput): string =>
  [input.namespace, input.limit, input.windowSeconds, input.key].join(":");

const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])
local current = redis.call("INCR", key)

if current == 1 then
  redis.call("PEXPIRE", key, window_ms)
end

local ttl = redis.call("PTTL", key)

if ttl < 0 then
  redis.call("PEXPIRE", key, window_ms)
  ttl = window_ms
end

local remaining = limit - current

if remaining < 0 then
  remaining = 0
end

return { current, remaining, ttl }
`;

export const createNoopRateLimitProvider = (): RateLimitProvider => ({
  consume: async (
    input: RateLimitProviderInput
  ): Promise<RateLimitProviderResult> => ({
    success: true,
    limit: input.limit,
    remaining: input.limit,
    resetAt: new Date(Date.now() + input.windowSeconds * 1000),
    retryAfterSeconds: 0,
  }),
});

export const createMemoryRateLimitProvider = (): RateLimitProvider => {
  const windows = new Map<string, { count: number; resetAt: number }>();

  return {
    consume: (
      input: RateLimitProviderInput
    ): Promise<RateLimitProviderResult> => {
      const storageKey = createMemoryStorageKey(input);
      const now = Date.now();
      const current = windows.get(storageKey);

      if (!current || current.resetAt <= now) {
        const resetAt = now + input.windowSeconds * 1000;
        windows.set(storageKey, { count: 1, resetAt });

        return Promise.resolve({
          success: true,
          limit: input.limit,
          remaining: Math.max(0, input.limit - 1),
          resetAt: new Date(resetAt),
          retryAfterSeconds: 0,
        });
      }

      if (current.count >= input.limit) {
        return Promise.resolve({
          success: false,
          limit: input.limit,
          remaining: 0,
          resetAt: new Date(current.resetAt),
          retryAfterSeconds: Math.max(
            0,
            Math.ceil((current.resetAt - now) / 1000)
          ),
        });
      }

      current.count += 1;

      return Promise.resolve({
        success: true,
        limit: input.limit,
        remaining: Math.max(0, input.limit - current.count),
        resetAt: new Date(current.resetAt),
        retryAfterSeconds: 0,
      });
    },
  };
};

export type RedisRateLimitProviderOptions = {
  client?: XForgeRedisClient;
  prefix?: string;
};

const createRedisRateLimitStorageKey = (
  input: RateLimitProviderInput,
  prefix: string
): string => `${prefix}:rate-limit:${input.namespace}:${input.key}`;

const parseScriptNumber = (value: unknown, field: string): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.length > 0) {
    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  throw new ConfigurationError(
    `Redis rate-limit script returned an invalid ${field} value`
  );
};

export const createRedisRateLimitProvider = (
  options: RedisRateLimitProviderOptions = {}
): RateLimitProvider => {
  const redisKeys = loadRedisKeys();

  if (!(redisKeys.REDIS_URL || options.client)) {
    throw new ConfigurationError(
      "REDIS_URL is required for the Redis rate-limit provider"
    );
  }

  const prefix = options.prefix ?? redisKeys.REDIS_KEY_PREFIX;

  return {
    consume: async (
      input: RateLimitProviderInput
    ): Promise<RateLimitProviderResult> => {
      const client = options.client ?? (await getRedisClient());
      const result = await client.sendCommand([
        "EVAL",
        RATE_LIMIT_SCRIPT,
        "1",
        createRedisRateLimitStorageKey(input, prefix),
        String(input.limit),
        String(input.windowSeconds * 1000),
      ]);

      if (!Array.isArray(result) || result.length < 3) {
        throw new ConfigurationError(
          "Redis rate-limit script returned an unexpected response shape"
        );
      }

      const current = parseScriptNumber(result[0], "current");
      const remaining = parseScriptNumber(result[1], "remaining");
      const ttlMs = parseScriptNumber(result[2], "ttl");
      const resetAt = new Date(Date.now() + ttlMs);

      return {
        success: current <= input.limit,
        limit: input.limit,
        remaining,
        resetAt,
        retryAfterSeconds: Math.max(0, Math.ceil(ttlMs / 1000)),
      };
    },
  };
};

export const createConfiguredRateLimitProvider = (): RateLimitProvider => {
  const env = loadRateLimitKeys();

  if (hasRedisConfig()) {
    return createRedisRateLimitProvider({
      prefix: env.RATE_LIMIT_NAMESPACE,
    });
  }

  return createMemoryRateLimitProvider();
};
