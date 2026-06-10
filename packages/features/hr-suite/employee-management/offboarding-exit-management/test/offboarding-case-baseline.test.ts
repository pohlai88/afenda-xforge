import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  resetOffboardingRepositoryForTesting,
  setOffboardingRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  getOffboardingCaseById,
  listOffboardingCases,
  openOffboardingCase,
  updateOffboardingCase,
} from "../src/server.ts";

const buildLifecycleTrigger = (
  id: string,
  exitType: "resignation" | "termination" = "resignation"
) => ({
  sourceFeatureId:
    "hr-suite.employee-management.employee-lifecycle-management" as const,
  sourceLifecycleEventId: `lifecycle-event-${id}`,
  exitType,
  effectiveSeparationDate: new Date("2026-07-01T00:00:00.000Z"),
  lastWorkingDate: new Date("2026-06-30T00:00:00.000Z"),
  noticeStartDate: new Date("2026-06-01T00:00:00.000Z"),
  noticeEndDate: new Date("2026-06-30T00:00:00.000Z"),
  triggeredAt: new Date("2026-06-10T00:00:00.000Z"),
});

const baseReadContext = {
  actorId: "hr-admin",
  canRead: true,
  companyId: "company-001",
  tenantId: "tenant-001",
} as const;

const baseWriteContext = {
  ...baseReadContext,
  canWrite: true,
} as const;

let currentRepositoryPath = "";

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-offboarding-slice2-${randomUUID()}.json`
  );
  setOffboardingRepositoryPathForTesting(currentRepositoryPath);
  await resetOffboardingRepositoryForTesting();
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("creates, updates, lists, and gets scoped offboarding cases", async () => {
  const createdRecord = await openOffboardingCase(
    {
      caseTitle: "Resignation - Platform Engineer",
      employeeId: "emp-001",
      lifecycleTrigger: buildLifecycleTrigger("001"),
      reasonSummary: "Employee accepted a new role externally.",
    },
    baseWriteContext
  );

  assert.equal(createdRecord.tenantId, "tenant-001");
  assert.equal(createdRecord.companyId, "company-001");
  assert.equal(
    createdRecord.lifecycleTrigger.sourceLifecycleEventId,
    "lifecycle-event-001"
  );
  assert.equal(
    createdRecord.lastWorkingDate?.toISOString(),
    "2026-06-30T00:00:00.000Z"
  );

  const updatedRecord = await updateOffboardingCase(
    {
      id: createdRecord.id,
      status: "active",
      reasonSummary: "Knowledge transfer and payroll handoff are active.",
    },
    baseWriteContext
  );

  assert.equal(updatedRecord.status, "active");

  const fetchedRecord = await getOffboardingCaseById(
    createdRecord.id,
    baseReadContext
  );
  assert.equal(fetchedRecord?.id, createdRecord.id);
  assert.equal(
    fetchedRecord?.reasonSummary,
    "Knowledge transfer and payroll handoff are active."
  );

  const listedRecords = await listOffboardingCases(
    {
      employeeId: "emp-001",
      search: "Platform Engineer",
    },
    baseReadContext
  );

  assert.equal(listedRecords.length, 1);
  assert.equal(listedRecords[0]?.id, createdRecord.id);
});

test("denies reads when access is explicitly revoked", async () => {
  const createdRecord = await openOffboardingCase(
    {
      caseTitle: "Termination - Finance Analyst",
      employeeId: "emp-002",
      lifecycleTrigger: buildLifecycleTrigger("002", "termination"),
    },
    baseWriteContext
  );

  const deniedContext = {
    ...baseReadContext,
    canRead: false,
  } as const;

  assert.deepEqual(await listOffboardingCases({}, deniedContext), []);
  assert.equal(
    await getOffboardingCaseById(createdRecord.id, deniedContext),
    null
  );
});

test("denies writes when access is explicitly revoked", async () => {
  await assert.rejects(
    () =>
      openOffboardingCase(
        {
          caseTitle: "Denied write case",
          employeeId: "emp-003",
          lifecycleTrigger: buildLifecycleTrigger("003"),
        },
        {
          ...baseWriteContext,
          canWrite: false,
        }
      ),
    /Write access denied/i
  );

  const createdRecord = await openOffboardingCase(
    {
      caseTitle: "Resignation - Support Lead",
      employeeId: "emp-004",
      lifecycleTrigger: buildLifecycleTrigger("004"),
    },
    baseWriteContext
  );

  await assert.rejects(
    () =>
      updateOffboardingCase(
        {
          id: createdRecord.id,
          status: "active",
        },
        {
          ...baseWriteContext,
          canWrite: false,
        }
      ),
    /Write access denied/i
  );

  assert.equal(
    (await getOffboardingCaseById(createdRecord.id, baseReadContext))?.status,
    "draft"
  );
});

test("isolates offboarding cases across company scope", async () => {
  const companyOneRecord = await openOffboardingCase(
    {
      caseTitle: "Resignation - Designer",
      employeeId: "emp-005",
      lifecycleTrigger: buildLifecycleTrigger("005"),
    },
    baseWriteContext
  );

  const companyTwoContext = {
    ...baseWriteContext,
    companyId: "company-002",
  } as const;

  const companyTwoRecord = await openOffboardingCase(
    {
      caseTitle: "Resignation - Sales Lead",
      employeeId: "emp-006",
      lifecycleTrigger: buildLifecycleTrigger("006"),
    },
    companyTwoContext
  );

  const companyOneList = await listOffboardingCases({}, baseReadContext);
  assert.equal(
    companyOneList.some((record) => record.id === companyOneRecord.id),
    true
  );
  assert.equal(
    companyOneList.some((record) => record.id === companyTwoRecord.id),
    false
  );

  assert.equal(
    await getOffboardingCaseById(companyTwoRecord.id, baseReadContext),
    null
  );

  await assert.rejects(
    () =>
      updateOffboardingCase(
        {
          id: companyTwoRecord.id,
          status: "active",
        },
        baseWriteContext
      ),
    /could not be found/i
  );
});
