import type {
  HrRecordsArchiveEmployeeInput,
  HrRecordsAssignmentInput,
  HrRecordsUpdateEmployeeInput,
} from "../records.contract.ts";

export type HrRecordsAssignmentCommand = HrRecordsAssignmentInput;
export type HrRecordsArchiveCommand = HrRecordsArchiveEmployeeInput;
export type HrRecordsStatusHistoryCommand = HrRecordsUpdateEmployeeInput;
