import { randomUUID } from "node:crypto";
import type {
  CreateJobPositionBody,
  JobPosition,
  JobPositionList,
  ListJobPositionsQuery,
} from "./contract.ts";

const jobPositions = new Map<string, JobPosition>();

const matchesSearch = (
  record: JobPosition,
  search: string | undefined
): boolean => {
  if (!search) {
    return true;
  }

  const normalizedSearch = search.trim().toLowerCase();
  return (
    record.code.toLowerCase().includes(normalizedSearch) ||
    record.title.toLowerCase().includes(normalizedSearch) ||
    record.orgUnitId.toLowerCase().includes(normalizedSearch) ||
    record.locationCode?.toLowerCase().includes(normalizedSearch) === true
  );
};

export function createJobPositionRecord(
  input: CreateJobPositionBody
): JobPosition {
  const record: JobPosition = {
    id: randomUUID(),
    code: input.code.trim(),
    title: input.title.trim(),
    orgUnitId: input.orgUnitId.trim(),
    status: input.status ?? "active",
    managerEmployeeId: input.managerEmployeeId?.trim() || undefined,
    costCenterCode: input.costCenterCode?.trim() || undefined,
    locationCode: input.locationCode?.trim() || undefined,
    effectiveFrom: input.effectiveFrom?.trim() || undefined,
  };

  jobPositions.set(record.id, record);
  return record;
}

export function listJobPositionRecords(
  query: ListJobPositionsQuery
): JobPositionList {
  const filtered = Array.from(jobPositions.values()).filter(
    (record) =>
      matchesSearch(record, query.search) &&
      (query.status ? record.status === query.status : true) &&
      (query.orgUnitId ? record.orgUnitId === query.orgUnitId : true) &&
      (query.locationCode ? record.locationCode === query.locationCode : true)
  );

  const offset = (query.page - 1) * query.pageSize;
  return {
    items: filtered.slice(offset, offset + query.pageSize),
    page: query.page,
    pageSize: query.pageSize,
    total: filtered.length,
  };
}
