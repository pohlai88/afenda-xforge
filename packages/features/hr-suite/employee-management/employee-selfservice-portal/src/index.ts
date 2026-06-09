/**
 * Server-only public door for the feature package.
 *
 * Governed employee self-service portal package extracted from the legacy HR suite.
 */
import "server-only";

export type {
  CreateEmployeeSelfservicePortalInput,
  EmployeeSelfservicePortalRecord,
  HrWorkforceEssRoutePath,
  ListEmployeeSelfservicePortalQuery,
  UpdateEmployeeSelfservicePortalInput,
} from "./contract.ts";
export { employeeSelfservicePortalExecutionSurface } from "./execution/index.ts";
export { employeeSelfservicePortalManifest } from "./manifest.ts";
export { employeeSelfservicePortalMetadata } from "./metadata.ts";
export {
  createEmployeeSelfservicePortal,
  employeeSelfservicePortalFeatureId,
  employeeSelfservicePortalRouteContracts,
  getEmployeeSelfservicePortal,
  hrWorkforceEssReadPermission,
  hrWorkforceEssRoutePaths,
  listEmployeeSelfservicePortal,
  updateEmployeeSelfservicePortal,
} from "./server.ts";
export { employeeSelfservicePortalFeatureScope } from "./shared/index.ts";
