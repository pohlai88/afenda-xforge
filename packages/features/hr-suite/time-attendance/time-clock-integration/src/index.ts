/**
 * Server-only public door for the feature package.
 *
 * This package exposes the governed time-clock-integration contracts and
 * surfaces extracted from the legacy HR suite module.
 */
import "server-only";

export type {
  CreateTimeClockIntegrationInput,
  HrTimeClockCapability,
  HrTimeClockRoutePath,
  ListTimeClockIntegrationQuery,
  TimeClockIntegrationRecord,
  UpdateTimeClockIntegrationInput,
} from "./contract.ts";
export { timeClockIntegrationExecutionSurface } from "./execution/index.ts";
export { timeClockIntegrationManifest } from "./manifest.ts";
export { timeClockIntegrationMetadata } from "./metadata.ts";
export {
  createTimeClockIntegration,
  getTimeClockIntegration,
  hrTimeClockCapabilities,
  hrTimeClockReadPermission,
  hrTimeClockRoutePaths,
  listTimeClockIntegration,
  timeClockIntegrationFeatureId,
  timeClockIntegrationRouteContracts,
  updateTimeClockIntegration,
} from "./server.ts";
export { timeClockIntegrationFeatureScope } from "./shared/index.ts";
