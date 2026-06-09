/**
 * Server-only public door for the feature package.
 *
 * This package exposes the governed absence analytics trends contracts and
 * surfaces extracted from the legacy HR suite module.
 */
import "server-only";

export type {
  AbsenceAnalyticsTrendsRecord,
  CreateAbsenceAnalyticsTrendsInput,
  HrAatRoutePath,
  HrTimeAatAuditAction,
  ListAbsenceAnalyticsTrendsQuery,
  UpdateAbsenceAnalyticsTrendsInput,
} from "./contract.ts";
export { absenceAnalyticsTrendsExecutionSurface } from "./execution/index.ts";
export { absenceAnalyticsTrendsManifest } from "./manifest.ts";
export { absenceAnalyticsTrendsMetadata } from "./metadata.ts";
export {
  absenceAnalyticsTrendsFeatureId,
  absenceAnalyticsTrendsRouteContracts,
  createAbsenceAnalyticsTrends,
  getAbsenceAnalyticsTrends,
  HR_TIME_AAT_AUDIT_MODULE_KEY,
  hrAatRoutePaths,
  hrTimeAatAuditActions,
  hrTimeAatExportPermission,
  hrTimeAatReadPermission,
  listAbsenceAnalyticsTrends,
  updateAbsenceAnalyticsTrends,
} from "./server.ts";
export { absenceAnalyticsTrendsFeatureScope } from "./shared/index.ts";
