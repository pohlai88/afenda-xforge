import "server-only";

export {
  createOvertimeManagementRecord as createOvertimeManagement,
  updateOvertimeManagementRecord as updateOvertimeManagement,
} from "./actions.ts";
export {
  HRM_OTM_AUDIT,
  hrTimeOtmAuditActions,
  hrTimeOtmReadPermission,
  hrTimeOtmRoutePaths,
  hrTimeOtmWritePermission,
  overtimeManagementFeatureId,
  overtimeManagementRouteContracts,
} from "./contract.ts";
export {
  getOvertimeManagementRecord as getOvertimeManagement,
  listOvertimeManagementRecords as listOvertimeManagement,
} from "./queries.ts";
