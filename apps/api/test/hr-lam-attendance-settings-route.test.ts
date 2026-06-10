import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { defaultLamAttendanceCorrectionsEnabled } from "@repo/features-time-attendance-leave-attendance-management/contract";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import {
  GET as getAttendanceSettingsRoute,
  POST as upsertAttendanceSettingsRoute,
} from "../app/api/hr/attendance/attendance-settings/route.ts";

let currentRepositoryPath = "";

const readHeaders = {
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-read-lam": "true",
} as const;

const writeHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-write-lam": "true",
  "x-lam-capabilities": "hr.lam.attendance.write",
  "x-actor-id": "hr-admin",
} as const;

const deniedHeaders = {
  "content-type": "application/json",
  "x-company-id": "company-001",
  "x-tenant-id": "tenant-001",
  "x-can-write-lam": "false",
} as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-attendance-settings-${randomUUID()}.json`
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

test("AC-019 attendance settings GET returns default enabled when unset", async () => {
  const response = await getAttendanceSettingsRoute(
    new Request("http://localhost/api/hr/attendance/attendance-settings", {
      headers: readHeaders,
    })
  );
  assert.equal(response.status, 200);

  const payload = (await response.json()) as {
    companyId: string;
    attendanceCorrectionsEnabled: boolean;
  };
  assert.equal(payload.companyId, "company-001");
  assert.equal(
    payload.attendanceCorrectionsEnabled,
    defaultLamAttendanceCorrectionsEnabled
  );
});

test("AC-019 attendance settings POST persists disablement and GET round-trips", async () => {
  const postResponse = await upsertAttendanceSettingsRoute(
    new Request("http://localhost/api/hr/attendance/attendance-settings", {
      method: "POST",
      headers: writeHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        attendanceCorrectionsEnabled: false,
      }),
    })
  );
  assert.equal(postResponse.status, 200);

  const postPayload = (await postResponse.json()) as { ok: boolean };
  assert.equal(postPayload.ok, true);

  const getResponse = await getAttendanceSettingsRoute(
    new Request("http://localhost/api/hr/attendance/attendance-settings", {
      headers: readHeaders,
    })
  );
  assert.equal(getResponse.status, 200);

  const settings = (await getResponse.json()) as {
    attendanceCorrectionsEnabled: boolean;
  };
  assert.equal(settings.attendanceCorrectionsEnabled, false);
});

test("attendance settings POST denies without write access", async () => {
  const response = await upsertAttendanceSettingsRoute(
    new Request("http://localhost/api/hr/attendance/attendance-settings", {
      method: "POST",
      headers: deniedHeaders,
      body: JSON.stringify({
        companyId: "company-001",
        attendanceCorrectionsEnabled: false,
      }),
    })
  );
  assert.equal(response.status, 403);
});

test("attendance settings POST returns 400 for invalid JSON body", async () => {
  const response = await upsertAttendanceSettingsRoute(
    new Request("http://localhost/api/hr/attendance/attendance-settings", {
      method: "POST",
      headers: writeHeaders,
      body: "{",
    })
  );
  assert.equal(response.status, 400);
});

test("attendance settings GET returns 400 without company context", async () => {
  const response = await getAttendanceSettingsRoute(
    new Request("http://localhost/api/hr/attendance/attendance-settings")
  );
  assert.equal(response.status, 400);
});
