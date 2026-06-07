import { ConfigurationError } from "@repo/errors";
import type {
  AppLogger,
  LoggerBindings,
  TimedOperationLogLevel,
} from "@repo/logger";
import { createLogger, timeOperation } from "@repo/logger";
import { createClient } from "redis";
import { loadRedisKeys } from "./keys.ts";

export type XForgeRedisClient = ReturnType<typeof createClient>;
export type TimedRedisOperationOptions = {
  client?: XForgeRedisClient;
  logger?: AppLogger;
  logLevel?: TimedOperationLogLevel;
  metadata?: LoggerBindings;
  operation: string;
  resource?: string;
};
export type SendRedisCommandOptions = Omit<
  TimedRedisOperationOptions,
  "operation"
> & {
  operation?: string;
};

let cachedRedisClient: XForgeRedisClient | null = null;
let pendingRedisConnection: Promise<XForgeRedisClient> | null = null;
const redisLogger = createLogger("redis");

const attachRedisErrorHandler = (client: XForgeRedisClient): void => {
  client.on("error", (error) => {
    redisLogger.error(
      {
        error,
      },
      "redis client error"
    );
  });
};

export const createRedisClient = (
  url = loadRedisKeys().REDIS_URL
): XForgeRedisClient => {
  if (!url) {
    throw new ConfigurationError(
      "REDIS_URL is required to create a shared Redis client"
    );
  }

  const client = createClient({
    url,
  });

  attachRedisErrorHandler(client);

  return client;
};

export const getRedisClient = (): Promise<XForgeRedisClient> => {
  if (cachedRedisClient?.isReady) {
    return Promise.resolve(cachedRedisClient);
  }

  if (pendingRedisConnection) {
    return pendingRedisConnection;
  }

  cachedRedisClient ??= createRedisClient();

  const client = cachedRedisClient;

  const connectionPromise = (
    client.isOpen
      ? Promise.resolve(client)
      : timeOperation(
          "redis connect",
          async (): Promise<XForgeRedisClient> => {
            await client.connect();
            return client;
          },
          {
            level: "debug",
            logger: redisLogger,
          }
        )
  )
    .catch((error: unknown) => {
      if (cachedRedisClient === client) {
        cachedRedisClient = null;
      }

      throw error;
    })
    .finally(() => {
      pendingRedisConnection = null;
    });

  pendingRedisConnection = connectionPromise;

  return connectionPromise;
};

export const timeRedisOperation = async <T>(
  run: (client: XForgeRedisClient) => Promise<T>,
  options: TimedRedisOperationOptions
): Promise<T> => {
  const client = options.client ?? (await getRedisClient());

  return timeOperation(`redis ${options.operation}`, () => run(client), {
    failureLevel: "error",
    level: options.logLevel ?? "debug",
    logger: options.logger ?? redisLogger,
    metadata: {
      operation: options.operation,
      resource: options.resource ?? "redis",
      ...options.metadata,
    },
  });
};

export const pingRedis = (
  options: Omit<TimedRedisOperationOptions, "operation"> = {}
): Promise<string> =>
  timeRedisOperation((client) => client.ping(), {
    ...options,
    operation: "ping",
    resource: options.resource ?? "server",
  });

export const sendRedisCommand = <T = unknown>(
  command: string[],
  options: SendRedisCommandOptions = {}
): Promise<T> =>
  timeRedisOperation((client) => client.sendCommand(command) as Promise<T>, {
    ...options,
    operation: options.operation ?? command[0]?.toLowerCase() ?? "command",
    metadata: {
      argumentCount: Math.max(0, command.length - 1),
      command: command[0] ?? "UNKNOWN",
      ...options.metadata,
    },
  });

export const closeRedisClient = async (): Promise<void> => {
  if (!cachedRedisClient?.isOpen) {
    cachedRedisClient = null;
    return;
  }

  await cachedRedisClient.close();
  cachedRedisClient = null;
};
