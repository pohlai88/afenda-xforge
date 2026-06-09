/**
 * Server-only public door for the feature package.
 */
import "server-only";

export type {
  CreateJobPositionBody,
  JobPosition,
  JobPositionList,
  JobPositionStatus,
  ListJobPositionsQuery,
} from "./contract.ts";
export { jobPositionExecutionSurface } from "./execution/index.ts";
export { jobPositionFeatureManifest } from "./manifest.ts";
export { jobPositionMetadata } from "./metadata.ts";
export {
  createJobPosition,
  createJobPositionRouteContract,
  jobPositionOpenApiSchemas,
  jobPositionRouteContracts,
  listJobPositions,
  listJobPositionsRouteContract,
  registerJobPositionOpenApi,
} from "./server.ts";
export { jobPositionFeatureKey } from "./shared/index.ts";
