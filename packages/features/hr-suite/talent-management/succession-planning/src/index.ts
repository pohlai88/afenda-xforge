/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateSuccessionPlanningInput,
  SuccessionPlanningRecord,
  ListSuccessionPlanningQuery,
  UpdateSuccessionPlanningInput,
} from "./contract.ts";
export { successionPlanningExecutionSurface } from "./execution/index.ts";
export { successionPlanningManifest } from "./manifest.ts";
export { successionPlanningMetadata } from "./metadata.ts";
export {
  createSuccessionPlanning,
  getSuccessionPlanning,
  listSuccessionPlanning,
  successionPlanningRouteContracts,
  updateSuccessionPlanning,
} from "./server.ts";
export { successionPlanningFeatureScope } from "./shared/index.ts";
