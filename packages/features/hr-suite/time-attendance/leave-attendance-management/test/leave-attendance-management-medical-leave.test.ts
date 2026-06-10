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
  resolveAcceptedLeaveDocumentKinds,
  resolveRequiredLeaveDocumentKind,
} from "../src/projector/medical-leave-references.ts";
import {
  getLamMedicalLeaveReferencesForApplication,
  listLamLeaveDocumentsRecords,
} from "../src/queries/leave-documents.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import {
  lamLeaveDocumentKindValues,
  lamLeaveDocumentSchema,
  lamLeaveTypeSchema,
} from "../src/schema.ts";

let currentRepositoryPath = "";
let medicalLeaveTypeId = "";
let hospitalizationLeaveTypeId = "";

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
  departmentId: "dept-sales",
} as const;

const seedBalance = async (leaveTypeId: string): Promise<void> => {
  await applyLamLeaveEntitlementCalculation(
    {
      ...employeeProfile,
      leaveTypeId,
      periodYear: 2026,
      asOfDate: new Date("2026-06-01"),
    },
    writeContext
  );
};

const createConfirmedDocument = async (args: {
  documentKind:
    | "medical_certificate"
    | "panel_clinic_referral"
    | "hospitalization_document"
    | "supporting_document";
  referenceNumber?: string;
  panelClinicName?: string;
  panelClinicId?: string;
  sourceDocumentId?: string;
  hospitalizationAdmissionDate?: Date;
}): Promise<string> => {
  const session = await createLamLeaveDocumentUploadSession(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      fileName: "reference.pdf",
      contentType: "application/pdf",
      documentKind: args.documentKind,
      referenceNumber: args.referenceNumber,
      panelClinicName: args.panelClinicName,
      panelClinicId: args.panelClinicId,
      sourceDocumentId: args.sourceDocumentId,
      hospitalizationAdmissionDate: args.hospitalizationAdmissionDate,
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
    `afenda-lam-medical-leave-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

  const medicalType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "MC",
      name: "Medical Leave",
      kind: "medical",
      requiresDocument: true,
    },
    writeContext
  );
  assert.equal(medicalType.ok, true);
  if (!medicalType.ok) {
    throw new Error("Failed to seed medical leave type");
  }
  medicalLeaveTypeId = medicalType.targetId;

  const hospitalizationType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "HOSP",
      name: "Hospitalization Leave",
      kind: "hospitalization",
      requiresDocument: true,
    },
    writeContext
  );
  assert.equal(hospitalizationType.ok, true);
  if (!hospitalizationType.ok) {
    throw new Error("Failed to seed hospitalization leave type");
  }
  hospitalizationLeaveTypeId = hospitalizationType.targetId;

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

  await upsertLamLeaveEntitlementRule(
    {
      companyId: "company-001",
      leaveTypeId: hospitalizationLeaveTypeId,
      code: "HOSP-MY",
      title: "Hospitalization Leave MY",
      scope: { countryCode: "MY" },
      entitlementDays: 30,
      accrualRule: "annual_grant",
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    writeContext
  );
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("HRM-LAM-021 document kind enum covers medical certificate, panel clinic, and hospitalization references", () => {
  assert.deepEqual(lamLeaveDocumentKindValues, [
    "supporting_document",
    "medical_certificate",
    "panel_clinic_referral",
    "hospitalization_document",
  ]);
});

test("HRM-LAM-021 resolveRequiredLeaveDocumentKind maps medical and hospitalization leave types", () => {
  const medicalType = lamLeaveTypeSchema.parse({
    id: "lt-med",
    companyId: "company-001",
    code: "MC",
    name: "Medical",
    kind: "medical",
    policyGroupId: null,
    active: true,
    requiresDocument: true,
    paid: true,
    minNoticeDays: null,
    maxConsecutiveDays: null,
    eligibilityTenureMonthsMin: null,
    eligibilityGender: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const hospitalizationType = lamLeaveTypeSchema.parse({
    ...medicalType,
    id: "lt-hosp",
    code: "HOSP",
    kind: "hospitalization",
  });

  assert.equal(
    resolveRequiredLeaveDocumentKind(medicalType),
    "medical_certificate"
  );
  assert.equal(
    resolveRequiredLeaveDocumentKind(hospitalizationType),
    "hospitalization_document"
  );
  assert.deepEqual(resolveAcceptedLeaveDocumentKinds(medicalType), [
    "medical_certificate",
    "panel_clinic_referral",
  ]);
  assert.deepEqual(resolveAcceptedLeaveDocumentKinds(hospitalizationType), [
    "hospitalization_document",
  ]);
});

test("HRM-LAM-021 submit rejects medical leave with generic supporting document", async () => {
  await seedBalance(medicalLeaveTypeId);
  const documentId = await createConfirmedDocument({
    documentKind: "supporting_document",
    referenceNumber: "DOC-001",
  });

  const result = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: medicalLeaveTypeId,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-02"),
      totalDays: 2,
      reason: "Flu",
      supportingDocumentId: documentId,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    throw new Error("Expected medical certificate kind enforcement to fail");
  }
  assert.match(result.error, /medical_certificate/);
});

test("HRM-LAM-021 submit rejects medical certificate without panel clinic reference", async () => {
  await seedBalance(medicalLeaveTypeId);
  const documentId = await createConfirmedDocument({
    documentKind: "medical_certificate",
    referenceNumber: "MC-2026-002",
  });

  const result = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: medicalLeaveTypeId,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-02"),
      totalDays: 2,
      reason: "Flu",
      supportingDocumentId: documentId,
    },
    writeContext
  );

  assert.equal(result.ok, false);
  assert.match(result.error, /Panel clinic reference/);
});

test("HRM-LAM-021 medical leave submit links certificate, clinic, and hospitalization references with audit", async () => {
  await seedBalance(medicalLeaveTypeId);
  const documentId = await createConfirmedDocument({
    documentKind: "medical_certificate",
    referenceNumber: "MC-2026-010",
    panelClinicName: "Sunway Medical Centre",
  });

  const result = await submitLamLeaveApplication(
    {
      ...employeeProfile,
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
    throw new Error("Expected medical leave submit to succeed");
  }

  const document = await listLamLeaveDocumentsRecords(
    { documentKind: "medical_certificate", employeeId: "emp-001" },
    readContext
  );
  assert.equal(document.length, 1);
  assert.equal(document[0]?.referenceNumber, "MC-2026-010");
  assert.equal(document[0]?.panelClinicName, "Sunway Medical Centre");
  lamLeaveDocumentSchema.parse(document[0]);

  const references = await getLamMedicalLeaveReferencesForApplication(
    result.targetId,
    readContext
  );
  assert.equal(references.length, 1);
  assert.equal(references[0]?.documentKind, "medical_certificate");

  const state = await loadLamRepository(readContext);
  assert.ok(
    state.auditEvents.some(
      (entry) =>
        entry.action ===
        leaveAttendanceManagementAuditEvents.leaveMedicalCertificateLinked
    )
  );
});

test("HRM-LAM-021 hospitalization leave requires hospitalization document reference", async () => {
  await seedBalance(hospitalizationLeaveTypeId);
  const documentId = await createConfirmedDocument({
    documentKind: "hospitalization_document",
    referenceNumber: "HOSP-2026-001",
    hospitalizationAdmissionDate: new Date("2026-09-01"),
  });

  const result = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: hospitalizationLeaveTypeId,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-05"),
      totalDays: 5,
      reason: "Surgery recovery",
      supportingDocumentId: documentId,
    },
    writeContext
  );
  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected hospitalization leave submit to succeed");
  }

  const references = await getLamMedicalLeaveReferencesForApplication(
    result.targetId,
    readContext
  );
  assert.equal(references.length, 1);
  assert.equal(references[0]?.documentKind, "hospitalization_document");
  assert.equal(references[0]?.referenceNumber, "HOSP-2026-001");
});

test("getLamMedicalLeaveReferencesForApplication fails closed without read access", async () => {
  assert.deepEqual(
    await getLamMedicalLeaveReferencesForApplication("missing", {
      companyId: "company-001",
    }),
    []
  );
});

test("HRM-LAM-021 panel clinic referral satisfies medical leave policy when clinic reference is present", async () => {
  await seedBalance(medicalLeaveTypeId);
  const documentId = await createConfirmedDocument({
    documentKind: "panel_clinic_referral",
    referenceNumber: "REF-2026-001",
    panelClinicId: "clinic-001",
    panelClinicName: "Panel Clinic KL",
  });

  const result = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: medicalLeaveTypeId,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-02"),
      totalDays: 2,
      reason: "Specialist referral",
      supportingDocumentId: documentId,
    },
    writeContext
  );

  assert.equal(result.ok, true);
  const references = await getLamMedicalLeaveReferencesForApplication(
    result.ok ? result.targetId : "",
    readContext
  );
  assert.equal(references.length, 1);
  assert.equal(references[0]?.documentKind, "panel_clinic_referral");
});

test("HRM-LAM-021 panel clinic referral rejects invalid sourceDocumentId on confirm", async () => {
  const session = await createLamLeaveDocumentUploadSession(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      fileName: "referral.pdf",
      contentType: "application/pdf",
      documentKind: "panel_clinic_referral",
      referenceNumber: "REF-2026-002",
      panelClinicName: "Panel Clinic KL",
      sourceDocumentId: "missing-document-id",
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
  assert.equal(confirm.ok, false);
  if (confirm.ok) {
    throw new Error("Expected invalid sourceDocumentId to fail confirm");
  }
  assert.match(confirm.error, /sourceDocumentId/);
});

test("HRM-LAM-021 panel clinic referral links to confirmed medical certificate sourceDocumentId", async () => {
  await seedBalance(medicalLeaveTypeId);
  const certificateId = await createConfirmedDocument({
    documentKind: "medical_certificate",
    referenceNumber: "MC-2026-050",
    panelClinicName: "Primary Clinic",
  });
  const referralId = await createConfirmedDocument({
    documentKind: "panel_clinic_referral",
    referenceNumber: "REF-2026-050",
    panelClinicName: "Specialist Clinic",
    sourceDocumentId: certificateId,
  });

  const result = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: medicalLeaveTypeId,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-02"),
      totalDays: 2,
      reason: "Follow-up referral",
      supportingDocumentId: referralId,
    },
    writeContext
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected linked panel clinic referral submit to succeed");
  }

  const document = await listLamLeaveDocumentsRecords(
    { leaveApplicationId: result.targetId },
    readContext
  );
  assert.equal(document.length, 1);
  assert.equal(document[0]?.sourceDocumentId, certificateId);
});

test("HRM-LAM-021 hospitalization submit emits leaveMedicalCertificateLinked audit without file payload", async () => {
  await seedBalance(hospitalizationLeaveTypeId);
  const documentId = await createConfirmedDocument({
    documentKind: "hospitalization_document",
    referenceNumber: "HOSP-2026-010",
    hospitalizationAdmissionDate: new Date("2026-09-01"),
  });

  const result = await submitLamLeaveApplication(
    {
      ...employeeProfile,
      leaveTypeId: hospitalizationLeaveTypeId,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-05"),
      totalDays: 5,
      reason: "Hospital stay",
      supportingDocumentId: documentId,
    },
    writeContext
  );
  assert.equal(result.ok, true);

  const state = await loadLamRepository(readContext);
  const audit = state.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.leaveMedicalCertificateLinked
  );
  assert.ok(audit);
  assert.equal(audit.metadata.documentKind, "hospitalization_document");
  assert.equal(audit.metadata.storageKey, undefined);
  assert.equal(audit.metadata.fileName, undefined);
});
