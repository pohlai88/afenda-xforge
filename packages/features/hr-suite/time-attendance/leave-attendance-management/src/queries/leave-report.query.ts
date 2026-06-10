import "server-only";

import type {
  LamLeaveReportEntry,
  ListLamLeaveReportQuery,
} from "../contracts/index.ts";
import { listLamLeaveReportQuerySchema } from "../contracts/index.ts";
import { resolveEmployeeIdsFilter } from "../projector/attendance-summary.ts";
import { listLeaveReportEntries } from "../projector/leave-report.ts";
import { loadLamRepository } from "../repository.ts";
import type { LamReadContext } from "../schema.ts";
import {
  filterByEmployeeDataScope,
  paginate,
  readReportsContext,
} from "./shared.ts";

export async function listLamLeaveReportRecords(
  query: ListLamLeaveReportQuery,
  context?: LamReadContext
): Promise<readonly LamLeaveReportEntry[]> {
  const parsed = listLamLeaveReportQuerySchema.parse(query);
  const ctx = readReportsContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return [];
  }

  if (parsed.periodEnd.getTime() < parsed.periodStart.getTime()) {
    throw new Error("periodEnd must be on or after periodStart");
  }

  const employeeIds = resolveEmployeeIdsFilter({
    employeeId: parsed.employeeId,
    employeeIds: parsed.employeeIds,
  });

  return paginate(
    filterByEmployeeDataScope(
      listLeaveReportEntries(state, {
        companyId: ctx.companyId,
        employeeId: parsed.employeeId ?? undefined,
        employeeIds,
        leaveTypeId: parsed.leaveTypeId ?? undefined,
        status: parsed.status,
        periodStart: parsed.periodStart,
        periodEnd: parsed.periodEnd,
      }),
      context,
      parsed.employeeId
    ),
    parsed.page,
    parsed.pageSize
  );
}

export async function getLamLeaveReportForEmployee(
  employeeId: string,
  query: Pick<
    ListLamLeaveReportQuery,
    "periodStart" | "periodEnd" | "leaveTypeId" | "status"
  >,
  context?: LamReadContext
): Promise<LamLeaveReportEntry | null> {
  const entries = await listLamLeaveReportRecords(
    {
      employeeId,
      periodStart: query.periodStart,
      periodEnd: query.periodEnd,
      leaveTypeId: query.leaveTypeId,
      status: query.status,
      page: 1,
      pageSize: 1,
    },
    context
  );

  return entries[0] ?? null;
}
