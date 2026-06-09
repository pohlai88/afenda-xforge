import "server-only";

export type {
  HrEmployeeAssignmentRecord,
  HrEmployeeAssignmentsPageModel,
  HrEmployeeAssignmentView,
  HrEmployeeRecordAuditRecord,
  HrEmployeeIntegrationAssignmentReference,
  HrEmployeeIntegrationChangeEvent,
  HrEmployeeIntegrationDocumentCoverage,
  HrEmployeeIntegrationEmploymentReference,
  HrEmployeeIntegrationReference,
  HrEmployeeIntegrationSensitiveData,
  HrEmployeeIntegrationSnapshot,
  HrEmployeeStatusHistoryPageModel,
  HrEmployeeStatusHistoryRecord,
  HrEmployeeStatusHistoryView,
  HrRecordsActionApproval,
  HrRecordsActionCapability,
  HrRecordsActionContract,
  HrRecordsActionRisk,
  HrRecordsBoundedContext,
  HrRecordsArchiveAuditAction,
  HrRecordsArchiveCommand,
  HrRecordsAssignmentsQuery,
  HrRecordsFeatureManifest,
  HrRecordsFeatureMetadata,
  HrRecordsStatusHistoryCommand,
  HrRecordsStatusHistoryQuery,
  HrRecordsRouteContract,
} from "./contracts/index.ts";
export { hrRecordsExecutionSurface } from "./execution/index.ts";
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
export { hrRecordsSearchParamsSchema } from "./hr.workforce.records.contract.ts";
export {
  buildHrEmployeeIntegrationChangeEvent,
  buildHrEmployeeIntegrationSnapshot,
  hrRecordsIntegrationEventSchema,
  hrRecordsIntegrationEvents,
  hrRecordsIntegrationSnapshotVersion,
} from "./registry/integration.ts";
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
  hrRecordsRoutePaths,
} from "./hr.workforce.records-route.contract.ts";
export {
  hrRecordsFeature,
  hrRecordsFeatureDomain,
  hrRecordsFeatureId,
  hrRecordsFeaturePackageName,
  hrRecordsFeatureSource,
  hrRecordsFeatureSuite,
} from "./identity.ts";
export { parseHrRecordsSearchParams } from "./hr.workforce.records-search-params.parse.shared.ts";
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
export { hrRecordsFeatureScope, hrSuiteFeatureScope } from "./feature-scope.ts";
