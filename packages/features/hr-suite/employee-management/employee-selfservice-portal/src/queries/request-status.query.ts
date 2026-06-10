import "server-only";

import { canReadEmployeeSelfservicePortal } from "../policy.ts";
import { projectEmployeeSelfservicePortalRequestStatus } from "../projector/request-status.ts";
import { listEmployeeSelfservicePortalProfileUpdateRequestViews } from "../queries/profile-update-requests.query.ts";
import { listEmployeeSelfservicePortalRepositoryRecords } from "../repository.ts";
import type {
  EmployeeSelfservicePortalRequestStatusItem,
  ListEmployeeSelfservicePortalRequestStatusesQuery,
} from "../schema.ts";
import { listEmployeeSelfservicePortalRequestStatusesQuerySchema } from "../schema.ts";
import type { HrSuiteFeatureContext } from "../shared/index.ts";

const DEFAULT_PAGE_SIZE = 25;

const normalizePositiveInteger = (
  value: number | undefined,
  fallback: number
): number => {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  const parsedValue = Math.floor(value);
  return parsedValue > 0 ? parsedValue : fallback;
};

const normalizeSearchTerm = (value: string | undefined): string =>
  value?.trim().toLowerCase() ?? "";

const hasAccessiblePortalRecord = (
  context: HrSuiteFeatureContext | undefined
): boolean =>
  Boolean(
    context?.actorEmployeeId &&
      listEmployeeSelfservicePortalRepositoryRecords().some(
        (record) =>
          record.employeeId === context.actorEmployeeId &&
          canReadEmployeeSelfservicePortal(context, record)
      )
  );

const matchesSearch = (
  item: EmployeeSelfservicePortalRequestStatusItem,
  searchTerm: string
): boolean => {
  if (searchTerm.length === 0) {
    return true;
  }

  return [
    item.requestType,
    item.status,
    item.summary,
    item.approvalReference,
    item.rejectionReason,
  ].some((value) => value?.toLowerCase().includes(searchTerm) ?? false);
};

export function listEmployeeSelfservicePortalRequestStatuses(
  query: ListEmployeeSelfservicePortalRequestStatusesQuery = {},
  context?: HrSuiteFeatureContext
): readonly EmployeeSelfservicePortalRequestStatusItem[] {
  const parsedQuery =
    listEmployeeSelfservicePortalRequestStatusesQuerySchema.parse(query);

  if (
    !(
      context?.canRead &&
      context.actorEmployeeId &&
      hasAccessiblePortalRecord(context)
    )
  ) {
    return [];
  }

  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );
  const searchTerm = normalizeSearchTerm(parsedQuery.search);

  const items = listEmployeeSelfservicePortalProfileUpdateRequestViews(
    {
      employeeId: context.actorEmployeeId,
    },
    context
  )
    .filter((entry) =>
      parsedQuery.requestType
        ? entry.requestType === parsedQuery.requestType
        : true
    )
    .filter((entry) =>
      parsedQuery.status ? entry.status === parsedQuery.status : true
    )
    .map(projectEmployeeSelfservicePortalRequestStatus)
    .filter((entry) => matchesSearch(entry, searchTerm))
    .sort(
      (left, right) =>
        right.submittedAt.getTime() - left.submittedAt.getTime() ||
        right.updatedAt.getTime() - left.updatedAt.getTime()
    );

  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}
