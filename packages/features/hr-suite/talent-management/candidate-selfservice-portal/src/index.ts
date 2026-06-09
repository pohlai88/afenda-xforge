/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CandidateSelfservicePortalRecord,
  CreateCandidateSelfservicePortalInput,
  ListCandidateSelfservicePortalQuery,
  UpdateCandidateSelfservicePortalInput,
} from "./contract.ts";
export { candidateSelfservicePortalExecutionSurface } from "./execution/index.ts";
export { candidateSelfservicePortalManifest } from "./manifest.ts";
export { candidateSelfservicePortalMetadata } from "./metadata.ts";
export {
  candidateSelfservicePortalRouteContracts,
  createCandidateSelfservicePortal,
  getCandidateSelfservicePortal,
  listCandidateSelfservicePortal,
  updateCandidateSelfservicePortal,
} from "./server.ts";
export { candidateSelfservicePortalFeatureScope } from "./shared/index.ts";
