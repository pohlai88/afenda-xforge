/**
 * Server-only feature execution surface.
 */
import "server-only";

export const orgUnitExecutionSurface = {
  name: "org-units",
} as const;

export const runOrgUnitAction = <T>(result: T): T => result;
