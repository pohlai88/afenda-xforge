/**
 * Server-only feature execution surface.
 */
import "server-only";

export const jobPositionExecutionSurface = {
  name: "job-positions",
} as const;

export const runJobPositionAction = <T>(result: T): T => result;
