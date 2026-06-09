/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateLearningManagementSystemLmsInput,
  LearningManagementSystemLmsRecord,
  ListLearningManagementSystemLmsQuery,
  UpdateLearningManagementSystemLmsInput,
} from "./contract.ts";
export { learningManagementSystemLmsExecutionSurface } from "./execution/index.ts";
export { learningManagementSystemLmsManifest } from "./manifest.ts";
export { learningManagementSystemLmsMetadata } from "./metadata.ts";
export {
  createLearningManagementSystemLms,
  getLearningManagementSystemLms,
  listLearningManagementSystemLms,
  learningManagementSystemLmsRouteContracts,
  updateLearningManagementSystemLms,
} from "./server.ts";
export { learningManagementSystemLmsFeatureScope } from "./shared/index.ts";
