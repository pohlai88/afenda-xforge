/**
 * Server-only public door for the feature package.
 *
 * This package exposes the governed overtime contracts and surfaces
 * extracted from the legacy HR suite module.
 */
import "server-only";

export type {
  CreateOvertimeManagementInput,
  HrTimeOtmRoutePath,
  ListOvertimeManagementQuery,
  OvertimeManagementRecord,
  UpdateOvertimeManagementInput,
} from "./contract.ts";
export { overtimeManagementExecutionSurface } from "./execution/index.ts";
export { overtimeManagementManifest } from "./manifest.ts";
export { overtimeManagementMetadata } from "./metadata.ts";
export {
  createOvertimeManagement,
  getOvertimeManagement,
  HRM_OTM_AUDIT,
  hrTimeOtmAuditActions,
  hrTimeOtmReadPermission,
  hrTimeOtmRoutePaths,
  hrTimeOtmWritePermission,
  listOvertimeManagement,
  overtimeManagementFeatureId,
  overtimeManagementRouteContracts,
  updateOvertimeManagement,
} from "./server.ts";
export { overtimeManagementFeatureScope } from "./shared/index.ts";
