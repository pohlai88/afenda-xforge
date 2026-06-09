/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  BonusIncentiveManagementRecord,
  CreateBonusIncentiveManagementInput,
  ListBonusIncentiveManagementQuery,
  UpdateBonusIncentiveManagementInput,
} from "./contract.ts";
export { bonusIncentiveManagementExecutionSurface } from "./execution/index.ts";
export { bonusIncentiveManagementManifest } from "./manifest.ts";
export { bonusIncentiveManagementMetadata } from "./metadata.ts";
export {
  bonusIncentiveManagementRouteContracts,
  createBonusIncentiveManagement,
  getBonusIncentiveManagement,
  listBonusIncentiveManagement,
  updateBonusIncentiveManagement,
} from "./server.ts";
export { bonusIncentiveManagementFeatureScope } from "./shared/index.ts";
