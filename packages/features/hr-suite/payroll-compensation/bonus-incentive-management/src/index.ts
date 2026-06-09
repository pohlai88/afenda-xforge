/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateBonusIncentiveManagementInput,
  BonusIncentiveManagementRecord,
  ListBonusIncentiveManagementQuery,
  UpdateBonusIncentiveManagementInput,
} from "./contract.ts";
export { bonusIncentiveManagementExecutionSurface } from "./execution/index.ts";
export { bonusIncentiveManagementManifest } from "./manifest.ts";
export { bonusIncentiveManagementMetadata } from "./metadata.ts";
export {
  createBonusIncentiveManagement,
  getBonusIncentiveManagement,
  listBonusIncentiveManagement,
  bonusIncentiveManagementRouteContracts,
  updateBonusIncentiveManagement,
} from "./server.ts";
export { bonusIncentiveManagementFeatureScope } from "./shared/index.ts";
