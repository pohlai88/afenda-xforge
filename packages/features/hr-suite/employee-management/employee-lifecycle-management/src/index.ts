/**
 * Server-only public door for the feature package.
 *
 * This package exposes the governed lifecycle contracts and feature surfaces
 * extracted from the legacy HR suite module.
 */
import "server-only";

export type {
  CreateEmployeeLifecycleManagementInput,
  EmployeeLifecycleManagementRecord,
  HrLifecycleRoutePath,
  HrWorkforceLifecycleAuditAction,
  ListEmployeeLifecycleManagementQuery,
  UpdateEmployeeLifecycleManagementInput,
} from "./contract.ts";
export { employeeLifecycleManagementExecutionSurface } from "./execution/index.ts";
export { employeeLifecycleManagementManifest } from "./manifest.ts";
export { employeeLifecycleManagementMetadata } from "./metadata.ts";
export {
  createEmployeeLifecycleManagement,
  employeeLifecycleManagementFeatureId,
  employeeLifecycleManagementRouteContracts,
  getEmployeeLifecycleManagement,
  hrLifecycleRoutePaths,
  hrWorkforceLifecycleAuditActions,
  hrWorkforceLifecycleReadPermission,
  hrWorkforceLifecycleWritePermission,
  listEmployeeLifecycleManagement,
  updateEmployeeLifecycleManagement,
} from "./server.ts";
export { employeeLifecycleManagementFeatureScope } from "./shared/index.ts";
