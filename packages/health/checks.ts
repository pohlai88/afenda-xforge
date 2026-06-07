import "server-only";

import { client as databaseClient } from "@repo/database";
import { getRedisClient, hasRedisConfig } from "@repo/redis";
import type { HealthCheck, HealthCheckResult } from "./manager.js";

export type MemoryCheckOptions = {
  critical?: boolean;
  maxHeapMb?: number;
  timeoutMs?: number;
};

export type RedisCheckOptions = {
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
    await databaseClient`SELECT 1`;
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

    const redisClient = await getRedisClient();
    const response = await redisClient.ping();

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
