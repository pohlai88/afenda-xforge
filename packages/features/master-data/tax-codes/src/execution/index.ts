/**
 * Server-only feature execution surface.
 */
import "server-only";

export const taxCodeExecutionSurface = {
  name: "tax-codes",
} as const;

export const runTaxCodeAction = <T>(result: T): T => result;
