import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { upsertLamAttendanceRecord } from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import { GET as getAttendanceExceptionsForRecordRoute } from "../app/api/hr/attendance/attendance-exceptions/[recordId]/route.ts";
import { GET as listAttendanceExceptionsRoute } from "../app/api/hr/attendance/attendance-exceptions/route.ts";

let currentRepositoryPath = "";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const exceptionsReadHeaders = {
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-read-lam": "true",
  "x-lam-capabilities": "hr.lam.attendance-corrections.read",
};

const deniedHeaders = {
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-read-lam": "false",
};

const seedRecord = async (args: {
  status: "late" | "absent" | "early_out" | "missing_punch" | "present";
  attendanceDate?: Date;
  clockInAt?: Date | null;
  clockOutAt?: Date | null;
}): Promise<string> => {
  const result = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: args.attendanceDate ?? new Date("2026-06-10"),
      status: args.status,
      clockInAt: args.clockInAt,
      clockOutAt: args.clockOutAt,
    },
    writeContext
  );
  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Failed to seed attendance record");
  }
  return result.targetId;
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-attendance-exceptions-${randomUUID()}.json`
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

test("AC-018 attendance exceptions list route flags all four exception types through HTTP boundary", async () => {
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

  const response = await listAttendanceExceptionsRoute(
    new Request("http://localhost/api/hr/attendance/attendance-exceptions", {
      headers: exceptionsReadHeaders,
    })
  );
  assert.equal(response.status, 200);

  const exceptions = (await response.json()) as Array<{
    exceptionType: string;
    source: string;
  }>;
  assert.equal(exceptions.length, 4);
  assert.deepEqual(exceptions.map((entry) => entry.exceptionType).sort(), [
    "absence",
    "early_departure",
    "late_arrival",
    "missing_punch",
  ]);
});

test("AC-018 attendance exceptions detail route returns flagged exception for record", async () => {
  const recordId = await seedRecord({
    status: "present",
    attendanceDate: new Date("2026-06-09"),
    clockInAt: new Date("2026-06-09T09:00:00.000Z"),
    clockOutAt: null,
  });

  const response = await getAttendanceExceptionsForRecordRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-exceptions/${recordId}`,
      { headers: exceptionsReadHeaders }
    ),
    { params: Promise.resolve({ recordId }) }
  );
  assert.equal(response.status, 200);

  const exceptions = (await response.json()) as Array<{
    exceptionType: string;
    source: string;
  }>;
  assert.equal(exceptions.length, 1);
  assert.equal(exceptions[0]?.exceptionType, "missing_punch");
  assert.equal(exceptions[0]?.source, "clock_missing");
});

test("AC-018 attendance exceptions detail route applies clock policy query params", async () => {
  const recordId = await seedRecord({
    status: "present",
    attendanceDate: new Date("2026-06-14"),
    clockInAt: new Date("2026-06-14T09:20:00.000Z"),
    clockOutAt: new Date("2026-06-14T18:00:00.000Z"),
  });

  const response = await getAttendanceExceptionsForRecordRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-exceptions/${recordId}?scheduledClockInAt=2026-06-14T09:00:00.000Z&scheduledClockOutAt=2026-06-14T18:00:00.000Z&gracePeriodMinutes=5`,
      { headers: exceptionsReadHeaders }
    ),
    { params: Promise.resolve({ recordId }) }
  );
  assert.equal(response.status, 200);

  const exceptions = (await response.json()) as Array<{
    exceptionType: string;
    source: string;
  }>;
  assert.equal(exceptions.length, 1);
  assert.equal(exceptions[0]?.exceptionType, "late_arrival");
  assert.equal(exceptions[0]?.source, "clock_policy");
});

test("AC-018 attendance exceptions list route fails closed without corrections read capability", async () => {
  await seedRecord({ status: "late" });

  const response = await listAttendanceExceptionsRoute(
    new Request("http://localhost/api/hr/attendance/attendance-exceptions", {
      headers: deniedHeaders,
    })
  );
  assert.equal(response.status, 200);

  const exceptions = (await response.json()) as unknown[];
  assert.deepEqual(exceptions, []);
});

test("AC-018 attendance exceptions detail route returns empty without corrections read capability", async () => {
  const recordId = await seedRecord({ status: "absent" });

  const response = await getAttendanceExceptionsForRecordRoute(
    new Request(
      `http://localhost/api/hr/attendance/attendance-exceptions/${recordId}`,
      { headers: deniedHeaders }
    ),
    { params: Promise.resolve({ recordId }) }
  );
  assert.equal(response.status, 200);

  const exceptions = (await response.json()) as unknown[];
  assert.deepEqual(exceptions, []);
});
