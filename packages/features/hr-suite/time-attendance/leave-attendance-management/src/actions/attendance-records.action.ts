import "server-only";

import type {
  LamMutationResult,
  UpsertLamAttendanceRecordInput,
} from "../contracts/index.ts";
import {
  leaveAttendanceManagementAuditEvents,
  upsertLamAttendanceRecordInputSchema,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamAttendanceWriteAccess,
  requireLamEmployeeMutationScope,
} from "../execution.ts";
import {
  createLamRecordId,
  mutateLamRepository,
  upsertLamEntity,
} from "../repository.ts";
import { lamAttendanceRecordSchema, lamWriteContextSchema } from "../schema.ts";
import {
  isSameAttendanceDay,
  normalizeAttendanceDate,
} from "../shared/attendance-date.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected attendance record mutation failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error(
      "Company context is required for attendance record mutations"
    );
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

const findDuplicateAttendanceRecord = (
  records: readonly {
    id: string;
    companyId?: string | null;
    employeeId: string;
    attendanceDate: Date;
  }[],
  args: {
    id: string;
    companyId: string;
    employeeId: string;
    attendanceDate: Date;
  }
): boolean =>
  records.some(
    (entry) =>
      entry.id !== args.id &&
      entry.companyId === args.companyId &&
      entry.employeeId === args.employeeId &&
      isSameAttendanceDay(entry.attendanceDate, args.attendanceDate)
  );

export async function upsertLamAttendanceRecord(
  input: UpsertLamAttendanceRecordInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamAttendanceWriteAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = upsertLamAttendanceRecordInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    const attendanceDate = normalizeAttendanceDate(validInput.attendanceDate);
    const recordId = validInput.id ?? createLamRecordId();

    if (
      validInput.clockInAt &&
      validInput.clockOutAt &&
      validInput.clockOutAt.getTime() < validInput.clockInAt.getTime()
    ) {
      throw new Error("clockOutAt must be on or after clockInAt");
    }

    const scopeDenied = requireLamEmployeeMutationScope(
      context,
      validInput.employeeId
    );
    if (scopeDenied && !scopeDenied.ok) {
      return scopeDenied;
    }

    let targetId = "";

    await mutateLamRepository((draft) => {
      if (
        findDuplicateAttendanceRecord(draft.attendanceRecords, {
          id: recordId,
          companyId,
          employeeId: validInput.employeeId,
          attendanceDate,
        })
      ) {
        throw new Error(
          `Attendance record already exists for employee "${validInput.employeeId}" on ${attendanceDate.toISOString().slice(0, 10)}`
        );
      }

      const before = draft.attendanceRecords.find(
        (entry) => entry.id === recordId
      );
      const next = lamAttendanceRecordSchema.parse({
        id: recordId,
        companyId,
        employeeId: validInput.employeeId,
        attendanceDate,
        status: validInput.status,
        workCalendarId: validInput.workCalendarId ?? null,
        clockInAt: validInput.clockInAt ?? null,
        clockOutAt: validInput.clockOutAt ?? null,
        notes: validInput.notes ?? null,
        createdAt: before?.createdAt ?? new Date(),
        updatedAt: new Date(),
      });

      draft.attendanceRecords = upsertLamEntity(draft.attendanceRecords, next);
      targetId = next.id;

      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action: leaveAttendanceManagementAuditEvents.attendanceRecordUpserted,
          entityType: "attendance_record",
          entityId: next.id,
          summary: `Attendance ${next.status} for employee ${next.employeeId} on ${attendanceDate.toISOString().slice(0, 10)}`,
          metadata: buildLamAuditMetadata({
            employeeId: next.employeeId,
            attendanceDate: attendanceDate.toISOString(),
            status: next.status,
            workCalendarId: next.workCalendarId,
          }),
          before,
          after: next,
        })
      );
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}
