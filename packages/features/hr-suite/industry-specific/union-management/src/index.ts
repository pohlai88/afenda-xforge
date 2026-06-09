/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateUnionManagementInput,
  UnionManagementRecord,
  ListUnionManagementQuery,
  UpdateUnionManagementInput,
} from "./contract.ts";
export { unionManagementExecutionSurface } from "./execution/index.ts";
export { unionManagementManifest } from "./manifest.ts";
export { unionManagementMetadata } from "./metadata.ts";
export {
  createUnionManagement,
  getUnionManagement,
  listUnionManagement,
  unionManagementRouteContracts,
  updateUnionManagement,
} from "./server.ts";
export { unionManagementFeatureScope } from "./shared/index.ts";
