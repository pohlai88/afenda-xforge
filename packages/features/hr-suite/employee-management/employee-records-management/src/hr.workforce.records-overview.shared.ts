import { hrRecordsStore } from "./hr.workforce.records.store.ts";

export type HrEmployeeRecordsOverviewSnapshot = {
  totalCount: number;
  activeCount: number;
  archivedCount: number;
};

export function loadHrRecordsOverviewSnapshot(
  organizationId?: string
): HrEmployeeRecordsOverviewSnapshot {
  const records = hrRecordsStore.list({ organizationId });
  const archivedCount = records.filter(
    (record) => record.employmentStatus === "archived"
  ).length;
  const activeCount = records.filter(
    (record) => record.employmentStatus === "active"
  ).length;

  return {
    totalCount: records.length,
    activeCount,
    archivedCount,
  };
}
