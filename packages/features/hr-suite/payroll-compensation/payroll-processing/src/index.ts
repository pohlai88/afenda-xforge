/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreatePayrollProcessingInput,
  PayrollProcessingRecord,
  ListPayrollProcessingQuery,
  UpdatePayrollProcessingInput,
} from "./contract.ts";
export { payrollProcessingExecutionSurface } from "./execution/index.ts";
export { payrollProcessingManifest } from "./manifest.ts";
export { payrollProcessingMetadata } from "./metadata.ts";
export {
  createPayrollProcessing,
  getPayrollProcessing,
  listPayrollProcessing,
  payrollProcessingRouteContracts,
  updatePayrollProcessing,
} from "./server.ts";
export { payrollProcessingFeatureScope } from "./shared/index.ts";
