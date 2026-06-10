import "server-only";

import { listEmployeeSelfservicePortalIntegratedLeaveApplications } from "../leave-attendance.integration.ts";
import { canReadEmployeeSelfservicePortal } from "../policy.ts";
import { projectEmployeeSelfservicePortalLeaveApplication } from "../projector/leave-application.ts";
import { listEmployeeSelfservicePortalRepositoryRecords } from "../repository.ts";
import type {
  EmployeeSelfservicePortalLeaveApplicationItem,
  ListEmployeeSelfservicePortalLeaveApplicationsQuery,
} from "../schema.ts";
import { listEmployeeSelfservicePortalLeaveApplicationsQuerySchema } from "../schema.ts";
import type { HrSuiteFeatureContext } from "../shared/index.ts";

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

export function listEmployeeSelfservicePortalLeaveApplications(
  query: ListEmployeeSelfservicePortalLeaveApplicationsQuery = {},
  context?: HrSuiteFeatureContext
): readonly EmployeeSelfservicePortalLeaveApplicationItem[] {
  const parsedQuery =
    listEmployeeSelfservicePortalLeaveApplicationsQuerySchema.parse(query);

  if (
    !(
      context?.canRead &&
      context.actorEmployeeId &&
      hasAccessiblePortalRecord(context)
    )
  ) {
    return [];
  }

  return listEmployeeSelfservicePortalIntegratedLeaveApplications(
    {
      employeeId: context.actorEmployeeId,
      leaveTypeCode: parsedQuery.leaveTypeCode,
      page: parsedQuery.page,
      pageSize: parsedQuery.pageSize,
      search: parsedQuery.search,
      status: parsedQuery.status,
    },
    context
  ).map(projectEmployeeSelfservicePortalLeaveApplication);
}
