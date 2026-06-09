import "server-only";

export type {
  HrEmployeeAssignmentRecord,
  HrEmployeeAssignmentsPageModel,
  HrEmployeeAssignmentView,
  HrEmployeeIntegrationAssignmentReference,
  HrEmployeeIntegrationChangeEvent,
  HrEmployeeIntegrationDocumentCoverage,
  HrEmployeeIntegrationEmploymentReference,
  HrEmployeeIntegrationReference,
  HrEmployeeIntegrationSensitiveData,
  HrEmployeeIntegrationSnapshot,
  HrEmployeeRecordAuditRecord,
  HrEmployeeStatusHistoryPageModel,
  HrEmployeeStatusHistoryRecord,
  HrEmployeeStatusHistoryView,
  HrRecordsActionApproval,
  HrRecordsActionCapability,
  HrRecordsActionContract,
  HrRecordsActionRisk,
  HrRecordsArchiveAuditAction,
  HrRecordsArchiveCommand,
  HrRecordsAssignmentsQuery,
  HrRecordsBoundedContext,
  HrRecordsFeatureManifest,
  HrRecordsFeatureMetadata,
  HrRecordsRouteContract,
  HrRecordsStatusHistoryCommand,
  HrRecordsStatusHistoryQuery,
} from "./contracts/index.ts";
export { hrRecordsExecutionSurface } from "./execution/index.ts";
export { hrRecordsFeatureScope, hrSuiteFeatureScope } from "./feature-scope.ts";
export type {
  HrEmployeeRecord,
  HrEmployeeRecordDetail,
  HrEmployeeRecordExportView,
  HrEmployeeRecordPageModel,
  HrEmployeeRecordSummary,
  HrRecordsActionResult,
  HrRecordsArchiveEmployeeInput,
  HrRecordsAssignmentInput,
  HrRecordsCreateEmployeeInput,
  HrRecordsPageModelInput,
  HrRecordsRehireEmployeeInput,
  HrRecordsSearchParams,
  HrRecordsUpdateEmployeeInput,
} from "./hr.workforce.records.contract.ts";
export {
  hrRecordsReadPermission,
  hrRecordsSearchParamsSchema,
  hrRecordsSensitiveReadPermission,
  hrRecordsWritePermission,
} from "./hr.workforce.records.contract.ts";
export {
  buildHrEmployeeRecordDetailPageModel,
  buildHrEmployeeRecordExportPageModel,
} from "./hr.workforce.records.detail.page-model.server.ts";
export {
  type HrRecordsEmploymentStatus,
  hrRecordsEmploymentStatusSchema,
} from "./hr.workforce.records-employment-status.schema.ts";
export {
  hrRecordsArchiveEmployeeSchema,
  hrRecordsAssignmentSchema,
  hrRecordsCreateEmployeeSchema,
  hrRecordsRehireEmployeeSchema,
  hrRecordsUpdateEmployeeSchema,
} from "./hr.workforce.records-form.shared.ts";
export {
  hrEmployeeArchiveRoutePath,
  hrEmployeeAssignmentsRoutePath,
  hrEmployeeDetailRoutePath,
  hrEmployeeRehireRoutePath,
  hrEmployeeStatusHistoryRoutePath,
  hrRecordsRouteContract,
  hrRecordsRoutePaths,
} from "./hr.workforce.records-route.contract.ts";
export { parseHrRecordsSearchParams } from "./hr.workforce.records-search-params.parse.shared.ts";
export {
  hrRecordsFeature,
  hrRecordsFeatureDomain,
  hrRecordsFeatureId,
  hrRecordsFeaturePackageName,
  hrRecordsFeatureSource,
  hrRecordsFeatureSuite,
} from "./identity.ts";
export { hrRecordsFeatureManifest } from "./manifest.ts";
export { hrRecordsFeatureMetadata } from "./metadata.ts";
export { projectHrEmployeeAssignment } from "./projector/assignment.ts";
export {
  projectHrEmployeeIntegrationChangeEvent,
  projectHrEmployeeIntegrationSnapshot,
} from "./projector/integration.ts";
export {
  buildHrEmployeeAssignmentsPageModel,
  buildHrEmployeeStatusHistoryPageModel,
} from "./projector/read-models.ts";
export {
  type HrEmployeeRecordDetailView,
  projectHrEmployeeRecordDetail,
  projectHrEmployeeRecordExportDetail,
} from "./projector/record-detail.ts";
export { projectHrEmployeeStatusHistory } from "./projector/status.ts";
export {
  listHrEmployeeRecordSummaries,
  listHrEmployeeRecordSummariesPage,
} from "./queries/records.query.ts";
export {
  buildHrEmployeeIntegrationChangeEvent,
  buildHrEmployeeIntegrationSnapshot,
  hrRecordsIntegrationEventSchema,
  hrRecordsIntegrationEvents,
  hrRecordsIntegrationSnapshotVersion,
} from "./registry/integration.ts";
