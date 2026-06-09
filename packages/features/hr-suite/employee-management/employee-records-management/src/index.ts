import "server-only";

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
export {
  hrEmployeeDetailRoutePath,
  hrRecordsRoutePaths,
} from "./hr.workforce.records-route.contract.ts";
export { hrRecordsFeatureManifest } from "./manifest.ts";
export { hrRecordsFeatureMetadata } from "./metadata.ts";
export { hrRecordsFeatureScope } from "./shared/index.ts";
