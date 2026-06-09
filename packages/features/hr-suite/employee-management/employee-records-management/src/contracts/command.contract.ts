import type {
  HrRecordsArchiveEmployeeInput,
  HrRecordsAssignmentInput,
  HrRecordsUpdateEmployeeInput,
} from "../hr.workforce.records.contract.ts";

export type HrRecordsAssignmentCommand = HrRecordsAssignmentInput;
export type HrRecordsArchiveCommand = HrRecordsArchiveEmployeeInput;
export type HrRecordsStatusHistoryCommand = HrRecordsUpdateEmployeeInput;
