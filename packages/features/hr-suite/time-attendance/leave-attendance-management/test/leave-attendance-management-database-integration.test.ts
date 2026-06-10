import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { upsertLamCompanyAttendanceSettings } from "../src/actions/company-attendance-settings.action.ts";
import { upsertLamAttendanceRecord } from "../src/actions/attendance-records.action.ts";
import { approveLamLeaveApplication } from "../src/actions/leave-application-decisions.action.ts";
import { submitLamLeaveApplication } from "../src/actions/leave-applications.action.ts";
import {
  confirmLamLeaveDocumentUpload,
  createLamLeaveDocumentUploadSession,
} from "../src/actions/leave-documents.action.ts";
import { applyLamLeaveEntitlementCalculation } from "../src/actions/leave-entitlement-calculation.action.ts";
import { upsertLamLeaveEntitlementRule } from "../src/actions/leave-entitlement-rules.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import {
  getLamAttendanceRecordById,
  listLamAttendanceRecordsRecords,
} from "../src/queries/attendance-records.query.ts";
import { getLamLeaveApplicationById } from "../src/queries/leave-applications.query.ts";
import { getLamMedicalLeaveReferencesForApplication } from "../src/queries/leave-documents.query.ts";
import { listLamLeaveTypesRecords } from "../src/queries/leave-types.query.ts";
import { getLamPayrollReferenceByApplicationId } from "../src/queries/payroll-references.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import { lamPersonaCapabilityPresets } from "../src/registry/persona-capabilities.ts";
import {
  enableLamDatabaseRepositoryForTesting,
  loadLamRepository,
  resetLamRepositoryCacheForTesting,
} from "../src/repository.ts";

process.env.DATABASE_URL ??=
  "postgres://postgres:postgres@localhost:5432/postgres";

let databaseAvailable = false;

const probeDatabase = async (): Promise<boolean> => {
  try {
    const { pingDatabase } = await import("@repo/database");
    await pingDatabase();
    return true;
  } catch {
    return false;
  }
};

before(async () => {
  enableLamDatabaseRepositoryForTesting();
  databaseAvailable = await probeDatabase();
});

after(() => {
  resetLamRepositoryCacheForTesting();
});

const requireDatabase = (t: { skip: (message?: string) => void }): void => {
  if (!databaseAvailable) {
    t.skip(
      "DATABASE_URL is not reachable; skipping database integration tests"
    );
  }
};

const createScope = () => {
  const tenantId = `tenant-${randomUUID()}`;
  const companyId = `company-${randomUUID()}`;
  const employeeId = `emp-${randomUUID().slice(0, 8)}`;

  const writeContext = {
    actorId: employeeId,
    companyId,
    tenantId,
    canWrite: true,
  } as const;

  const approveContext = {
    actorId: "mgr-001",
    companyId,
    tenantId,
    grantedCapabilities: [
      leaveAttendanceManagementCapabilities.leaveApplicationsApprove,
    ],
  } as const;

  const readContext = {
    companyId,
    tenantId,
    canRead: true,
    grantedCapabilities: [
      leaveAttendanceManagementCapabilities.leaveApplicationsRead,
      leaveAttendanceManagementCapabilities.payrollReferencesRead,
    ],
  } as const;

  return {
    tenantId,
    companyId,
    employeeId,
    writeContext,
    approveContext,
    readContext,
  };
};

