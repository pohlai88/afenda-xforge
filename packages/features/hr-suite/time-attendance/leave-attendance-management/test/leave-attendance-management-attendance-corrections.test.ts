import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  approveLamAttendanceCorrection,
  rejectLamAttendanceCorrection,
  submitLamAttendanceCorrection,
} from "../src/actions/attendance-corrections.action.ts";
import { upsertLamAttendanceRecord } from "../src/actions/attendance-records.action.ts";
import { upsertLamLeaveApprovalRoute } from "../src/actions/leave-approval-routes.action.ts";
import { leaveAttendanceManagementAuditEvents } from "../src/contracts/index.ts";
import {
  requireLamAttendanceCorrectionsWriteAccess,
  requireLamCorrectionApprovalAccess,
  requireStrictLamCorrectionApprovalAccess,
} from "../src/execution.ts";
import { buildAttendanceExceptionId } from "../src/projector/attendance-exceptions.ts";
import {
  getLamAttendanceCorrectionById,
  listLamAttendanceCorrectionsRecords,
} from "../src/queries/attendance-corrections.query.ts";
import { getLamAttendanceRecordById } from "../src/queries/attendance-records.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  loadLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
} from "../src/repository.ts";
import { buildLamStepApproverContext } from "./lam-approval-test-context.ts";

let currentRepositoryPath = "";

const writeContext = {
  actorId: "emp-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const correctionWriteContext = {
  actorId: "emp-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: false,
  scopedEmployeeId: "emp-001",
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.attendanceCorrectionsWrite,
  ],
} as const;

const correctionApproveContext = {
  actorId: "mgr-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: false,
  teamEmployeeIds: ["emp-001"],
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.attendanceCorrectionsWrite,
  ],
} as const;

const managerCorrectionStepContext = buildLamStepApproverContext(
  correctionApproveContext,
  "mgr-001"
);
const hrCorrectionStepContext = buildLamStepApproverContext(
  correctionApproveContext,
  "hr-001"
);

const readContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  canRead: true,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.attendanceCorrectionsRead,
  ],
} as const;

