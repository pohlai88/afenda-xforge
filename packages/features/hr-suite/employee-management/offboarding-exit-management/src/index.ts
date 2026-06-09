/**
 * Server-only public door for the feature package.
 *
 * This package exposes the governed offboarding contracts and surfaces
 * extracted from the legacy HR suite module.
 */
import "server-only";

export type {
  CreateOffboardingExitManagementInput,
  HrOffboardingRoutePath,
  HrWorkforceOffboardingAuditAction,
  ListOffboardingExitManagementQuery,
  OffboardingExitManagementRecord,
  UpdateOffboardingExitManagementInput,
} from "./contract.ts";
export { offboardingExitManagementExecutionSurface } from "./execution/index.ts";
export { offboardingExitManagementManifest } from "./manifest.ts";
export { offboardingExitManagementMetadata } from "./metadata.ts";
export {
  createOffboardingExitManagement,
  getOffboardingExitManagement,
  hrOffboardingRoutePaths,
  hrWorkforceOffboardingAuditActions,
  hrWorkforceOffboardingReadPermission,
  hrWorkforceOffboardingWritePermission,
  listOffboardingExitManagement,
  offboardingExitManagementFeatureId,
  offboardingExitManagementRouteContracts,
  updateOffboardingExitManagement,
} from "./server.ts";
export { offboardingExitManagementFeatureScope } from "./shared/index.ts";
