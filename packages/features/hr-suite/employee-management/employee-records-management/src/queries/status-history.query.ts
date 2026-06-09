import "server-only";

import { hrRecordsStore } from "../hr.workforce.records.store.ts";
import { canReadHrEmployeeRecord } from "../policy.ts";
import {
  projectHrEmployeeStatusHistory,
  projectHrEmployeeStatusHistoryViews,
  resolveCurrentHrEmployeeStatusHistory,
  sortHrEmployeeStatusHistory,
} from "../projector/status.ts";
import type {
  HrEmployeeStatusHistoryPageModel,
  HrEmployeeStatusHistoryRecord,
} from "../schema.ts";
import {
  hrEmployeeStatusHistoryPageModelSchema,
  hrEmployeeStatusHistoryQuerySchema,
} from "../schema.ts";

type QueryContext = {
  canRead?: boolean;
  canViewSensitive?: boolean;
  organizationId?: string;
};

const toLowerCase = (value: string | null | undefined): string =>
  value?.trim().toLowerCase() ?? "";

const paginate = <T>(
  values: readonly T[],
  page: number,
  pageSize: number
): readonly T[] => {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 25;
  const start = (safePage - 1) * safePageSize;
  return values.slice(start, start + safePageSize);
};

const groupHistoryByEmployee = (
  history: readonly HrEmployeeStatusHistoryRecord[]
): Map<string, HrEmployeeStatusHistoryRecord[]> => {
  const grouped = new Map<string, HrEmployeeStatusHistoryRecord[]>();
  for (const entry of history) {
    const bucket = grouped.get(entry.employeeId) ?? [];
    bucket.push(entry);
    grouped.set(entry.employeeId, bucket);
  }

  return grouped;
};

const matchesHistorySearch = (
  entry: HrEmployeeStatusHistoryRecord,
  search: string
): boolean => {
  if (!search) {
    return true;
  }

  const previousStatus = entry.previousStatus?.toLowerCase() ?? "";
  const reason = entry.reason?.toLowerCase() ?? "";
  const source = entry.source.toLowerCase();
  return (
    entry.status.toLowerCase().includes(search) ||
    previousStatus.includes(search) ||
    source.includes(search) ||
    reason.includes(search)
  );
};

const matchesHistoryFilters = (
  entry: HrEmployeeStatusHistoryRecord,
  query: {
    employeeId?: string;
    status?: string;
    source?: string;
    asOf?: Date;
  }
): boolean => {
  if (query.employeeId && entry.employeeId !== query.employeeId) {
    return false;
  }

  if (query.status && entry.status !== query.status) {
    return false;
  }

  if (query.source && entry.source !== query.source) {
    return false;
  }

  if (query.asOf && entry.effectiveAt.getTime() > query.asOf.getTime()) {
    return false;
  }

  return true;
};

const buildCurrentStatusHistoryPageModel = (
  history: readonly HrEmployeeStatusHistoryRecord[],
  parsed: ReturnType<typeof hrEmployeeStatusHistoryQuerySchema.parse>,
  context: QueryContext | undefined,
  page: number,
  pageSize: number,
  asOf: Date,
  search: string
): HrEmployeeStatusHistoryPageModel => {
  const currentHistory = sortHrEmployeeStatusHistory(
    Array.from(groupHistoryByEmployee(history).values())
      .map((employeeHistory) =>
        resolveCurrentHrEmployeeStatusHistory(employeeHistory, asOf)
      )
      .filter((entry): entry is HrEmployeeStatusHistoryRecord => entry !== null)
      .filter((entry) =>
        matchesHistoryFilters(entry, {
          employeeId: parsed.employeeId,
          status: parsed.status,
          source: parsed.source,
          asOf,
        })
      )
      .filter((entry) => matchesHistorySearch(entry, search))
  );
  const pagedHistory = paginate(currentHistory, page, pageSize);
  let currentStatusHistory:
    | HrEmployeeStatusHistoryPageModel["currentStatusHistory"]
    | undefined;
  if (parsed.employeeId) {
    currentStatusHistory =
      currentHistory.length > 0
        ? projectHrEmployeeStatusHistory(
            currentHistory[0] as HrEmployeeStatusHistoryRecord,
            {
              isCurrent: true,
            }
          )
        : null;
  }

  return hrEmployeeStatusHistoryPageModelSchema.parse({
    organizationId: context?.organizationId ?? null,
    employeeId: parsed.employeeId,
    currentStatusHistory,
    statusHistory: pagedHistory.map((entry) =>
      projectHrEmployeeStatusHistory(entry, { isCurrent: true })
    ),
    page,
    pageSize,
    totalCount: currentHistory.length,
    hasNextPage: page * pageSize < currentHistory.length,
  });
};

