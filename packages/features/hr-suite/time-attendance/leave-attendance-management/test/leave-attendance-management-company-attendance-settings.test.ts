import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  resolveLamAttendanceCorrectionsEnabled,
} from "../src/shared/attendance-corrections-enabled.ts";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import { upsertLamCompanyAttendanceSettings } from "../src/actions/company-attendance-settings.action.ts";
import { submitLamAttendanceCorrection } from "../src/actions/attendance-corrections.action.ts";
import { upsertLamAttendanceRecord } from "../src/actions/attendance-records.action.ts";
import { getLamCompanyAttendanceSettings } from "../src/queries/company-attendance-settings.query.ts";
import { defaultLamAttendanceCorrectionsEnabled } from "../src/shared/attendance-corrections-enabled.ts";

let currentRepositoryPath = "";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const correctionWriteContext = {
  ...writeContext,
  grantedCapabilities: ["hr.lam.attendance-corrections.write"],
} as const;

const readContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: true,
} as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `lam-company-attendance-settings-${randomUUID()}.json`
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

test("resolveLamAttendanceCorrectionsEnabled defaults to enabled without settings", () => {
  assert.equal(
    resolveLamAttendanceCorrectionsEnabled({
      companyId: "company-001",
      companyAttendanceSettings: [],
    }),
    true
  );
});

test("resolveLamAttendanceCorrectionsEnabled honors persisted company disablement", () => {
  assert.equal(
    resolveLamAttendanceCorrectionsEnabled({
      companyId: "company-001",
      companyAttendanceSettings: [
        {
          id: "settings-001",
          companyId: "company-001",
          attendanceCorrectionsEnabled: false,
          updatedAt: new Date(),
          updatedBy: "hr-admin",
        },
      ],
    }),
    false
  );
});

test("resolveLamAttendanceCorrectionsEnabled honors orchestration header disablement", () => {
  assert.equal(
    resolveLamAttendanceCorrectionsEnabled({
      companyId: "company-001",
      companyAttendanceSettings: [],
      contextEnabled: false,
    }),
    false
  );
});

test("AC-019 submit fails when attendance corrections are disabled for company", async () => {
  await upsertLamCompanyAttendanceSettings(
    {
      companyId: "company-001",
      attendanceCorrectionsEnabled: false,
    },
    writeContext
  );

  const recordResult = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-10"),
      status: "late",
      clockInAt: new Date("2026-06-10T09:30:00.000Z"),
      clockOutAt: new Date("2026-06-10T18:00:00.000Z"),
    },
    writeContext
  );
  assert.equal(recordResult.ok, true);
  if (!recordResult.ok) {
    throw new Error("Failed to seed attendance record");
  }

  const submitResult = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: recordResult.targetId,
      exceptionType: "late_arrival",
      requestedStatus: "present",
      reason: "Should be blocked",
    },
    correctionWriteContext
  );

  assert.equal(submitResult.ok, false);
  if (submitResult.ok) {
    throw new Error("Expected disabled correction submit to fail");
  }
  assert.match(submitResult.error, /disabled for this company/i);
});

test("getLamCompanyAttendanceSettings returns default enabled when unset", async () => {
  const settings = await getLamCompanyAttendanceSettings(readContext);
  assert.ok(settings);
  assert.equal(settings?.companyId, "company-001");
  assert.equal(
    settings?.attendanceCorrectionsEnabled,
    defaultLamAttendanceCorrectionsEnabled
  );
});
