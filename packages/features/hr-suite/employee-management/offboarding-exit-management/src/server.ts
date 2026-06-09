import "server-only";

export {
  createOffboardingExitManagementRecord as createOffboardingExitManagement,
  updateOffboardingExitManagementRecord as updateOffboardingExitManagement,
} from "./actions.ts";
export {
  hrOffboardingRoutePaths,
  hrWorkforceOffboardingAuditActions,
  hrWorkforceOffboardingReadPermission,
  hrWorkforceOffboardingWritePermission,
  offboardingExitManagementFeatureId,
  offboardingExitManagementRouteContracts,
} from "./contract.ts";
export {
  getOffboardingExitManagementRecord as getOffboardingExitManagement,
  listOffboardingExitManagementRecords as listOffboardingExitManagement,
} from "./queries.ts";
