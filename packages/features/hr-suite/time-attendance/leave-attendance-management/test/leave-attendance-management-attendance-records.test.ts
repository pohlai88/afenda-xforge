import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { upsertLamAttendanceRecord } from "../src/actions/attendance-records.action.ts";
import { upsertLamAttendanceRecordInputSchema } from "../src/contracts/command.contract.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import { requireLamAttendanceWriteAccess } from "../src/execution.ts";
import {
  getLamAttendanceRecordById,
  listLamAttendanceRecordsRecords,
} from "../src/queries/attendance-records.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  lamAttendanceRecordSchema,
  lamAttendanceStatusSchema,
  lamAttendanceStatusValues,
} from "../src/schema.ts";
import { lamAttendanceStatusLabels } from "../src/shared/attendance-status.ts";

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
  grantedCapabilities: [leaveAttendanceManagementCapabilities.attendanceRead],
} as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-attendance-records-${randomUUID()}.json`
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

test("HRM-LAM-002 attendance status enum covers all required statuses", () => {
  const required = [
    "present",
    "absent",
    "late",
    "early_out",
    "half_day",
    "rest_day",
    "off_day",
    "public_holiday",
    "missing_punch",
  ] as const;

  for (const status of required) {
    assert.ok(lamAttendanceStatusValues.includes(status));
    assert.equal(lamAttendanceStatusSchema.parse(status), status);
  }

  assert.equal(lamAttendanceStatusValues.length, 9);
  assert.equal(lamAttendanceStatusSchema.parse("early-out"), "early_out");
  assert.equal(lamAttendanceStatusSchema.parse("half-day"), "half_day");
  assert.equal(lamAttendanceStatusSchema.parse("holiday"), "public_holiday");
  assert.equal(
    lamAttendanceStatusSchema.parse("public-holiday"),
    "public_holiday"
  );

  for (const status of lamAttendanceStatusValues) {
    assert.ok(status in lamAttendanceStatusLabels);
    assert.ok(lamAttendanceStatusLabels[status].length > 0);
  }
});

test("HRM-LAM-002 upsert accepts holiday alias and persists public_holiday status", async () => {
  const created = await upsertLamAttendanceRecord(
    upsertLamAttendanceRecordInputSchema.parse({
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-12"),
      status: "holiday",
    }),
    writeContext
  );

  assert.equal(created.ok, true);
  if (!created.ok) {
    throw new Error("Expected holiday alias upsert to succeed");
  }

  const record = await getLamAttendanceRecordById(
    created.targetId,
    readContext
  );
  assert.equal(record?.status, "public_holiday");
});

test("HRM-LAM-001 upsertLamAttendanceRecord creates daily attendance record", async () => {
  const created = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-10"),
      status: "present",
      workCalendarId: "calendar-001",
      clockInAt: new Date("2026-06-10T09:00:00.000Z"),
      clockOutAt: new Date("2026-06-10T18:00:00.000Z"),
      notes: "On time",
    },
    writeContext
  );

  assert.equal(created.ok, true);
  if (!created.ok) {
    throw new Error("Expected attendance record creation to succeed");
  }

  const record = await getLamAttendanceRecordById(
    created.targetId,
    readContext
  );
  assert.ok(record);
  assert.equal(record?.employeeId, "emp-001");
  assert.equal(record?.status, "present");
  assert.equal(record?.workCalendarId, "calendar-001");
  assert.equal(record?.notes, "On time");
  assert.equal(
    record?.attendanceDate.toISOString(),
    "2026-06-10T00:00:00.000Z"
  );

  const state = await loadLamRepository(readContext);
  const audit = state.auditEvents.filter(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.attendanceRecordUpserted
  );
  assert.equal(audit.length, 1);
});

test("HRM-LAM-001 upsertLamAttendanceRecord updates existing record", async () => {
  const created = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-11"),
      status: "present",
    },
    writeContext
  );
  assert.equal(created.ok, true);
  if (!created.ok) {
    throw new Error("Expected attendance record creation to succeed");
  }

  const updated = await upsertLamAttendanceRecord(
    {
      id: created.targetId,
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-11"),
      status: "late",
      notes: "Traffic delay",
    },
    writeContext
  );
  assert.equal(updated.ok, true);

  const record = await getLamAttendanceRecordById(
    created.targetId,
    readContext
  );
  assert.equal(record?.status, "late");
  assert.equal(record?.notes, "Traffic delay");
});

test("HRM-LAM-001 rejects duplicate employee and attendance date", async () => {
  const first = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-12"),
      status: "present",
    },
    writeContext
  );
  assert.equal(first.ok, true);

  const duplicate = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-12T15:30:00.000Z"),
      status: "absent",
    },
    writeContext
  );
  assert.equal(duplicate.ok, false);
  if (duplicate.ok) {
    throw new Error("Expected duplicate attendance date to fail");
  }
  assert.match(duplicate.error, /already exists/i);
});

test("HRM-LAM-001 AC-001 normalizes attendanceDate to UTC calendar day on upsert", async () => {
  const created = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-13T22:45:00.000Z"),
      status: "present",
    },
    writeContext
  );
  assert.equal(created.ok, true);
  if (!created.ok) {
    throw new Error("Expected attendance record creation to succeed");
  }

  const record = await getLamAttendanceRecordById(
    created.targetId,
    readContext
  );
  assert.equal(
    record?.attendanceDate.toISOString(),
    "2026-06-13T00:00:00.000Z"
  );
});

test("HRM-LAM-001 AC-001 attendance records are isolated by company", async () => {
  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-14"),
      status: "present",
    },
    writeContext
  );

  const otherCompanyRecords = await listLamAttendanceRecordsRecords(
    {},
    {
      companyId: "company-002",
      tenantId: "tenant-001",
      canRead: true,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.attendanceRead,
      ],
    }
  );
  assert.equal(otherCompanyRecords.length, 0);
});

test("HRM-LAM-001 listLamAttendanceRecordsRecords filters by employee, status, and date range", async () => {
  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-01"),
      status: "present",
      workCalendarId: "calendar-001",
    },
    writeContext
  );
  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-02"),
      status: "absent",
      workCalendarId: "calendar-001",
    },
    writeContext
  );
  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-002",
      attendanceDate: new Date("2026-06-02"),
      status: "present",
    },
    writeContext
  );

  const byEmployee = await listLamAttendanceRecordsRecords(
    { employeeId: "emp-001" },
    readContext
  );
  assert.equal(byEmployee.length, 2);

  const byStatus = await listLamAttendanceRecordsRecords(
    { employeeId: "emp-001", status: "absent" },
    readContext
  );
  assert.equal(byStatus.length, 1);
  assert.equal(byStatus[0]?.status, "absent");

  const byDateRange = await listLamAttendanceRecordsRecords(
    {
      employeeId: "emp-001",
      attendanceDateFrom: new Date("2026-06-02"),
      attendanceDateTo: new Date("2026-06-02"),
    },
    readContext
  );
  assert.equal(byDateRange.length, 1);

  const byCalendar = await listLamAttendanceRecordsRecords(
    { workCalendarId: "calendar-001" },
    readContext
  );
  assert.equal(byCalendar.length, 2);
});

test("attendance record schema validates all ledger fields", () => {
  const parsed = lamAttendanceRecordSchema.parse({
    id: "rec-001",
    companyId: "company-001",
    employeeId: "emp-001",
    attendanceDate: new Date("2026-06-10"),
    status: "half_day",
    workCalendarId: "calendar-001",
    clockInAt: new Date("2026-06-10T09:00:00.000Z"),
    clockOutAt: new Date("2026-06-10T13:00:00.000Z"),
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  assert.equal(parsed.status, "half_day");
});

test("attendance write access gate requires attendance write capability or write access", () => {
  assert.equal(requireLamAttendanceWriteAccess(undefined)?.ok, false);
  assert.equal(requireLamAttendanceWriteAccess(writeContext), null);
  assert.equal(
    requireLamAttendanceWriteAccess({
      companyId: "company-001",
      canWrite: false,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.attendanceWrite,
      ],
    }),
    null
  );
  assert.equal(
    requireLamAttendanceWriteAccess({
      companyId: "company-001",
      canWrite: false,
      grantedCapabilities: [],
    })?.ok,
    false
  );
});

test("attendance record queries fail closed without read access", async () => {
  assert.equal(
    (await listLamAttendanceRecordsRecords({}, { companyId: "company-001" }))
      .length,
    0
  );
  assert.equal(
    await getLamAttendanceRecordById("missing", { companyId: "company-001" }),
    null
  );
});

test("upsertLamAttendanceRecord fails closed without write access", async () => {
  const result = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-10"),
      status: "present",
    },
    { companyId: "company-001", canWrite: false }
  );

  assert.equal(result.ok, false);
});

test("upsertLamAttendanceRecord rejects clockOutAt before clockInAt", async () => {
  const result = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-10"),
      status: "present",
      clockInAt: new Date("2026-06-10T18:00:00.000Z"),
      clockOutAt: new Date("2026-06-10T09:00:00.000Z"),
    },
    writeContext
  );

  assert.equal(result.ok, false);
  assert.match(result.error, /clockOutAt/i);
});
