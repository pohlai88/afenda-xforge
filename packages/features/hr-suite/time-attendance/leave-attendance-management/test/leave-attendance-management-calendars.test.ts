import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { upsertLamHolidayCalendar } from "../src/actions/holiday-calendars.action.ts";
import { upsertLamWorkCalendar } from "../src/actions/work-calendars.action.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import {
  getLamHolidayCalendarById,
  getLamWorkCalendarById,
  listLamHolidayCalendarsRecords,
  listLamWorkCalendarsRecords,
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
  grantedCapabilities: [leaveAttendanceManagementCapabilities.calendarsWrite],
} as const;

const readContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: true,
  grantedCapabilities: [leaveAttendanceManagementCapabilities.calendarsRead],
} as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-calendars-${randomUUID()}.json`
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
      scope: { countryCode: "MY" },
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

test("HRM-LAM-031 upsertLamWorkCalendar creates, updates, and lists scoped calendars with audit trail", async () => {
  const created = await upsertLamWorkCalendar(
    {
      companyId: "company-001",
      code: "WC-KL",
      title: "KL Work Week",
      weekdayRules: {
        ...standardWeekdayRules,
        saturday: "rest_day",
      },
      effectiveFrom: new Date("2026-01-01"),
      scope: { workLocationCode: "KL-HQ" },
    },
    writeContext
  );

  assert.equal(created.ok, true);
  if (!created.ok) {
    return;
  }

  const updated = await upsertLamWorkCalendar(
    {
      id: created.targetId,
      companyId: "company-001",
      code: "WC-KL",
      title: "KL Work Week (Revised)",
      weekdayRules: {
        ...standardWeekdayRules,
        saturday: "rest_day",
      },
      effectiveFrom: new Date("2026-01-01"),
      scope: { workLocationCode: "KL-HQ" },
    },
    writeContext
  );
  assert.equal(updated.ok, true);

  const listed = await listLamWorkCalendarsRecords(
    { workLocationCode: "KL-HQ" },
    readContext
  );
  assert.equal(listed.length, 1);
  assert.equal(listed[0]?.title, "KL Work Week (Revised)");

  const state = await loadLamRepository(readContext);
  const auditEvents = state.auditEvents.filter(
    (event) => event.entityType === "work_calendar"
  );
  assert.ok(
    auditEvents.some(
      (event) =>
        event.action ===
        leaveAttendanceManagementAuditEvents.workCalendarCreated
    )
  );
  assert.ok(
    auditEvents.some(
      (event) =>
        event.action ===
        leaveAttendanceManagementAuditEvents.workCalendarUpdated
    )
  );
});

test("HRM-LAM-031 rejects duplicate work calendar codes within the same company", async () => {
  const duplicate = await upsertLamWorkCalendar(
    {
      companyId: "company-001",
      code: "wc-std",
      title: "Duplicate",
      weekdayRules: standardWeekdayRules,
      effectiveFrom: new Date("2026-01-01"),
    },
    writeContext
  );

  assert.equal(duplicate.ok, false);
  if (duplicate.ok) {
    return;
  }
  assert.match(duplicate.error, /already exists/i);
});

test("HRM-LAM-031 upsertLamHolidayCalendar links work calendar and lists holidays", async () => {
  const created = await upsertLamHolidayCalendar(
    {
      companyId: "company-001",
      code: "HC-MY",
      title: "Malaysia Public Holidays",
      workCalendarId,
      holidays: [
        {
          date: new Date("2026-08-31"),
          name: "National Day",
          kind: "public_holiday",
        },
      ],
      effectiveFrom: new Date("2026-01-01"),
      scope: { countryCode: "MY" },
    },
    writeContext
  );

  assert.equal(created.ok, true);
  if (!created.ok) {
    return;
  }

  const record = await getLamHolidayCalendarById(created.targetId, readContext);
  assert.equal(record?.workCalendarId, workCalendarId);
  assert.equal(record?.holidays.length, 1);

  const listed = await listLamHolidayCalendarsRecords(
    { workCalendarId, countryCode: "MY" },
    readContext
  );
  assert.equal(listed.length, 1);
});

test("HRM-LAM-031 rejects holiday calendar when linked work calendar is missing", async () => {
  const result = await upsertLamHolidayCalendar(
    {
      companyId: "company-001",
      code: "HC-ORPHAN",
      title: "Orphan Holiday Calendar",
      workCalendarId: "missing-calendar",
      effectiveFrom: new Date("2026-01-01"),
    },
    writeContext
  );

  assert.equal(result.ok, false);
});

test("HRM-LAM-031 read guards deny calendar listing without read access", async () => {
  const listed = await listLamWorkCalendarsRecords(
    {},
    {
      companyId: "company-001",
      tenantId: "tenant-001",
      canRead: false,
    }
  );
  assert.equal(listed.length, 0);

  const record = await getLamWorkCalendarById(workCalendarId, {
    companyId: "company-001",
    tenantId: "tenant-001",
    canRead: false,
  });
  assert.equal(record, null);
});

test("HRM-LAM-031 write guard denies calendar mutation without calendars write capability", async () => {
  const denied = await upsertLamWorkCalendar(
    {
      companyId: "company-001",
      code: "WC-DENIED",
      title: "Denied",
      weekdayRules: standardWeekdayRules,
      effectiveFrom: new Date("2026-01-01"),
    },
    {
      actorId: "hr-viewer",
      companyId: "company-001",
      tenantId: "tenant-001",
      canWrite: false,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.calendarsRead,
      ],
    }
  );

  assert.equal(denied.ok, false);
});
