/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateManufacturingSafetyTrainingOshaComplianceInput,
  ListManufacturingSafetyTrainingOshaComplianceQuery,
  ManufacturingSafetyTrainingOshaComplianceRecord,
  UpdateManufacturingSafetyTrainingOshaComplianceInput,
} from "./contract.ts";
export { manufacturingSafetyTrainingOshaComplianceExecutionSurface } from "./execution/index.ts";
export { manufacturingSafetyTrainingOshaComplianceManifest } from "./manifest.ts";
export { manufacturingSafetyTrainingOshaComplianceMetadata } from "./metadata.ts";
export {
  createManufacturingSafetyTrainingOshaCompliance,
  getManufacturingSafetyTrainingOshaCompliance,
  listManufacturingSafetyTrainingOshaCompliance,
  manufacturingSafetyTrainingOshaComplianceRouteContracts,
  updateManufacturingSafetyTrainingOshaCompliance,
} from "./server.ts";
export { manufacturingSafetyTrainingOshaComplianceFeatureScope } from "./shared/index.ts";
