import {
  hrOrgAuditTrailColumnsId,
  hrOrgHeadcountColumnsId,
  hrOrgPositionsColumnsId,
  hrOrgReportingLinesColumnsId,
  hrOrgUnitsColumnsId,
  hrOrgVacanciesColumnsId,
} from "./hr.workforce.org-surface-columns.shared.ts";
import {
  hrOrgAuditTrailSurfaceKey,
  hrOrgHeadcountSurfaceKey,
  hrOrgPositionsSurfaceKey,
  hrOrgReportingLinesSurfaceKey,
  hrOrgUnitsSurfaceKey,
  hrOrgVacanciesSurfaceKey,
} from "./hr.workforce.org-units-list.surface.ts";

export const HR_ORG_LIST_SURFACE_KEYS = [
  hrOrgUnitsSurfaceKey,
  hrOrgPositionsSurfaceKey,
  hrOrgReportingLinesSurfaceKey,
  hrOrgVacanciesSurfaceKey,
  hrOrgHeadcountSurfaceKey,
  hrOrgAuditTrailSurfaceKey,
] as const;

export type HrOrgListSurfaceKey = (typeof HR_ORG_LIST_SURFACE_KEYS)[number];

export function getHrOrgListSurfaceKeys(): readonly HrOrgListSurfaceKey[] {
  return HR_ORG_LIST_SURFACE_KEYS;
}

export const HR_ORG_LIST_SURFACE_COLUMNS_BY_KEY = {
  [hrOrgUnitsSurfaceKey]: hrOrgUnitsColumnsId,
  [hrOrgPositionsSurfaceKey]: hrOrgPositionsColumnsId,
  [hrOrgReportingLinesSurfaceKey]: hrOrgReportingLinesColumnsId,
  [hrOrgVacanciesSurfaceKey]: hrOrgVacanciesColumnsId,
  [hrOrgHeadcountSurfaceKey]: hrOrgHeadcountColumnsId,
  [hrOrgAuditTrailSurfaceKey]: hrOrgAuditTrailColumnsId,
} as const;

export const HR_ORG_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrOrgUnitsSurfaceKey]: "orgUnitsSearch",
  [hrOrgPositionsSurfaceKey]: "orgPositionsSearch",
  [hrOrgReportingLinesSurfaceKey]: "orgReportingLinesSearch",
  [hrOrgVacanciesSurfaceKey]: "orgVacanciesSearch",
  [hrOrgHeadcountSurfaceKey]: "orgHeadcountSearch",
  [hrOrgAuditTrailSurfaceKey]: "orgAuditTrailSearch",
} as const;

export const HR_ORG_LIST_SEARCH_PARAM_MODEL_FIELDS = {
  orgUnitsSearch: "unitsSearch",
  orgPositionsSearch: "positionsSearch",
  orgReportingLinesSearch: "reportingLinesSearch",
  orgVacanciesSearch: "vacanciesSearch",
  orgHeadcountSearch: "headcountSearch",
  orgAuditTrailSearch: "auditTrailSearch",
  orgUnitTypeFilter: "unitTypeFilter",
  orgStatusFilter: "statusFilter",
  orgLocationFilter: "locationFilter",
  orgLegalEntityFilter: "legalEntityFilter",
} as const;

export const HR_ORG_WORKBENCH_READ_ONLY_SURFACE_KEYS =
  new Set<HrOrgListSurfaceKey>([
    hrOrgVacanciesSurfaceKey,
    hrOrgHeadcountSurfaceKey,
    hrOrgAuditTrailSurfaceKey,
  ]);
