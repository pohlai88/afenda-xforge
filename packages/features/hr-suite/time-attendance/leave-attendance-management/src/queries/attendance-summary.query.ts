import "server-only";

import type {
  LamAttendanceSummary,
  ListLamAttendanceSummaryQuery,
} from "../contracts/index.ts";
import { listLamAttendanceSummaryQuerySchema } from "../contracts/index.ts";
import {
  listAttendanceSummaries,
  resolveEmployeeIdsFilter,
} from "../projector/attendance-summary.ts";
import { loadLamRepository } from "../repository.ts";
import type { LamReadContext } from "../schema.ts";
import {
  filterByEmployeeDataScope,
  paginate,
  readReportsContext,
} from "./shared.ts";

export async function listLamAttendanceSummaryRecords(
  query: ListLamAttendanceSummaryQuery,
  context?: LamReadContext
): Promise<readonly LamAttendanceSummary[]> {
  const parsed = listLamAttendanceSummaryQuerySchema.parse(query);
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
      listAttendanceSummaries(state, {
        companyId: ctx.companyId,
        employeeId: parsed.employeeId ?? undefined,
        employeeIds,
        attendanceStatus: parsed.attendanceStatus,
        leaveTypeId: parsed.leaveTypeId ?? undefined,
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

export async function getLamAttendanceSummaryForEmployee(
  employeeId: string,
  query: Pick<ListLamAttendanceSummaryQuery, "periodStart" | "periodEnd">,
  context?: LamReadContext
): Promise<LamAttendanceSummary | null> {
  const summaries = await listLamAttendanceSummaryRecords(
    {
      employeeId,
      periodStart: query.periodStart,
      periodEnd: query.periodEnd,
      page: 1,
      pageSize: 1,
    },
    context
  );

  return summaries[0] ?? null;
}
