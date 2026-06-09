import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  createHrEmployeeRecordAction,
  updateHrEmployeeRecordAction,
} from "../src/hr.workforce.records.actions.server.ts";
import { buildHrEmployeeRecordDetailPageModel } from "../src/hr.workforce.records.detail.page-model.server.ts";
import { getHrEmployeeRecord } from "../src/hr.workforce.records.queries.ts";
import {
  resetHrEmployeeRecordsRepositoryForTesting,
  setHrEmployeeRecordsRepositoryPathForTesting,
} from "../src/repository.ts";

let repositoryPath = "";

const requireTargetId = (
  result: { ok: true; targetId?: string } | { ok: false; error: string }
): string => {
  if (!(result.ok && result.targetId)) {
    throw new Error("Expected mutation result to include targetId");
  }

  return result.targetId;
};

beforeEach(() => {
  repositoryPath = resolve(
    tmpdir(),
    `afenda-employee-records-profile-${randomUUID()}.json`
  );
  setHrEmployeeRecordsRepositoryPathForTesting(repositoryPath);
  resetHrEmployeeRecordsRepositoryForTesting();
});

afterEach(() => {
  try {
    rmSync(repositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for repository test artifacts.
  }
});

test("persists profile fields and projects sensitive detail reads", () => {
  const managerOne = createHrEmployeeRecordAction(
    {
      employeeNumber: "M100",
      legalName: "Manager One",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );
  const managerTwo = createHrEmployeeRecordAction(
    {
      employeeNumber: "M101",
      legalName: "Manager Two",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );
  const hrOwner = createHrEmployeeRecordAction(
    {
      employeeNumber: "H100",
      legalName: "HR Owner",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(managerOne.ok, true);
  assert.equal(managerTwo.ok, true);
  assert.equal(hrOwner.ok, true);

  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "E100",
      legalName: "Ari Worker",
      preferredName: "Ari",
      email: "ari@example.com",
      employmentStartDate: new Date("2026-01-02T00:00:00.000Z"),
      employmentType: "full-time",
      workerCategory: "employee",
      grade: "G7",
      level: "L2",
      legalEntityCode: "ENTITY-1",
      workLocationCode: "LOC-9",
      countryCode: "TH",
      contractStartDate: new Date("2026-01-15T00:00:00.000Z"),
      contractEndDate: new Date("2027-01-15T00:00:00.000Z"),
      currentDepartmentId: "dept-1",
      currentPositionId: "pos-1",
      managerEmployeeId: requireTargetId(managerOne),
      matrixManagerEmployeeId: requireTargetId(managerTwo),
      hrOwnerEmployeeId: requireTargetId(hrOwner),
      personalEmail: "ari.private@example.com",
      identityDocumentType: "passport",
      identityNumber: "ID-123456",
      nationality: "Thai",
      dateOfBirth: new Date("1990-05-15T00:00:00.000Z"),
      gender: "female",
      maritalStatus: "single",
      languagePreference: "en",
      phoneNumber: "+66812345678",
      residentialAddress: "1 Main St",
      mailingAddress: "1 Main St",
      emergencyContactName: "Jane Worker",
      emergencyContactRelationship: "Sibling",
      emergencyContactPhoneNumber: "+66987654321",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  assert.ok(created.targetId);

  const raw = getHrEmployeeRecord(created.targetId, {
    canRead: true,
    organizationId: "org-1",
  });

  assert.ok(raw);
  assert.equal(raw?.employmentType, "full-time");
  assert.equal(raw?.currentDepartmentId, "dept-1");
  assert.equal(raw?.personalEmail, "ari.private@example.com");
  assert.equal(raw?.emergencyContactPhoneNumber, "+66987654321");

  const masked = buildHrEmployeeRecordDetailPageModel({
    organizationId: "org-1",
    employeeId: created.targetId,
    canViewSensitive: false,
  });

  assert.ok(masked);
  assert.equal(masked?.employee.email, "ar***@example.com");
  assert.equal(masked?.employee.personalEmail, "ar***@example.com");
  assert.equal(masked?.employee.identityNumber, "ID***");
  assert.equal(masked?.employee.phoneNumber, "+66***");
  assert.equal(masked?.employee.residentialAddress, "hidden");
  assert.equal(masked?.employee.mailingAddress, "hidden");
  assert.equal(masked?.employee.dateOfBirth, "hidden");
  assert.equal(
    masked?.employee.employmentStartDate,
    "2026-01-02T00:00:00.000Z"
  );
  assert.equal(masked?.employee.contractStartDate, "2026-01-15T00:00:00.000Z");
  assert.equal(masked?.employee.contractEndDate, "2027-01-15T00:00:00.000Z");

  const sensitive = buildHrEmployeeRecordDetailPageModel({
    organizationId: "org-1",
    employeeId: created.targetId,
    canViewSensitive: true,
  });

  assert.ok(sensitive);
  assert.equal(sensitive?.employee.email, "ari@example.com");
  assert.equal(sensitive?.employee.personalEmail, "ari.private@example.com");
  assert.equal(sensitive?.employee.identityNumber, "ID-123456");
  assert.equal(sensitive?.employee.phoneNumber, "+66812345678");
  assert.equal(sensitive?.employee.dateOfBirth, "1990-05-15");

  const updated = updateHrEmployeeRecordAction(
    {
      employeeId: created.targetId,
      legalName: "Ari Worker Updated",
      personalEmail: "ari.updated@example.com",
      phoneNumber: "+66899999999",
    },
    {
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(updated.ok, true);

  const afterUpdate = getHrEmployeeRecord(created.targetId, {
    canRead: true,
    organizationId: "org-1",
  });

  assert.ok(afterUpdate);
  assert.equal(afterUpdate?.legalName, "Ari Worker Updated");
  assert.equal(afterUpdate?.personalEmail, "ari.updated@example.com");
  assert.equal(afterUpdate?.phoneNumber, "+66899999999");
});
