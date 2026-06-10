import type {
  LamAttendanceException,
  LamAttendanceExceptionDetectionPolicy,
  LamAttendanceRecord,
} from "../schema.ts";
import {
  lamAttendanceExceptionSchema,
  lamAttendanceExceptionTypeSchema,
} from "../schema.ts";

export type LamAttendanceExceptionSource = LamAttendanceException["source"];

const STATUS_EXCEPTION_MAP = {
  late: "late_arrival",
  early_out: "early_departure",
  absent: "absence",
  missing_punch: "missing_punch",
} as const satisfies Partial<
  Record<LamAttendanceRecord["status"], LamAttendanceException["exceptionType"]>
>;

export const buildAttendanceExceptionId = (args: {
  attendanceRecordId: string;
  exceptionType: LamAttendanceException["exceptionType"];
}): string => `${args.attendanceRecordId}:${args.exceptionType}`;

const buildAttendanceException = (args: {
  record: LamAttendanceRecord;
  exceptionType: LamAttendanceException["exceptionType"];
  source: LamAttendanceExceptionSource;
  detectedAt: Date;
}): LamAttendanceException =>
  lamAttendanceExceptionSchema.parse({
    id: buildAttendanceExceptionId({
      attendanceRecordId: args.record.id,
      exceptionType: args.exceptionType,
    }),
    attendanceRecordId: args.record.id,
    companyId: args.record.companyId ?? null,
    employeeId: args.record.employeeId,
    attendanceDate: args.record.attendanceDate,
    status: args.record.status,
    exceptionType: args.exceptionType,
    detectedAt: args.detectedAt,
    clockInAt: args.record.clockInAt ?? null,
    clockOutAt: args.record.clockOutAt ?? null,
    workCalendarId: args.record.workCalendarId ?? null,
    source: args.source,
  });

const hasExceptionType = (
  exceptions: readonly LamAttendanceException[],
  exceptionType: LamAttendanceException["exceptionType"]
): boolean => exceptions.some((entry) => entry.exceptionType === exceptionType);

const detectStatusBasedExceptions = (
  record: LamAttendanceRecord,
  detectedAt: Date
): LamAttendanceException[] => {
  const mapped =
    STATUS_EXCEPTION_MAP[record.status as keyof typeof STATUS_EXCEPTION_MAP];
  if (!mapped) {
    return [];
  }

  return [
    buildAttendanceException({
      record,
      exceptionType: mapped,
      source: "status",
      detectedAt,
    }),
  ];
};

const detectMissingClockExceptions = (
  record: LamAttendanceRecord,
  detectedAt: Date,
  existing: readonly LamAttendanceException[]
): LamAttendanceException[] => {
  if (record.status !== "present" && record.status !== "half_day") {
    return [];
  }

  if (record.clockInAt && record.clockOutAt) {
    return [];
  }

  if (hasExceptionType(existing, "missing_punch")) {
    return [];
  }

  return [
    buildAttendanceException({
      record,
      exceptionType: "missing_punch",
      source: "clock_missing",
      detectedAt,
    }),
  ];
};

const detectClockPolicyExceptions = (
  record: LamAttendanceRecord,
  policy: LamAttendanceExceptionDetectionPolicy | undefined,
  detectedAt: Date,
  existing: readonly LamAttendanceException[]
): LamAttendanceException[] => {
  if (!policy) {
    return [];
  }

  const graceMs = (policy.gracePeriodMinutes ?? 0) * 60_000;
  const next: LamAttendanceException[] = [];

  if (
    policy.scheduledClockInAt &&
    record.clockInAt &&
    record.clockInAt.getTime() >
      policy.scheduledClockInAt.getTime() + graceMs &&
    !hasExceptionType(existing, "late_arrival") &&
    !hasExceptionType(next, "late_arrival")
  ) {
    next.push(
      buildAttendanceException({
        record,
        exceptionType: "late_arrival",
        source: "clock_policy",
        detectedAt,
      })
    );
  }

  if (
    policy.scheduledClockOutAt &&
    record.clockOutAt &&
    record.clockOutAt.getTime() <
      policy.scheduledClockOutAt.getTime() - graceMs &&
    !hasExceptionType(existing, "early_departure") &&
    !hasExceptionType(next, "early_departure")
  ) {
    next.push(
      buildAttendanceException({
        record,
        exceptionType: "early_departure",
        source: "clock_policy",
        detectedAt,
      })
    );
  }

  return next;
};

export const detectAttendanceExceptionsFromRecord = (
  record: LamAttendanceRecord,
  policy?: LamAttendanceExceptionDetectionPolicy,
  detectedAt: Date = new Date()
): LamAttendanceException[] => {
  const statusExceptions = detectStatusBasedExceptions(record, detectedAt);
  const missingClockExceptions = detectMissingClockExceptions(
    record,
    detectedAt,
    statusExceptions
  );
  const combined = [...statusExceptions, ...missingClockExceptions];
  const policyExceptions = detectClockPolicyExceptions(
    record,
    policy,
    detectedAt,
    combined
  );

  return [...combined, ...policyExceptions];
};

export const recordHasAttendanceException = (
  record: LamAttendanceRecord,
  policy?: LamAttendanceExceptionDetectionPolicy
): boolean => detectAttendanceExceptionsFromRecord(record, policy).length > 0;

export const parseAttendanceExceptionType = (
  value: unknown
): LamAttendanceException["exceptionType"] =>
  lamAttendanceExceptionTypeSchema.parse(value);
