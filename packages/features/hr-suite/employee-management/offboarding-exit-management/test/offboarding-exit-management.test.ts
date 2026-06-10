import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  approveOffboardingApprovalStep,
  getOffboardingApprovalById,
  getOffboardingCaseById,
  getOffboardingFoundationSnapshot,
  listOffboardingApprovalBlockers,
  listOffboardingApprovalRecords,
  listOffboardingAuditTrailRecords,
  listOffboardingCaseRecords,
  offboardingExitManagementRequirementCoverage,
  openOffboardingCase,
  rejectOffboardingApprovalStep,
  reopenOffboardingApprovalStep,
  submitOffboardingApprovalStep,
  updateOffboardingCase,
  upsertOffboardingApprovalStep,
} from "../src/index.ts";
import {
  resetOffboardingRepositoryForTesting,
  setOffboardingRepositoryPathForTesting,
} from "../src/repository.testing.ts";

let currentRepositoryPath = "";

const readContext = {
  canRead: true,
  companyId: "acme",
  tenantId: "tenant-1",
};

const sensitiveReadContext = {
  ...readContext,
  canViewSensitive: true,
};

const writeContext = {
  actorId: "hr-admin",
  canWrite: true,
  companyId: "acme",
  tenantId: "tenant-1",
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-offboarding-${randomUUID()}.json`
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

const openCaseForApprovalTests = async () => {
  const opened = await openOffboardingCase(
    {
      companyId: "acme",
      employeeId: "emp-001",
      exitType: "termination",
      reason: "Policy breach",
      reasonDetails: "Sensitive termination details",
      effectiveSeparationDate: new Date("2026-07-15T00:00:00.000Z"),
      noticeStartDate: new Date("2026-07-01T00:00:00.000Z"),
      noticeEndDate: new Date("2026-07-15T00:00:00.000Z"),
      requiredNoticeDays: 30,
      lastWorkingDate: new Date("2026-07-15T00:00:00.000Z"),
      initiationSource: "manager",
      legalEntityCode: "LE-TH",
      departmentId: "ops",
      managerEmployeeId: "mgr-001",
      workLocationCode: "BKK",
      riskLevel: "high",
      legalReviewRequired: true,
    },
    writeContext
  );

  assert.equal(opened.ok, true);
  return opened.targetId;
};

test("returns a scoped foundation snapshot for authorized readers", async () => {
  const snapshot = await getOffboardingFoundationSnapshot(readContext);

  assert.ok(snapshot);
  assert.equal(
    snapshot?.featureId,
    "hr-suite.employee-management.offboarding-exit-management"
  );
  assert.deepEqual(
    snapshot?.requirementCoverage,
    offboardingExitManagementRequirementCoverage
  );
  assert.equal(snapshot?.boundedContext.ownershipMatrix.length, 10);
  assert.equal(snapshot?.caseCount, 0);
  assert.equal(snapshot?.approvalCount, 0);
});

test("opens and lists offboarding cases with notice compliance and sensitive redaction", async () => {
  const opened = await openOffboardingCase(
    {
      companyId: "acme",
      employeeId: "emp-100",
      exitType: "resignation",
      reason: "Personal resignation",
      reasonDetails: "Sensitive reason details",
      effectiveSeparationDate: new Date("2026-07-15T00:00:00.000Z"),
      noticeStartDate: new Date("2026-06-16T00:00:00.000Z"),
      noticeEndDate: new Date("2026-07-15T00:00:00.000Z"),
      requiredNoticeDays: 30,
      lastWorkingDate: new Date("2026-07-15T00:00:00.000Z"),
      initiationSource: "employee",
      legalEntityCode: "LE-TH",
      departmentId: "ops",
      managerEmployeeId: "mgr-001",
      workLocationCode: "BKK",
      policyReference: "POL-NOTICE-30",
      riskLevel: "medium",
    },
    { ...writeContext, actorId: "emp-100" }
  );

  assert.equal(opened.ok, true);

  const visibleWithoutSensitive = await listOffboardingCaseRecords(
    { companyId: "acme" },
    readContext
  );

  assert.equal(visibleWithoutSensitive.length, 1);
  assert.equal(visibleWithoutSensitive[0]?.noticeStatus, "compliant");
  assert.equal(visibleWithoutSensitive[0]?.actualNoticeDays, 30);
  assert.equal(visibleWithoutSensitive[0]?.reason, null);
  assert.equal(visibleWithoutSensitive[0]?.reasonDetails, null);

  const visibleWithSensitive = await getOffboardingCaseById(
    opened.targetId,
    sensitiveReadContext
  );

  assert.ok(visibleWithSensitive);
  assert.equal(visibleWithSensitive?.reason, "Personal resignation");
  assert.equal(visibleWithSensitive?.reasonDetails, "Sensitive reason details");
});

test("creates, submits, rejects, reopens, and approves approval steps with blockers and audit", async () => {
  const caseId = await openCaseForApprovalTests();

  const configured = await upsertOffboardingApprovalStep(
    {
      caseId,
      stepCode: "hrbp-review",
      stepLabel: "HRBP Review",
      sequence: 1,
      required: true,
      routeToType: "role",
      routeToId: "hrbp",
      routeToLabel: "HR Business Partner",
      escalationTargetType: "role",
      escalationTargetId: "hr-director",
      escalationTargetLabel: "HR Director",
    },
    writeContext
  );

  assert.equal(configured.ok, true);

  const configuredApproval = await getOffboardingApprovalById(
    configured.targetId,
    readContext
  );
  assert.ok(configuredApproval);
  assert.equal(configuredApproval?.status, "draft");
  assert.equal(configuredApproval?.decisionNotes, null);

  const submitted = await submitOffboardingApprovalStep(
    {
      approvalId: configured.targetId,
      decisionNotes: "Submitted for review",
    },
    writeContext
  );
  assert.equal(submitted.ok, true);

  const rejected = await rejectOffboardingApprovalStep(
    {
      approvalId: configured.targetId,
      rejectionReason: "Missing legal packet",
      decisionNotes: "Need legal packet before approval",
    },
    writeContext
  );
  assert.equal(rejected.ok, true);

  const blockerAfterReject = await listOffboardingApprovalBlockers(
    { caseId },
    sensitiveReadContext
  );
  assert.equal(blockerAfterReject.length, 1);
  assert.equal(blockerAfterReject[0]?.blockingStatus, "blocked");
  assert.equal(blockerAfterReject[0]?.rejectedRequiredCount, 1);

  const reopened = await reopenOffboardingApprovalStep(
    {
      approvalId: configured.targetId,
      reopenedReason: "Legal packet received",
    },
    writeContext
  );
  assert.equal(reopened.ok, true);

  const resubmitted = await submitOffboardingApprovalStep(
    {
      approvalId: configured.targetId,
      decisionNotes: "Resubmitted with attachments",
    },
    writeContext
  );
  assert.equal(resubmitted.ok, true);

  const approved = await approveOffboardingApprovalStep(
    {
      approvalId: configured.targetId,
      approvedBy: "hrbp-001",
      decisionNotes: "Cleared by HRBP",
    },
    writeContext
  );
  assert.equal(approved.ok, true);

  const hiddenApproval = await getOffboardingApprovalById(
    configured.targetId,
    readContext
  );
  assert.ok(hiddenApproval);
  assert.equal(hiddenApproval?.decisionNotes, null);
  assert.equal(hiddenApproval?.rejectionReason, null);

  const visibleApproval = await getOffboardingApprovalById(
    configured.targetId,
    sensitiveReadContext
  );
  assert.ok(visibleApproval);
  assert.equal(visibleApproval?.status, "approved");
  assert.equal(visibleApproval?.decisionNotes, "Cleared by HRBP");
  assert.equal(visibleApproval?.approvedBy, "hrbp-001");

  const blockers = await listOffboardingApprovalBlockers(
    { caseId },
    sensitiveReadContext
  );
  assert.equal(blockers.length, 1);
  assert.equal(blockers[0]?.blockingStatus, "clear");
  assert.equal(blockers[0]?.approvedRequiredCount, 1);
  assert.equal(blockers[0]?.blockingApprovalCount, 0);

  const auditTrail = await listOffboardingAuditTrailRecords(
    {
      companyId: "acme",
      entityType: "approval",
    },
    sensitiveReadContext
  );

  assert.equal(auditTrail.length, 6);
  assert.equal(
    auditTrail.some(
      (entry) => entry.action === "hr.offboarding.approval.resubmit"
    ),
    true
  );
});

test("keeps approval records synchronized when case routing fields change", async () => {
  const caseId = await openCaseForApprovalTests();
  const configured = await upsertOffboardingApprovalStep(
    {
      caseId,
      stepCode: "legal-review",
      stepLabel: "Legal Review",
      sequence: 2,
      routeToType: "role",
      routeToId: "legal",
    },
    writeContext
  );

  assert.equal(configured.ok, true);

  const updated = await updateOffboardingCase(
    {
      caseId,
      departmentId: "finance",
      riskLevel: "critical",
      legalEntityCode: "LE-SG",
    },
    writeContext
  );

  assert.equal(updated.ok, true);

  const approvals = await listOffboardingApprovalRecords(
    { caseId },
    sensitiveReadContext
  );
  assert.equal(approvals.length, 1);
  assert.equal(approvals[0]?.departmentId, "finance");
  assert.equal(approvals[0]?.riskLevel, "critical");
  assert.equal(approvals[0]?.legalEntityCode, "LE-SG");
});

test("blocks duplicate open cases for the same employee within scope", async () => {
  const firstOpen = await openOffboardingCase(
    {
      companyId: "acme",
      employeeId: "emp-003",
      exitType: "retirement",
      reason: "Retirement",
      effectiveSeparationDate: new Date("2026-12-31T00:00:00.000Z"),
      initiationSource: "hr",
    },
    writeContext
  );

  const duplicateOpen = await openOffboardingCase(
    {
      companyId: "acme",
      employeeId: "emp-003",
      exitType: "retirement",
      reason: "Retirement second attempt",
      effectiveSeparationDate: new Date("2027-01-15T00:00:00.000Z"),
      initiationSource: "hr",
    },
    writeContext
  );

  assert.equal(firstOpen.ok, true);
  assert.equal(duplicateOpen.ok, false);
  assert.match(
    duplicateOpen.error ?? "",
    /already has an open offboarding case/i
  );
});

test("denies writes without write access and fails closed on unauthorized reads", async () => {
  const denied = await openOffboardingCase(
    {
      companyId: "acme",
      employeeId: "emp-004",
      exitType: "mutual_separation",
      reason: "Denied write test",
      effectiveSeparationDate: new Date("2026-08-15T00:00:00.000Z"),
    },
    {
      actorId: "viewer",
      canWrite: false,
      companyId: "acme",
      tenantId: "tenant-1",
    }
  );

  assert.equal(denied.ok, false);
  assert.match(denied.error ?? "", /write access denied/i);

  const hiddenSnapshot = await getOffboardingFoundationSnapshot({
    companyId: "acme",
    tenantId: "tenant-1",
  });
  assert.equal(hiddenSnapshot, null);

  const hiddenCases = await listOffboardingCaseRecords(
    {},
    {
      companyId: "acme",
      tenantId: "tenant-1",
    }
  );
  assert.equal(hiddenCases.length, 0);

  const hiddenApprovals = await listOffboardingApprovalRecords(
    {},
    {
      companyId: "acme",
      tenantId: "tenant-1",
    }
  );
  assert.equal(hiddenApprovals.length, 0);
});