const seedLateRecord = async (): Promise<string> =>
  upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-10"),
      status: "late",
      clockInAt: new Date("2026-06-10T09:30:00.000Z"),
      clockOutAt: new Date("2026-06-10T18:00:00.000Z"),
    },
    writeContext
  ).then((result) => {
    assert.equal(result.ok, true);
    if (!result.ok) {
      throw new Error("Expected attendance record seed to succeed");
    }
    return result.targetId;
  });

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `afenda-lam-attendance-corrections-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("AC-019 submitLamAttendanceCorrection creates correction for detectable exception", async () => {
  const recordId = await seedLateRecord();

  const result = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: recordId,
      exceptionType: "late_arrival",
      requestedStatus: "present",
      requestedClockInAt: new Date("2026-06-10T09:00:00.000Z"),
      requestedClockOutAt: new Date("2026-06-10T18:00:00.000Z"),
      reason: "Traffic delay — corrected to on-time arrival",
    },
    correctionWriteContext
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected correction submission to succeed");
  }

  const correction = await getLamAttendanceCorrectionById(
    result.targetId,
    readContext
  );
  assert.ok(correction);
  assert.equal(correction?.status, "submitted");
  assert.equal(correction?.exceptionType, "late_arrival");
  assert.equal(correction?.requestedStatus, "present");

  const state = await loadLamRepository({
    companyId: "company-001",
    tenantId: "tenant-001",
  });
  const submittedAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.attendanceCorrectionSubmitted
  );
  assert.ok(submittedAudit);
  const detectedAudit = state.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.attendanceExceptionDetected
  );
  assert.ok(detectedAudit);
});

test("HRM-LAM-023 rejects correction when no detectable exception exists", async () => {
  const recordResult = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-11"),
      status: "present",
      clockInAt: new Date("2026-06-11T09:00:00.000Z"),
      clockOutAt: new Date("2026-06-11T18:00:00.000Z"),
    },
    writeContext
  );
  assert.equal(recordResult.ok, true);
  if (!recordResult.ok) {
    throw new Error("Expected attendance record seed to succeed");
  }

  const result = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: recordResult.targetId,
      exceptionType: "late_arrival",
      requestedStatus: "present",
      reason: "Invalid correction",
    },
    correctionWriteContext
  );

  assert.equal(result.ok, false);
});

test("HRM-LAM-023 submit accepts clock-policy late arrival when schedule params are supplied", async () => {
  const recordResult = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-12"),
      status: "present",
      clockInAt: new Date("2026-06-12T09:20:00.000Z"),
      clockOutAt: new Date("2026-06-12T18:00:00.000Z"),
    },
    writeContext
  );
  assert.equal(recordResult.ok, true);
  if (!recordResult.ok) {
    throw new Error("Expected attendance record seed to succeed");
  }

  const result = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: recordResult.targetId,
      exceptionType: "late_arrival",
      requestedStatus: "present",
      requestedClockInAt: new Date("2026-06-12T09:00:00.000Z"),
      reason: "Corrected to scheduled arrival",
      scheduledClockInAt: new Date("2026-06-12T09:00:00.000Z"),
      scheduledClockOutAt: new Date("2026-06-12T18:00:00.000Z"),
      gracePeriodMinutes: 5,
    },
    correctionWriteContext
  );

  assert.equal(result.ok, true);
});

test("HRM-LAM-023 rejects duplicate pending correction for same record and exception", async () => {
  const recordId = await seedLateRecord();

  const first = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: recordId,
      exceptionType: "late_arrival",
      requestedStatus: "present",
      reason: "First request",
    },
    correctionWriteContext
  );
  assert.equal(first.ok, true);

  const duplicate = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: recordId,
      exceptionType: "late_arrival",
      requestedStatus: "present",
      reason: "Duplicate request",
    },
    correctionWriteContext
  );
  assert.equal(duplicate.ok, false);
});

test("HRM-LAM-024 routes correction through approval workflow when route matches", async () => {
  const recordId = await seedLateRecord();

  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "ATT-CORR-ROUTE",
      title: "Attendance Correction Route",
      scope: { grade: "G5" },
      steps: [
        { order: 1, kind: "direct_manager", label: "Manager" },
        { order: 2, kind: "hr_officer", label: "HR" },
      ],
      active: true,
    },
    writeContext
  );

  const submitResult = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: recordId,
      exceptionType: "late_arrival",
      requestedStatus: "present",
      requestedClockInAt: new Date("2026-06-10T09:00:00.000Z"),
      requestedClockOutAt: new Date("2026-06-10T18:00:00.000Z"),
      reason: "Corrected arrival time",
      grade: "G5",
    },
    correctionWriteContext
  );
  assert.equal(submitResult.ok, true);
  if (!submitResult.ok) {
    throw new Error("Expected routed correction submission to succeed");
  }

  const pending = await getLamAttendanceCorrectionById(
    submitResult.targetId,
    readContext
  );
  assert.equal(pending?.status, "pending_approval");
  assert.equal(pending?.currentStepOrder, 1);
  assert.ok(pending?.approvalRouteId);

  const firstApprove = await approveLamAttendanceCorrection(
    {
      companyId: "company-001",
      correctionId: submitResult.targetId,
      approvedBy: "mgr-001",
    },
    managerCorrectionStepContext
  );
  assert.equal(firstApprove.ok, true);

  const stateAfterFirstStep = await loadLamRepository({
    companyId: "company-001",
    tenantId: "tenant-001",
  });
  const intermediateAudit = stateAfterFirstStep.auditEvents.find(
    (entry) =>
      entry.action ===
      leaveAttendanceManagementAuditEvents.attendanceCorrectionApproved
  );
  assert.ok(intermediateAudit);
  assert.equal(intermediateAudit?.metadata.isFinalApproval, false);

  const afterFirstStep = await getLamAttendanceCorrectionById(
    submitResult.targetId,
    readContext
  );
  assert.equal(afterFirstStep?.status, "pending_approval");
  assert.equal(afterFirstStep?.currentStepOrder, 2);

  const finalApprove = await approveLamAttendanceCorrection(
    {
      companyId: "company-001",
      correctionId: submitResult.targetId,
      approvedBy: "hr-001",
    },
    hrCorrectionStepContext
  );
  assert.equal(finalApprove.ok, true);

  const approved = await getLamAttendanceCorrectionById(
    submitResult.targetId,
    readContext
  );
  assert.equal(approved?.status, "approved");
  assert.equal(approved?.approvedBy, "hr-001");
  assert.ok(approved?.approvedAt);

  const record = await getLamAttendanceRecordById(recordId, readContext);
  assert.equal(record?.status, "present");
  assert.equal(
    record?.clockInAt?.toISOString(),
    new Date("2026-06-10T09:00:00.000Z").toISOString()
  );
});

test("HRM-LAM-024 rejects unauthorized actor on configured correction approval step", async () => {
  const recordId = await seedLateRecord();

  await upsertLamLeaveApprovalRoute(
    {
      companyId: "company-001",
      code: "ATT-CORR-DENY",
      title: "Deny Route",
      scope: { grade: "G5" },
      steps: [{ order: 1, kind: "direct_manager", label: "Manager" }],
      active: true,
    },
    writeContext
  );

  const submitResult = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: recordId,
      exceptionType: "late_arrival",
      requestedStatus: "present",
      reason: "Unauthorized actor test",
      grade: "G5",
    },
    correctionWriteContext
  );
  assert.equal(submitResult.ok, true);
  if (!submitResult.ok) {
    throw new Error("Expected correction submission to succeed");
  }

  const denied = await approveLamAttendanceCorrection(
    {
      companyId: "company-001",
      correctionId: submitResult.targetId,
      approvedBy: "wrong-mgr",
    },
    buildLamStepApproverContext(correctionApproveContext, "wrong-mgr", [
      "mgr-001",
    ])
  );
  assert.equal(denied.ok, false);
  if (denied.ok) {
    throw new Error("Expected unauthorized correction approver to be denied");
  }
  assert.match(denied.error, /not authorized for approval workflow step/);
});

test("AC-019 approveLamAttendanceCorrection applies correction without route on submitted status", async () => {
  const recordId = await seedLateRecord();

  const submitResult = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: recordId,
      exceptionType: "late_arrival",
      requestedStatus: "present",
      requestedClockInAt: new Date("2026-06-10T09:05:00.000Z"),
      requestedClockOutAt: new Date("2026-06-10T18:00:00.000Z"),
      reason: "Supervisor verified on-time arrival",
    },
    correctionWriteContext
  );
  assert.equal(submitResult.ok, true);
  if (!submitResult.ok) {
    throw new Error("Expected correction submission to succeed");
  }

  const approveResult = await approveLamAttendanceCorrection(
    {
      companyId: "company-001",
      correctionId: submitResult.targetId,
      approvedBy: "mgr-001",
    },
    correctionApproveContext
  );
  assert.equal(approveResult.ok, true);

  const record = await getLamAttendanceRecordById(recordId, readContext);
  assert.equal(record?.status, "present");

  const state = await loadLamRepository({
    companyId: "company-001",
    tenantId: "tenant-001",
  });
  assert.ok(
    state.auditEvents.some(
      (entry) =>
        entry.action ===
        leaveAttendanceManagementAuditEvents.attendanceCorrectionApproved
    )
  );
  assert.ok(
    state.auditEvents.some(
      (entry) =>
        entry.action ===
        leaveAttendanceManagementAuditEvents.attendanceRecordUpserted
    )
  );
});

test("AC-019 rejectLamAttendanceCorrection stores rejection reason without changing attendance record", async () => {
  const recordId = await seedLateRecord();

  const submitResult = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: recordId,
      exceptionType: "late_arrival",
      requestedStatus: "present",
      reason: "Request rejected scenario",
    },
    correctionWriteContext
  );
  assert.equal(submitResult.ok, true);
  if (!submitResult.ok) {
    throw new Error("Expected correction submission to succeed");
  }

  const beforeRecord = await getLamAttendanceRecordById(recordId, readContext);

  const rejectResult = await rejectLamAttendanceCorrection(
    {
      companyId: "company-001",
      correctionId: submitResult.targetId,
      rejectionReason: "Insufficient evidence",
    },
    correctionApproveContext
  );
  assert.equal(rejectResult.ok, true);

  const correction = await getLamAttendanceCorrectionById(
    submitResult.targetId,
    readContext
  );
  assert.equal(correction?.status, "rejected");
  assert.equal(correction?.rejectionReason, "Insufficient evidence");

  const afterRecord = await getLamAttendanceRecordById(recordId, readContext);
  assert.equal(afterRecord?.status, beforeRecord?.status);

  const state = await loadLamRepository({
    companyId: "company-001",
    tenantId: "tenant-001",
  });
  assert.ok(
    state.auditEvents.some(
      (entry) =>
        entry.action ===
        leaveAttendanceManagementAuditEvents.attendanceCorrectionRejected
    )
  );
});

test("listLamAttendanceCorrectionsRecords filters by status and employee", async () => {
  const recordId = await seedLateRecord();

  await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: recordId,
      exceptionType: "late_arrival",
      requestedStatus: "present",
      reason: "Filter test",
    },
    correctionWriteContext
  );

  const listed = await listLamAttendanceCorrectionsRecords(
    { employeeId: "emp-001", status: "submitted" },
    readContext
  );
  assert.equal(listed.length, 1);
  assert.equal(listed[0]?.employeeId, "emp-001");
});

test("attendance correction capability gates enforce write and approval access", () => {
  assert.equal(
    requireLamAttendanceCorrectionsWriteAccess({
      companyId: "company-001",
    })?.ok,
    false
  );
  assert.equal(
    requireLamAttendanceCorrectionsWriteAccess(correctionWriteContext),
    null
  );
  assert.equal(
    requireLamCorrectionApprovalAccess(correctionApproveContext),
    null
  );
  assert.equal(
    requireStrictLamCorrectionApprovalAccess({
      ...correctionApproveContext,
      canWrite: true,
      grantedCapabilities: [],
    })?.ok,
    false
  );
  assert.equal(
    requireStrictLamCorrectionApprovalAccess(correctionApproveContext),
    null
  );
});

test("buildAttendanceExceptionId provides stable exception identifier for corrections", () => {
  assert.equal(
    buildAttendanceExceptionId({
      attendanceRecordId: "rec-001",
      exceptionType: "late_arrival",
    }),
    "rec-001:late_arrival"
  );
});

test("AC-019 submit fails closed without attendance correction write access", async () => {
  const recordId = await seedLateRecord();

  const result = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: recordId,
      exceptionType: "late_arrival",
      requestedStatus: "present",
      reason: "Unauthorized submit",
    },
    {
      companyId: "company-001",
      tenantId: "tenant-001",
      canWrite: false,
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.leaveApplicationsWrite,
      ],
    }
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error, "Attendance correction write access denied");
  }
});

test("AC-019 submit respects employee mutation scope", async () => {
  const recordId = await seedLateRecord();

  const result = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-002",
      attendanceRecordId: recordId,
      exceptionType: "late_arrival",
      requestedStatus: "present",
      reason: "Out of scope submit",
    },
    {
      actorId: "emp-001",
      companyId: "company-001",
      tenantId: "tenant-001",
      scopedEmployeeId: "emp-001",
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.attendanceCorrectionsWrite,
      ],
    }
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(
      result.error,
      "Employee data scope access denied for leave and attendance"
    );
  }
});

test("AC-019 approve fails closed without strict correction write capability", async () => {
  const recordId = await seedLateRecord();
  const submitResult = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: recordId,
      exceptionType: "late_arrival",
      requestedStatus: "present",
      reason: "Approve gate test",
    },
    correctionWriteContext
  );
  assert.equal(submitResult.ok, true);
  if (!submitResult.ok) {
    throw new Error("Expected correction submission to succeed");
  }

  const denied = await approveLamAttendanceCorrection(
    {
      companyId: "company-001",
      correctionId: submitResult.targetId,
      approvedBy: "mgr-001",
    },
    {
      actorId: "mgr-001",
      companyId: "company-001",
      tenantId: "tenant-001",
      canWrite: true,
      teamEmployeeIds: ["emp-001"],
      grantedCapabilities: [
        leaveAttendanceManagementCapabilities.leaveApplicationsApprove,
      ],
    }
  );
  assert.equal(denied.ok, false);
  if (!denied.ok) {
    assert.equal(
      denied.error,
      "Approval access denied for attendance corrections"
    );
  }
});

test("attendance correction queries fail closed without read access", async () => {
  assert.equal(
    (
      await listLamAttendanceCorrectionsRecords(
        {},
        { companyId: "company-001" }
      )
    ).length,
    0
  );
  assert.equal(
    await getLamAttendanceCorrectionById("missing", {
      companyId: "company-001",
    }),
    null
  );
});
