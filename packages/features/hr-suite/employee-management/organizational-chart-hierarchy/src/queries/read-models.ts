import "server-only";

import {
  hrOrgAuditEventProjectionSchema,
  hrOrgChartNodeProjectionSchema,
  hrOrgHeadcountProjectionSchema,
  hrOrgOverviewProjectionSchema,
  hrOrgPositionProjectionSchema,
  hrOrgReportingRelationshipProjectionSchema,
  hrOrgUnitProjectionSchema,
  hrOrgVacancyProjectionSchema,
} from "../contracts/index.ts";
import type {
  HrOrgAuditTrailListRow,
  HrOrgChartNode,
  HrOrgHeadcountListRow,
  HrOrgListWindow,
  HrOrgPositionListRow,
  HrOrgReportingRelationshipListRow,
  HrOrgUnitListRow,
  HrOrgVacancyListRow,
} from "../contracts/org-model.contract.ts";
import type {
  ListHrOrgAuditQuery,
  ListHrOrgHeadcountQuery,
  ListHrOrgPositionsQuery,
  ListHrOrgReportingRelationshipsQuery,
  ListHrOrgUnitsQuery,
  ListHrOrgVacanciesQuery,
} from "../contracts/query.contract.ts";
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

const resolvePositionListInvocation = (
  queryOrContext?: ListHrOrgPositionsQuery | unknown,
  context?: unknown
): {
  context?: unknown;
  query: ListHrOrgPositionsQuery;
} => {
  if (context !== undefined) {
    return {
      context,
      query:
        queryOrContext && !isReadContextLike(queryOrContext)
          ? (queryOrContext as ListHrOrgPositionsQuery)
          : {},
    };
  }

  if (isReadContextLike(queryOrContext)) {
    return { context: queryOrContext, query: {} };
  }

  return {
    query:
      queryOrContext && typeof queryOrContext === "object"
        ? (queryOrContext as ListHrOrgPositionsQuery)
        : {},
  };
};

const resolveReportingLineListInvocation = (
  queryOrContext?: ListHrOrgReportingRelationshipsQuery | unknown,
  context?: unknown
): {
  context?: unknown;
  query: ListHrOrgReportingRelationshipsQuery;
} => {
  if (context !== undefined) {
    return {
      context,
      query:
        queryOrContext && !isReadContextLike(queryOrContext)
          ? (queryOrContext as ListHrOrgReportingRelationshipsQuery)
          : {},
    };
  }

  if (isReadContextLike(queryOrContext)) {
    return { context: queryOrContext, query: {} };
  }

  return {
    query:
      queryOrContext && typeof queryOrContext === "object"
        ? (queryOrContext as ListHrOrgReportingRelationshipsQuery)
        : {},
  };
};

const resolveVacancyListInvocation = (
  queryOrContext?: ListHrOrgVacanciesQuery | unknown,
  context?: unknown
): {
  context?: unknown;
  query: ListHrOrgVacanciesQuery;
} => {
  if (context !== undefined) {
    return {
      context,
      query:
        queryOrContext && !isReadContextLike(queryOrContext)
          ? (queryOrContext as ListHrOrgVacanciesQuery)
          : {},
    };
  }

  if (isReadContextLike(queryOrContext)) {
    return { context: queryOrContext, query: {} };
  }

  return {
    query:
      queryOrContext && typeof queryOrContext === "object"
        ? (queryOrContext as ListHrOrgVacanciesQuery)
        : {},
  };
};

const resolveHeadcountListInvocation = (
  queryOrContext?: ListHrOrgHeadcountQuery | unknown,
  context?: unknown
): {
  context?: unknown;
  query: ListHrOrgHeadcountQuery;
} => {
  if (context !== undefined) {
    return {
      context,
      query:
        queryOrContext && !isReadContextLike(queryOrContext)
          ? (queryOrContext as ListHrOrgHeadcountQuery)
          : {},
    };
  }

  if (isReadContextLike(queryOrContext)) {
    return { context: queryOrContext, query: {} };
  }

  return {
    query:
      queryOrContext && typeof queryOrContext === "object"
        ? (queryOrContext as ListHrOrgHeadcountQuery)
        : {},
  };
};

