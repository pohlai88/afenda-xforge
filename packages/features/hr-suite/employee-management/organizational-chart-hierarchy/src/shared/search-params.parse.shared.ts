import type { z } from "zod";
import type {
  HrOrgPageModelInput,
  HrOrgSearchParams,
} from "../contracts/org-model.contract.ts";
import {
  hrOrgStatusSchema,
  hrOrgUnitTypeSchema,
} from "../contracts/org-model.contract.ts";
import {
  hrOrgAuditTrailSearchParam,
  hrOrgHeadcountSearchParam,
  hrOrgPositionsSearchParam,
  hrOrgReportingLinesSearchParam,
  hrOrgUnitsSearchParam,
  hrOrgVacanciesSearchParam,
} from "./list-surfaces.surface.ts";

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

function parseEnumSearchParam<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  value: string | undefined
): z.infer<TSchema> | undefined {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
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
    unitTypeFilter: parseEnumSearchParam(
      hrOrgUnitTypeSchema,
      readSearchParam(searchParams, "orgUnitTypeFilter")
    ),
    statusFilter: parseEnumSearchParam(
      hrOrgStatusSchema,
      readSearchParam(searchParams, "orgStatusFilter")
    ),
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
