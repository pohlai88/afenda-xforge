import type { HrEmployeeRecordSummary } from "./hr.workforce.records.contract.ts";

export const hrRecordsDirectorySurfaceKey = "hr.records.directory" as const;
export const hrRecordsDirectorySearchParam = "directorySearch" as const;
export const hrRecordsEmploymentStatusFilterParam =
  "employmentStatusFilter" as const;

export function buildHrRecordsDirectoryListSurface(
  rows: readonly HrEmployeeRecordSummary[]
): {
  readonly key: typeof hrRecordsDirectorySurfaceKey;
  readonly rows: readonly HrEmployeeRecordSummary[];
  readonly searchParam: typeof hrRecordsDirectorySearchParam;
} {
  return {
    key: hrRecordsDirectorySurfaceKey,
    rows,
    searchParam: hrRecordsDirectorySearchParam,
  } as const;
}
