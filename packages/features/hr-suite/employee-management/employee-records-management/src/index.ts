import "server-only";

export type {
  HrEmployeeAssignmentRecord,
  HrEmployeeAssignmentsPageModel,
  HrEmployeeAssignmentView,
  HrEmployeeRecordAuditRecord,
  HrEmployeeStatusHistoryPageModel,
  HrEmployeeStatusHistoryRecord,
  HrEmployeeStatusHistoryView,
  HrRecordsArchiveAuditAction,
  HrRecordsArchiveCommand,
  HrRecordsAssignmentsQuery,
  HrRecordsStatusHistoryCommand,
  HrRecordsStatusHistoryQuery,
} from "./contracts/index.ts";
export { hrRecordsExecutionSurface } from "./execution/index.ts";
export type {
  HrEmployeeRecord,
  HrEmployeeRecordDetail,
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
export { parseHrRecordsSearchParams } from "./hr.workforce.records-search-params.parse.shared.ts";
export { hrRecordsFeatureManifest } from "./manifest.ts";
export { hrRecordsFeatureMetadata } from "./metadata.ts";
export { projectHrEmployeeAssignment } from "./projector/assignment.ts";
export {
  buildHrEmployeeAssignmentsPageModel,
  buildHrEmployeeStatusHistoryPageModel,
} from "./projector/read-models.ts";
export {
  type HrEmployeeRecordDetailView,
  projectHrEmployeeRecordDetail,
} from "./projector/record-detail.ts";
export { projectHrEmployeeStatusHistory } from "./projector/status.ts";
export { hrRecordsFeatureScope } from "./shared/index.ts";
