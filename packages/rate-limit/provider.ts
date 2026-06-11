import { ConfigurationError } from "@repo/errors";
import type { XForgeRedisClient } from "@repo/redis";
import {
  getRedisClient,
  hasRedisConfig,
  loadRedisKeys,
  sendRedisCommand,
} from "@repo/redis";

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
  get: (input: RateLimitProviderInput) => Promise<RateLimitProviderResult>;
  reset: (input: RateLimitProviderInput) => Promise<void>;
};

const createMemoryStorageKey = (input: RateLimitProviderInput): string =>
  [input.namespace, input.limit, input.windowSeconds, input.key].join(":");

const RATE_LIMIT_CONSUME_SCRIPT = `
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

const RATE_LIMIT_GET_SCRIPT = `
local key = KEYS[1]
local current = redis.call("GET", key)
local ttl = redis.call("PTTL", key)

if not current then
  current = 0
else
  current = tonumber(current)
end

return { current, ttl }
`;

const toRateLimitResult = (
  input: RateLimitProviderInput,
  current: number,
  ttlMs: number,
  consumed: boolean
): RateLimitProviderResult => {
  const boundedCurrent = Number.isFinite(current) ? Math.max(0, current) : 0;
  const remaining = Math.max(0, input.limit - boundedCurrent);
  const resolvedTtlMs = ttlMs >= 0 ? ttlMs : input.windowSeconds * 1000;
  const success = consumed
    ? boundedCurrent <= input.limit
    : boundedCurrent < input.limit;

  return {
    success,
    limit: input.limit,
    remaining,
    resetAt: new Date(Date.now() + resolvedTtlMs),
    retryAfterSeconds:
      success || remaining > 0
        ? 0
        : Math.max(0, Math.ceil(resolvedTtlMs / 1000)),
  };
};

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
  get: async (
    input: RateLimitProviderInput
  ): Promise<RateLimitProviderResult> => ({
    success: true,
    limit: input.limit,
    remaining: input.limit,
    resetAt: new Date(Date.now() + input.windowSeconds * 1000),
    retryAfterSeconds: 0,
  }),
  reset: (): Promise<void> => Promise.resolve(),
});

export const createMemoryRateLimitProvider = (): RateLimitProvider => {
  const windows = new Map<string, { count: number; resetAt: number }>();

  const read = (
    input: RateLimitProviderInput,
    consumed: boolean
  ): RateLimitProviderResult => {
    const storageKey = createMemoryStorageKey(input);
    const now = Date.now();
    const current = windows.get(storageKey);

    if (!current || current.resetAt <= now) {
      windows.delete(storageKey);
      return toRateLimitResult(input, 0, input.windowSeconds * 1000, consumed);
    }

    return toRateLimitResult(
      input,
      current.count,
      current.resetAt - now,
      consumed
    );
  };

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
    get: (input: RateLimitProviderInput): Promise<RateLimitProviderResult> =>
      Promise.resolve(read(input, false)),
    reset: (input: RateLimitProviderInput): Promise<void> => {
      windows.delete(createMemoryStorageKey(input));
      return Promise.resolve();
    },
  };
};

export type RedisRateLimitProviderOptions = {
  client?: XForgeRedisClient;
  prefix?: string;
};

export type ConfiguredRateLimitProviderOptions =
  RedisRateLimitProviderOptions & {
    allowMemoryFallback?: boolean;
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
      const result = await sendRedisCommand(
        [
          "EVAL",
          RATE_LIMIT_CONSUME_SCRIPT,
          "1",
          createRedisRateLimitStorageKey(input, prefix),
          String(input.limit),
          String(input.windowSeconds * 1000),
        ],
        {
          client,
          logLevel: "debug",
          metadata: {
            limit: input.limit,
            namespace: input.namespace,
            windowSeconds: input.windowSeconds,
          },
          operation: "rate-limit consume",
          resource: "rate-limit",
        }
      );

      if (!Array.isArray(result) || result.length < 3) {
        throw new ConfigurationError(
          "Redis rate-limit script returned an unexpected response shape"
        );
      }

      const current = parseScriptNumber(result[0], "current");
      const remaining = parseScriptNumber(result[1], "remaining");
      const ttlMs = parseScriptNumber(result[2], "ttl");

      return {
        success: current <= input.limit,
        limit: input.limit,
        remaining,
        resetAt: new Date(Date.now() + ttlMs),
        retryAfterSeconds:
          current <= input.limit ? 0 : Math.max(0, Math.ceil(ttlMs / 1000)),
      };
    },
    get: async (
      input: RateLimitProviderInput
    ): Promise<RateLimitProviderResult> => {
      const client = options.client ?? (await getRedisClient());
      const result = await sendRedisCommand(
        [
          "EVAL",
          RATE_LIMIT_GET_SCRIPT,
          "1",
          createRedisRateLimitStorageKey(input, prefix),
        ],
        {
          client,
          logLevel: "debug",
          metadata: {
            limit: input.limit,
            namespace: input.namespace,
            windowSeconds: input.windowSeconds,
          },
          operation: "rate-limit get",
          resource: "rate-limit",
        }
      );

      if (!Array.isArray(result) || result.length < 2) {
        throw new ConfigurationError(
          "Redis rate-limit script returned an unexpected response shape"
        );
      }

      const current = parseScriptNumber(result[0], "current");
      const ttlMs = parseScriptNumber(result[1], "ttl");

      return toRateLimitResult(input, current, ttlMs, false);
    },
    reset: async (input: RateLimitProviderInput): Promise<void> => {
      const client = options.client ?? (await getRedisClient());

      await sendRedisCommand(
        ["DEL", createRedisRateLimitStorageKey(input, prefix)],
        {
          client,
          logLevel: "debug",
          metadata: {
            limit: input.limit,
            namespace: input.namespace,
            windowSeconds: input.windowSeconds,
          },
          operation: "rate-limit reset",
          resource: "rate-limit",
        }
      );
    },
  };
};

export const createConfiguredRateLimitProvider = (
  options: ConfiguredRateLimitProviderOptions = {}
): RateLimitProvider => {
  if (hasRedisConfig() || options.client) {
    return createRedisRateLimitProvider(options);
  }

  const allowMemoryFallback =
    options.allowMemoryFallback ?? process.env.NODE_ENV !== "production";

  if (!allowMemoryFallback) {
    throw new ConfigurationError(
      "Redis-backed rate limiting is required in production unless allowMemoryFallback is explicitly enabled"
    );
  }

  return createMemoryRateLimitProvider();
};
