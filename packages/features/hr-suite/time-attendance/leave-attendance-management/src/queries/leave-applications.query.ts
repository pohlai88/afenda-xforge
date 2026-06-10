import "server-only";

import type {
  LamLeaveApplication,
  ListLamLeaveApplicationsQuery,
} from "../contracts/index.ts";
import { listLamLeaveApplicationsQuerySchema } from "../contracts/index.ts";
import { loadLamRepository } from "../repository.ts";
import type { LamReadContext } from "../schema.ts";
import { redactLamLeaveApplicationSensitiveFields } from "../shared/leave-application-sensitive-fields.ts";
import {
  canAccessLamEmployeeRecord,
  filterByCompany,
  filterByEmployeeDataScope,
  paginate,
  readContext,
} from "./shared.ts";

const redactLeaveApplicationsForRead = (
  applications: readonly LamLeaveApplication[],
  context?: LamReadContext
): LamLeaveApplication[] =>
  applications.map((application) =>
    redactLamLeaveApplicationSensitiveFields(application, context)
  );

export async function listLamLeaveApplicationsRecords(
  query: ListLamLeaveApplicationsQuery = {},
  context?: LamReadContext
): Promise<readonly LamLeaveApplication[]> {
  const parsed = listLamLeaveApplicationsQuerySchema.parse(query);
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return [];
  }

  return paginate(
    redactLeaveApplicationsForRead(
      filterByEmployeeDataScope(
        filterByCompany(state.leaveApplications, ctx.companyId),
        context,
        parsed.employeeId
      )
        .filter((entry) =>
          parsed.leaveTypeId ? entry.leaveTypeId === parsed.leaveTypeId : true
        )
        .filter((entry) =>
          parsed.status ? entry.status === parsed.status : true
        )
        .filter((entry) =>
          parsed.startDateFrom
            ? entry.startDate.getTime() >= parsed.startDateFrom.getTime()
            : true
        )
        .filter((entry) =>
          parsed.startDateTo
            ? entry.startDate.getTime() <= parsed.startDateTo.getTime()
            : true
        )
        .sort(
          (left, right) => right.startDate.getTime() - left.startDate.getTime()
        ),
      context
    ),
    parsed.page,
    parsed.pageSize
  );
}

export async function getLamLeaveApplicationById(
  id: string,
  context?: LamReadContext
): Promise<LamLeaveApplication | null> {
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return null;
  }

  const application =
    filterByCompany(state.leaveApplications, ctx.companyId).find(
      (entry) => entry.id === id
    ) ?? null;

  if (
    !(
      application && canAccessLamEmployeeRecord(context, application.employeeId)
    )
  ) {
    return null;
  }

  return redactLamLeaveApplicationSensitiveFields(application, context);
}
