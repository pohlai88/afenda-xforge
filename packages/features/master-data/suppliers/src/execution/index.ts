/**
 * Server-only feature execution surface.
 */
import "server-only";

export const supplierExecutionSurface = {
  name: "suppliers",
} as const;

export const runSupplierAction = <T>(result: T): T => result;
