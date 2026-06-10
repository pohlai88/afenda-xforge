import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { upsertLamAttendanceRecord } from "../src/actions/attendance-records.action.ts";
import {
  detectAttendanceExceptionsFromRecord,
  recordHasAttendanceException,
} from "../src/projector/attendance-exceptions.ts";
import {
  getLamAttendanceExceptionsForRecord,
  listLamAttendanceExceptionsRecords,
} from "../src/queries/attendance-exceptions.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  lamAttendanceExceptionTypeValues,
  lamAttendanceRecordSchema,
} from "../src/schema.ts";

let currentRepositoryPath = "";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const readContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: true,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.attendanceCorrectionsRead,
  ],
} as const;

const seedRecord = async (args: {
  employeeId?: string;
  attendanceDate?: Date;
  status:
    | "present"
    | "absent"
    | "late"
    | "early_out"
    | "missing_punch"
    | "rest_day"
    | "off_day"
    | "public_holiday"
    | "half_day";
  clockInAt?: Date | null;
  clockOutAt?: Date | null;
}): Promise<string> => {
  const result = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: args.employeeId ?? "emp-001",
      attendanceDate: args.attendanceDate ?? new Date("2026-06-10"),
      status: args.status,
      clockInAt: args.clockInAt,
      clockOutAt: args.clockOutAt,
    },
    writeContext
  );
  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected attendance record seed to succeed");
  }
  return result.targetId;
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-attendance-exceptions-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("HRM-LAM-022 exception type enum covers late, early out, absence, and missing punch", () => {
  assert.deepEqual(lamAttendanceExceptionTypeValues, [
    "late_arrival",
    "early_departure",
    "absence",
    "missing_punch",
  ]);
});

test("AC-018 detects status-based exceptions for late, absent, early out, and missing punch", async () => {
  await seedRecord({ status: "late", attendanceDate: new Date("2026-06-01") });
  await seedRecord({
    status: "absent",
    attendanceDate: new Date("2026-06-02"),
  });
  await seedRecord({
    status: "early_out",
    attendanceDate: new Date("2026-06-03"),
  });
  await seedRecord({
    status: "missing_punch",
    attendanceDate: new Date("2026-06-04"),
  });

  const exceptions = await listLamAttendanceExceptionsRecords({}, readContext);
  const types = exceptions.map((entry) => entry.exceptionType).sort();

  assert.deepEqual(types, [
    "absence",
    "early_departure",
    "late_arrival",
    "missing_punch",
  ]);
});

test("HRM-LAM-022 non-exception statuses produce no flags", async () => {
  await seedRecord({
    status: "present",
    attendanceDate: new Date("2026-06-05"),
    clockInAt: new Date("2026-06-05T09:00:00.000Z"),
    clockOutAt: new Date("2026-06-05T18:00:00.000Z"),
  });
  await seedRecord({
    status: "rest_day",
    attendanceDate: new Date("2026-06-06"),
  });
  await seedRecord({
    status: "off_day",
    attendanceDate: new Date("2026-06-07"),
  });
  await seedRecord({
    status: "public_holiday",
    attendanceDate: new Date("2026-06-08"),
  });

  const exceptions = await listLamAttendanceExceptionsRecords({}, readContext);
  assert.equal(exceptions.length, 0);
});

test("HRM-LAM-022 detects missing punch when present record lacks clock times", async () => {
  const recordId = await seedRecord({
    status: "present",
    attendanceDate: new Date("2026-06-09"),
    clockInAt: new Date("2026-06-09T09:00:00.000Z"),
    clockOutAt: null,
  });

  const exceptions = await getLamAttendanceExceptionsForRecord(
    recordId,
    readContext
  );
  assert.equal(exceptions.length, 1);
  assert.equal(exceptions[0]?.exceptionType, "missing_punch");
  assert.equal(exceptions[0]?.source, "clock_missing");
});

