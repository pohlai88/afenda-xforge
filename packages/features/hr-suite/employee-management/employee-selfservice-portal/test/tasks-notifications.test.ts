import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  resetComplianceRepositoryForTesting,
  saveComplianceRepository,
  setComplianceRepositoryPathForTesting,
} from "../../compliance-regulatory-tracking/src/repository.ts";
import {
  complianceObligationSchema,
  complianceWorkerProfileSchema,
} from "../../compliance-regulatory-tracking/src/schema.ts";
import {
  resetDocumentsManagementRepositoryForTesting,
  setDocumentsManagementRepositoryPathForTesting,
} from "../../documents-management/src/repository.testing.ts";
import { upsertDocumentsManagementRepositoryDocumentObligation } from "../../documents-management/src/repository.ts";
import { documentsManagementDocumentObligationSchema } from "../../documents-management/src/schema.ts";
import { employeeLifecycleNotificationIntentSchema } from "../../employee-lifecycle-management/src/contracts/automation.contract.ts";
import {
  resetEmployeeLifecycleRepositoryForTesting,
  setEmployeeLifecycleRepositoryPathForTesting,
  upsertEmployeeLifecycleNotificationIntent,
  upsertEmployeeLifecycleOnboardingRecord,
  upsertEmployeeLifecycleState,
} from "../../employee-lifecycle-management/src/repository.ts";
import {
  employeeLifecycleOnboardingRecordSchema,
  employeeLifecycleStateSchema,
} from "../../employee-lifecycle-management/src/schema.ts";
import {
  resetOffboardingRepositoryForTesting,
  setOffboardingRepositoryPathForTesting,
} from "../../offboarding-exit-management/src/repository.testing.ts";
import { saveOffboardingRepository } from "../../offboarding-exit-management/src/repository.ts";
import { offboardingCaseSchema } from "../../offboarding-exit-management/src/schema.ts";
import { createEmployeeSelfservicePortalRecord } from "../src/actions.ts";
import {
  resetEmployeeSelfservicePortalRepositoryForTesting,
  setEmployeeSelfservicePortalRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  listEmployeeSelfservicePortalNotifications,
  listEmployeeSelfservicePortalRequestStatuses,
  listEmployeeSelfservicePortalTasks,
  submitEmployeeSelfservicePortalProfileUpdateRequest,
} from "../src/server.ts";

let essRepositoryPath = "";
let lifecycleRepositoryPath = "";
let offboardingRepositoryPath = "";
let complianceRepositoryPath = "";
let documentsRepositoryPath = "";

const scope = {
  companyId: "company-a",
  tenantId: "tenant-a",
};

const now = new Date("2026-06-10T00:00:00.000Z");

beforeEach(async () => {
  essRepositoryPath = resolve(
    tmpdir(),
    `afenda-ess-workflow-${randomUUID()}.json`
  );
  lifecycleRepositoryPath = resolve(
    tmpdir(),
    `afenda-ess-lifecycle-${randomUUID()}.json`
  );
  offboardingRepositoryPath = resolve(
    tmpdir(),
    `afenda-ess-offboarding-${randomUUID()}.json`
  );
  complianceRepositoryPath = resolve(
    tmpdir(),
    `afenda-ess-compliance-${randomUUID()}.json`
  );
  documentsRepositoryPath = resolve(
    tmpdir(),
    `afenda-ess-documents-${randomUUID()}.json`
  );

  setEmployeeSelfservicePortalRepositoryPathForTesting(essRepositoryPath);
  resetEmployeeSelfservicePortalRepositoryForTesting();
  setEmployeeLifecycleRepositoryPathForTesting(lifecycleRepositoryPath);
  resetEmployeeLifecycleRepositoryForTesting();
  setOffboardingRepositoryPathForTesting(offboardingRepositoryPath);
  await resetOffboardingRepositoryForTesting();
  setComplianceRepositoryPathForTesting(complianceRepositoryPath);
  await resetComplianceRepositoryForTesting();
  setDocumentsManagementRepositoryPathForTesting(documentsRepositoryPath);
  resetDocumentsManagementRepositoryForTesting();
});

afterEach(() => {
  rmSync(essRepositoryPath, { force: true });
  rmSync(lifecycleRepositoryPath, { force: true });
  rmSync(offboardingRepositoryPath, { force: true });
  rmSync(complianceRepositoryPath, { force: true });
  rmSync(documentsRepositoryPath, { force: true });
});

const seedPortalAndRequests = () => {
  createEmployeeSelfservicePortalRecord(
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
};

const seedLifecycle = () => {
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
      events: [
        {
          actorId: "hr-admin",
          createdAt: now,
          employeeId: "employee-1",
          event: "started",
          id: "onboarding-event-started",
          metadata: {},
          sequence: 0,
          taskCode: null,
        },
      ],
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
};

const seedOffboarding = async () => {
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
};

const seedCompliance = async () => {
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
};

const seedPendingAcknowledgment = () => {
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
};

test("aggregates employee tasks across onboarding, offboarding, compliance, and HR", async () => {
  seedPortalAndRequests();
  seedLifecycle();
  await seedOffboarding();
  await seedCompliance();
  seedPendingAcknowledgment();

  const tasks = await listEmployeeSelfservicePortalTasks(
    {},
    {
      actorEmployeeId: "employee-1",
      canRead: true,
      companyId: scope.companyId,
      tenantId: scope.tenantId,
      userId: "employee-user",
    }
  );

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
  assert.equal(
    tasks.every((entry) => entry.employeeId === "employee-1"),
    true
  );
});

test("tracks submitted request statuses and projects notifications for employee actions", async () => {
  seedPortalAndRequests();
  seedLifecycle();
  await seedCompliance();
  seedPendingAcknowledgment();

  const requestStatuses = listEmployeeSelfservicePortalRequestStatuses(
    {},
    {
      actorEmployeeId: "employee-1",
      canRead: true,
      companyId: scope.companyId,
      tenantId: scope.tenantId,
      userId: "employee-user",
    }
  );

  const notifications = await listEmployeeSelfservicePortalNotifications(
    {},
    {
      actorEmployeeId: "employee-1",
      canRead: true,
      companyId: scope.companyId,
      organizationId: "org-a",
      tenantId: scope.tenantId,
      userId: "employee-user",
    }
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
});
