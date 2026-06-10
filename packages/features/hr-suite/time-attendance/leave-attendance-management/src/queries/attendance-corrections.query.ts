import "server-only";

import type {
  LamAttendanceCorrection,
  ListLamAttendanceCorrectionsQuery,
} from "../contracts/index.ts";
import { listLamAttendanceCorrectionsQuerySchema } from "../contracts/index.ts";
import { loadLamRepository } from "../repository.ts";
import type { LamReadContext } from "../schema.ts";
import {
  canAccessLamEmployeeRecord,
  filterByCompany,
  filterByEmployeeDataScope,
  paginate,
  readAttendanceCorrectionsContext,
} from "./shared.ts";

export async function listLamAttendanceCorrectionsRecords(
  query: ListLamAttendanceCorrectionsQuery = {},
  context?: LamReadContext
): Promise<readonly LamAttendanceCorrection[]> {
  const parsed = listLamAttendanceCorrectionsQuerySchema.parse(query);
  const ctx = readAttendanceCorrectionsContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return [];
  }

  const corrections = filterByEmployeeDataScope(
    filterByCompany(state.attendanceCorrections, ctx.companyId),
    context,
    parsed.employeeId
  )
    .filter((entry) =>
      parsed.attendanceRecordId
        ? entry.attendanceRecordId === parsed.attendanceRecordId
        : true
    )
    .filter((entry) =>
      parsed.exceptionType ? entry.exceptionType === parsed.exceptionType : true
    )
    .filter((entry) => (parsed.status ? entry.status === parsed.status : true))
    .sort(
      (left, right) => right.submittedAt.getTime() - left.submittedAt.getTime()
    );

  return paginate(corrections, parsed.page, parsed.pageSize);
}

export async function getLamAttendanceCorrectionById(
  correctionId: string,
  context?: LamReadContext
): Promise<LamAttendanceCorrection | null> {
  const ctx = readAttendanceCorrectionsContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return null;
  }

  const correction = filterByCompany(
    state.attendanceCorrections,
    ctx.companyId
  ).find((entry) => entry.id === correctionId);

  if (
    !(correction && canAccessLamEmployeeRecord(context, correction.employeeId))
  ) {
    return null;
  }

  return correction;
}
