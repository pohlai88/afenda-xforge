import "server-only";

export {
  createAbsenceAnalyticsTrendsRecord as createAbsenceAnalyticsTrends,
  updateAbsenceAnalyticsTrendsRecord as updateAbsenceAnalyticsTrends,
} from "./actions.ts";
export {
  absenceAnalyticsTrendsFeatureId,
  absenceAnalyticsTrendsRouteContracts,
  HR_TIME_AAT_AUDIT_MODULE_KEY,
  hrAatRoutePaths,
  hrTimeAatAuditActions,
  hrTimeAatExportPermission,
  hrTimeAatReadPermission,
} from "./contract.ts";
export {
  getAbsenceAnalyticsTrendsRecord as getAbsenceAnalyticsTrends,
  listAbsenceAnalyticsTrendsRecords as listAbsenceAnalyticsTrends,
} from "./queries.ts";
