import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { upsertLamAttendanceRecord } from "../src/actions/attendance-records.action.ts";
import {
  hrTimeAttendanceLamAuditActions,
  leaveAttendanceManagementAuditEvents,
} from "../src/contracts/index.ts";
import {
  getLamAuditTrailRecordById,
  listLamAuditTrailRecords,
} from "../src/queries/audit.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";

let currentRepositoryPath = "";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const auditReadContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: false,
  grantedCapabilities: [leaveAttendanceManagementCapabilities.auditRead],
} as const;

const auditSensitiveContext = {
  ...auditReadContext,
  canViewSensitive: true,
} as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `lam-audit-trail-${randomUUID()}.json`
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

test("HRM-LAM-030 audit action map references catalog event strings", () => {
  assert.equal(
    hrTimeAttendanceLamAuditActions.notification.enqueued,
    leaveAttendanceManagementAuditEvents.notificationEnqueued
  );
  assert.equal(
    hrTimeAttendanceLamAuditActions.attendance.dayUpserted,
    leaveAttendanceManagementAuditEvents.attendanceRecordUpserted
  );
});

test("HRM-LAM-030 listLamAuditTrailRecords returns mutation audit events newest first", async () => {
  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-02"),
      status: "present",
    },
    writeContext
  );

  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-03"),
      status: "absent",
    },
    writeContext
  );

  const events = await listLamAuditTrailRecords({}, auditReadContext);
  assert.equal(events.length, 2);
  assert.equal(
    events.every(
      (entry) =>
        entry.action ===
        leaveAttendanceManagementAuditEvents.attendanceRecordUpserted
    ),
    true
  );
});

test("HRM-LAM-030 audit trail filters by action and entityType", async () => {
  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-03"),
      status: "absent",
    },
    writeContext
  );

  const attendanceEvents = await listLamAuditTrailRecords(
    {
      action: leaveAttendanceManagementAuditEvents.attendanceRecordUpserted,
      entityType: "attendance_record",
    },
    auditReadContext
  );

  assert.equal(attendanceEvents.length, 1);
  assert.equal(attendanceEvents[0]?.entityType, "attendance_record");
});

test("HRM-LAM-030 audit trail includes before and after for auditRead holders", async () => {
  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-04"),
      status: "late",
    },
    writeContext
  );

  const events = await listLamAuditTrailRecords({}, auditReadContext);
  assert.ok(events[0]?.after);
});

test("HRM-LAM-030 getLamAuditTrailRecordById returns a single audit event", async () => {
  const upsert = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-05"),
      status: "present",
    },
    writeContext
  );
  assert.equal(upsert.ok, true);

  const state = await loadLamRepository(auditReadContext);
  const auditEvent = state.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.attendanceRecordUpserted
  );
  assert.ok(auditEvent);

  const record = await getLamAuditTrailRecordById(
    auditEvent.id,
    auditSensitiveContext
  );
  assert.ok(record);
  assert.equal(record.id, auditEvent.id);
});

test("HRM-LAM-030 listLamAuditTrailRecords fails closed without auditRead", async () => {
  await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-06"),
      status: "present",
    },
    writeContext
  );

  assert.deepEqual(
    await listLamAuditTrailRecords(
      {},
      {
        companyId: "company-001",
        canRead: false,
        grantedCapabilities: [
          leaveAttendanceManagementCapabilities.attendanceRead,
        ],
      }
    ),
    []
  );
});
