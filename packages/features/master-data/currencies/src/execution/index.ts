/**
 * Server-only feature execution surface.
 */
import "server-only";

export const currencyExecutionSurface = {
  name: "currencies",
} as const;

export const runCurrencyAction = <T>(result: T): T => result;
