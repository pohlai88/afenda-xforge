import { canReadEmployeeSelfservicePortalProfileUpdateRequest } from "../policy.ts";
import { projectEmployeeSelfservicePortalProfileUpdateRequest } from "../projector/profile-update-request.ts";
import {
  getEmployeeSelfservicePortalProfileUpdateRequestById,
  listEmployeeSelfservicePortalProfileUpdateRequests,
} from "../repository.ts";
import type {
  EmployeeSelfservicePortalProfileUpdateRequestView,
  ListEmployeeSelfservicePortalProfileUpdateRequestsQuery,
} from "../schema.ts";
import { listEmployeeSelfservicePortalProfileUpdateRequestsQuerySchema } from "../schema.ts";
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

export function listEmployeeSelfservicePortalProfileUpdateRequestViews(
  query: ListEmployeeSelfservicePortalProfileUpdateRequestsQuery = {},
  context?: HrSuiteFeatureContext
): readonly EmployeeSelfservicePortalProfileUpdateRequestView[] {
  const parsedQuery =
    listEmployeeSelfservicePortalProfileUpdateRequestsQuerySchema.parse(query);
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );

  const filteredRequests = listEmployeeSelfservicePortalProfileUpdateRequests()
    .filter((request) =>
      canReadEmployeeSelfservicePortalProfileUpdateRequest(context, request)
    )
    .filter((request) =>
      parsedQuery.employeeId
        ? request.employeeId === parsedQuery.employeeId
        : true
    )
    .filter((request) =>
      parsedQuery.status ? request.status === parsedQuery.status : true
    )
    .sort(
      (leftRequest, rightRequest) =>
        rightRequest.submittedAt.getTime() - leftRequest.submittedAt.getTime()
    );

  const startIndex = (page - 1) * pageSize;
  return filteredRequests
    .slice(startIndex, startIndex + pageSize)
    .map(projectEmployeeSelfservicePortalProfileUpdateRequest);
}

export function getEmployeeSelfservicePortalProfileUpdateRequestView(
  requestId: string,
  context?: HrSuiteFeatureContext
): EmployeeSelfservicePortalProfileUpdateRequestView | null {
  const request =
    getEmployeeSelfservicePortalProfileUpdateRequestById(requestId);
  if (!request) {
    return null;
  }

  if (!canReadEmployeeSelfservicePortalProfileUpdateRequest(context, request)) {
    return null;
  }

  return projectEmployeeSelfservicePortalProfileUpdateRequest(request);
}
