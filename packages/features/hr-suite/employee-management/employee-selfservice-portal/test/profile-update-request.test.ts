import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { createHrEmployeeRecordAction } from "../../employee-records-management/src/actions.server.ts";
import { getHrEmployeeRecord } from "../../employee-records-management/src/queries.server.ts";
import {
  resetHrEmployeeRecordsRepositoryForTesting,
  setHrEmployeeRecordsRepositoryPathForTesting,
} from "../../employee-records-management/src/repository.ts";
import {
  approveEmployeeSelfservicePortalProfileUpdateRequest,
  createEmployeeSelfservicePortalRecord,
  rejectEmployeeSelfservicePortalProfileUpdateRequest,
  submitEmployeeSelfservicePortalProfileUpdateRequest,
} from "../src/actions.ts";
import {
  getEmployeeSelfservicePortalProfileUpdateRequestView,
  listEmployeeSelfservicePortalProfileUpdateRequestViews,
} from "../src/queries/profile-update-requests.query.ts";
import {
  mutateEmployeeSelfservicePortalRepository,
  resetEmployeeSelfservicePortalRepositoryForTesting,
  setEmployeeSelfservicePortalRepositoryPathForTesting,
} from "../src/repository.ts";

let portalRepositoryPath = "";
let recordsRepositoryPath = "";

beforeEach(() => {
  portalRepositoryPath = resolve(
    tmpdir(),
    `afenda-employee-selfservice-profile-update-portal-${randomUUID()}.json`
  );
  recordsRepositoryPath = resolve(
    tmpdir(),
    `afenda-employee-selfservice-profile-update-records-${randomUUID()}.json`
  );
  setEmployeeSelfservicePortalRepositoryPathForTesting(portalRepositoryPath);
  resetEmployeeSelfservicePortalRepositoryForTesting();
  setHrEmployeeRecordsRepositoryPathForTesting(recordsRepositoryPath);
  resetHrEmployeeRecordsRepositoryForTesting();
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
});

const createPortalRecordForEmployee = (
  employeeId: string,
  employeeNumber: string
) =>
  createEmployeeSelfservicePortalRecord(
    {
      displayName: employeeNumber,
      employeeId,
      employeeNumber,
      locale: "en-US",
      workEmail: `${employeeNumber.toLowerCase()}@example.com`,
    },
    {
      canWrite: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "hr-admin",
    }
  );

test("submits self-service profile update requests for self only", () => {
  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "E200",
      legalName: "Self Submit",
      email: "self.submit@example.com",
    },
    {
      canViewSensitive: true,
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  assert.ok(created.targetId);
  const employeeId = created.targetId;
  createPortalRecordForEmployee(employeeId, "E200");

  const request = submitEmployeeSelfservicePortalProfileUpdateRequest(
    {
      employeeId,
      reason: "Moved home",
      requestedChanges: {
        mailingAddress: "123 Example Street",
        phoneNumber: "0811111111",
      },
    },
    {
      actorEmployeeId: employeeId,
      actorId: "actor-1",
      canWrite: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "employee-user",
    }
  );

  assert.equal(request.status, "pending_hr_review");
  assert.equal(request.requiresSensitiveApproval, true);

  const selfList = listEmployeeSelfservicePortalProfileUpdateRequestViews(
    {},
    {
      actorEmployeeId: employeeId,
      canRead: true,
      companyId: "company-1",
      tenantId: "tenant-1",
    }
  );

  assert.equal(selfList.length, 1);
  assert.equal(selfList[0]?.id, request.id);

  assert.throws(
    () =>
      submitEmployeeSelfservicePortalProfileUpdateRequest(
        {
          employeeId,
          requestedChanges: { personalEmail: "bad@example.com" },
        },
        {
          actorEmployeeId: "another-employee",
          canWrite: true,
          companyId: "company-1",
          tenantId: "tenant-1",
          userId: "another-user",
        }
      ),
    /submission denied/i
  );
});

test("approves profile update requests and applies changes to employee records", async () => {
  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "E201",
      legalName: "Approve Request",
      email: "approve.request@example.com",
      phoneNumber: "0800000000",
      personalEmail: "before@example.com",
    },
    {
      canViewSensitive: true,
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  assert.ok(created.targetId);
  const employeeId = created.targetId;
  createPortalRecordForEmployee(employeeId, "E201");

  const submitted = submitEmployeeSelfservicePortalProfileUpdateRequest(
    {
      employeeId,
      requestedChanges: {
        personalEmail: "after@example.com",
        phoneNumber: "0822222222",
      },
    },
    {
      actorEmployeeId: employeeId,
      actorId: "actor-2",
      canWrite: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "employee-user",
    }
  );

  const approved = await approveEmployeeSelfservicePortalProfileUpdateRequest(
    {
      approvalReference: "APP-201",
      requestId: submitted.id,
    },
    {
      canReadAll: true,
      canViewSensitive: true,
      canWrite: true,
      companyId: "company-1",
      organizationId: "org-1",
      tenantId: "tenant-1",
      userId: "hr-reviewer",
    }
  );

  assert.equal(approved.status, "approved");

  const updatedRecord = getHrEmployeeRecord(employeeId, {
    canRead: true,
    canViewSensitive: true,
    organizationId: "org-1",
  });

  assert.ok(updatedRecord);
  assert.equal(updatedRecord.personalEmail, "after@example.com");
  assert.equal(updatedRecord.phoneNumber, "0822222222");
});

