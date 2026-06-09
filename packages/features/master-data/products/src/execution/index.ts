/**
 * Server-only feature execution surface.
 */
import "server-only";

export const productExecutionSurface = {
  name: "products",
} as const;

export const runProductAction = <T>(result: T): T => result;
