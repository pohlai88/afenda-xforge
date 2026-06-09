import type {
  HrOrgPageModelInput,
  HrOrgSearchParams,
} from "./hr.workforce.org.contract.ts";
import {
  hrOrgStatusSchema,
  hrOrgUnitTypeSchema,
} from "./hr.workforce.org.contract.ts";
import {
  hrOrgAuditTrailSearchParam,
  hrOrgHeadcountSearchParam,
  hrOrgPositionsSearchParam,
  hrOrgReportingLinesSearchParam,
  hrOrgUnitsSearchParam,
  hrOrgVacanciesSearchParam,
} from "./hr.workforce.org-units-list.surface.ts";

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = searchParams[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  if (Array.isArray(value)) {
    const first = value.find((entry) => entry.trim().length > 0);
    return first?.trim();
  }
  return;
}

export function parseHrOrgSearchParams(
  searchParams: Record<string, string | string[] | undefined> | undefined
): HrOrgSearchParams {
  if (!searchParams) {
    return {};
  }

  return {
    unitsSearch: readSearchParam(searchParams, hrOrgUnitsSearchParam),
    positionsSearch: readSearchParam(searchParams, hrOrgPositionsSearchParam),
    reportingLinesSearch: readSearchParam(
      searchParams,
      hrOrgReportingLinesSearchParam
    ),
    vacanciesSearch: readSearchParam(searchParams, hrOrgVacanciesSearchParam),
    headcountSearch: readSearchParam(searchParams, hrOrgHeadcountSearchParam),
    auditTrailSearch: readSearchParam(searchParams, hrOrgAuditTrailSearchParam),
    unitTypeFilter: hrOrgUnitTypeSchema.safeParse(
      readSearchParam(searchParams, "orgUnitTypeFilter")
    ).success
      ? hrOrgUnitTypeSchema.parse(
          readSearchParam(searchParams, "orgUnitTypeFilter")
        )
      : undefined,
    statusFilter: hrOrgStatusSchema.safeParse(
      readSearchParam(searchParams, "orgStatusFilter")
    ).success
      ? hrOrgStatusSchema.parse(
          readSearchParam(searchParams, "orgStatusFilter")
        )
      : undefined,
    locationFilter: readSearchParam(searchParams, "orgLocationFilter"),
    legalEntityFilter: readSearchParam(searchParams, "orgLegalEntityFilter"),
  };
}

export function toHrOrgPageModelInput(input: {
  organizationId: string;
  canWrite: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}): HrOrgPageModelInput {
  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    ...parseHrOrgSearchParams(input.searchParams),
  };
}
