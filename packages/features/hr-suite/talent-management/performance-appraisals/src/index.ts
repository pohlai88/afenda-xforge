/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreatePerformanceAppraisalsInput,
  PerformanceAppraisalsRecord,
  ListPerformanceAppraisalsQuery,
  UpdatePerformanceAppraisalsInput,
} from "./contract.ts";
export { performanceAppraisalsExecutionSurface } from "./execution/index.ts";
export { performanceAppraisalsManifest } from "./manifest.ts";
export { performanceAppraisalsMetadata } from "./metadata.ts";
export {
  createPerformanceAppraisals,
  getPerformanceAppraisals,
  listPerformanceAppraisals,
  performanceAppraisalsRouteContracts,
  updatePerformanceAppraisals,
} from "./server.ts";
export { performanceAppraisalsFeatureScope } from "./shared/index.ts";
