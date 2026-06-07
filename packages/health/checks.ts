import "server-only";

import { getConnection, hasEventsConfig } from "@repo/events";
import { hasRedisConfig, pingRedis } from "@repo/redis";
import type { HealthCheck, HealthCheckResult } from "./manager.ts";

export type MemoryCheckOptions = {
  critical?: boolean;
  maxHeapMb?: number;
  timeoutMs?: number;
};

export type RedisCheckOptions = {
  critical?: boolean;
  timeoutMs?: number;
};

export type NatsCheckOptions = {
  critical?: boolean;
  timeoutMs?: number;
};

export const createDatabaseCheck = (
  options: { critical?: boolean; timeoutMs?: number } = {}
): HealthCheck => ({
  name: "database",
  critical: options.critical ?? true,
  timeoutMs: options.timeoutMs ?? 3000,
  check: async (): Promise<HealthCheckResult> => {
    const { pingDatabase } = await import("@repo/database");

    await pingDatabase();
    return { healthy: true };
  },
});

export const createRedisCheck = (
  options: RedisCheckOptions = {}
): HealthCheck => ({
  name: "redis",
  critical: options.critical ?? false,
  timeoutMs: options.timeoutMs ?? 3000,
  check: async (): Promise<HealthCheckResult> => {
    if (!hasRedisConfig()) {
      return {
        healthy: true,
        details: {
          configured: false,
        },
        message: "Redis is not configured",
      };
    }

    const response = await pingRedis({
      metadata: {
        check: "health",
      },
      resource: "health",
    });

    return {
      healthy: response === "PONG",
      details: {
        configured: true,
        response,
      },
      message:
        response === "PONG" ? undefined : "Unexpected Redis ping response",
    };
  },
});

export const createNatsCheck = (
  options: NatsCheckOptions = {}
): HealthCheck => ({
  name: "nats",
  critical: options.critical ?? false,
  timeoutMs: options.timeoutMs ?? 3000,
  check: async (): Promise<HealthCheckResult> => {
    if (!hasEventsConfig()) {
      return {
        healthy: true,
        details: {
          configured: false,
        },
        message: "NATS is not configured",
      };
    }

    const connection = await getConnection();

    return {
      healthy: !connection.isClosed(),
      details: {
        configured: true,
        server: connection.getServer(),
      },
      message: connection.isClosed() ? "NATS connection is closed" : undefined,
    };
  },
});

export const createMemoryCheck = (
  options: MemoryCheckOptions = {}
): HealthCheck => ({
  name: "memory",
  critical: options.critical ?? false,
  timeoutMs: options.timeoutMs ?? 1000,
  check: (): Promise<HealthCheckResult> => {
    const heapUsedMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const maxHeapMb = options.maxHeapMb ?? 512;

    return Promise.resolve({
      healthy: heapUsedMb < maxHeapMb,
      details: {
        heapUsedMb,
        maxHeapMb,
      },
      message:
        heapUsedMb < maxHeapMb
          ? undefined
          : `Heap usage is high: ${heapUsedMb}MB / ${maxHeapMb}MB`,
    });
  },
});
