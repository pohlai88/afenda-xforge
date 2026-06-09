import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  canExecuteComplianceRegulatoryTrackingAction,
  complianceAlertProjectionSchema,
  complianceOverviewProjectionSchema,
  complianceRegulatoryCalendarProjectionSchema,
  complianceRegulatoryTrackingActionRegistry,
  complianceRequirementProjectionSchema,
  getComplianceRegulatoryTrackingActionDecision,
  getComplianceOverviewSnapshot as getProjectedComplianceOverviewSnapshot,
  listComplianceCalendarItemsRecords as listProjectedComplianceCalendarItemsRecords,
  projectComplianceAlerts,
  projectComplianceCalendarItems,
  projectComplianceRequirements,
} from "../src/index.ts";
import {
  resetComplianceRepositoryForTesting,
  setComplianceRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  complianceAlertKindSchema,
  complianceCalendarKindSchema,
  complianceCorrectiveActionStatusSchema,
  complianceRepositoryEntityTypeSchema,
  complianceRequirementKindSchema,
  complianceStatusSchema,
} from "../src/schema.ts";
import {
  approveComplianceWaiver,
  getComplianceOverviewSnapshot,
  listComplianceAlertsRecords,
  listComplianceAuditTrailRecords,
  listComplianceEvidenceArtifactsRecords,
  listComplianceRequirementsRecords,
  openComplianceException,
  upsertComplianceEvidenceArtifact,
  upsertComplianceObligation,
  upsertComplianceWorkerProfile,
  verifyComplianceEvidenceArtifact,
} from "../src/server.ts";

const now = new Date();
const days = (offset: number): Date =>
  new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);

