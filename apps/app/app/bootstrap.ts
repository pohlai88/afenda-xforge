import "server-only";

import { initializeEventsInfrastructure } from "@repo/events/bootstrap";
import { createLogger } from "@repo/logger";
import { healthManager } from "./api/health/_manager";

const logger = createLogger("app.bootstrap");

let appBootstrapPromise: Promise<void> | null = null;

export const ensureAppBootstrap = (): Promise<void> => {
  appBootstrapPromise ??= (async (): Promise<void> => {
    try {
      await initializeEventsInfrastructure();
      healthManager.markReady();
    } catch (error: unknown) {
      appBootstrapPromise = null;
      healthManager.markNotReady();
      logger.error({ error }, "app infrastructure bootstrap failed");
    }
  })();

  return appBootstrapPromise;
};
