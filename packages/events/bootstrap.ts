import "server-only";

import { createLogger } from "@repo/logger";
import { ensureStreams } from "./connection.ts";
import { hasEventsConfig } from "./keys.ts";
import { registerXForgeEventSchemas } from "./schemas.ts";
import { getXForgeStreams } from "./streams.ts";

const logger = createLogger("events.bootstrap");

let bootstrapPromise: Promise<boolean> | null = null;

export const initializeEventsInfrastructure = (): Promise<boolean> => {
  if (!hasEventsConfig()) {
    return Promise.resolve(false);
  }

  bootstrapPromise ??= (async (): Promise<boolean> => {
    registerXForgeEventSchemas();
    await ensureStreams(getXForgeStreams());
    logger.info("events infrastructure initialized");
    return true;
  })().catch((error: unknown) => {
    bootstrapPromise = null;
    logger.error({ error }, "events infrastructure initialization failed");
    throw error;
  });

  return bootstrapPromise;
};
