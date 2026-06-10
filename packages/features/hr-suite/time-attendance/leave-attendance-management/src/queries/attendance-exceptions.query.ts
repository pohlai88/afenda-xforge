import "server-only";

import type {
  LamAttendanceException,
  ListLamAttendanceExceptionsQuery,
} from "../contracts/index.ts";
import { listLamAttendanceExceptionsQuerySchema } from "../contracts/index.ts";
import { detectAttendanceExceptionsFromRecord } from "../projector/attendance-exceptions.ts";
import { loadLamRepository } from "../repository.ts";
import type { LamReadContext } from "../schema.ts";
import { lamAttendanceExceptionDetectionPolicySchema } from "../schema.ts";
import {
  canAccessLamEmployeeRecord,
  filterByCompany,
  filterByEmployeeDataScope,
  paginate,
  readAttendanceCorrectionsContext,
} from "./shared.ts";

const isOnOrAfter = (value: Date, boundary: Date): boolean =>
  value.getTime() >= boundary.getTime();

const isOnOrBefore = (value: Date, boundary: Date): boolean =>
  value.getTime() <= boundary.getTime();

const buildDetectionPolicy = (
  query: ListLamAttendanceExceptionsQuery
):
  | ReturnType<typeof lamAttendanceExceptionDetectionPolicySchema.parse>
  | undefined => {
  if (
    !(query.scheduledClockInAt || query.scheduledClockOutAt) &&
    query.gracePeriodMinutes === undefined
  ) {
    return;
  }

  return lamAttendanceExceptionDetectionPolicySchema.parse({
    scheduledClockInAt: query.scheduledClockInAt,
    scheduledClockOutAt: query.scheduledClockOutAt,
    gracePeriodMinutes: query.gracePeriodMinutes,
  });
};

export async function listLamAttendanceExceptionsRecords(
  query: ListLamAttendanceExceptionsQuery = {},
  context?: LamReadContext
): Promise<readonly LamAttendanceException[]> {
  const parsed = listLamAttendanceExceptionsQuerySchema.parse(query);
  const ctx = readAttendanceCorrectionsContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return [];
  }

  const policy = buildDetectionPolicy(parsed);
  const detectedAt = new Date();

  const exceptions = filterByEmployeeDataScope(
    filterByCompany(state.attendanceRecords, ctx.companyId),
    context,
    parsed.employeeId
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
    .flatMap((record) =>
      detectAttendanceExceptionsFromRecord(record, policy, detectedAt)
    )
    .filter((entry) =>
      parsed.exceptionType ? entry.exceptionType === parsed.exceptionType : true
    )
    .sort(
      (left, right) =>
        right.attendanceDate.getTime() - left.attendanceDate.getTime()
    );

  return paginate(exceptions, parsed.page, parsed.pageSize);
}

export async function getLamAttendanceExceptionsForRecord(
  attendanceRecordId: string,
  context?: LamReadContext,
  policyInput?: ListLamAttendanceExceptionsQuery
): Promise<readonly LamAttendanceException[]> {
  const ctx = readAttendanceCorrectionsContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return [];
  }

  const record = filterByCompany(state.attendanceRecords, ctx.companyId).find(
    (entry) => entry.id === attendanceRecordId
  );
  if (!(record && canAccessLamEmployeeRecord(context, record.employeeId))) {
    return [];
  }

  const policy = policyInput
    ? buildDetectionPolicy(
        listLamAttendanceExceptionsQuerySchema.parse(policyInput)
      )
    : undefined;

  return detectAttendanceExceptionsFromRecord(record, policy, new Date());
}
