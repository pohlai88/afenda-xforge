import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { createHrEmployeeRecordAction } from "../../employee-records-management/src/actions.server.ts";
import { updateHrEmployeeRecord } from "../../employee-records-management/src/actions.ts";
import { buildHrEmployeeRecordDetailPageModel } from "../../employee-records-management/src/detail-page-model.server.ts";
import { getHrEmployeeRecord } from "../../employee-records-management/src/queries.server.ts";
import {
  resetHrEmployeeRecordsRepositoryForTesting,
  setHrEmployeeRecordsRepositoryPathForTesting,
} from "../../employee-records-management/src/repository.ts";
import {
  resetEmployeeSelfservicePortalRepositoryForTesting,
  setEmployeeSelfservicePortalRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  approveEmployeeSelfservicePortalProfileUpdateRequest,
  configureEmployeeSelfservicePortalEmployeeRecordsIntegration,
  createEmployeeSelfservicePortal,
  listEmployeeSelfservicePortalManagerApprovalInbox,
  rejectEmployeeSelfservicePortalProfileUpdateRequest,
  resetEmployeeSelfservicePortalEmployeeRecordsIntegrationForTesting,
  submitEmployeeSelfservicePortalProfileUpdateRequest,
} from "../src/server.ts";

let portalRepositoryPath = "";
let recordsRepositoryPath = "";
let managerEmployeeId = "";

