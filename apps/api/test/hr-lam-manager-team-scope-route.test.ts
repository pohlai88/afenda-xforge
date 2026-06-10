import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  submitLamLeaveApplication,
  upsertLamAttendanceRecord,
  upsertLamLeaveType,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import { GET as listAttendanceExceptionsRoute } from "../app/api/hr/attendance/attendance-exceptions/route.ts";
import { GET as listLeaveApplicationsRoute } from "../app/api/hr/leave/leave-applications/route.ts";

let currentRepositoryPath = "";
let unpaidLeaveTypeId = "";

const calendarQuery = "startDateFrom=2026-07-01&startDateTo=2026-07-31";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const managerTeamBaseHeaders = {
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-read-lam": "false",
  "x-lam-team-employee-ids": "emp-001,emp-002",
} as const;

const managerTeamLeaveHeaders = {
  ...managerTeamBaseHeaders,
  "x-lam-capabilities":
    "hr.lam.leave-applications.read,hr.lam.leave-applications.approve",
};

const managerTeamExceptionsHeaders = {
  ...managerTeamBaseHeaders,
  "x-lam-capabilities": "hr.lam.attendance-corrections.read",
};

const seedManagerTeamData = async (): Promise<void> => {
  await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-02"),
      totalDays: 2,
      reason: "Team member leave",
    },
    writeContext
  );

  await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-002",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-10"),
      endDate: new Date("2026-07-11"),
      totalDays: 2,
      reason: "Other team member leave",
    },
    writeContext
  );

  await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-999",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-07-15"),
      endDate: new Date("2026-07-16"),
      totalDays: 2,
      reason: "Outside team leave",
    },
    writeContext
  );

  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-10"),
      status: "present",
      clockInAt: new Date("2026-06-10T09:00:00.000Z"),
      clockOutAt: new Date("2026-06-10T18:00:00.000Z"),
    },
    writeContext
  );

  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-002",
      attendanceDate: new Date("2026-06-10"),
      status: "absent",
    },
    writeContext
  );

  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-999",
      attendanceDate: new Date("2026-06-10"),
      status: "late",
    },
    writeContext
  );
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-manager-team-scope-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

  const unpaidType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "UNPAID",
      name: "Unpaid Leave",
      kind: "unpaid",
      paid: false,
      requiresDocument: false,
      active: true,
    },
    writeContext
  );
  assert.equal(unpaidType.ok, true);
  if (!unpaidType.ok) {
    throw new Error("Failed to seed unpaid leave type");
  }
  unpaidLeaveTypeId = unpaidType.targetId;
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("AC-022 leave applications route returns only team leave calendar entries through HTTP boundary", async () => {
  await seedManagerTeamData();

  const response = await listLeaveApplicationsRoute(
    new Request(
      `http://localhost/api/hr/leave/leave-applications?${calendarQuery}`,
      { headers: managerTeamLeaveHeaders }
    )
  );
  assert.equal(response.status, 200);

  const applications = (await response.json()) as Array<{ employeeId: string }>;
  assert.equal(applications.length, 2);
  assert.deepEqual(applications.map((entry) => entry.employeeId).sort(), [
    "emp-001",
    "emp-002",
  ]);
});

test("AC-022 attendance exceptions route returns only team exceptions through HTTP boundary", async () => {
  await seedManagerTeamData();

  const response = await listAttendanceExceptionsRoute(
    new Request("http://localhost/api/hr/attendance/attendance-exceptions", {
      headers: managerTeamExceptionsHeaders,
    })
  );
  assert.equal(response.status, 200);

  const exceptions = (await response.json()) as Array<{
    employeeId: string;
    exceptionType: string;
  }>;
  assert.equal(exceptions.length, 1);
  assert.equal(exceptions[0]?.employeeId, "emp-002");
  assert.equal(exceptions[0]?.exceptionType, "absence");
});

test("AC-022 manager team routes return empty when filtering outside-team employee id", async () => {
  await seedManagerTeamData();

  const leaveResponse = await listLeaveApplicationsRoute(
    new Request(
      "http://localhost/api/hr/leave/leave-applications?employeeId=emp-999",
      { headers: managerTeamLeaveHeaders }
    )
  );
  assert.equal(leaveResponse.status, 200);
  assert.deepEqual(await leaveResponse.json(), []);

  const exceptionResponse = await listAttendanceExceptionsRoute(
    new Request(
      "http://localhost/api/hr/attendance/attendance-exceptions?employeeId=emp-999",
      { headers: managerTeamExceptionsHeaders }
    )
  );
  assert.equal(exceptionResponse.status, 200);
  assert.deepEqual(await exceptionResponse.json(), []);
});

test("AC-022 manager team routes fail closed without team employee ids header", async () => {
  await seedManagerTeamData();

  const deniedLeaveHeaders = {
    "x-company-id": "company-001",
    "x-tenant-id": "tenant-001",
    "x-can-read-lam": "false",
    "x-lam-capabilities":
      "hr.lam.leave-applications.read,hr.lam.leave-applications.approve",
  };

  const leaveResponse = await listLeaveApplicationsRoute(
    new Request("http://localhost/api/hr/leave/leave-applications", {
      headers: deniedLeaveHeaders,
    })
  );
  assert.equal(leaveResponse.status, 200);
  assert.deepEqual(await leaveResponse.json(), []);

  const deniedExceptionHeaders = {
    "x-company-id": "company-001",
    "x-tenant-id": "tenant-001",
    "x-can-read-lam": "false",
    "x-lam-capabilities": "hr.lam.attendance-corrections.read",
  };

  const exceptionResponse = await listAttendanceExceptionsRoute(
    new Request("http://localhost/api/hr/attendance/attendance-exceptions", {
      headers: deniedExceptionHeaders,
    })
  );
  assert.equal(exceptionResponse.status, 200);
  assert.deepEqual(await exceptionResponse.json(), []);
});