const buildHistoricalStatusHistoryPageModel = (
  history: readonly HrEmployeeStatusHistoryRecord[],
  parsed: ReturnType<typeof hrEmployeeStatusHistoryQuerySchema.parse>,
  context: QueryContext | undefined,
  page: number,
  pageSize: number,
  asOf: Date,
  search: string
): HrEmployeeStatusHistoryPageModel => {
  const scopedHistory = sortHrEmployeeStatusHistory(
    history.filter((entry) =>
      matchesHistoryFilters(entry, {
        employeeId: parsed.employeeId,
        status: parsed.status,
        source: parsed.source,
        asOf,
      })
    )
  ).filter((entry) => matchesHistorySearch(entry, search));
  const pagedHistory = paginate(scopedHistory, page, pageSize);
  const currentHistory = parsed.employeeId
    ? resolveCurrentHrEmployeeStatusHistory(
        history.filter((entry) => entry.employeeId === parsed.employeeId),
        asOf
      )
    : null;
  let currentStatusHistory:
    | HrEmployeeStatusHistoryPageModel["currentStatusHistory"]
    | undefined;
  if (parsed.employeeId) {
    currentStatusHistory = currentHistory
      ? projectHrEmployeeStatusHistory(currentHistory, { isCurrent: true })
      : null;
  }

  return hrEmployeeStatusHistoryPageModelSchema.parse({
    organizationId: context?.organizationId ?? null,
    employeeId: parsed.employeeId,
    currentStatusHistory,
    statusHistory: projectHrEmployeeStatusHistoryViews(
      pagedHistory,
      currentHistory?.id ?? null
    ),
    page,
    pageSize,
    totalCount: scopedHistory.length,
    hasNextPage: page * pageSize < scopedHistory.length,
  });
};

export function listHrEmployeeStatusHistory(
  query: unknown = {},
  context?: QueryContext
): HrEmployeeStatusHistoryPageModel {
  const parsed = hrEmployeeStatusHistoryQuerySchema.parse(query);

  if (!canReadHrEmployeeRecord(context ?? {})) {
    return hrEmployeeStatusHistoryPageModelSchema.parse({
      organizationId: context?.organizationId ?? null,
      employeeId: parsed.employeeId,
      currentStatusHistory: null,
      statusHistory: [],
      page: parsed.page ?? 1,
      pageSize: parsed.pageSize ?? 25,
      totalCount: 0,
      hasNextPage: false,
    });
  }

  const history = hrRecordsStore.listStatusHistory({
    canRead: true,
    organizationId: context?.organizationId,
  });
  const search = toLowerCase(parsed.search);
  const page = parsed.page ?? 1;
  const pageSize = parsed.pageSize ?? 25;
  const asOf = parsed.asOf ?? new Date();

  return parsed.current
    ? buildCurrentStatusHistoryPageModel(
        history,
        parsed,
        context,
        page,
        pageSize,
        asOf,
        search
      )
    : buildHistoricalStatusHistoryPageModel(
        history,
        parsed,
        context,
        page,
        pageSize,
        asOf,
        search
      );
}
