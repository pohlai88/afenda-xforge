import "server-only";

import type {
  LamAttendanceRecord,
  ListLamAttendanceRecordsQuery,
} from "../contracts/index.ts";
import { listLamAttendanceRecordsQuerySchema } from "../contracts/index.ts";
import { loadLamRepository } from "../repository.ts";
import type { LamReadContext } from "../schema.ts";
import {
  canAccessLamEmployeeRecord,
  filterByCompany,
  filterByEmployeeDataScope,
  paginate,
  readContext,
} from "./shared.ts";

const isOnOrAfter = (value: Date, boundary: Date): boolean =>
  value.getTime() >= boundary.getTime();

const isOnOrBefore = (value: Date, boundary: Date): boolean =>
  value.getTime() <= boundary.getTime();

export async function listLamAttendanceRecordsRecords(
  query: ListLamAttendanceRecordsQuery = {},
  context?: LamReadContext
): Promise<readonly LamAttendanceRecord[]> {
  const parsed = listLamAttendanceRecordsQuerySchema.parse(query);
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return [];
  }

  return paginate(
    filterByEmployeeDataScope(
      filterByCompany(state.attendanceRecords, ctx.companyId),
      context,
      parsed.employeeId
    )
      .filter((entry) =>
        parsed.status ? entry.status === parsed.status : true
      )
      .filter((entry) =>
        parsed.workCalendarId
          ? entry.workCalendarId === parsed.workCalendarId
          : true
      )
      .filter((entry) =>
        parsed.attendanceDateFrom
          ? isOnOrAfter(entry.attendanceDate, parsed.attendanceDateFrom)
          : true
      )
      .filter((entry) =>
        parsed.attendanceDateTo
          ? isOnOrBefore(entry.attendanceDate, parsed.attendanceDateTo)
          : true
      )
      .sort(
        (left, right) =>
          right.attendanceDate.getTime() - left.attendanceDate.getTime()
      ),
    parsed.page,
    parsed.pageSize
  );
}

export async function getLamAttendanceRecordById(
  id: string,
  context?: LamReadContext
): Promise<LamAttendanceRecord | null> {
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return null;
  }

  const record =
    filterByCompany(state.attendanceRecords, ctx.companyId).find(
      (entry) => entry.id === id
    ) ?? null;

  if (!(record && canAccessLamEmployeeRecord(context, record.employeeId))) {
    return null;
  }

  return record;
}
