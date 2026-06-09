/**
 * Server-only feature execution surface.
 */
import "server-only";

export const departmentExecutionSurface = {
  name: "departments",
} as const;

export const runDepartmentAction = <T>(result: T): T => result;
