import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { upsertLamAttendancePolicy } from "../src/actions/attendance-policies.action.ts";
import { upsertLamWorkCalendar } from "../src/actions/work-calendars.action.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import {
  getLamAttendancePolicyById,
  listLamAttendancePoliciesRecords,
} from "../src/queries/index.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";

let currentRepositoryPath = "";
let workCalendarId = "";

const standardWeekdayRules = {
  monday: "working_day",
  tuesday: "working_day",
  wednesday: "working_day",
  thursday: "working_day",
  friday: "working_day",
  saturday: "off_day",
  sunday: "off_day",
} as const;

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.attendancePolicyWrite,
    leaveAttendanceManagementCapabilities.calendarsWrite,
  ],
} as const;

const readContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: true,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.attendancePolicyRead,
  ],
} as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-attendance-policies-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

  const workCalendar = await upsertLamWorkCalendar(
    {
      companyId: "company-001",
      code: "WC-STD",
      title: "Standard Work Week",
      weekdayRules: standardWeekdayRules,
      effectiveFrom: new Date("2026-01-01"),
    },
    writeContext
  );
  assert.equal(workCalendar.ok, true);
  if (!workCalendar.ok) {
    throw new Error("Failed to seed work calendar");
  }
  workCalendarId = workCalendar.targetId;
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("HRM-LAM-032 upsertLamAttendancePolicy creates, updates, and lists scoped policies with audit trail", async () => {
  const created = await upsertLamAttendancePolicy(
    {
      companyId: "company-001",
      code: "AP-STD",
      title: "Standard Attendance Policy",
      gracePeriodMinutes: 10,
      latenessThresholdMinutes: 15,
      earlyDepartureThresholdMinutes: 15,
      absenceThresholdMinutes: 240,
      workCalendarId,
      effectiveFrom: new Date("2026-01-01"),
      scope: { legalEntityCode: "ACME-MY" },
    },
    writeContext
  );

  assert.equal(created.ok, true);
  if (!created.ok) {
    return;
  }

  const updated = await upsertLamAttendancePolicy(
    {
      id: created.targetId,
      companyId: "company-001",
      code: "AP-STD",
      title: "Standard Attendance Policy (Revised)",
      gracePeriodMinutes: 15,
      latenessThresholdMinutes: 20,
      earlyDepartureThresholdMinutes: 20,
      absenceThresholdMinutes: 240,
      workCalendarId,
      effectiveFrom: new Date("2026-01-01"),
      scope: { legalEntityCode: "ACME-MY" },
    },
    writeContext
  );
  assert.equal(updated.ok, true);

  const record = await getLamAttendancePolicyById(
    created.targetId,
    readContext
  );
  assert.equal(record?.gracePeriodMinutes, 15);
  assert.equal(record?.workCalendarId, workCalendarId);

  const listed = await listLamAttendancePoliciesRecords(
    { legalEntityCode: "ACME-MY" },
    readContext
  );
  assert.equal(listed.length, 1);

  const state = await loadLamRepository(readContext);
  assert.ok(
    state.auditEvents.some(
      (event) =>
        event.action ===
        leaveAttendanceManagementAuditEvents.attendancePolicyCreated
    )
  );
});

test("HRM-LAM-032 rejects attendance policy when work calendar reference is invalid", async () => {
  const result = await upsertLamAttendancePolicy(
    {
      companyId: "company-001",
      code: "AP-BAD",
      title: "Bad Reference",
      gracePeriodMinutes: 10,
      latenessThresholdMinutes: 15,
      earlyDepartureThresholdMinutes: 15,
      absenceThresholdMinutes: 240,
      workCalendarId: "missing-calendar",
      effectiveFrom: new Date("2026-01-01"),
    },
    writeContext
  );

  assert.equal(result.ok, false);
});

test("HRM-LAM-032 write guard denies attendance policy mutation without write capability", async () => {
  const denied = await upsertLamAttendancePolicy(
    {
      companyId: "company-001",
      code: "AP-DENIED",
      title: "Denied",
      gracePeriodMinutes: 10,
      latenessThresholdMinutes: 15,
      earlyDepartureThresholdMinutes: 15,
      absenceThresholdMinutes: 240,
      effectiveFrom: new Date("2026-01-01"),
    },
    {
      actorId: "hr-viewer",
      companyId: "company-001",
      tenantId: "tenant-001",
      canWrite: false,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.attendancePolicyRead,
      ],
    }
  );

  assert.equal(denied.ok, false);
});
