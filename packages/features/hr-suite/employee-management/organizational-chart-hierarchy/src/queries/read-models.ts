import "server-only";

import {
  hrOrgAuditEventProjectionSchema,
  hrOrgChartNodeProjectionSchema,
  hrOrgOverviewProjectionSchema,
  hrOrgPositionProjectionSchema,
  hrOrgReportingRelationshipProjectionSchema,
  hrOrgUnitProjectionSchema,
} from "../contracts/index.ts";
import type {
  HrOrgAuditTrailListRow,
  HrOrgChartNode,
  HrOrgHeadcountListRow,
  HrOrgListWindow,
  ListHrOrgUnitsQuery,
  HrOrgPositionListRow,
  HrOrgReportingRelationshipListRow,
  HrOrgUnitListRow,
  HrOrgVacancyListRow,
} from "../contracts/org-model.contract.ts";
import { canReadHrOrg } from "../policy.ts";
import { hrOrgStore } from "../store.ts";

const toWindow = <TItem>(rows: readonly TItem[]): HrOrgListWindow<TItem> => ({
  rows,
  pageSize: rows.length,
  totalCount: rows.length,
  hasNextPage: false,
});

const readAccessDenied = (context?: unknown): boolean => !canReadHrOrg(context);

const isReadContextLike = (value: unknown): boolean => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as {
    actorId?: unknown;
    canRead?: unknown;
    canWrite?: unknown;
    grantedCapabilities?: unknown;
  };

  return (
    candidate.canRead !== undefined ||
    candidate.canWrite !== undefined ||
    candidate.actorId !== undefined ||
    candidate.grantedCapabilities !== undefined
  );
};

const resolveUnitListInvocation = (
  queryOrContext?: ListHrOrgUnitsQuery | unknown,
  context?: unknown
): {
  context?: unknown;
  query: ListHrOrgUnitsQuery;
} => {
  if (context !== undefined) {
    return {
      context,
      query:
        queryOrContext && !isReadContextLike(queryOrContext)
          ? (queryOrContext as ListHrOrgUnitsQuery)
          : {},
    };
  }

  if (isReadContextLike(queryOrContext)) {
    return { context: queryOrContext, query: {} };
  }

  return {
    query:
      queryOrContext && typeof queryOrContext === "object"
        ? (queryOrContext as ListHrOrgUnitsQuery)
        : {},
  };
};

const normalizeSearch = (value?: string): string | null => {
  const trimmed = value?.trim().toLowerCase();
  return trimmed ? trimmed : null;
};

