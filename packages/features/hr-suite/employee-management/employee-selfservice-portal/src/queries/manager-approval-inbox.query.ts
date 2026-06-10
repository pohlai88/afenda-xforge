import { getEmployeeSelfservicePortalProfileSource } from "../employee-records.integration.ts";
import {
  canReadEmployeeSelfservicePortalManagerApprovalInbox,
  isEmployeeSelfservicePortalManagerForEmployee,
} from "../policy.ts";
import { projectEmployeeSelfservicePortalManagerApprovalInboxItem } from "../projector/approval-inbox.ts";
import { listEmployeeSelfservicePortalProfileUpdateRequests } from "../repository.ts";
import type {
  EmployeeSelfservicePortalManagerApprovalInboxItem,
  ListEmployeeSelfservicePortalManagerApprovalInboxQuery,
} from "../schema.ts";
import { listEmployeeSelfservicePortalManagerApprovalInboxQuerySchema } from "../schema.ts";
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

const matchesSearch = (
  item: EmployeeSelfservicePortalManagerApprovalInboxItem,
  searchTerm: string
): boolean => {
  if (searchTerm.length === 0) {
    return true;
  }

  return [
    item.employeeDisplayName,
    item.employeeId,
    item.employeeNumber,
    item.requestType,
    item.status,
    item.summary,
    ...item.changedFields,
  ].some((value) => value.toLowerCase().includes(searchTerm));
};

export function listEmployeeSelfservicePortalManagerApprovalInbox(
  query: ListEmployeeSelfservicePortalManagerApprovalInboxQuery = {},
  context?: HrSuiteFeatureContext
): readonly EmployeeSelfservicePortalManagerApprovalInboxItem[] {
  const parsedQuery =
    listEmployeeSelfservicePortalManagerApprovalInboxQuerySchema.parse(query);

  if (
    !(canReadEmployeeSelfservicePortalManagerApprovalInbox(context) && context)
  ) {
    return [];
  }

  const { organizationId } = context;
  if (!organizationId) {
    return [];
  }

  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );
  const searchTerm = normalizeSearchTerm(parsedQuery.search);

  const items = listEmployeeSelfservicePortalProfileUpdateRequests()
    .filter(
      (request) =>
        request.tenantId === context.tenantId &&
        request.companyId === context.companyId
    )
    .filter((request) =>
      parsedQuery.employeeId
        ? request.employeeId === parsedQuery.employeeId
        : true
    )
    .filter((request) =>
      parsedQuery.requestType
        ? request.requestType === parsedQuery.requestType
        : true
    )
    .filter((request) =>
      parsedQuery.status ? request.status === parsedQuery.status : true
    )
    .filter((request) =>
      isEmployeeSelfservicePortalManagerForEmployee(context, request.employeeId)
    )
    .flatMap((request) => {
      const employee = getEmployeeSelfservicePortalProfileSource({
        canViewSensitive: false,
        employeeId: request.employeeId,
        organizationId,
      });

      if (!employee) {
        return [];
      }

      return [
        projectEmployeeSelfservicePortalManagerApprovalInboxItem(
          request,
          employee,
          context
        ),
      ];
    })
    .filter((item) => matchesSearch(item, searchTerm))
    .sort(
      (leftItem, rightItem) =>
        rightItem.submittedAt.getTime() - leftItem.submittedAt.getTime()
    );

  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}
