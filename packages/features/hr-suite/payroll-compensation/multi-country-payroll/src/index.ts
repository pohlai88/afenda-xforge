/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateMultiCountryPayrollInput,
  MultiCountryPayrollRecord,
  ListMultiCountryPayrollQuery,
  UpdateMultiCountryPayrollInput,
} from "./contract.ts";
export { multiCountryPayrollExecutionSurface } from "./execution/index.ts";
export { multiCountryPayrollManifest } from "./manifest.ts";
export { multiCountryPayrollMetadata } from "./metadata.ts";
export {
  createMultiCountryPayroll,
  getMultiCountryPayroll,
  listMultiCountryPayroll,
  multiCountryPayrollRouteContracts,
  updateMultiCountryPayroll,
} from "./server.ts";
export { multiCountryPayrollFeatureScope } from "./shared/index.ts";
