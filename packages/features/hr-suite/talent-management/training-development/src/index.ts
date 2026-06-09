/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateTrainingDevelopmentInput,
  ListTrainingDevelopmentQuery,
  TrainingDevelopmentRecord,
  UpdateTrainingDevelopmentInput,
} from "./contract.ts";
export { trainingDevelopmentExecutionSurface } from "./execution/index.ts";
export { trainingDevelopmentManifest } from "./manifest.ts";
export { trainingDevelopmentMetadata } from "./metadata.ts";
export {
  createTrainingDevelopment,
  getTrainingDevelopment,
  listTrainingDevelopment,
  trainingDevelopmentRouteContracts,
  updateTrainingDevelopment,
} from "./server.ts";
export { trainingDevelopmentFeatureScope } from "./shared/index.ts";
