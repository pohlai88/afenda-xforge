/**
 * Server-only feature execution surface.
 */
import "server-only";

export const locationExecutionSurface = {
  name: "locations",
} as const;

export const runLocationAction = <T>(result: T): T => result;
