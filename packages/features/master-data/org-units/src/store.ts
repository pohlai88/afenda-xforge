import { randomUUID } from "node:crypto";
import type {
  CreateOrgUnitBody,
  ListOrgUnitsQuery,
  OrgUnit,
  OrgUnitList,
} from "./contract.ts";

const orgUnits = new Map<string, OrgUnit>();

const matchesSearch = (
  record: OrgUnit,
  search: string | undefined
): boolean => {
  if (!search) {
    return true;
  }

  const normalizedSearch = search.trim().toLowerCase();
  return (
    record.code.toLowerCase().includes(normalizedSearch) ||
    record.name.toLowerCase().includes(normalizedSearch) ||
    record.unitType.toLowerCase().includes(normalizedSearch) ||
    record.locationCode?.toLowerCase().includes(normalizedSearch) === true ||
    record.legalEntityCode?.toLowerCase().includes(normalizedSearch) === true
  );
};

export function createOrgUnitRecord(input: CreateOrgUnitBody): OrgUnit {
  const record: OrgUnit = {
    id: randomUUID(),
    code: input.code.trim(),
    name: input.name.trim(),
    unitType: input.unitType,
    status: input.status ?? "active",
    parentOrgUnitId: input.parentOrgUnitId?.trim() || undefined,
    managerEmployeeId: input.managerEmployeeId?.trim() || undefined,
    costCenterCode: input.costCenterCode?.trim() || undefined,
    locationCode: input.locationCode?.trim() || undefined,
    legalEntityCode: input.legalEntityCode?.trim() || undefined,
    effectiveFrom: input.effectiveFrom?.trim() || undefined,
  };

  orgUnits.set(record.id, record);
  return record;
}

export function listOrgUnitRecords(query: ListOrgUnitsQuery): OrgUnitList {
  const filtered = Array.from(orgUnits.values()).filter(
    (record) =>
      matchesSearch(record, query.search) &&
      (query.status ? record.status === query.status : true) &&
      (query.unitType ? record.unitType === query.unitType : true) &&
      (query.parentOrgUnitId
        ? record.parentOrgUnitId === query.parentOrgUnitId
        : true) &&
      (query.locationCode
        ? record.locationCode === query.locationCode
        : true) &&
      (query.legalEntityCode
        ? record.legalEntityCode === query.legalEntityCode
        : true)
  );

  const offset = (query.page - 1) * query.pageSize;
  return {
    items: filtered.slice(offset, offset + query.pageSize),
    page: query.page,
    pageSize: query.pageSize,
    total: filtered.length,
  };
}
