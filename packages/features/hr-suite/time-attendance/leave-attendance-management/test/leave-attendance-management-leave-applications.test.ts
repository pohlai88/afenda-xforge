import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { submitLamLeaveApplication } from "../src/actions/leave-applications.action.ts";
import {
  confirmLamLeaveDocumentUpload,
  createLamLeaveDocumentUploadSession,
} from "../src/actions/leave-documents.action.ts";
import { applyLamLeaveEntitlementCalculation } from "../src/actions/leave-entitlement-calculation.action.ts";
import { upsertLamLeaveEntitlementRule } from "../src/actions/leave-entitlement-rules.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import {
  getLamLeaveApplicationById,
  listLamLeaveApplicationsRecords,
} from "../src/queries/leave-applications.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import { lamLeaveApplicationSchema } from "../src/schema.ts";

let currentRepositoryPath = "";
let leaveTypeId = "";
let medicalLeaveTypeId = "";

const writeContext = {
  actorId: "emp-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const readContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: true,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.leaveApplicationsRead,
    leaveAttendanceManagementCapabilities.leaveBalancesRead,
  ],
} as const;

const employeeProfile = {
  companyId: "company-001",
  employeeId: "emp-001",
  hireDate: new Date("2020-01-15"),
  countryCode: "MY",
  legalEntityCode: "MY-ENTITY",
  workLocationCode: "KL",
  employmentType: "permanent",
  grade: "G5",
} as const;

const submitProfile = {
  companyId: employeeProfile.companyId,
  employeeId: employeeProfile.employeeId,
  hireDate: employeeProfile.hireDate,
  countryCode: employeeProfile.countryCode,
  legalEntityCode: employeeProfile.legalEntityCode,
  workLocationCode: employeeProfile.workLocationCode,
  employmentType: employeeProfile.employmentType,
  grade: employeeProfile.grade,
} as const;

const seedAnnualBalance = async (periodYear = 2026): Promise<void> => {
  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      periodYear,
      asOfDate: new Date(`${periodYear}-06-01`),
    },
    writeContext
  );
};

const seedMedicalBalance = async (): Promise<void> => {
  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId: medicalLeaveTypeId,
      code: "MC-MY",
      title: "Medical Leave MY",
      scope: { countryCode: "MY" },
      entitlementDays: 14,
      accrualRule: "annual_grant",
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );

  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId: medicalLeaveTypeId,
      periodYear: 2026,
      asOfDate: new Date("2026-06-01"),
    },
    writeContext
  );
};

const createConfirmedLeaveDocument = async (): Promise<string> => {
  const session = await createLamLeaveDocumentUploadSession(
    {
      ...submitProfile,
      fileName: "medical-cert.pdf",
      contentType: "application/pdf",
      documentKind: "medical_certificate",
      referenceNumber: "MC-2026-001",
      panelClinicName: "Panel Clinic KL",
      issuedAt: new Date("2026-08-28"),
    },
    writeContext
  );
  assert.equal(session.ok, true);
  if (!session.ok) {
    throw new Error("Expected upload session to succeed");
  }

  const confirm = await confirmLamLeaveDocumentUpload(
    { documentId: session.targetId },
    writeContext
  );
  assert.equal(confirm.ok, true);

  return session.targetId;
};

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-leave-applications-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

  const leaveType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "AL",
      name: "Annual Leave",
      kind: "annual",
    },
    writeContext
  );
  assert.equal(leaveType.ok, true);
  if (!leaveType.ok) {
    throw new Error("Failed to seed leave type");
  }
  leaveTypeId = leaveType.targetId;

  const medicalLeaveType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "MC",
      name: "Medical Leave",
      kind: "medical",
      requiresDocument: true,
    },
    writeContext
  );
  assert.equal(medicalLeaveType.ok, true);
  if (!medicalLeaveType.ok) {
    throw new Error("Failed to seed medical leave type");
  }
  medicalLeaveTypeId = medicalLeaveType.targetId;

  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId,
      code: "AL-MY",
      title: "Annual Leave MY",
      scope: { countryCode: "MY" },
      entitlementDays: 18,
      accrualRule: "annual_grant",
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );

  await seedAnnualBalance();
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("HRM-LAM-007 submitLamLeaveApplication creates submitted application and reserves pending balance", async () => {
  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-03"),
      totalDays: 3,
      reason: "Family vacation",
    },
    writeContext
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected submit to succeed");
  }

  const application = await getLamLeaveApplicationById(
    result.targetId,
    readContext
  );
  assert.ok(application);
  lamLeaveApplicationSchema.parse(application);
  assert.equal(application?.status, "submitted");
  assert.ok(application?.submittedAt);

  const balances = await listLamLeaveApplicationsRecords(
    { employeeId: employeeProfile.employeeId, status: "submitted" },
    readContext
  );
  assert.equal(balances.length, 1);

  const state = await loadLamRepository(readContext);
  const balance = state.leaveBalances.find(
    (entry) =>
      entry.employeeId === employeeProfile.employeeId &&
      entry.leaveTypeId === leaveTypeId &&
      entry.periodYear === 2026
  );
  assert.equal(balance?.pending, 3);
  assert.equal(balance?.remaining, 15);

  const audit = state.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.leaveApplicationSubmitted
  );
  assert.ok(audit);
  assert.equal(audit?.entityType, "leave_application");

  const balanceAudit = state.auditEvents.find(
    (entry) =>
      entry.action === leaveAttendanceManagementAuditEvents.leaveBalanceUpdated
  );
  assert.ok(balanceAudit);
  assert.equal(balanceAudit?.entityType, "leave_balance");
});