beforeEach(() => {
  portalRepositoryPath = resolve(
    tmpdir(),
    `afenda-employee-selfservice-manager-inbox-portal-${randomUUID()}.json`
  );
  recordsRepositoryPath = resolve(
    tmpdir(),
    `afenda-employee-selfservice-manager-inbox-records-${randomUUID()}.json`
  );
  setEmployeeSelfservicePortalRepositoryPathForTesting(portalRepositoryPath);
  resetEmployeeSelfservicePortalRepositoryForTesting();
  setHrEmployeeRecordsRepositoryPathForTesting(recordsRepositoryPath);
  resetHrEmployeeRecordsRepositoryForTesting();
  configureEmployeeSelfservicePortalEmployeeRecordsIntegration({
    applyApprovedProfileUpdate: async (input) =>
      updateHrEmployeeRecord(
        {
          approvalReference: input.approvalReference,
          employeeId: input.employeeId,
          reason: input.reason,
          ...input.requestedChanges,
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
      return detailPageModel?.employee ?? null;
    },
  });
});

afterEach(() => {
  rmSync(portalRepositoryPath, { force: true });
  rmSync(recordsRepositoryPath, { force: true });
  resetEmployeeSelfservicePortalEmployeeRecordsIntegrationForTesting();
});

const createEmployeeWithPortal = () => {
  const managerCreated = createHrEmployeeRecordAction(
    {
      employeeNumber: "M300",
      legalName: "Direct Manager",
      email: "direct.manager@example.com",
    },
    {
      canViewSensitive: true,
      canWrite: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(managerCreated.ok, true);
  assert.ok(managerCreated.targetId);
  managerEmployeeId = managerCreated.targetId;

  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "E300",
      legalName: "Manager Approval Employee",
      email: "manager.approval.employee@example.com",
      managerEmployeeId,
      personalEmail: "before.manager.approval@example.com",
      phoneNumber: "0800003000",
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

  createEmployeeSelfservicePortal(
    {
      displayName: "E300",
      employeeId: created.targetId,
      employeeNumber: "E300",
      locale: "en-US",
      workEmail: "e300@example.com",
    },
    {
      canWrite: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "hr-admin",
    }
  );

  return created.targetId;
};

test("lists manager approval inbox items for direct reports only", () => {
  const employeeId = createEmployeeWithPortal();

  submitEmployeeSelfservicePortalProfileUpdateRequest(
    {
      employeeId,
      reason: "Need new contact information",
      requestedChanges: {
        personalEmail: "after.manager.approval@example.com",
        phoneNumber: "0822230000",
      },
    },
    {
      actorEmployeeId: employeeId,
      actorId: "employee-actor",
      canWrite: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "employee-user",
    }
  );

  const managerInbox = listEmployeeSelfservicePortalManagerApprovalInbox(
    {},
    {
      actorEmployeeId: managerEmployeeId,
      canRead: true,
      canReadAll: true,
      canViewSensitive: true,
      companyId: "company-1",
      organizationId: "org-1",
      tenantId: "tenant-1",
      userId: "manager-user",
    }
  );

  const unrelatedInbox = listEmployeeSelfservicePortalManagerApprovalInbox(
    {},
    {
      actorEmployeeId: "manager-2",
      canRead: true,
      canReadAll: true,
      canViewSensitive: true,
      companyId: "company-1",
      organizationId: "org-1",
      tenantId: "tenant-1",
      userId: "other-manager-user",
    }
  );

  assert.equal(managerInbox.length, 1);
  assert.equal(managerInbox[0]?.employeeId, employeeId);
  assert.deepEqual(managerInbox[0]?.changedFields, [
    "personalEmail",
    "phoneNumber",
  ]);
  assert.equal(managerInbox[0]?.canApprove, true);
  assert.equal(unrelatedInbox.length, 0);
});

test("allows direct managers to approve requests and denies unrelated managers", async () => {
  const employeeId = createEmployeeWithPortal();

  const submitted = submitEmployeeSelfservicePortalProfileUpdateRequest(
    {
      employeeId,
      requestedChanges: {
        personalEmail: "after.manager.approved@example.com",
      },
    },
    {
      actorEmployeeId: employeeId,
      actorId: "employee-actor-2",
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
          actorEmployeeId: "manager-2",
          canRead: true,
          canReadAll: true,
          canViewSensitive: true,
          canWrite: true,
          companyId: "company-1",
          organizationId: "org-1",
          tenantId: "tenant-1",
          userId: "other-manager-user",
        }
      ),
    /approval denied/i
  );

  const approved = await approveEmployeeSelfservicePortalProfileUpdateRequest(
    {
      approvalReference: "MGR-APP-300",
      requestId: submitted.id,
    },
    {
      actorEmployeeId: managerEmployeeId,
      canRead: true,
      canReadAll: true,
      canViewSensitive: true,
      canWrite: true,
      companyId: "company-1",
      organizationId: "org-1",
      tenantId: "tenant-1",
      userId: "manager-user",
    }
  );

  assert.equal(approved.status, "approved");

  const updatedRecord = getHrEmployeeRecord(employeeId, {
    canRead: true,
    canViewSensitive: true,
    organizationId: "org-1",
  });

  assert.ok(updatedRecord);
  assert.equal(
    updatedRecord.personalEmail,
    "after.manager.approved@example.com"
  );
});

test("allows direct managers to reject requests for direct reports", () => {
  const employeeId = createEmployeeWithPortal();

  const submitted = submitEmployeeSelfservicePortalProfileUpdateRequest(
    {
      employeeId,
      requestedChanges: {
        phoneNumber: "0899993000",
      },
    },
    {
      actorEmployeeId: employeeId,
      actorId: "employee-actor-3",
      canWrite: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "employee-user",
    }
  );

  const rejected = rejectEmployeeSelfservicePortalProfileUpdateRequest(
    {
      rejectionReason: "Manager requires supporting documentation",
      requestId: submitted.id,
    },
    {
      actorEmployeeId: managerEmployeeId,
      canRead: true,
      canReadAll: true,
      canViewSensitive: true,
      canWrite: true,
      companyId: "company-1",
      organizationId: "org-1",
      tenantId: "tenant-1",
      userId: "manager-user",
    }
  );

  assert.equal(rejected.status, "rejected");
  assert.equal(
    rejected.rejectionReason,
    "Manager requires supporting documentation"
  );
});