const matchesUnitSearch = (
  unit: HrOrgUnitListRow,
  search: string | null
): boolean => {
  if (!search) {
    return true;
  }

  const haystack = [
    unit.code,
    unit.name,
    unit.unitType,
    unit.status,
    unit.locationCode ?? "",
    unit.legalEntityCode ?? "",
    unit.costCenterCode ?? "",
    unit.managerEmployeeId ?? "",
    unit.parentUnitId ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(search);
};

const matchesUnitFilters = (
  unit: HrOrgUnitListRow,
  query: ListHrOrgUnitsQuery
): boolean => {
  if (query.unitType && unit.unitType !== query.unitType) {
    return false;
  }

  if (query.status && unit.status !== query.status) {
    return false;
  }

  if (query.locationCode && unit.locationCode !== query.locationCode) {
    return false;
  }

  if (query.legalEntityCode && unit.legalEntityCode !== query.legalEntityCode) {
    return false;
  }

  return matchesUnitSearch(unit, normalizeSearch(query.search));
};

const applyUnitPagination = (
  rows: readonly HrOrgUnitListRow[],
  query: ListHrOrgUnitsQuery
): HrOrgListWindow<HrOrgUnitListRow> => {
  const pageSize = query.pageSize ?? rows.length;
  const page = query.page ?? 1;
  const start = Math.max(0, (page - 1) * pageSize);
  const end = start + pageSize;

  return {
    rows: rows.slice(start, end),
    pageSize: rows.length === 0 ? 0 : pageSize,
    totalCount: rows.length,
    hasNextPage: end < rows.length,
  };
};

export function loadHrOrgChartTreeNodes(context?: unknown): readonly HrOrgChartNode[] {
  if (readAccessDenied(context)) {
    return [];
  }

  return hrOrgStore
    .list()
    .map((row) => hrOrgChartNodeProjectionSchema.parse(row));
}

export function loadHrOrgOverviewSnapshot(context?: unknown): {
  totalUnits: number;
  totalPositions: number;
  totalVacancies: number;
  totalHeadcount: number;
} {
  if (readAccessDenied(context)) {
    return {
      totalUnits: 0,
      totalPositions: 0,
      totalVacancies: 0,
      totalHeadcount: 0,
    };
  }

  const units = hrOrgStore.listUnits();
  const positions = hrOrgStore.listPositions();
  const vacancies = hrOrgStore.listVacancies();
  const headcount = hrOrgStore.listHeadcount();

  return hrOrgOverviewProjectionSchema.parse({
    totalUnits: units.length,
    totalPositions: positions.length,
    totalVacancies: vacancies.length,
    totalHeadcount: headcount.reduce(
      (total, row) => total + row.activePositionCount,
      0
    ),
  });
}

export function listHrOrgUnitsWindow(
  queryOrContext?: ListHrOrgUnitsQuery | unknown,
  context?: unknown
): HrOrgListWindow<HrOrgUnitListRow> {
  const { query, context: resolvedContext } = resolveUnitListInvocation(
    queryOrContext,
    context
  );

  if (readAccessDenied(resolvedContext)) {
    return toWindow([]);
  }

  const filtered = hrOrgStore
    .listUnits()
    .filter((unit) => matchesUnitFilters(unit, query));

  return applyUnitPagination(filtered, query);
}

export function getHrOrgUnitById(
  id: string,
  context?: unknown
): HrOrgUnitListRow | null {
  if (readAccessDenied(context)) {
    return null;
  }

  const unit = hrOrgStore
    .listUnits()
    .find((row) => row.id === id);

  return unit ? hrOrgUnitProjectionSchema.parse(unit) : null;
}

export function listHrOrgPositionsWindow(
  context?: unknown
): HrOrgListWindow<HrOrgPositionListRow> {
  if (readAccessDenied(context)) {
    return toWindow([]);
  }

  return toWindow(
    hrOrgStore
      .listPositions()
      .map((row) => hrOrgPositionProjectionSchema.parse(row))
  );
}

export function listHrOrgReportingLinesWindow(
  context?: unknown
): HrOrgListWindow<HrOrgReportingRelationshipListRow> {
  if (readAccessDenied(context)) {
    return toWindow([]);
  }

  return toWindow(
    hrOrgStore
      .listReportingRelationships()
      .map((row) => hrOrgReportingRelationshipProjectionSchema.parse(row))
  );
}

export function listHrVacantPositionsWindow(
  context?: unknown
): HrOrgListWindow<HrOrgVacancyListRow> {
  if (readAccessDenied(context)) {
    return toWindow([]);
  }

  return toWindow(hrOrgStore.listVacancies());
}

export function listHrOrgHeadcountWindow(
  context?: unknown
): HrOrgListWindow<HrOrgHeadcountListRow> {
  if (readAccessDenied(context)) {
    return toWindow([]);
  }

  return toWindow(hrOrgStore.listHeadcount());
}

export function listHrOrgStructureAuditTrailWindow(
  context?: unknown
): HrOrgListWindow<HrOrgAuditTrailListRow> {
  if (readAccessDenied(context)) {
    return toWindow([]);
  }

  return toWindow(
    hrOrgStore
      .listAuditEvents()
      .map((row) => hrOrgAuditEventProjectionSchema.parse(row))
  );
}