test("HRM-LAM-007 submit rejects insufficient leave balance", async () => {
  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-31"),
      totalDays: 31,
      reason: "Extended leave",
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected insufficient balance to fail");
  }
  assert.match(result.error, /Insufficient leave balance/);
});

test("HRM-LAM-008 submit rejects medical leave without supporting document when required", async () => {
  await seedMedicalBalance();

  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId: medicalLeaveTypeId,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-02"),
      totalDays: 2,
      reason: "Flu",
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected missing document to fail");
  }
  assert.match(result.error, /Supporting document is required/);
});

test("HRM-LAM-008 submit rejects medical leave with pending document reference", async () => {
  await seedMedicalBalance();

  const session = await createLamLeaveDocumentUploadSession(
    {
      ...submitProfile,
      fileName: "medical-cert.pdf",
      contentType: "application/pdf",
    },
    writeContext
  );
  assert.equal(session.ok, true);
  if (!session.ok) {
    throw new Error("Expected upload session to succeed");
  }

  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId: medicalLeaveTypeId,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-02"),
      totalDays: 2,
      reason: "Flu",
      supportingDocumentId: session.targetId,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected pending document to fail");
  }
  assert.match(result.error, /must be uploaded and confirmed/);
});

test("HRM-LAM-008 submit accepts medical leave with confirmed supporting document", async () => {
  await seedMedicalBalance();
  const documentId = await createConfirmedLeaveDocument();

  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId: medicalLeaveTypeId,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-02"),
      totalDays: 2,
      reason: "Flu",
      supportingDocumentId: documentId,
    },
    writeContext
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected submit with confirmed document to succeed");
  }

  const state = await loadLamRepository(readContext);
  const document = state.leaveDocuments.find(
    (entry) => entry.id === documentId
  );
  assert.equal(document?.leaveApplicationId, result.targetId);
  assert.ok(
    state.auditEvents.some(
      (entry) =>
        entry.action ===
        leaveAttendanceManagementAuditEvents.leaveMedicalCertificateLinked
    )
  );
});

test("HRM-LAM-008 submit rejects non-medical leave when requiresDocument policy is set", async () => {
  const maternityType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "MAT",
      name: "Maternity Leave",
      kind: "maternity",
      requiresDocument: true,
      paid: false,
    },
    writeContext
  );
  assert.equal(maternityType.ok, true);
  if (!maternityType.ok) {
    throw new Error("Expected maternity leave type upsert to succeed");
  }

  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId: maternityType.targetId,
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-05"),
      totalDays: 5,
      reason: "Maternity leave",
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected missing document to fail for maternity leave");
  }
  assert.match(result.error, /Supporting document is required/);
});

test("HRM-LAM-008 submit rejects already linked supporting document", async () => {
  await seedMedicalBalance();
  const documentId = await createConfirmedLeaveDocument();

  const first = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId: medicalLeaveTypeId,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-02"),
      totalDays: 2,
      reason: "Flu",
      supportingDocumentId: documentId,
    },
    writeContext
  );
  assert.equal(first.ok, true);

  const second = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId: medicalLeaveTypeId,
      startDate: new Date("2026-09-10"),
      endDate: new Date("2026-09-11"),
      totalDays: 2,
      reason: "Follow-up",
      supportingDocumentId: documentId,
    },
    writeContext
  );

  assert.equal(second.ok, false);
  if (second.ok) {
    throw new Error("Expected already linked document to fail");
  }
  assert.match(second.error, /already linked to leave application/);
});

test("HRM-LAM-008 submit accepts generic supporting_document for non-medical requiresDocument type", async () => {
  const maternityType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "MAT-CONF",
      name: "Maternity Leave Confirmed",
      kind: "maternity",
      requiresDocument: true,
      paid: false,
    },
    writeContext
  );
  assert.equal(maternityType.ok, true);
  if (!maternityType.ok) {
    throw new Error("Expected maternity leave type upsert to succeed");
  }

  const session = await createLamLeaveDocumentUploadSession(
    {
      ...submitProfile,
      fileName: "maternity-cert.pdf",
      contentType: "application/pdf",
      documentKind: "supporting_document",
    },
    writeContext
  );
  assert.equal(session.ok, true);
  if (!session.ok) {
    throw new Error("Expected upload session to succeed");
  }

  const confirm = await confirmLamLeaveDocumentUpload(
    { documentId: session.targetId },
    writeContext
  );
  assert.equal(confirm.ok, true);

  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId: maternityType.targetId,
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-05"),
      totalDays: 5,
      reason: "Maternity leave",
      supportingDocumentId: session.targetId,
    },
    writeContext
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected maternity submit with supporting document");
  }

  const state = await loadLamRepository(readContext);
  const document = state.leaveDocuments.find(
    (entry) => entry.id === session.targetId
  );
  assert.equal(document?.leaveApplicationId, result.targetId);
});