let currentRepositoryPath = "";

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-compliance-${randomUUID()}.json`
  );
  setComplianceRepositoryPathForTesting(currentRepositoryPath);
  await resetComplianceRepositoryForTesting();
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("derives compliant requirement from verified evidence and masks sensitive data", async () => {
  const obligation = await upsertComplianceObligation(
    {
      companyId: "acme",
      code: "POL-ACK-001",
      title: "Employee handbook acknowledgment",
      requirementKind: "policy_acknowledgment",
      severity: "medium",
      scope: { companyId: "acme", countryCode: "TH" },
      expectedEvidenceType: "policy_acknowledgment",
      initialDueInDays: 60,
      renewalEveryDays: 365,
      effectiveFrom: days(-1),
      active: true,
      jurisdictionSource: "internal-policy",
      version: "2026.06",
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  assert.equal(obligation.ok, true);

  const worker = await upsertComplianceWorkerProfile(
    {
      companyId: "acme",
      employeeId: "emp-001",
      employeeNumber: "E001",
      displayName: "Alex Worker",
      countryCode: "TH",
      active: true,
      hireDate: now,
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  assert.equal(worker.ok, true);

  const evidence = await upsertComplianceEvidenceArtifact(
    {
      companyId: "acme",
      employeeId: "emp-001",
      obligationId: obligation.targetId,
      requirementId: `emp-001:${obligation.targetId}`,
      evidenceType: "policy_acknowledgment",
      title: "Signed employee handbook acknowledgment",
      sourceDocumentNumber: "DOC-12345",
      sourceNotes: "Employee signed on intake",
      sensitivity: "confidential",
      status: "pending",
      expiresAt: days(365),
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  assert.equal(evidence.ok, true);

  const verifiedEvidence = await verifyComplianceEvidenceArtifact(
    {
      evidenceId: evidence.targetId,
      verifiedAt: now,
      verifiedBy: "hr-admin",
    },
    {
      canViewSensitive: true,
      canWrite: true,
      companyId: "acme",
      actorId: "hr-admin",
    }
  );

  assert.equal(verifiedEvidence.ok, true);

  const requirements = await listComplianceRequirementsRecords(
    { companyId: "acme", employeeId: "emp-001" },
    { companyId: "acme", canRead: true, canViewSensitive: false }
  );

  assert.equal(requirements.length, 1);
  assert.equal(requirements[0]?.status, "compliant");

  const visibleEvidence = await listComplianceEvidenceArtifactsRecords(
    { companyId: "acme", employeeId: "emp-001" },
    { companyId: "acme", canRead: true, canViewSensitive: false }
  );

  assert.equal(visibleEvidence.length, 1);
  assert.equal(visibleEvidence[0]?.sourceDocumentNumber, null);
  assert.equal(visibleEvidence[0]?.sourceNotes, null);

  const overview = await getComplianceOverviewSnapshot({
    companyId: "acme",
    canRead: true,
  });
  assert.equal(overview.totalRequirements, 1);
  assert.equal(overview.countsByStatus.compliant, 1);
});

test("flags overdue requirements, opens alerts, and records waivers in audit trail", async () => {
  const obligation = await upsertComplianceObligation(
    {
      companyId: "acme",
      code: "VISA-001",
      title: "Work authorization verification",
      requirementKind: "work_eligibility",
      severity: "critical",
      scope: { companyId: "acme", countryCode: "TH" },
      expectedEvidenceType: "work_authorization",
      initialDueInDays: 1,
      effectiveFrom: days(-90),
      active: true,
      jurisdictionSource: "immigration-policy",
      version: "2026.06",
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  const worker = await upsertComplianceWorkerProfile(
    {
      companyId: "acme",
      employeeId: "emp-002",
      employeeNumber: "E002",
      displayName: "Jordan Worker",
      countryCode: "TH",
      active: true,
      hireDate: days(-60),
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  assert.equal(obligation.ok, true);
  assert.equal(worker.ok, true);

  const requirementId = `emp-002:${obligation.targetId}`;

  const initialRequirements = await listComplianceRequirementsRecords(
    { companyId: "acme", employeeId: "emp-002" },
    { companyId: "acme", canRead: true, canViewSensitive: true }
  );

  assert.equal(initialRequirements.length, 1);
  assert.equal(initialRequirements[0]?.status, "overdue");

  const alerts = await listComplianceAlertsRecords(
    { companyId: "acme", employeeId: "emp-002" },
    { companyId: "acme", canRead: true, canViewSensitive: true }
  );

  assert.equal(alerts.length, 1);
  assert.equal(alerts[0]?.kind, "overdue_requirement");

  const exception = await openComplianceException(
    {
      companyId: "acme",
      employeeId: "emp-002",
      obligationId: obligation.targetId,
      requirementId,
      reason: "Temporary permit review pending",
      ownerId: "hr-admin",
      dueAt: days(7),
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  assert.equal(exception.ok, true);

  const waiver = await approveComplianceWaiver(
    {
      exceptionId: exception.targetId,
      approvedBy: "hr-manager",
      waiverExpiresAt: days(14),
      reason: "Approved temporary waiver",
    },
    { canWrite: true, companyId: "acme", actorId: "hr-manager" }
  );

  assert.equal(waiver.ok, true);

  const waivedRequirements = await listComplianceRequirementsRecords(
    { companyId: "acme", employeeId: "emp-002" },
    { companyId: "acme", canRead: true, canViewSensitive: true }
  );

  assert.equal(waivedRequirements[0]?.status, "waived");

  const auditTrail = await listComplianceAuditTrailRecords(
    {
      companyId: "acme",
      action: "compliance.exception.waiver.approved",
    },
    { companyId: "acme", canRead: true, canViewSensitive: true }
  );

  assert.equal(auditTrail.length, 1);
  assert.equal(auditTrail[0]?.entityType, "exception");
});

test("derives non-compliant requirement and rejected evidence alert", async () => {
  const obligation = await upsertComplianceObligation(
    {
      companyId: "acme",
      code: "I9-001",
      title: "Right to work evidence",
      requirementKind: "work_eligibility",
      severity: "critical",
      scope: { companyId: "acme", countryCode: "TH" },
      expectedEvidenceType: "work_authorization",
      initialDueInDays: 30,
      effectiveFrom: days(-1),
      active: true,
      jurisdictionSource: "immigration-policy",
      version: "2026.06",
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  const worker = await upsertComplianceWorkerProfile(
    {
      companyId: "acme",
      employeeId: "emp-012",
      employeeNumber: "E012",
      displayName: "Rejected Evidence Worker",
      countryCode: "TH",
      active: true,
      hireDate: days(-5),
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  assert.equal(obligation.ok, true);
  assert.equal(worker.ok, true);

  const evidence = await upsertComplianceEvidenceArtifact(
    {
      companyId: "acme",
      employeeId: "emp-012",
      obligationId: obligation.targetId,
      requirementId: `emp-012:${obligation.targetId}`,
      evidenceType: "work_authorization",
      title: "Rejected right to work evidence",
      sensitivity: "restricted",
      status: "rejected",
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  assert.equal(evidence.ok, true);

  const requirements = await listComplianceRequirementsRecords(
    { companyId: "acme", employeeId: "emp-012" },
    { companyId: "acme", canRead: true, canViewSensitive: true }
  );

  assert.equal(requirements.length, 1);
  assert.equal(requirements[0]?.status, "non_compliant");
  assert.equal(requirements[0]?.evidenceStatus, "rejected");

  const alerts = await listComplianceAlertsRecords(
    { companyId: "acme", employeeId: "emp-012" },
    { companyId: "acme", canRead: true, canViewSensitive: true }
  );

  assert.equal(alerts.length, 1);
  assert.equal(alerts[0]?.kind, "rejected_evidence");
});

test("denies writes when the context is not writable", async () => {
  const denied = await upsertComplianceObligation(
    {
      companyId: "acme",
      code: "DENIED-001",
      title: "Denied write test",
      requirementKind: "document",
      severity: "low",
      scope: { companyId: "acme" },
      expectedEvidenceType: "document",
      effectiveFrom: now,
      active: true,
      jurisdictionSource: "test",
      version: "1",
    },
    { canWrite: false, companyId: "acme", actorId: "viewer" }
  );

  assert.equal(denied.ok, false);
  assert.match(denied.error, /Write access denied/i);
});

test("fails closed for read queries without read access", async () => {
  const obligation = await upsertComplianceObligation(
    {
      companyId: "acme",
      code: "READ-DENIED-001",
      title: "Read denied test",
      requirementKind: "document",
      severity: "low",
      scope: { companyId: "acme" },
      expectedEvidenceType: "document",
      effectiveFrom: now,
      active: true,
      jurisdictionSource: "test",
      version: "1",
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  const worker = await upsertComplianceWorkerProfile(
    {
      companyId: "acme",
      employeeId: "emp-read-denied",
      employeeNumber: "ERD",
      displayName: "Read Denied Worker",
      active: true,
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  assert.equal(obligation.ok, true);
  assert.equal(worker.ok, true);

  assert.equal(
    (
      await listComplianceRequirementsRecords(
        { companyId: "acme", employeeId: "emp-read-denied" },
        { companyId: "acme" }
      )
    ).length,
    0
  );
});

test("action decision helpers enforce capability, sensitive access, and approval semantics", () => {
  const verifyEvidenceDecision = getComplianceRegulatoryTrackingActionDecision(
    complianceRegulatoryTrackingActionRegistry.verifyEvidence,
    {
      grantedCapabilities: [
        complianceRegulatoryTrackingActionRegistry.verifyEvidence.capability,
      ],
      canViewSensitive: false,
    },
    {}
  );

  assert.equal(verifyEvidenceDecision.allowed, false);
  assert.equal(verifyEvidenceDecision.sensitiveAccessRequired, true);
  assert.equal(verifyEvidenceDecision.sensitiveAccessGranted, false);
  assert.match(
    verifyEvidenceDecision.reasons.join(","),
    /sensitive_access_required/
  );

  const approveWaiverDecision = getComplianceRegulatoryTrackingActionDecision(
    complianceRegulatoryTrackingActionRegistry.approveWaiver,
    {
      grantedCapabilities: [
        complianceRegulatoryTrackingActionRegistry.approveWaiver.capability,
      ],
      canViewSensitive: true,
      canWrite: true,
    },
    {}
  );

  assert.equal(approveWaiverDecision.allowed, false);
  assert.equal(approveWaiverDecision.requiresApproval, true);
  assert.equal(approveWaiverDecision.approvalSatisfied, false);

  const approvedWaiverDecision = getComplianceRegulatoryTrackingActionDecision(
    complianceRegulatoryTrackingActionRegistry.approveWaiver,
    {
      grantedCapabilities: [
        complianceRegulatoryTrackingActionRegistry.approveWaiver.capability,
      ],
      canViewSensitive: true,
      canWrite: true,
    },
    { approvedBy: "hr-director" }
  );

  assert.equal(approvedWaiverDecision.allowed, true);
  assert.equal(
    canExecuteComplianceRegulatoryTrackingAction(
      complianceRegulatoryTrackingActionRegistry.approveWaiver,
      {
        grantedCapabilities: [
          complianceRegulatoryTrackingActionRegistry.approveWaiver.capability,
        ],
        canViewSensitive: true,
        canWrite: true,
      },
      { approvedBy: "hr-director" }
    ),
    true
  );
});

test("projector outputs validated requirement projections for list usage", async () => {
  const obligation = await upsertComplianceObligation(
    {
      companyId: "acme",
      code: "TRN-001",
      title: "Annual safety training",
      requirementKind: "training",
      severity: "high",
      scope: { companyId: "acme", countryCode: "TH" },
      expectedEvidenceType: "training_completion",
      initialDueInDays: 30,
      effectiveFrom: days(-10),
      active: true,
      jurisdictionSource: "learning-policy",
      version: "2026.06",
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  const worker = await upsertComplianceWorkerProfile(
    {
      companyId: "acme",
      employeeId: "emp-003",
      employeeNumber: "E003",
      displayName: "Taylor Worker",
      countryCode: "TH",
      active: true,
      hireDate: days(-5),
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  assert.equal(obligation.ok, true);
  assert.equal(worker.ok, true);

  const requirements = await listComplianceRequirementsRecords(
    { companyId: "acme", employeeId: "emp-003" },
    { companyId: "acme", canRead: true, canViewSensitive: true }
  );

  assert.equal(requirements.length, 1);
  assert.doesNotThrow(() =>
    complianceRequirementProjectionSchema.parse(requirements[0])
  );

  const projectedRequirements = projectComplianceRequirements(requirements);
  assert.equal(projectedRequirements.length, 1);
  assert.equal(projectedRequirements[0]?.id, requirements[0]?.id);
});

test("query filters and pagination preserve projection-valid outputs", async () => {
  const obligation = await upsertComplianceObligation(
    {
      companyId: "acme",
      code: "DOC-SEARCH-001",
      title: "Searchable document retention acknowledgment",
      requirementKind: "document",
      severity: "medium",
      scope: { companyId: "acme", countryCode: "TH" },
      expectedEvidenceType: "document",
      initialDueInDays: 45,
      effectiveFrom: days(-30),
      active: true,
      jurisdictionSource: "records-policy",
      version: "2026.06",
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  const firstWorker = await upsertComplianceWorkerProfile(
    {
      companyId: "acme",
      employeeId: "emp-010",
      employeeNumber: "E010",
      displayName: "Search Target One",
      countryCode: "TH",
      active: true,
      hireDate: days(-5),
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  const secondWorker = await upsertComplianceWorkerProfile(
    {
      companyId: "acme",
      employeeId: "emp-011",
      employeeNumber: "E011",
      displayName: "Search Target Two",
      countryCode: "TH",
      active: true,
      hireDate: days(-6),
    },
    { canWrite: true, companyId: "acme", actorId: "hr-admin" }
  );

  assert.equal(obligation.ok, true);
  assert.equal(firstWorker.ok, true);
  assert.equal(secondWorker.ok, true);

  const requirementResults = await listComplianceRequirementsRecords(
    {
      companyId: "acme",
      search: "retention",
      page: 1,
      pageSize: 1,
      status: "pending",
    },
    { companyId: "acme", canRead: true, canViewSensitive: true }
  );

  assert.equal(requirementResults.length, 1);
  assert.doesNotThrow(() => {
    for (const entry of requirementResults) {
      complianceRequirementProjectionSchema.parse(entry);
    }
  });
  assert.equal(projectComplianceRequirements(requirementResults).length, 1);

  const alertResults = await listComplianceAlertsRecords(
    {
      companyId: "acme",
      search: "missing_evidence",
      page: 1,
      pageSize: 1,
      status: "open",
    },
    { companyId: "acme", canRead: true, canViewSensitive: true }
  );

  assert.equal(alertResults.length, 1);
  assert.doesNotThrow(() => {
    for (const entry of alertResults) {
      complianceAlertProjectionSchema.parse(entry);
    }
  });
  assert.equal(projectComplianceAlerts(alertResults).length, 1);

  const calendarResults = await listProjectedComplianceCalendarItemsRecords(
    {
      companyId: "acme",
      search: "DOC-SEARCH-001",
      page: 1,
      pageSize: 1,
      employeeId: "emp-010",
    },
    { companyId: "acme", canRead: true, canViewSensitive: true }
  );

  assert.equal(calendarResults.length, 1);
  assert.doesNotThrow(() => {
    for (const entry of calendarResults) {
      complianceRegulatoryCalendarProjectionSchema.parse(entry);
    }
  });
  assert.equal(projectComplianceCalendarItems(calendarResults).length, 1);

  const overview = await getProjectedComplianceOverviewSnapshot({
    companyId: "acme",
    canRead: true,
    canViewSensitive: true,
  });

  assert.doesNotThrow(() => complianceOverviewProjectionSchema.parse(overview));
  assert.equal(overview.totalRequirements >= 2, true);
});

test("schema normalizes legacy hyphenated enum values to canonical snake_case", () => {
  assert.equal(complianceStatusSchema.parse("at-risk"), "at_risk");
  assert.equal(complianceStatusSchema.parse("non-compliant"), "non_compliant");
  assert.equal(
    complianceRequirementKindSchema.parse("policy-acknowledgment"),
    "policy_acknowledgment"
  );
  assert.equal(
    complianceRequirementKindSchema.parse("work-eligibility"),
    "work_eligibility"
  );
  assert.equal(
    complianceCorrectiveActionStatusSchema.parse("in-progress"),
    "in_progress"
  );
  assert.equal(
    complianceAlertKindSchema.parse("overdue-requirement"),
    "overdue_requirement"
  );
  assert.equal(
    complianceCalendarKindSchema.parse("initial-due"),
    "initial_due"
  );
  assert.equal(
    complianceRepositoryEntityTypeSchema.parse("worker-profile"),
    "worker_profile"
  );
});
