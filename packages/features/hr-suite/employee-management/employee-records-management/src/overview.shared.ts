import { isHrEmployeeRecordIncomplete } from "./projector/completeness.ts";
import { loadHrEmployeeRecordsRepository } from "./repository.ts";

export type HrEmployeeRecordsOverviewSnapshot = {
  totalCount: number;
  activeCount: number;
  archivedCount: number;
  incompleteCount: number;
};

export function loadHrRecordsOverviewSnapshot(
  organizationId?: string
): HrEmployeeRecordsOverviewSnapshot {
  const records = loadHrEmployeeRecordsRepository().records.filter(
    (record) => !organizationId || record.organizationId === organizationId
  );
  const archivedCount = records.filter(
    (record) => record.employmentStatus === "archived"
  ).length;
  const activeCount = records.filter(
    (record) => record.employmentStatus === "active"
  ).length;
  const incompleteCount = records.filter(
    (record) =>
      record.employmentStatus !== "archived" &&
      record.employmentStatus !== "separated" &&
      isHrEmployeeRecordIncomplete(record)
  ).length;

  return {
    totalCount: records.length,
    activeCount,
    archivedCount,
    incompleteCount,
  };
}
