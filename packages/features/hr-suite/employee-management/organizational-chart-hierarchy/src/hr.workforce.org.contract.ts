import { z } from "zod";

export const hrOrgUnitTypeSchema = z.enum([
  "business_unit",
  "department",
  "legal_entity",
  "location",
  "sub_department",
  "team",
]);

export const hrOrgStatusSchema = z.enum([
  "active",
  "closed",
  "frozen",
  "planned",
]);

export type HrOrgUnitType = z.infer<typeof hrOrgUnitTypeSchema>;
export type HrOrgUnitStatus = z.infer<typeof hrOrgStatusSchema>;

export type HrOrgChartNode = {
  id: string;
  code: string;
  name: string;
  unitType: HrOrgUnitType;
  parentDepartmentId: string | null;
  managerDisplayName: string | null;
  orgUnitStatus: HrOrgUnitStatus;
  childCount: number;
};

export type HrOrgNodeInput = {
  code: string;
  name: string;
  unitType: HrOrgUnitType;
  parentDepartmentId?: string | null;
  managerDisplayName?: string | null;
  orgUnitStatus?: HrOrgUnitStatus;
};

export type HrOrgSearchParams = {
  unitsSearch?: string;
  positionsSearch?: string;
  reportingLinesSearch?: string;
  vacanciesSearch?: string;
  headcountSearch?: string;
  auditTrailSearch?: string;
  unitTypeFilter?: HrOrgUnitType;
  statusFilter?: HrOrgUnitStatus;
  locationFilter?: string;
  legalEntityFilter?: string;
};

export type HrOrgPageModelInput = {
  organizationId: string;
  canWrite: boolean;
  unitsSearch?: string;
  positionsSearch?: string;
  reportingLinesSearch?: string;
  vacanciesSearch?: string;
  headcountSearch?: string;
  auditTrailSearch?: string;
  unitTypeFilter?: string;
  statusFilter?: string;
  locationFilter?: string;
  legalEntityFilter?: string;
};

export type HrOrgPageModel = {
  organizationId: string;
  canWrite: boolean;
  search: HrOrgSearchParams;
  overviewStatGroups: readonly {
    key: string;
    stats: readonly { id: string; label: string; value: number }[];
  }[];
  orgChartNodes: readonly HrOrgChartNode[];
  unitsList: unknown;
  positionsList: unknown;
  reportingLinesList: unknown;
  vacanciesList: unknown;
  headcountList: unknown;
  auditTrailList: unknown;
  employeePickerOptions: readonly { value: string; label: string }[];
  orgUnitPickerOptions: readonly { value: string; label: string }[];
};

export type HrOrgActionResult =
  | { ok: true; targetId?: string; message?: string }
  | { ok: false; error: string };

export type UpsertHrOrgUnitInput = {
  id?: string;
  code: string;
  name: string;
  unitType: HrOrgUnitType;
  parentDepartmentId?: string | null;
  managerEmployeeId?: string | null;
  costCenterCode?: string | null;
  locationCode?: string | null;
  legalEntityCode?: string | null;
  orgUnitStatus: HrOrgUnitStatus;
  effectiveFrom?: string | null;
};

export type UpsertHrOrgPositionInput = {
  id?: string;
  code: string;
  title: string;
  departmentId: string;
  managerEmployeeId?: string | null;
  costCenterCode?: string | null;
  locationCode?: string | null;
  positionStatus: HrOrgUnitStatus;
  effectiveFrom?: string | null;
};

export type UpsertHrOrgReportingRelationshipInput = {
  id?: string;
  employeeId: string;
  managerEmployeeId: string;
  relationshipType: string;
  effectiveFrom?: string | null;
  reason?: string | null;
};
