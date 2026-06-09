/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateFoodHandlerCertificationHealthComplianceInput,
  FoodHandlerCertificationHealthComplianceRecord,
  ListFoodHandlerCertificationHealthComplianceQuery,
  UpdateFoodHandlerCertificationHealthComplianceInput,
} from "./contract.ts";
export { foodHandlerCertificationHealthComplianceExecutionSurface } from "./execution/index.ts";
export { foodHandlerCertificationHealthComplianceManifest } from "./manifest.ts";
export { foodHandlerCertificationHealthComplianceMetadata } from "./metadata.ts";
export {
  createFoodHandlerCertificationHealthCompliance,
  getFoodHandlerCertificationHealthCompliance,
  listFoodHandlerCertificationHealthCompliance,
  foodHandlerCertificationHealthComplianceRouteContracts,
  updateFoodHandlerCertificationHealthCompliance,
} from "./server.ts";
export { foodHandlerCertificationHealthComplianceFeatureScope } from "./shared/index.ts";
