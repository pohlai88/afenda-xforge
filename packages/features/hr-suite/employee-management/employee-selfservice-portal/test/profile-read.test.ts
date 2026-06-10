import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { createHrEmployeeRecordAction } from "../../employee-records-management/src/actions.server.ts";
import { updateHrEmployeeRecord } from "../../employee-records-management/src/actions.ts";
import { buildHrEmployeeRecordDetailPageModel } from "../../employee-records-management/src/detail-page-model.server.ts";
import {
  resetHrEmployeeRecordsRepositoryForTesting,
  setHrEmployeeRecordsRepositoryPathForTesting,
} from "../../employee-records-management/src/repository.ts";
import { createEmployeeSelfservicePortalRecord } from "../src/actions.ts";
import { getEmployeeSelfservicePortalProfile } from "../src/queries/profile.query.ts";
import {
  resetEmployeeSelfservicePortalRepositoryForTesting,
  setEmployeeSelfservicePortalRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  configureEmployeeSelfservicePortalEmployeeRecordsIntegration,
  resetEmployeeSelfservicePortalEmployeeRecordsIntegrationForTesting,
} from "../src/server.ts";

let portalRepositoryPath = "";
let recordsRepositoryPath = "";

beforeEach(() => {
  portalRepositoryPath = resolve(
    tmpdir(),
    `afenda-employee-selfservice-profile-portal-${randomUUID()}.json`
  );
  recordsRepositoryPath = resolve(
    tmpdir(),
    `afenda-employee-selfservice-profile-records-${randomUUID()}.json`
  );

  setEmployeeSelfservicePortalRepositoryPathForTesting(portalRepositoryPath);
  resetEmployeeSelfservicePortalRepositoryForTesting();
  setHrEmployeeRecordsRepositoryPathForTesting(recordsRepositoryPath);
  resetHrEmployeeRecordsRepositoryForTesting();
  configureEmployeeSelfservicePortalEmployeeRecordsIntegration({
    applyApprovedProfileUpdate: async (input) =>
      updateHrEmployeeRecord(
        {
          employeeId: input.employeeId,
          ...input.requestedChanges,
          approvalReference: input.approvalReference,
          reason: input.reason,
        },
        {
          canViewSensitive: true,
          canWrite: true,
          organizationId: input.organizationId,
          userId: input.userId,
        }
      ),
    getProfileSource: (input) => {
      const detailPageModel = buildHrEmployeeRecordDetailPageModel(input);

      if (!detailPageModel) {
        return null;
      }

      return detailPageModel.employee;
    },
  });
});

