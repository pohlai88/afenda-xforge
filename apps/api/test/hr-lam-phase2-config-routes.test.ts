import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { permissionCatalog } from "@repo/permissions";
import {
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/time-attendance/leave-attendance-management/src/repository.ts";
import { GET as getWorkCalendarByIdRoute } from "../app/api/hr/attendance/work-calendars/[calendarId]/route.ts";
import {
  GET as listWorkCalendarsRoute,
  POST as upsertWorkCalendarRoute,
} from "../app/api/hr/attendance/work-calendars/route.ts";

let currentRepositoryPath = "";

const readHeaders = {
  "x-can-read-lam": "true",
  "x-company-id": "company-001",
  "x-lam-capabilities": permissionCatalog.hrLam.calendarsWrite,
  "x-tenant-id": "tenant-001",
} as const;

const writeHeaders = {
  "content-type": "application/json",
  "x-actor-id": "hr-admin",
  "x-can-write-lam": "true",
  "x-company-id": "company-001",
  "x-lam-capabilities": permissionCatalog.hrLam.calendarsWrite,
  "x-tenant-id": "tenant-001",
} as const;

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `api-lam-work-calendars-${randomUUID()}.json`
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

test("phase 2 work calendar POST and GET-by-id routes round-trip", async () => {
  const postResponse = await upsertWorkCalendarRoute(
    new Request("http://localhost/api/hr/attendance/work-calendars", {
      body: JSON.stringify({
        code: "MY-STD",
        companyId: "company-001",
        effectiveFrom: "2026-01-01T00:00:00.000Z",
        title: "Malaysia Standard Week",
        weekdayRules: {
          friday: "working_day",
          monday: "working_day",
          saturday: "rest_day",
          sunday: "rest_day",
          thursday: "working_day",
          tuesday: "working_day",
          wednesday: "working_day",
        },
      }),
      headers: writeHeaders,
      method: "POST",
    })
  );

  assert.equal(postResponse.status, 201);
  const created = (await postResponse.json()) as {
    ok: boolean;
    targetId?: string;
  };
  assert.equal(created.ok, true);
  assert.ok(created.targetId);

  const getByIdResponse = await getWorkCalendarByIdRoute(
    new Request(
      `http://localhost/api/hr/attendance/work-calendars/${created.targetId}`,
      {
        headers: readHeaders,
      }
    ),
    { params: Promise.resolve({ calendarId: created.targetId ?? "" }) }
  );

  assert.equal(getByIdResponse.status, 200);
  const record = (await getByIdResponse.json()) as { code: string };
  assert.equal(record.code, "MY-STD");

  const listResponse = await listWorkCalendarsRoute(
    new Request("http://localhost/api/hr/attendance/work-calendars", {
      headers: readHeaders,
    })
  );

  assert.equal(listResponse.status, 200);
});

test("phase 2 work calendar POST denies without calendars write capability", async () => {
  const response = await upsertWorkCalendarRoute(
    new Request("http://localhost/api/hr/attendance/work-calendars", {
      body: JSON.stringify({
        code: "DENY",
        companyId: "company-001",
        effectiveFrom: "2026-01-01T00:00:00.000Z",
        title: "Denied",
        weekdayRules: {
          friday: "working_day",
          monday: "working_day",
          saturday: "rest_day",
          sunday: "rest_day",
          thursday: "working_day",
          tuesday: "working_day",
          wednesday: "working_day",
        },
      }),
      headers: {
        ...writeHeaders,
        "x-lam-capabilities": permissionCatalog.hrLam.attendancePolicyWrite,
      },
      method: "POST",
    })
  );

  const payload = (await response.json()) as { ok: boolean };
  assert.equal(payload.ok, false);
});