test("submit rejects inactive leave type", async () => {
  const inactiveType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "INACTIVE",
      name: "Inactive Leave",
      kind: "annual",
      active: false,
    },
    writeContext
  );
  assert.equal(inactiveType.ok, true);
  if (!inactiveType.ok) {
    throw new Error("Failed to seed inactive leave type");
  }

  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId: inactiveType.targetId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-01"),
      totalDays: 1,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected inactive leave type to fail");
  }
  assert.match(result.error, /Active leave type/);
});

test("submit rejects when leave balance is missing", async () => {
  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      employeeId: "emp-without-balance",
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-01"),
      totalDays: 1,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected missing balance to fail");
  }
  assert.match(result.error, /Leave balance was not found/);
});

test("getLamLeaveApplicationById returns submitted application", async () => {
  const submit = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-01"),
      totalDays: 1,
    },
    writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    throw new Error("Expected submit to succeed");
  }

  const application = await getLamLeaveApplicationById(
    submit.targetId,
    readContext
  );
  assert.ok(application);
  assert.equal(application?.id, submit.targetId);
});

test("listLamLeaveApplicationsRecords filters by start date range", async () => {
  await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-01"),
      totalDays: 1,
    },
    writeContext
  );

  const inRange = await listLamLeaveApplicationsRecords(
    {
      startDateFrom: new Date("2026-07-01"),
      startDateTo: new Date("2026-07-31"),
    },
    readContext
  );
  assert.equal(inRange.length, 1);

  const outOfRange = await listLamLeaveApplicationsRecords(
    {
      startDateFrom: new Date("2026-08-01"),
      startDateTo: new Date("2026-08-31"),
    },
    readContext
  );
  assert.equal(outOfRange.length, 0);
});

test("submitLamLeaveApplication rejects companyId mismatch", async () => {
  const result = await submitLamLeaveApplication(
    {
      companyId: "company-other",
      employeeId: employeeProfile.employeeId,
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-01"),
      totalDays: 1,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected company mismatch to fail");
  }
  assert.match(result.error, /does not match leave and attendance context/);
});

test("leave application queries fail closed without read access", async () => {
  assert.equal(
    (await listLamLeaveApplicationsRecords({}, { companyId: "company-001" }))
      .length,
    0
  );
  assert.equal(await getLamLeaveApplicationById("missing", readContext), null);
});

test("submitLamLeaveApplication fails closed without write access", async () => {
  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-02"),
      totalDays: 1,
    },
    { companyId: "company-001", canWrite: false }
  );

  assert.equal(result.ok, false);
});

test("submitLamLeaveApplication rejects endDate before startDate", async () => {
  const result = await submitLamLeaveApplication(
    {
      ...submitProfile,
      leaveTypeId,
      startDate: new Date("2026-07-05"),
      endDate: new Date("2026-07-01"),
      totalDays: 1,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected invalid dates to fail");
  }
  assert.match(result.error, /endDate must be on or after startDate/);
});

test("AC-003 submit enforces leave type policy group access on submission", async () => {
  const scoped = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "AL-EXEC",
      name: "Executive Annual Leave",
      kind: "annual",
      policyGroupId: "policy-group-exec",
    },
    writeContext
  );
  assert.equal(scoped.ok, true);
  if (!scoped.ok) {
    throw new Error("Failed to seed scoped leave type");
  }

  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId: scoped.targetId,
      code: "AL-EXEC-RULE",
      title: "Executive Annual Entitlement",
      scope: { countryCode: "MY", policyGroupId: "policy-group-exec" },
      entitlementDays: 20,
      accrualRule: "annual_grant",
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );

  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      policyGroupId: "policy-group-exec",
      leaveTypeId: scoped.targetId,
      periodYear: 2026,
      asOfDate: new Date("2026-06-01"),
    },
    writeContext
  );

  const denied = await submitLamLeaveApplication(
    {
      ...submitProfile,
      policyGroupId: "policy-group-ops",
      leaveTypeId: scoped.targetId,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-01"),
      totalDays: 1,
      reason: "Wrong policy group",
    },
    writeContext
  );
  assert.equal(denied.ok, false);
  if (denied.ok) {
    throw new Error("Expected policy group mismatch to fail");
  }
  assert.match(denied.error, /policy group/i);

  const allowed = await submitLamLeaveApplication(
    {
      ...submitProfile,
      policyGroupId: "policy-group-exec",
      leaveTypeId: scoped.targetId,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-01"),
      totalDays: 1,
      reason: "Executive leave",
    },
    writeContext
  );
  assert.equal(allowed.ok, true);
});