test("HRM-LAM-022 detects late arrival from scheduled clock policy", () => {
  const record = lamAttendanceRecordSchema.parse({
    id: "rec-late-policy",
    companyId: "company-001",
    employeeId: "emp-001",
    attendanceDate: new Date("2026-06-10"),
    status: "present",
    workCalendarId: null,
    clockInAt: new Date("2026-06-10T09:20:00.000Z"),
    clockOutAt: new Date("2026-06-10T18:00:00.000Z"),
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const exceptions = detectAttendanceExceptionsFromRecord(record, {
    scheduledClockInAt: new Date("2026-06-10T09:00:00.000Z"),
    scheduledClockOutAt: new Date("2026-06-10T18:00:00.000Z"),
    gracePeriodMinutes: 5,
  });

  assert.equal(exceptions.length, 1);
  assert.equal(exceptions[0]?.exceptionType, "late_arrival");
  assert.equal(exceptions[0]?.source, "clock_policy");
});

test("HRM-LAM-022 detects early departure from scheduled clock policy", () => {
  const record = lamAttendanceRecordSchema.parse({
    id: "rec-early-policy",
    companyId: "company-001",
    employeeId: "emp-001",
    attendanceDate: new Date("2026-06-11"),
    status: "present",
    workCalendarId: null,
    clockInAt: new Date("2026-06-11T09:00:00.000Z"),
    clockOutAt: new Date("2026-06-11T17:30:00.000Z"),
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const exceptions = detectAttendanceExceptionsFromRecord(record, {
    scheduledClockInAt: new Date("2026-06-11T09:00:00.000Z"),
    scheduledClockOutAt: new Date("2026-06-11T18:00:00.000Z"),
    gracePeriodMinutes: 10,
  });

  assert.equal(exceptions.length, 1);
  assert.equal(exceptions[0]?.exceptionType, "early_departure");
  assert.equal(exceptions[0]?.source, "clock_policy");
});

test("HRM-LAM-022 listLamAttendanceExceptionsRecords filters by employee and exception type", async () => {
  await seedRecord({
    employeeId: "emp-001",
    status: "late",
    attendanceDate: new Date("2026-06-12"),
  });
  await seedRecord({
    employeeId: "emp-002",
    status: "absent",
    attendanceDate: new Date("2026-06-12"),
  });

  const lateOnly = await listLamAttendanceExceptionsRecords(
    { employeeId: "emp-001", exceptionType: "late_arrival" },
    readContext
  );
  assert.equal(lateOnly.length, 1);
  assert.equal(lateOnly[0]?.employeeId, "emp-001");
  assert.equal(lateOnly[0]?.exceptionType, "late_arrival");
});

test("AC-018 recordHasAttendanceException flags exception records only", () => {
  const exceptionRecord = lamAttendanceRecordSchema.parse({
    id: "rec-absent",
    companyId: "company-001",
    employeeId: "emp-001",
    attendanceDate: new Date("2026-06-13"),
    status: "absent",
    workCalendarId: null,
    clockInAt: null,
    clockOutAt: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const normalRecord = lamAttendanceRecordSchema.parse({
    ...exceptionRecord,
    id: "rec-present",
    status: "present",
    clockInAt: new Date("2026-06-13T09:00:00.000Z"),
    clockOutAt: new Date("2026-06-13T18:00:00.000Z"),
  });

  assert.equal(recordHasAttendanceException(exceptionRecord), true);
  assert.equal(recordHasAttendanceException(normalRecord), false);
});

test("HRM-LAM-022 list query coerces gracePeriodMinutes from string query params", async () => {
  await seedRecord({
    status: "present",
    attendanceDate: new Date("2026-06-14"),
    clockInAt: new Date("2026-06-14T09:20:00.000Z"),
    clockOutAt: new Date("2026-06-14T18:00:00.000Z"),
  });

  const exceptions = await listLamAttendanceExceptionsRecords(
    {
      scheduledClockInAt: new Date("2026-06-14T09:00:00.000Z"),
      scheduledClockOutAt: new Date("2026-06-14T18:00:00.000Z"),
      gracePeriodMinutes: "5" as unknown as number,
    },
    readContext
  );

  assert.equal(exceptions.length, 1);
  assert.equal(exceptions[0]?.exceptionType, "late_arrival");
  assert.equal(exceptions[0]?.id.endsWith(":late_arrival"), true);
});

test("AC-018 detects missing punch when half_day record lacks clock times", async () => {
  const recordId = await seedRecord({
    status: "half_day",
    attendanceDate: new Date("2026-06-15"),
    clockInAt: new Date("2026-06-15T09:00:00.000Z"),
    clockOutAt: null,
  });

  const exceptions = await getLamAttendanceExceptionsForRecord(
    recordId,
    readContext
  );
  assert.equal(exceptions.length, 1);
  assert.equal(exceptions[0]?.exceptionType, "missing_punch");
  assert.equal(exceptions[0]?.source, "clock_missing");
});

test("AC-018 list query applies clock policy consistently on get-by-record", async () => {
  const recordId = await seedRecord({
    status: "present",
    attendanceDate: new Date("2026-06-16"),
    clockInAt: new Date("2026-06-16T09:20:00.000Z"),
    clockOutAt: new Date("2026-06-16T18:00:00.000Z"),
  });

  const withoutPolicy = await getLamAttendanceExceptionsForRecord(
    recordId,
    readContext
  );
  assert.equal(withoutPolicy.length, 0);

  const withPolicy = await getLamAttendanceExceptionsForRecord(
    recordId,
    readContext,
    {
      scheduledClockInAt: new Date("2026-06-16T09:00:00.000Z"),
      scheduledClockOutAt: new Date("2026-06-16T18:00:00.000Z"),
      gracePeriodMinutes: 5,
    }
  );
  assert.equal(withPolicy.length, 1);
  assert.equal(withPolicy[0]?.exceptionType, "late_arrival");
  assert.equal(withPolicy[0]?.source, "clock_policy");
});

test("AC-018 attendance exception list respects employee data scope", async () => {
  await seedRecord({
    employeeId: "emp-001",
    status: "late",
    attendanceDate: new Date("2026-06-17"),
  });
  await seedRecord({
    employeeId: "emp-002",
    status: "absent",
    attendanceDate: new Date("2026-06-17"),
  });

  const scoped = await listLamAttendanceExceptionsRecords(
    {},
    {
      companyId: "company-001",
      tenantId: "tenant-001",
      scopedEmployeeId: "emp-001",
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.attendanceCorrectionsRead,
      ],
    }
  );
  assert.equal(scoped.length, 1);
  assert.equal(scoped[0]?.employeeId, "emp-001");
  assert.equal(scoped[0]?.exceptionType, "late_arrival");
});

test("AC-018 attendance exception queries fail closed with corrections read only without team scope or company read elevation", async () => {
  await seedRecord({
    status: "absent",
    attendanceDate: new Date("2026-06-18"),
  });

  const exceptions = await listLamAttendanceExceptionsRecords(
    {},
    {
      companyId: "company-001",
      tenantId: "tenant-001",
      canRead: false,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.attendanceCorrectionsRead,
      ],
    }
  );
  assert.deepEqual(exceptions, []);
});

test("AC-018 attendance exception queries succeed with company read elevation for corrections desk", async () => {
  await seedRecord({
    status: "absent",
    attendanceDate: new Date("2026-06-18"),
  });

  const exceptions = await listLamAttendanceExceptionsRecords(
    {},
    {
      companyId: "company-001",
      tenantId: "tenant-001",
      canRead: true,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.attendanceCorrectionsRead,
      ],
    }
  );
  assert.equal(exceptions.length, 1);
  assert.equal(exceptions[0]?.exceptionType, "absence");
});

test("attendance exception queries fail closed without read access", async () => {
  assert.equal(
    (await listLamAttendanceExceptionsRecords({}, { companyId: "company-001" }))
      .length,
    0
  );
  assert.deepEqual(
    await getLamAttendanceExceptionsForRecord("missing", {
      companyId: "company-001",
      canRead: false,
    }),
    []
  );
});