afterEach(() => {
  try {
    rmSync(portalRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for portal repository artifacts.
  }

  try {
    rmSync(recordsRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for records repository artifacts.
  }

  resetEmployeeSelfservicePortalEmployeeRecordsIntegrationForTesting();
});

test("returns self profile with sensitive masking by default", () => {
  const createdRecord = createHrEmployeeRecordAction(
    {
      employeeNumber: "E100",
      legalName: "Alex Worker",
      preferredName: "Alex",
      email: "alex.worker@example.com",
      phoneNumber: "0812345678",
      personalEmail: "alex.personal@example.com",
      languagePreference: "en",
    },
    {
      canWrite: true,
      canViewSensitive: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(createdRecord.ok, true);
  assert.ok(createdRecord.targetId);
  const employeeId = createdRecord.targetId;

  createEmployeeSelfservicePortalRecord(
    {
      employeeId,
      employeeNumber: "E100",
      displayName: "Alex",
      workEmail: "alex.worker@example.com",
      locale: "en-US",
    },
    {
      canWrite: true,
      tenantId: "tenant-1",
      companyId: "company-1",
      userId: "hr-admin",
    }
  );

  const profile = getEmployeeSelfservicePortalProfile(
    {},
    {
      actorEmployeeId: createdRecord.targetId,
      canRead: true,
      canViewSensitive: false,
      companyId: "company-1",
      organizationId: "org-1",
      tenantId: "tenant-1",
    }
  );

  assert.ok(profile);
  assert.equal(profile.employeeId, employeeId);
  assert.equal(profile.displayName, "Alex");
  assert.equal(profile.email, "al***@example.com");
  assert.equal(profile.personalEmail, "al***@example.com");
  assert.equal(profile.phoneNumber, "081***");
  assert.equal(profile.canViewSensitive, false);
  assert.equal(profile.portalStatus, "invited");
});

test("allows elevated scoped reads and preserves sensitive visibility", () => {
  const createdRecord = createHrEmployeeRecordAction(
    {
      employeeNumber: "E101",
      legalName: "Taylor Manager",
      preferredName: "Taylor",
      email: "taylor.manager@example.com",
      phoneNumber: "0899999999",
      personalEmail: "taylor.personal@example.com",
      languagePreference: "en",
    },
    {
      canWrite: true,
      canViewSensitive: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(createdRecord.ok, true);
  assert.ok(createdRecord.targetId);

  createEmployeeSelfservicePortalRecord(
    {
      employeeId: createdRecord.targetId,
      employeeNumber: "E101",
      displayName: "Taylor",
      workEmail: "taylor.manager@example.com",
      locale: "en-US",
    },
    {
      canWrite: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "hr-admin",
    }
  );

  const profile = getEmployeeSelfservicePortalProfile(
    { employeeId: createdRecord.targetId },
    {
      actorEmployeeId: "manager-employee",
      canRead: true,
      canReadAll: true,
      canViewSensitive: true,
      companyId: "company-1",
      organizationId: "org-1",
      tenantId: "tenant-1",
      userId: "manager-user",
    }
  );

  assert.ok(profile);
  assert.equal(profile.email, "taylor.manager@example.com");
  assert.equal(profile.personalEmail, "taylor.personal@example.com");
  assert.equal(profile.phoneNumber, "0899999999");
  assert.equal(profile.canViewSensitive, true);
});

test("keeps manager reads masked when elevated access lacks sensitive entitlement", () => {
  const createdRecord = createHrEmployeeRecordAction(
    {
      employeeNumber: "E101B",
      legalName: "Masked Manager View",
      preferredName: "Masked",
      email: "masked.manager@example.com",
      phoneNumber: "0844444444",
      personalEmail: "masked.personal@example.com",
      languagePreference: "en",
    },
    {
      canWrite: true,
      canViewSensitive: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(createdRecord.ok, true);
  assert.ok(createdRecord.targetId);

  createEmployeeSelfservicePortalRecord(
    {
      employeeId: createdRecord.targetId,
      employeeNumber: "E101B",
      displayName: "Masked",
      workEmail: "masked.manager@example.com",
      locale: "en-US",
    },
    {
      canWrite: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "hr-admin",
    }
  );

  const profile = getEmployeeSelfservicePortalProfile(
    { employeeId: createdRecord.targetId },
    {
      actorEmployeeId: "manager-employee",
      canRead: true,
      canReadAll: true,
      canViewSensitive: false,
      companyId: "company-1",
      organizationId: "org-1",
      tenantId: "tenant-1",
      userId: "manager-user",
    }
  );

  assert.ok(profile);
  assert.equal(profile.email, "ma***@example.com");
  assert.equal(profile.personalEmail, "ma***@example.com");
  assert.equal(profile.phoneNumber, "084***");
  assert.equal(profile.canViewSensitive, false);
});

test("denies elevated scoped reads without authenticated user context", () => {
  const createdRecord = createHrEmployeeRecordAction(
    {
      employeeNumber: "E101A",
      legalName: "Taylor Manager",
      preferredName: "Taylor",
      email: "taylor.manager@example.com",
    },
    {
      canWrite: true,
      canViewSensitive: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(createdRecord.ok, true);
  assert.ok(createdRecord.targetId);

  createEmployeeSelfservicePortalRecord(
    {
      employeeId: createdRecord.targetId,
      employeeNumber: "E101A",
      displayName: "Taylor",
      workEmail: "taylor.manager@example.com",
      locale: "en-US",
    },
    {
      canWrite: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "hr-admin",
    }
  );

  const profile = getEmployeeSelfservicePortalProfile(
    { employeeId: createdRecord.targetId },
    {
      actorEmployeeId: "manager-employee",
      canRead: true,
      canReadAll: true,
      canViewSensitive: true,
      companyId: "company-1",
      organizationId: "org-1",
      tenantId: "tenant-1",
    }
  );

  assert.equal(profile, null);
});

test("denies cross-employee profile reads without elevated access", () => {
  const createdRecord = createHrEmployeeRecordAction(
    {
      employeeNumber: "E102",
      legalName: "Blocked Worker",
      email: "blocked.worker@example.com",
    },
    {
      canWrite: true,
      canViewSensitive: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(createdRecord.ok, true);
  assert.ok(createdRecord.targetId);

  const denied = getEmployeeSelfservicePortalProfile(
    { employeeId: createdRecord.targetId },
    {
      actorEmployeeId: "different-employee",
      canRead: true,
      canViewSensitive: false,
      organizationId: "org-1",
    }
  );

  assert.equal(denied, null);
});

test("projects profile data from employee records management instead of portal snapshot fields", () => {
  const createdRecord = createHrEmployeeRecordAction(
    {
      employeeNumber: "E103",
      legalName: "Morgan Source",
      preferredName: "Morgan Truth",
      email: "morgan.truth@example.com",
      phoneNumber: "0833333333",
      personalEmail: "morgan.personal@example.com",
      languagePreference: "th",
    },
    {
      canWrite: true,
      canViewSensitive: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(createdRecord.ok, true);
  assert.ok(createdRecord.targetId);
  const employeeId = createdRecord.targetId;

  createEmployeeSelfservicePortalRecord(
    {
      employeeId,
      employeeNumber: "E103",
      displayName: "Stale Portal Snapshot",
      workEmail: "stale.portal@example.com",
      locale: "en-US",
    },
    {
      canWrite: true,
      tenantId: "tenant-1",
      companyId: "company-1",
      userId: "hr-admin",
    }
  );

  const profile = getEmployeeSelfservicePortalProfile(
    {},
    {
      actorEmployeeId: employeeId,
      canRead: true,
      canViewSensitive: true,
      companyId: "company-1",
      organizationId: "org-1",
      tenantId: "tenant-1",
    }
  );

  assert.ok(profile);
  assert.equal(profile.displayName, "Morgan Truth");
  assert.equal(profile.email, "morgan.truth@example.com");
  assert.equal(profile.phoneNumber, "0833333333");
  assert.notEqual(profile.displayName, "Stale Portal Snapshot");
  assert.notEqual(profile.email, "stale.portal@example.com");
});