const resolveAuditListInvocation = (
  queryOrContext?: ListHrOrgAuditQuery | unknown,
  context?: unknown
): {
  context?: unknown;
  query: ListHrOrgAuditQuery;
} => {
  if (context !== undefined) {
    return {
      context,
      query:
        queryOrContext && !isReadContextLike(queryOrContext)
          ? (queryOrContext as ListHrOrgAuditQuery)
          : {},
    };
  }

  if (isReadContextLike(queryOrContext)) {
    return { context: queryOrContext, query: {} };
  }

  return {
    query:
      queryOrContext && typeof queryOrContext === "object"
        ? (queryOrContext as ListHrOrgAuditQuery)
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

const matchesPositionSearch = (
  position: HrOrgPositionListRow,
  search: string | null
): boolean => {
  if (!search) {
    return true;
  }

  const haystack = [
    position.code,
    position.title,
    position.status,
    position.organizationUnitId,
    position.locationCode ?? "",
    position.costCenterCode ?? "",
    position.managerEmployeeId ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(search);
};

const matchesReportingLineSearch = (
  relationship: HrOrgReportingRelationshipListRow,
  search: string | null
): boolean => {
  if (!search) {
    return true;
  }

  const haystack = [
    relationship.employeeId,
    relationship.managerEmployeeId,
    relationship.relationshipType,
    relationship.reason ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(search);
};

const matchesPositionFilters = (
  position: HrOrgPositionListRow,
  query: ListHrOrgPositionsQuery,
  unitById: Map<string, HrOrgUnitListRow>
): boolean => {
  if (
    query.organizationUnitId &&
    position.organizationUnitId !== query.organizationUnitId
  ) {
    return false;
  }

  if (query.status && position.status !== query.status) {
    return false;
  }

  if (query.locationCode && position.locationCode !== query.locationCode) {
    return false;
  }

  if (query.legalEntityCode) {
    const owningUnit = unitById.get(position.organizationUnitId);
    if (owningUnit?.legalEntityCode !== query.legalEntityCode) {
      return false;
    }
  }

  return matchesPositionSearch(position, normalizeSearch(query.search));
};

const matchesReportingLineFilters = (
  relationship: HrOrgReportingRelationshipListRow,
  query: ListHrOrgReportingRelationshipsQuery
): boolean => {
  if (query.employeeId && relationship.employeeId !== query.employeeId) {
    return false;
  }

  if (
    query.managerEmployeeId &&
    relationship.managerEmployeeId !== query.managerEmployeeId
  ) {
    return false;
  }

  if (
    query.relationshipType &&
    relationship.relationshipType !== query.relationshipType
  ) {
    return false;
  }

  return matchesReportingLineSearch(
    relationship,
    normalizeSearch(query.search)
  );
};

const applyPositionPagination = (
  rows: readonly HrOrgPositionListRow[],
  query: ListHrOrgPositionsQuery
): HrOrgListWindow<HrOrgPositionListRow> => {
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

const applyReportingLinePagination = (
  rows: readonly HrOrgReportingRelationshipListRow[],
  query: ListHrOrgReportingRelationshipsQuery
): HrOrgListWindow<HrOrgReportingRelationshipListRow> => {
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

const applyGenericPagination = <TItem>(
  rows: readonly TItem[],
  query: { page?: number; pageSize?: number }
): HrOrgListWindow<TItem> => {
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

const matchesVacancySearch = (
  vacancy: HrOrgVacancyListRow,
  search: string | null
): boolean => {
  if (!search) {
    return true;
  }

  const haystack = [
    vacancy.code,
    vacancy.title,
    vacancy.status,
    vacancy.organizationUnitId,
    vacancy.positionId,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(search);
};

const matchesVacancyFilters = (
  vacancy: HrOrgVacancyListRow,
  query: ListHrOrgVacanciesQuery
): boolean => {
  if (
    query.organizationUnitId &&
    vacancy.organizationUnitId !== query.organizationUnitId
  ) {
    return false;
  }

  if (query.positionId && vacancy.positionId !== query.positionId) {
    return false;
  }

  if (query.status && vacancy.status !== query.status) {
    return false;
  }

  return matchesVacancySearch(vacancy, normalizeSearch(query.search));
};

const matchesHeadcountSearch = (
  headcount: HrOrgHeadcountListRow,
  search: string | null
): boolean => {
  if (!search) {
    return true;
  }

  const haystack = [
    headcount.code,
    headcount.name,
    headcount.organizationUnitId,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(search);
};

const matchesHeadcountFilters = (
  headcount: HrOrgHeadcountListRow,
  query: ListHrOrgHeadcountQuery
): boolean => {
  if (
    query.organizationUnitId &&
    headcount.organizationUnitId !== query.organizationUnitId
  ) {
    return false;
  }

  return matchesHeadcountSearch(headcount, normalizeSearch(query.search));
};

const matchesAuditSearch = (
  event: HrOrgAuditTrailListRow,
  search: string | null
): boolean => {
  if (!search) {
    return true;
  }

  const haystack = [
    event.action,
    event.entityType,
    event.entityId,
    event.summary,
    event.actorId ?? "",
    event.reason ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(search);
};

const matchesAuditFilters = (
  event: HrOrgAuditTrailListRow,
  query: ListHrOrgAuditQuery
): boolean => {
  if (query.action && event.action !== query.action) {
    return false;
  }

  if (query.entityType && event.entityType !== query.entityType) {
    return false;
  }

  return matchesAuditSearch(event, normalizeSearch(query.search));
};

export function loadHrOrgChartTreeNodes(
  context?: unknown
): readonly HrOrgChartNode[] {
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
  totalReportingLines: number;
  totalVacancies: number;
  totalHeadcount: number;
} {
  if (readAccessDenied(context)) {
    return {
      totalUnits: 0,
      totalPositions: 0,
      totalReportingLines: 0,
      totalVacancies: 0,
      totalHeadcount: 0,
    };
  }

  const units = hrOrgStore.listUnits();
  const positions = hrOrgStore.listPositions();
  const reportingLines = hrOrgStore.listReportingRelationships();
  const vacancies = hrOrgStore.listVacancies();
  const headcount = hrOrgStore.listHeadcount();

  return hrOrgOverviewProjectionSchema.parse({
    totalUnits: units.length,
    totalPositions: positions.length,
    totalReportingLines: reportingLines.length,
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

  const unit = hrOrgStore.listUnits().find((row) => row.id === id);

  return unit ? hrOrgUnitProjectionSchema.parse(unit) : null;
}

export function listHrOrgPositionsWindow(
  queryOrContext?: ListHrOrgPositionsQuery | unknown,
  context?: unknown
): HrOrgListWindow<HrOrgPositionListRow> {
  const { query, context: resolvedContext } = resolvePositionListInvocation(
    queryOrContext,
    context
  );

  if (readAccessDenied(resolvedContext)) {
    return toWindow([]);
  }

  const unitById = new Map(
    hrOrgStore.listUnits().map((unit) => [unit.id, unit] as const)
  );
  const filtered = hrOrgStore
    .listPositions()
    .filter((position) => matchesPositionFilters(position, query, unitById));

  return applyPositionPagination(filtered, query);
}

export function getHrOrgPositionById(
  id: string,
  context?: unknown
): HrOrgPositionListRow | null {
  if (readAccessDenied(context)) {
    return null;
  }

  const position = hrOrgStore.listPositions().find((row) => row.id === id);
  return position ? hrOrgPositionProjectionSchema.parse(position) : null;
}

export function listHrOrgReportingLinesWindow(
  queryOrContext?: ListHrOrgReportingRelationshipsQuery | unknown,
  context?: unknown
): HrOrgListWindow<HrOrgReportingRelationshipListRow> {
  const { query, context: resolvedContext } =
    resolveReportingLineListInvocation(queryOrContext, context);

  if (readAccessDenied(resolvedContext)) {
    return toWindow([]);
  }

  const filtered = hrOrgStore
    .listReportingRelationships()
    .filter((relationship) => matchesReportingLineFilters(relationship, query));

  return applyReportingLinePagination(filtered, query);
}

export function getHrOrgReportingRelationshipById(
  id: string,
  context?: unknown
): HrOrgReportingRelationshipListRow | null {
  if (readAccessDenied(context)) {
    return null;
  }

  const relationship = hrOrgStore
    .listReportingRelationships()
    .find((row) => row.id === id);

  return relationship
    ? hrOrgReportingRelationshipProjectionSchema.parse(relationship)
    : null;
}

export function listHrVacantPositionsWindow(
  queryOrContext?: ListHrOrgVacanciesQuery | unknown,
  context?: unknown
): HrOrgListWindow<HrOrgVacancyListRow> {
  const { query, context: resolvedContext } = resolveVacancyListInvocation(
    queryOrContext,
    context
  );

  if (readAccessDenied(resolvedContext)) {
    return toWindow([]);
  }

  const filtered = hrOrgStore
    .listVacancies()
    .map((row) => hrOrgVacancyProjectionSchema.parse(row))
    .filter((vacancy) => matchesVacancyFilters(vacancy, query));

  return applyGenericPagination(filtered, query);
}

export function listHrOrgHeadcountWindow(
  queryOrContext?: ListHrOrgHeadcountQuery | unknown,
  context?: unknown
): HrOrgListWindow<HrOrgHeadcountListRow> {
  const { query, context: resolvedContext } = resolveHeadcountListInvocation(
    queryOrContext,
    context
  );

  if (readAccessDenied(resolvedContext)) {
    return toWindow([]);
  }

  const filtered = hrOrgStore
    .listHeadcount()
    .map((row) => hrOrgHeadcountProjectionSchema.parse(row))
    .filter((row) => matchesHeadcountFilters(row, query));

  return applyGenericPagination(filtered, query);
}

export function listHrOrgStructureAuditTrailWindow(
  queryOrContext?: ListHrOrgAuditQuery | unknown,
  context?: unknown
): HrOrgListWindow<HrOrgAuditTrailListRow> {
  const { query, context: resolvedContext } = resolveAuditListInvocation(
    queryOrContext,
    context
  );

  if (readAccessDenied(resolvedContext)) {
    return toWindow([]);
  }

  const filtered = hrOrgStore
    .listAuditEvents()
    .map((row) => hrOrgAuditEventProjectionSchema.parse(row))
    .filter((event) => matchesAuditFilters(event, query));

  return applyGenericPagination(filtered, query);
}
