import type { HrEmployeeRecordSummary } from "../schema.ts";
import { hrEmployeeRecordSummarySchema } from "../schema.ts";

export function projectHrEmployeeRecordSummary(
  record: HrEmployeeRecordSummary
): HrEmployeeRecordSummary {
  return hrEmployeeRecordSummarySchema.parse(record);
}

export function sortHrEmployeeRecordSummaries(
  records: readonly HrEmployeeRecordSummary[]
): readonly HrEmployeeRecordSummary[] {
  return [...records].sort(
    (left, right) =>
      left.employeeNumber.localeCompare(right.employeeNumber) ||
      left.displayName.localeCompare(right.displayName) ||
      left.id.localeCompare(right.id)
  );
}

export function isHrEmployeeRecordArchived(
  record: HrEmployeeRecordSummary
): boolean {
  return record.employmentStatus === "archived";
}
