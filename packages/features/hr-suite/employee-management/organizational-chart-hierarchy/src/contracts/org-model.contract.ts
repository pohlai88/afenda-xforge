import { z } from "zod";
import type {
  HrOrgMutationResult,
  UpsertHrOrgPositionCommandInput,
  UpsertHrOrgReportingRelationshipCommandInput,
  UpsertHrOrgUnitCommandInput,
} from "./command.contract.ts";
import type { HrOrgStatus } from "./domain.contract.ts";
import type {
  HrOrgAuditEventProjection,
  HrOrgPositionProjection,
  HrOrgReportingRelationshipProjection,
  HrOrgUnitProjection,
} from "./projection.contract.ts";

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
  parentUnitId: string | null;
  managerEmployeeId: string | null;
  status: HrOrgUnitStatus;
  childCount: number;
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
} & HrOrgSearchParams;

export type HrOrgPageModel = {
  organizationId: string;
  canWrite: boolean;
  search: HrOrgSearchParams;
  overviewStatGroups: readonly {
    key: string;
    stats: readonly { id: string; label: string; value: number }[];
  }[];
  orgChartNodes: readonly HrOrgChartNode[];
  unitsList: HrOrgListWindow<HrOrgUnitListRow>;
  positionsList: HrOrgListWindow<HrOrgPositionListRow>;
  reportingLinesList: HrOrgListWindow<HrOrgReportingRelationshipListRow>;
  vacanciesList: HrOrgListWindow<HrOrgVacancyListRow>;
  headcountList: HrOrgListWindow<HrOrgHeadcountListRow>;
  auditTrailList: HrOrgListWindow<HrOrgAuditTrailListRow>;
};

export type HrOrgListWindow<TItem = HrOrgChartNode> = {
  hasNextPage: boolean;
  pageSize: number;
  rows: readonly TItem[];
  totalCount: number;
};

export type HrOrgUnitListRow = HrOrgUnitProjection;
export type HrOrgPositionListRow = HrOrgPositionProjection;
export type HrOrgReportingRelationshipListRow =
  HrOrgReportingRelationshipProjection;

export type HrOrgVacancyListRow = {
  code: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  organizationUnitId: string;
  positionId: string;
  status: HrOrgStatus;
  title: string;
};

export type HrOrgHeadcountListRow = {
  activePositionCount: number;
  code: string;
  name: string;
  organizationUnitId: string;
  positionCount: number;
  vacantPositionCount: number;
};

export type HrOrgAuditTrailListRow = HrOrgAuditEventProjection;

export type HrOrgActionResult = HrOrgMutationResult;

export type UpsertHrOrgUnitInput = UpsertHrOrgUnitCommandInput;
export type UpsertHrOrgPositionInput = UpsertHrOrgPositionCommandInput;
export type UpsertHrOrgReportingRelationshipInput =
  UpsertHrOrgReportingRelationshipCommandInput;
