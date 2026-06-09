/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateGovernmentClassificationPayGradesInput,
  GovernmentClassificationPayGradesRecord,
  ListGovernmentClassificationPayGradesQuery,
  UpdateGovernmentClassificationPayGradesInput,
} from "./contract.ts";
export { governmentClassificationPayGradesExecutionSurface } from "./execution/index.ts";
export { governmentClassificationPayGradesManifest } from "./manifest.ts";
export { governmentClassificationPayGradesMetadata } from "./metadata.ts";
export {
  createGovernmentClassificationPayGrades,
  getGovernmentClassificationPayGrades,
  governmentClassificationPayGradesRouteContracts,
  listGovernmentClassificationPayGrades,
  updateGovernmentClassificationPayGrades,
} from "./server.ts";
export { governmentClassificationPayGradesFeatureScope } from "./shared/index.ts";