test("database mode persists medical leave document metadata and reloads references", async (t) => {
  requireDatabase(t);

  const scope = createScope();
  const medicalType = await upsertLamLeaveType(
    {
      companyId: scope.companyId,
      code: "MC-DB",
      name: "Medical Leave DB",
      kind: "medical",
      requiresDocument: true,
      paid: true,
      active: true,
    },
    scope.writeContext
  );
  assert.equal(medicalType.ok, true);
  if (!medicalType.ok) {
    return;
  }

  await upsertLamLeaveEntitlementRule(
    {
      companyId: scope.companyId,
      leaveTypeId: medicalType.targetId,
      code: "MC-DB-RULE",
      title: "Medical Leave DB Rule",
      scope: {},
      entitlementDays: 14,
      accrualRule: "annual_grant",
      effectiveFrom: new Date("2024-01-01"),
      active: true,
    },
    scope.writeContext
  );

  await applyLamLeaveEntitlementCalculation(
    {
      companyId: scope.companyId,
      employeeId: scope.employeeId,
      leaveTypeId: medicalType.targetId,
      hireDate: new Date("2020-01-01"),
      periodYear: 2026,
      asOfDate: new Date("2026-10-01"),
    },
    scope.writeContext
  );

  const session = await createLamLeaveDocumentUploadSession(
    {
      companyId: scope.companyId,
      employeeId: scope.employeeId,
      fileName: "certificate.pdf",
      contentType: "application/pdf",
      documentKind: "medical_certificate",
      referenceNumber: "MC-DB-001",
      panelClinicName: "DB Panel Clinic",
    },
    scope.writeContext
  );
  assert.equal(session.ok, true);
  if (!session.ok) {
    return;
  }

  const confirm = await confirmLamLeaveDocumentUpload(
    { documentId: session.targetId, companyId: scope.companyId },
    scope.writeContext
  );
  assert.equal(confirm.ok, true);

  const submit = await submitLamLeaveApplication(
    {
      companyId: scope.companyId,
      employeeId: scope.employeeId,
      leaveTypeId: medicalType.targetId,
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-02"),
      totalDays: 2,
      reason: "Medical leave db integration",
      supportingDocumentId: session.targetId,
    },
    scope.writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    return;
  }

  resetLamRepositoryCacheForTesting();

  const reloaded = await loadLamRepository({
    tenantId: scope.tenantId,
    companyId: scope.companyId,
  });
  const storedDocument = reloaded.leaveDocuments.find(
    (entry) => entry.id === session.targetId
  );
  assert.ok(storedDocument);
  assert.equal(storedDocument.documentKind, "medical_certificate");
  assert.equal(storedDocument.referenceNumber, "MC-DB-001");
  assert.equal(storedDocument.panelClinicName, "DB Panel Clinic");

  const references = await getLamMedicalLeaveReferencesForApplication(
    submit.targetId,
    scope.readContext
  );
  assert.equal(references.length, 1);
  assert.equal(references[0]?.documentKind, "medical_certificate");
});

test("database mode persists approved unpaid leave payroll reference projection", async (t) => {
  requireDatabase(t);

  const scope = createScope();
  const unpaidType = await upsertLamLeaveType(
    {
      companyId: scope.companyId,
      code: "UNPAID-DB",
      name: "Unpaid Leave DB",
      kind: "unpaid",
      paid: false,
      requiresDocument: false,
      active: true,
    },
    scope.writeContext
  );
  assert.equal(unpaidType.ok, true);
  if (!unpaidType.ok) {
    return;
  }

  const submit = await submitLamLeaveApplication(
    {
      companyId: scope.companyId,
      employeeId: scope.employeeId,
      leaveTypeId: unpaidType.targetId,
      startDate: new Date("2026-11-01"),
      endDate: new Date("2026-11-03"),
      totalDays: 3,
      reason: "Unpaid leave db integration",
    },
    scope.writeContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    return;
  }

  const approved = await approveLamLeaveApplication(
    {
      companyId: scope.companyId,
      applicationId: submit.targetId,
      approvedBy: "mgr-001",
    },
    scope.approveContext
  );
  assert.equal(approved.ok, true);

  resetLamRepositoryCacheForTesting();

  const reloaded = await loadLamRepository({
    tenantId: scope.tenantId,
    companyId: scope.companyId,
  });
  const application = reloaded.leaveApplications.find(
    (entry) => entry.id === submit.targetId
  );
  assert.ok(application);
  assert.equal(application.status, "approved");

  const reference = await getLamPayrollReferenceByApplicationId(
    submit.targetId,
    scope.readContext
  );
  assert.ok(reference);
  assert.equal(reference.deductionCategory, "unpaid_leave");
  assert.equal(reference.totalDays, 3);
  assert.match(reference.sourceReference, /^lam:unpaid-leave:/);
});

