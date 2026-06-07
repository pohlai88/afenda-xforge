import { ConfigurationError } from "@repo/errors";
import { createClient } from "redis";
import { loadRedisKeys } from "./keys.js";

export type XForgeRedisClient = ReturnType<typeof createClient>;

let cachedRedisClient: XForgeRedisClient | null = null;
let pendingRedisConnection: Promise<XForgeRedisClient> | null = null;

const attachRedisErrorHandler = (client: XForgeRedisClient): void => {
  client.on("error", (error) => {
    console.error("Redis Client Error", error);
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

  pendingRedisConnection = (
    client.isOpen
      ? Promise.resolve(client)
      : client.connect().then(() => client)
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

  return pendingRedisConnection;
};

export const closeRedisClient = async (): Promise<void> => {
  if (!cachedRedisClient?.isOpen) {
    cachedRedisClient = null;
    return;
  }

  await cachedRedisClient.close();
  cachedRedisClient = null;
};
