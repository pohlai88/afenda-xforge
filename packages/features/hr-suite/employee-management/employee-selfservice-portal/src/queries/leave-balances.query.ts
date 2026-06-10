import "server-only";

import { listEmployeeSelfservicePortalIntegratedLeaveBalances } from "../leave-attendance.integration.ts";
import { canReadEmployeeSelfservicePortal } from "../policy.ts";
import { projectEmployeeSelfservicePortalLeaveBalance } from "../projector/leave-balance.ts";
import { listEmployeeSelfservicePortalRepositoryRecords } from "../repository.ts";
import type {
  EmployeeSelfservicePortalLeaveBalanceItem,
  ListEmployeeSelfservicePortalLeaveBalancesQuery,
} from "../schema.ts";
import { listEmployeeSelfservicePortalLeaveBalancesQuerySchema } from "../schema.ts";
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

export function listEmployeeSelfservicePortalLeaveBalances(
  query: ListEmployeeSelfservicePortalLeaveBalancesQuery = {},
  context?: HrSuiteFeatureContext
): readonly EmployeeSelfservicePortalLeaveBalanceItem[] {
  const parsedQuery =
    listEmployeeSelfservicePortalLeaveBalancesQuerySchema.parse(query);

  if (
    !(
      context?.canRead &&
      context.actorEmployeeId &&
      hasAccessiblePortalRecord(context)
    )
  ) {
    return [];
  }

  return listEmployeeSelfservicePortalIntegratedLeaveBalances(
    {
      employeeId: context.actorEmployeeId,
      leaveTypeCode: parsedQuery.leaveTypeCode,
      page: parsedQuery.page,
      pageSize: parsedQuery.pageSize,
      search: parsedQuery.search,
    },
    context
  ).map(projectEmployeeSelfservicePortalLeaveBalance);
}
