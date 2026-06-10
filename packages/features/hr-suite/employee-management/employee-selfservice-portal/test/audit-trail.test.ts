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
import {
  approveEmployeeSelfservicePortalProfileUpdateRequest,
  createEmployeeSelfservicePortalRecord,
  rejectEmployeeSelfservicePortalProfileUpdateRequest,
  submitEmployeeSelfservicePortalProfileUpdateRequest,
} from "../src/actions.ts";
import {
  resetEmployeeSelfservicePortalRepositoryForTesting,
  setEmployeeSelfservicePortalRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  configureEmployeeSelfservicePortalEmployeeRecordsIntegration,
  listEmployeeSelfservicePortalAuditTrailEvents,
  recordEmployeeSelfservicePortalAuditEvent,
  resetEmployeeSelfservicePortalEmployeeRecordsIntegrationForTesting,
} from "../src/server.ts";

let portalRepositoryPath = "";
let recordsRepositoryPath = "";

beforeEach(() => {
  portalRepositoryPath = resolve(
    tmpdir(),
    `afenda-employee-selfservice-audit-portal-${randomUUID()}.json`
  );
  recordsRepositoryPath = resolve(
    tmpdir(),
    `afenda-employee-selfservice-audit-records-${randomUUID()}.json`
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
  rmSync(portalRepositoryPath, { force: true });
  rmSync(recordsRepositoryPath, { force: true });
  resetEmployeeSelfservicePortalEmployeeRecordsIntegrationForTesting();
});

test("records audit events for self-service submission, approval, and rejection", async () => {
  const created = createHrEmployeeRecordAction(
    {
      employeeNumber: "E300",
      legalName: "Audit Worker",
      email: "audit.worker@example.com",
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

  createEmployeeSelfservicePortalRecord(
    {
      employeeId,
      employeeNumber: "E300",
      displayName: "Audit Worker",
      locale: "en-US",
      workEmail: "audit.worker@example.com",
    },
    {
      canWrite: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "hr-admin",
    }
  );

  const submitted = submitEmployeeSelfservicePortalProfileUpdateRequest(
    {
      employeeId,
      requestedChanges: {
        preferredName: "Audited",
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

  await approveEmployeeSelfservicePortalProfileUpdateRequest(
    {
      approvalReference: "APP-300",
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

  const secondSubmission = submitEmployeeSelfservicePortalProfileUpdateRequest(
    {
      employeeId,
      requestedChanges: {
        preferredName: "Rejected Name",
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

  rejectEmployeeSelfservicePortalProfileUpdateRequest(
    {
      rejectionReason: "Needs correction",
      requestId: secondSubmission.id,
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

  const auditEntries = listEmployeeSelfservicePortalAuditTrailEvents(
    {},
    {
      canRead: true,
      canReadAll: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "hr-reviewer",
    }
  );

  assert.equal(auditEntries.length, 4);
  assert.equal(
    auditEntries.some(
      (entry) =>
        entry.action ===
        "hr.employee-selfservice-portal.profile-update-request.submit"
    ),
    true
  );
  assert.equal(
    auditEntries.some(
      (entry) =>
        entry.action ===
        "hr.employee-selfservice-portal.profile-update-request.approve"
    ),
    true
  );
  assert.equal(
    auditEntries.some(
      (entry) =>
        entry.action ===
        "hr.employee-selfservice-portal.profile-update-request.reject"
    ),
    true
  );
});

test("restricts audit trail reads to own employee scope unless manager permissions apply", () => {
  recordEmployeeSelfservicePortalAuditEvent({
    action: "hr.employee-selfservice-portal.documents.view",
    context: {
      actorEmployeeId: "emp-1",
      canRead: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "employee-user",
    },
    employeeId: "emp-1",
    summary: "Viewed documents",
    targetId: "emp-1",
    targetType: "employee_documents",
  });

  const selfEvents = listEmployeeSelfservicePortalAuditTrailEvents(
    {},
    {
      actorEmployeeId: "emp-1",
      canRead: true,
      companyId: "company-1",
      tenantId: "tenant-1",
    }
  );
  const deniedEvents = listEmployeeSelfservicePortalAuditTrailEvents(
    {},
    {
      actorEmployeeId: "emp-2",
      canRead: true,
      companyId: "company-1",
      tenantId: "tenant-1",
    }
  );
  const managerEvents = listEmployeeSelfservicePortalAuditTrailEvents(
    {},
    {
      canRead: true,
      canReadAll: true,
      companyId: "company-1",
      tenantId: "tenant-1",
      userId: "manager-user",
    }
  );

  assert.equal(selfEvents.length, 1);
  assert.equal(deniedEvents.length, 0);
  assert.equal(managerEvents.length, 1);
});
