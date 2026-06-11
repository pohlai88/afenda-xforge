import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  createEmployeeSelfservicePortal,
  submitEmployeeSelfservicePortalProfileUpdateRequest,
} from "@repo/features-employee-management-employee-selfservice-portal/server";
import {
  installTestEssRuntimeTenantAccess,
  TEST_COMPANY_ID,
  TEST_TENANT_ID,
  uninstallTestRuntimeTenantAccess,
} from "./_runtime-access-fixture.ts";
import {
  resetComplianceRepositoryForTesting,
  saveComplianceRepository,
  setComplianceRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/compliance-regulatory-tracking/src/repository.ts";
import {
  complianceObligationSchema,
  complianceWorkerProfileSchema,
} from "../../../packages/features/hr-suite/employee-management/compliance-regulatory-tracking/src/schema.ts";
import {
  resetDocumentsManagementRepositoryForTesting,
  setDocumentsManagementRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/documents-management/src/repository.testing.ts";
import { upsertDocumentsManagementRepositoryDocumentObligation } from "../../../packages/features/hr-suite/employee-management/documents-management/src/repository.ts";
import { documentsManagementDocumentObligationSchema } from "../../../packages/features/hr-suite/employee-management/documents-management/src/schema.ts";
import { employeeLifecycleNotificationIntentSchema } from "../../../packages/features/hr-suite/employee-management/employee-lifecycle-management/src/contracts/automation.contract.ts";
import {
  resetEmployeeLifecycleRepositoryForTesting,
  setEmployeeLifecycleRepositoryPathForTesting,
  upsertEmployeeLifecycleNotificationIntent,
  upsertEmployeeLifecycleOnboardingRecord,
  upsertEmployeeLifecycleState,
} from "../../../packages/features/hr-suite/employee-management/employee-lifecycle-management/src/repository.ts";
import {
  employeeLifecycleOnboardingRecordSchema,
  employeeLifecycleStateSchema,
} from "../../../packages/features/hr-suite/employee-management/employee-lifecycle-management/src/schema.ts";
import {
  resetEmployeeSelfservicePortalRepositoryForTesting,
  setEmployeeSelfservicePortalRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/employee-selfservice-portal/src/repository.ts";
import {
  resetOffboardingRepositoryForTesting,
  setOffboardingRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/offboarding-exit-management/src/repository.testing.ts";
import { saveOffboardingRepository } from "../../../packages/features/hr-suite/employee-management/offboarding-exit-management/src/repository.ts";
import { offboardingCaseSchema } from "../../../packages/features/hr-suite/employee-management/offboarding-exit-management/src/schema.ts";
import { GET as getAuditTrailRoute } from "../app/api/hr/employee-selfservice-portal/audit-trail/route.ts";
import { GET as getNotificationsRoute } from "../app/api/hr/employee-selfservice-portal/notifications/route.ts";
import { GET as getRequestStatusRoute } from "../app/api/hr/employee-selfservice-portal/request-status/route.ts";
import { GET as getTasksRoute } from "../app/api/hr/employee-selfservice-portal/tasks/route.ts";

let sandboxDirectory = "";

const scope = {
  companyId: TEST_COMPANY_ID,
  tenantId: TEST_TENANT_ID,
};

const now = new Date("2026-06-10T00:00:00.000Z");

const buildRequest = (path: string): Request =>
  new Request(`http://localhost${path}`);

beforeEach(async () => {
  installTestEssRuntimeTenantAccess({
    actorEmployeeId: "employee-1",
    actorId: "employee-user",
    tenantId: scope.tenantId,
    userEmail: "employee.one@example.com",
  });
  sandboxDirectory = mkdtempSync(join(tmpdir(), "api-ess-workflow-"));

  setEmployeeSelfservicePortalRepositoryPathForTesting(
    join(sandboxDirectory, "ess-repository.json")
  );
  resetEmployeeSelfservicePortalRepositoryForTesting();
  setEmployeeLifecycleRepositoryPathForTesting(
    join(sandboxDirectory, "lifecycle-repository.json")
  );
  resetEmployeeLifecycleRepositoryForTesting();
  setOffboardingRepositoryPathForTesting(
    join(sandboxDirectory, "offboarding-repository.json")
  );
  await resetOffboardingRepositoryForTesting();
  setComplianceRepositoryPathForTesting(
    join(sandboxDirectory, "compliance-repository.json")
  );
  await resetComplianceRepositoryForTesting();
  setDocumentsManagementRepositoryPathForTesting(
    join(sandboxDirectory, "documents-repository.json")
  );
  resetDocumentsManagementRepositoryForTesting();

  createEmployeeSelfservicePortal(
    {
      displayName: "Employee One",
      employeeId: "employee-1",
      employeeNumber: "E001",
      locale: "en-US",
      workEmail: "employee.one@example.com",
    },
    {
      canWrite: true,
      companyId: scope.companyId,
      tenantId: scope.tenantId,
      userId: "hr-admin",
    }
  );

  submitEmployeeSelfservicePortalProfileUpdateRequest(
    {
      employeeId: "employee-1",
      requestedChanges: {
        preferredName: "New Preferred Name",
      },
      reason: "Update preferred name",
    },
    {
      actorEmployeeId: "employee-1",
      actorId: "employee-actor",
      canWrite: true,
      companyId: scope.companyId,
      tenantId: scope.tenantId,
      userId: "employee-user",
    }
  );

  upsertEmployeeLifecycleState(
    employeeLifecycleStateSchema.parse({
      companyId: scope.companyId,
      createdAt: now,
      currentStage: "onboarding",
      currentStageEffectiveAt: now,
      currentStageSequence: 0,
      employeeId: "employee-1",
      history: [
        {
          actorId: "hr-admin",
          employeeId: "employee-1",
          event: "hr.employee-lifecycle.state.initialized",
          effectiveAt: now,
          id: "lifecycle-state-init",
          metadata: {},
          recordedAt: now,
          sequence: 0,
          stage: "onboarding",
        },
      ],
      tenantId: scope.tenantId,
      updatedAt: now,
    }),
    scope
  );

  upsertEmployeeLifecycleOnboardingRecord(
    employeeLifecycleOnboardingRecordSchema.parse({
      activatedAt: null,
      companyId: scope.companyId,
      createdAt: now,
      employeeId: "employee-1",
      events: [],
      id: "onboarding-record-1",
      readyAt: null,
      startedAt: now,
      tasks: [
        {
          code: "policy_acknowledgment",
          completedAt: null,
          completedBy: null,
          createdAt: now,
          documentReferenceId: null,
          employeeId: "employee-1",
          id: "onboarding-task-1",
          notes: null,
          policyAcknowledgmentId: null,
          required: true,
          status: "pending",
          title: "Complete policy acknowledgments",
          updatedAt: now,
        },
      ],
      tenantId: scope.tenantId,
      updatedAt: now,
      workflowStatus: "in_progress",
    }),
    scope
  );

  upsertEmployeeLifecycleNotificationIntent(
    employeeLifecycleNotificationIntentSchema.parse({
      audienceRole: "employee",
      companyId: scope.companyId,
      createdAt: now,
      dedupeKey: "lifecycle-notification-onboarding-pending",
      dueAt: now,
      employeeId: "employee-1",
      id: "lifecycle-notification-1",
      kind: "onboarding_pending",
      metadata: {},
      reason: "Required onboarding tasks are still incomplete",
      sourceEventId: "onboarding-event-started",
      summary: "Onboarding tasks are pending",
      tenantId: scope.tenantId,
    }),
    scope
  );

  await saveOffboardingRepository(
    {
      approvals: [],
      auditEvents: [],
      cases: [
        offboardingCaseSchema.parse({
          companyId: scope.companyId,
          createdAt: now,
          departmentId: "dept-1",
          effectiveSeparationDate: new Date("2026-06-20T00:00:00.000Z"),
          employeeId: "employee-1",
          exitType: "resignation",
          id: "offboarding-case-1",
          initiatedBy: "employee-1",
          initiationSource: "employee",
          lastWorkingDate: new Date("2026-06-18T00:00:00.000Z"),
          legalEntityCode: "LE-1",
          legalReviewRequired: false,
          lifecycleExitReference: null,
          managerEmployeeId: "manager-1",
          noticeEndDate: new Date("2026-06-18T00:00:00.000Z"),
          noticeStartDate: now,
          policyReference: null,
          reason: "Voluntary resignation",
          reasonDetails: "Pending employee handover",
          requiredNoticeDays: 30,
          riskLevel: "medium",
          status: "open",
          tenantId: scope.tenantId,
          updatedAt: now,
          waivedNotice: false,
          waivedNoticeReason: null,
          workLocationCode: "BKK",
        }),
      ],
    },
    scope
  );

  await saveComplianceRepository(
    {
      alertStates: [],
      auditEvents: [],
      correctiveActions: [],
      evidence: [],
      exceptions: [],
      filings: [],
      obligations: [
        complianceObligationSchema.parse({
          active: true,
          code: "CMP-001",
          companyId: scope.companyId,
          createdAt: now,
          description: "Complete annual compliance training",
          effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
          effectiveTo: null,
          expectedEvidenceType: "training_certificate",
          id: "compliance-obligation-1",
          initialDueInDays: 1,
          jurisdictionSource: "internal-policy",
          ownerTeam: "Compliance",
          renewalEveryDays: null,
          requirementKind: "training",
          scope: {
            countryCode: "TH",
            departmentId: "dept-1",
            employmentType: "full_time",
            legalEntityCode: "LE-1",
            workLocationCode: "BKK",
            workerCategory: "employee",
          },
          severity: "high",
          title: "Annual compliance training",
          updatedAt: now,
          version: "v1",
        }),
      ],
      workerProfiles: [
        complianceWorkerProfileSchema.parse({
          active: true,
          companyId: scope.companyId,
          countryCode: "TH",
          createdAt: now,
          departmentId: "dept-1",
          displayName: "Employee One",
          employeeId: "employee-1",
          employeeNumber: "E001",
          employmentType: "full_time",
          hireDate: new Date("2025-01-01T00:00:00.000Z"),
          id: "compliance-worker-1",
          legalEntityCode: "LE-1",
          terminationDate: null,
          updatedAt: now,
          workLocationCode: "BKK",
          workerCategory: "employee",
        }),
      ],
    },
    scope
  );

  upsertDocumentsManagementRepositoryDocumentObligation(
    documentsManagementDocumentObligationSchema.parse({
      acknowledgmentId: null,
      companyId: scope.companyId,
      createdAt: now,
      description: null,
      documentCategory: "policy",
      documentType: "employee_handbook_acknowledgment",
      employeeId: "employee-1",
      evidenceDocumentId: null,
      expiresAt: null,
      fulfilledAt: null,
      id: "documents-obligation-1",
      jurisdictionCode: null,
      legalEntityCode: "LE-1",
      mandatory: true,
      obligationType: "policy_acknowledgment",
      policyId: "POL-001",
      policyVersion: "v1",
      retention: {
        action: "retain",
        anonymizeBeforeDeletion: false,
        archiveAfterEmployeeSeparation: false,
        retentionPeriodDays: null,
      },
      source: "policy-assignment",
      status: "pending",
      title: "Employee handbook acknowledgment",
      updatedAt: now,
      waivedAt: null,
    }),
    scope
  );
});

afterEach(() => {
  uninstallTestRuntimeTenantAccess();
  rmSync(sandboxDirectory, { force: true, recursive: true });
});

test("serves employee task, request-status, and notification routes and audits the reads", async () => {
  const tasksResponse = await getTasksRoute(
    buildRequest("/api/hr/employee-selfservice-portal/tasks")
  );
  const requestStatusResponse = await getRequestStatusRoute(
    buildRequest("/api/hr/employee-selfservice-portal/request-status")
  );
  const notificationsResponse = await getNotificationsRoute(
    buildRequest("/api/hr/employee-selfservice-portal/notifications")
  );
  const auditTrailResponse = await getAuditTrailRoute(
    buildRequest("/api/hr/employee-selfservice-portal/audit-trail")
  );

  assert.equal(tasksResponse.status, 200);
  assert.equal(requestStatusResponse.status, 200);
  assert.equal(notificationsResponse.status, 200);
  assert.equal(auditTrailResponse.status, 200);

  const tasks = (await tasksResponse.json()) as Array<{ category: string }>;
  const requestStatuses = (await requestStatusResponse.json()) as Array<{
    status: string;
  }>;
  const notifications = (await notificationsResponse.json()) as Array<{
    source: string;
  }>;
  const auditEntries = (await auditTrailResponse.json()) as Array<{
    action: string;
  }>;

  assert.equal(
    tasks.some((entry) => entry.category === "onboarding"),
    true
  );
  assert.equal(
    tasks.some((entry) => entry.category === "offboarding"),
    true
  );
  assert.equal(
    tasks.some((entry) => entry.category === "compliance"),
    true
  );
  assert.equal(
    tasks.some((entry) => entry.category === "hr"),
    true
  );
  assert.equal(requestStatuses.length, 1);
  assert.equal(requestStatuses[0]?.status, "pending_hr_review");
  assert.equal(
    notifications.some(
      (entry) => entry.source === "employee_lifecycle_management"
    ),
    true
  );
  assert.equal(
    notifications.some((entry) => entry.source === "documents_management"),
    true
  );
  assert.equal(
    notifications.some(
      (entry) => entry.source === "employee_selfservice_portal"
    ),
    true
  );
  assert.equal(
    auditEntries.some(
      (entry) => entry.action === "hr.employee-selfservice-portal.tasks.view"
    ),
    true
  );
  assert.equal(
    auditEntries.some(
      (entry) =>
        entry.action === "hr.employee-selfservice-portal.request-status.view"
    ),
    true
  );
  assert.equal(
    auditEntries.some(
      (entry) =>
        entry.action === "hr.employee-selfservice-portal.notifications.view"
    ),
    true
  );
});
