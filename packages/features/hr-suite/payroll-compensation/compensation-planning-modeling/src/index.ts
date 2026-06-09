/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CompensationPlanningModelingRecord,
  CreateCompensationPlanningModelingInput,
  ListCompensationPlanningModelingQuery,
  UpdateCompensationPlanningModelingInput,
} from "./contract.ts";
export { compensationPlanningModelingExecutionSurface } from "./execution/index.ts";
export { compensationPlanningModelingManifest } from "./manifest.ts";
export { compensationPlanningModelingMetadata } from "./metadata.ts";
export {
  compensationPlanningModelingRouteContracts,
  createCompensationPlanningModeling,
  getCompensationPlanningModeling,
  listCompensationPlanningModeling,
  updateCompensationPlanningModeling,
} from "./server.ts";
export { compensationPlanningModelingFeatureScope } from "./shared/index.ts";