test("AC-006 database mode persists employee self-service leave submit as submitted", async (t) => {
  requireDatabase(t);

  const scope = createScope();
  const unpaidType = await upsertLamLeaveType(
    {
      companyId: scope.companyId,
      code: "UNPAID-EMP-DB",
      name: "Unpaid Leave Employee DB",
      kind: "unpaid",
      paid: false,
      requiresDocument: false,
      active: true,
    },
    scope.writeContext
  );
  assert.equal(unpaidType.ok, true);
  if (!unpaidType.ok) {
    return;
  }

  const employeeSelfContext = {
    actorId: scope.employeeId,
    companyId: scope.companyId,
    tenantId: scope.tenantId,
    scopedEmployeeId: scope.employeeId,
    grantedCapabilities: lamPersonaCapabilityPresets.employee,
  } as const;

  const submit = await submitLamLeaveApplication(
    {
      companyId: scope.companyId,
      employeeId: scope.employeeId,
      leaveTypeId: unpaidType.targetId,
      startDate: new Date("2026-12-01"),
      endDate: new Date("2026-12-02"),
      totalDays: 2,
      reason: "Employee online submit db integration",
    },
    employeeSelfContext
  );
  assert.equal(submit.ok, true);
  if (!submit.ok) {
    return;
  }

  resetLamRepositoryCacheForTesting();

  const reloaded = await getLamLeaveApplicationById(submit.targetId, {
    companyId: scope.companyId,
    tenantId: scope.tenantId,
    scopedEmployeeId: scope.employeeId,
    grantedCapabilities: lamPersonaCapabilityPresets.employee,
  });
  assert.ok(reloaded);
  assert.equal(reloaded.status, "submitted");
  assert.ok(reloaded.submittedAt);
  assert.equal(reloaded.employeeId, scope.employeeId);
});

test("AC-001 database mode persists attendance record by employee and date", async (t) => {
  requireDatabase(t);
  const scope = createScope();
  const attendanceReadContext = {
    ...scope.readContext,
    grantedCapabilities: [leaveAttendanceManagementCapabilities.attendanceRead],
  };

  const created = await upsertLamAttendanceRecord(
    {
      companyId: scope.companyId,
      employeeId: scope.employeeId,
      attendanceDate: new Date("2026-06-15T18:00:00.000Z"),
      status: "present",
      notes: "Database integration",
    },
    scope.writeContext
  );
  assert.equal(created.ok, true);
  if (!created.ok) {
    throw new Error("Expected attendance record persistence to succeed");
  }

  resetLamRepositoryCacheForTesting();

  const record = await getLamAttendanceRecordById(
    created.targetId,
    attendanceReadContext
  );
  assert.ok(record);
  assert.equal(record.employeeId, scope.employeeId);
  assert.equal(record.attendanceDate.toISOString(), "2026-06-15T00:00:00.000Z");

  const listed = await listLamAttendanceRecordsRecords(
    { employeeId: scope.employeeId },
    attendanceReadContext
  );
  assert.equal(listed.length, 1);

  const duplicate = await upsertLamAttendanceRecord(
    {
      companyId: scope.companyId,
      employeeId: scope.employeeId,
      attendanceDate: new Date("2026-06-15T23:59:00.000Z"),
      status: "absent",
    },
    scope.writeContext
  );
  assert.equal(duplicate.ok, false);
});

test("AC-019 database mode persists company attendance settings disablement", async (t) => {
  requireDatabase(t);
  const scope = createScope();

  const upsertResult = await upsertLamCompanyAttendanceSettings(
    {
      companyId: scope.companyId,
      attendanceCorrectionsEnabled: false,
    },
    scope.writeContext
  );
  assert.equal(upsertResult.ok, true);
  if (!upsertResult.ok) {
    throw new Error("Expected company attendance settings persistence to succeed");
  }

  resetLamRepositoryCacheForTesting();

  const state = await loadLamRepository(scope.writeContext);
  const persisted = state.companyAttendanceSettings.find(
    (entry) => entry.companyId === scope.companyId
  );
  assert.equal(persisted?.attendanceCorrectionsEnabled, false);
});

test("AC-003 database mode persists leave type policyGroupId", async (t) => {
  requireDatabase(t);
  const scope = createScope();
  const leaveTypesReadContext = {
    ...scope.readContext,
    grantedCapabilities: [leaveAttendanceManagementCapabilities.leaveTypesRead],
  };

  const created = await upsertLamLeaveType(
    {
      companyId: scope.companyId,
      code: "AL",
      name: "Annual Leave (Policy Group)",
      kind: "annual",
      policyGroupId: "policy-group-db-001",
    },
    scope.writeContext
  );
  assert.equal(created.ok, true);
  if (!created.ok) {
    throw new Error("Expected leave type persistence to succeed");
  }

  resetLamRepositoryCacheForTesting();

  const state = await loadLamRepository(scope.writeContext);
  const persisted = state.leaveTypes.find(
    (entry) => entry.id === created.targetId
  );
  assert.equal(persisted?.policyGroupId, "policy-group-db-001");

  const listed = await listLamLeaveTypesRecords(
    { policyGroupId: "policy-group-db-001" },
    leaveTypesReadContext
  );
  assert.ok(listed.some((entry) => entry.id === created.targetId));
});