test("rejects profile update requests and preserves rejection reason", () => {
  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "E202",
      legalName: "Reject Request",
      email: "reject.request@example.com",
    },
    {
      canViewSensitive: true,
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  assert.ok(created.targetId);
  const employeeId = created.targetId;
  createPortalRecordForEmployee(employeeId, "E202");

  const submitted = submitEmployeeSelfservicePortalProfileUpdateRequest(
    {
      employeeId,
      requestedChanges: {
        emergencyContactPhoneNumber: "0899999999",
      },
    },
    {
      actorEmployeeId: employeeId,
      actorId: "actor-3",
      canWrite: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "employee-user",
    }
  );

  const rejected = rejectEmployeeSelfservicePortalProfileUpdateRequest(
    {
      rejectionReason: "Insufficient supporting evidence",
      requestId: submitted.id,
    },
    {
      canReadAll: true,
      canViewSensitive: true,
      canWrite: true,
      companyId: "company-1",
      organizationId: "org-1",
      tenantId: "tenant-1",
      userId: "hr-reviewer",
    }
  );

  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.rejectionReason, "Insufficient supporting evidence");

  const requestView = getEmployeeSelfservicePortalProfileUpdateRequestView(
    submitted.id,
    {
      actorEmployeeId: employeeId,
      canRead: true,
      companyId: "company-1",
      tenantId: "tenant-1",
    }
  );

  assert.ok(requestView);
  assert.equal(requestView.rejectionReason, "Insufficient supporting evidence");
});

test("denies profile update submission when no portal record exists for scope", () => {
  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "E203",
      legalName: "Missing Portal",
      email: "missing.portal@example.com",
    },
    {
      canViewSensitive: true,
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  assert.ok(created.targetId);

  assert.throws(
    () =>
      submitEmployeeSelfservicePortalProfileUpdateRequest(
        {
          employeeId: created.targetId,
          requestedChanges: {
            preferredName: "Portalless",
          },
        },
        {
          actorEmployeeId: created.targetId,
          canWrite: true,
          companyId: "company-1",
          tenantId: "tenant-1",
          userId: "employee-user",
        }
      ),
    /portal record not found/i
  );
});

test("denies sensitive approvals when reviewer lacks sensitive visibility", async () => {
  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "E204",
      legalName: "Sensitive Approval",
      email: "sensitive.approval@example.com",
    },
    {
      canViewSensitive: true,
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  assert.ok(created.targetId);
  createPortalRecordForEmployee(created.targetId, "E204");

  const submitted = submitEmployeeSelfservicePortalProfileUpdateRequest(
    {
      employeeId: created.targetId,
      requestedChanges: {
        phoneNumber: "0812345678",
      },
    },
    {
      actorEmployeeId: created.targetId,
      actorId: "actor-4",
      canWrite: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "employee-user",
    }
  );

  await assert.rejects(
    () =>
      approveEmployeeSelfservicePortalProfileUpdateRequest(
        {
          requestId: submitted.id,
        },
        {
          canReadAll: true,
          canWrite: true,
          companyId: "company-1",
          organizationId: "org-1",
          tenantId: "tenant-1",
          userId: "hr-reviewer",
        }
      ),
    /approval denied/i
  );
});

test("denies approval when portal record no longer exists for request scope", async () => {
  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "E205",
      legalName: "Lost Portal",
      email: "lost.portal@example.com",
    },
    {
      canViewSensitive: true,
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  assert.ok(created.targetId);
  createPortalRecordForEmployee(created.targetId, "E205");

  const submitted = submitEmployeeSelfservicePortalProfileUpdateRequest(
    {
      employeeId: created.targetId,
      requestedChanges: {
        preferredName: "Still Pending",
      },
    },
    {
      actorEmployeeId: created.targetId,
      actorId: "actor-5",
      canWrite: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "employee-user",
    }
  );

  mutateEmployeeSelfservicePortalRepository((snapshot) => ({
    ...snapshot,
    records: [],
  }));

  await assert.rejects(
    () =>
      approveEmployeeSelfservicePortalProfileUpdateRequest(
        {
          requestId: submitted.id,
        },
        {
          canReadAll: true,
          canViewSensitive: true,
          canWrite: true,
          companyId: "company-1",
          organizationId: "org-1",
          tenantId: "tenant-1",
          userId: "hr-reviewer",
        }
      ),
    /portal record not found/i
  );
});
