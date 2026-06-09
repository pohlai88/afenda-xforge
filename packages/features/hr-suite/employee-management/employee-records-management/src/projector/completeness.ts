import type { HrEmployeeRecord } from "../hr.workforce.records.contract.ts";

export const hrEmployeeRecordCoverageFields = [
  "currentDepartmentId",
  "currentPositionId",
  "managerEmployeeId",
  "workLocationCode",
] as const;

export type HrEmployeeRecordCoverageField =
  (typeof hrEmployeeRecordCoverageFields)[number];

export type HrEmployeeRecordCoverage = {
  completenessScore: number;
  coveragePercent: number;
  isComplete: boolean;
  missingFields: readonly HrEmployeeRecordCoverageField[];
};

const hasCoverageValue = (value: string | null): boolean =>
  value !== null && value.trim().length > 0;

export function projectHrEmployeeRecordCoverage(
  record: Pick<
    HrEmployeeRecord,
    | "currentDepartmentId"
    | "currentPositionId"
    | "managerEmployeeId"
    | "workLocationCode"
  >
): HrEmployeeRecordCoverage {
  const missingFields: HrEmployeeRecordCoverageField[] = [];

  if (!hasCoverageValue(record.currentDepartmentId)) {
    missingFields.push("currentDepartmentId");
  }

  if (!hasCoverageValue(record.currentPositionId)) {
    missingFields.push("currentPositionId");
  }

  if (!hasCoverageValue(record.managerEmployeeId)) {
    missingFields.push("managerEmployeeId");
  }

  if (!hasCoverageValue(record.workLocationCode)) {
    missingFields.push("workLocationCode");
  }

  const completenessScore =
    hrEmployeeRecordCoverageFields.length - missingFields.length;
  const coveragePercent = Math.round(
    (completenessScore / hrEmployeeRecordCoverageFields.length) * 100
  );

  return {
    completenessScore,
    coveragePercent,
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

export function isHrEmployeeRecordIncomplete(
  record: Pick<
    HrEmployeeRecord,
    | "currentDepartmentId"
    | "currentPositionId"
    | "managerEmployeeId"
    | "workLocationCode"
  >
): boolean {
  return !projectHrEmployeeRecordCoverage(record).isComplete;
}
