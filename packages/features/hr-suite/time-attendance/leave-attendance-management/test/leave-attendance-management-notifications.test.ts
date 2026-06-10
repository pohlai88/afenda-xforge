import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { submitLamAttendanceCorrection } from "../src/actions/attendance-corrections.action.ts";
import { upsertLamAttendanceRecord } from "../src/actions/attendance-records.action.ts";
import { submitLamLeaveApplication } from "../src/actions/leave-applications.action.ts";
import { upsertLamLeaveType } from "../src/actions/leave-types.action.ts";
import {
  processLamOverdueApprovalNotifications,
  recordLamNotificationEnqueued,
} from "../src/actions/notifications.action.ts";
import { lamNotificationEventNames } from "../src/contracts/notification.contract.ts";
import {
  buildLamAttendanceCorrectionNotificationIntent,
  buildLamLeaveApplicationNotificationIntent,
  resolveLamNotificationRecipientUserIds,
} from "../src/projector/notifications.ts";
import { listLamOverdueApprovalNotifications } from "../src/queries/overdue-approvals.query.ts";
import { leaveAttendanceManagementCapabilities } from "../src/registry/capability.ts";
import {
  mutateLamRepository,
  resetLamRepositoryForTesting,
  setLamRepositoryPathForTesting,
  upsertLamEntity,
} from "../src/repository.ts";
import type {
  LamAttendanceCorrection,
  LamLeaveApplication,
} from "../src/schema.ts";

let currentRepositoryPath = "";
let unpaidLeaveTypeId = "";

const writeContext = {
  actorId: "hr-admin",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: true,
} as const;

const correctionWriteContext = {
  actorId: "emp-001",
  companyId: "company-001",
  tenantId: "tenant-001",
  canWrite: false,
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.attendanceCorrectionsWrite,
  ],
} as const;

const sampleApplication = (): LamLeaveApplication => ({
  id: "app-001",
  companyId: "company-001",
  employeeId: "emp-001",
  leaveTypeId: "lt-unpaid",
  startDate: new Date("2026-07-01"),
  endDate: new Date("2026-07-03"),
  totalDays: 3,
  reason: "Personal",
  status: "pending_approval",
  approvalRouteId: null,
  currentStepOrder: null,
  approvedBy: null,
  approvedAt: null,
  rejectionReason: null,
  returnedReason: null,
  cancellationReason: null,
  cancelledAt: null,
  submittedAt: new Date("2026-06-01T00:00:00.000Z"),
  createdAt: new Date("2026-06-01T00:00:00.000Z"),
  updatedAt: new Date("2026-06-01T00:00:00.000Z"),
});

const sampleCorrection = (): LamAttendanceCorrection => ({
  id: "corr-001",
  companyId: "company-001",
  employeeId: "emp-001",
  attendanceRecordId: "att-001",
  exceptionType: "missing_punch",
  requestedStatus: "present",
  requestedClockInAt: new Date("2026-06-02T09:00:00.000Z"),
  requestedClockOutAt: new Date("2026-06-02T18:00:00.000Z"),
  reason: "Forgot to punch",
  status: "pending_approval",
  approvalRouteId: null,
  currentStepOrder: null,
  approvedBy: null,
  approvedAt: null,
  rejectionReason: null,
  submittedAt: new Date("2026-06-01T00:00:00.000Z"),
  createdAt: new Date("2026-06-01T00:00:00.000Z"),
  updatedAt: new Date("2026-06-01T00:00:00.000Z"),
});

beforeEach(async () => {
  currentRepositoryPath = resolve(
    tmpdir(),
    `lam-notifications-${randomUUID()}.json`
  );
  setLamRepositoryPathForTesting(currentRepositoryPath);
  await resetLamRepositoryForTesting();

  const leaveType = await upsertLamLeaveType(
    {
      companyId: "company-001",
      code: "UNPAID",
      name: "Unpaid Leave",
      kind: "unpaid",
      paid: false,
      requiresDocument: false,
      active: true,
    },
    writeContext
  );
  assert.equal(leaveType.ok, true);
  if (!leaveType.ok) {
    throw new Error("Failed to seed unpaid leave type");
  }
  unpaidLeaveTypeId = leaveType.targetId;
});

afterEach(() => {
  try {
    rmSync(currentRepositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for test artifacts.
  }
});

test("HRM-LAM-028 notification intents cover submitted, approved, rejected, cancelled, returned, and overdue", () => {
  const application = sampleApplication();

  for (const kind of [
    "submitted",
    "approved",
    "rejected",
    "cancelled",
    "returned",
    "overdue",
  ] as const) {
    const intent = buildLamLeaveApplicationNotificationIntent({
      application,
      kind,
      leaveTypeName: "Unpaid Leave",
      rejectionReason: kind === "rejected" ? "Insufficient balance" : null,
      returnedReason: kind === "returned" ? "Missing document" : null,
    });

    assert.equal(
      intent.event,
      lamNotificationEventNames.leaveApplication[kind]
    );
    assert.ok(intent.title.length > 0);
    assert.ok(intent.body.length > 0);
  }
});

test("HRM-LAM-028 attendance correction notification intents target employee or approver roles", () => {
  const correction = sampleCorrection();

  const submitted = buildLamAttendanceCorrectionNotificationIntent({
    correction,
    kind: "submitted",
  });
  assert.deepEqual(submitted.recipientRoles, ["approver"]);

  const approved = buildLamAttendanceCorrectionNotificationIntent({
    correction,
    kind: "approved",
  });
  assert.deepEqual(approved.recipientRoles, ["employee"]);
  assert.equal(
    approved.event,
    lamNotificationEventNames.attendanceCorrection.approved
  );

  const rejected = buildLamAttendanceCorrectionNotificationIntent({
    correction,
    kind: "rejected",
    rejectionReason: "Insufficient evidence",
  });
  assert.deepEqual(rejected.recipientRoles, ["employee"]);
  assert.equal(
    rejected.event,
    lamNotificationEventNames.attendanceCorrection.rejected
  );
  assert.match(rejected.body, /Insufficient evidence/);

  const overdue = buildLamAttendanceCorrectionNotificationIntent({
    correction,
    kind: "overdue",
  });
  assert.deepEqual(overdue.recipientRoles, ["approver"]);
  assert.equal(
    overdue.event,
    lamNotificationEventNames.attendanceCorrection.overdue
  );
});

test("buildLamLeaveApplicationNotificationIntent uses persisted rejection reason when override omitted", () => {
  const application = {
    ...sampleApplication(),
    status: "rejected" as const,
    rejectionReason: "Insufficient staffing during peak period",
  };

  const intent = buildLamLeaveApplicationNotificationIntent({
    application,
    kind: "rejected",
    leaveTypeName: "Annual Leave",
  });

  assert.match(intent.body, /Insufficient staffing during peak period/);
});

test("buildLamLeaveApplicationNotificationIntent distinguishes clarification from return", () => {
  const application = sampleApplication();

  const clarificationIntent = buildLamLeaveApplicationNotificationIntent({
    application,
    kind: "returned",
    returnedReason: "Confirm travel dates",
    requestType: "clarification",
  });

  assert.equal(
    clarificationIntent.title,
    "Leave Application Clarification Requested"
  );
  assert.match(clarificationIntent.body, /needs clarification/);
  assert.equal(clarificationIntent.metadata?.requestType, "clarification");

  const returnIntent = buildLamLeaveApplicationNotificationIntent({
    application,
    kind: "returned",
    returnedReason: "Attach itinerary",
    requestType: "return",
  });

  assert.equal(returnIntent.title, "Leave Application Returned");
  assert.match(returnIntent.body, /returned for correction/);
});

test("resolveLamNotificationRecipientUserIds maps employee and approver user ids", () => {
  const intent = buildLamLeaveApplicationNotificationIntent({
    application: sampleApplication(),
    kind: "submitted",
  });

  assert.deepEqual(
    resolveLamNotificationRecipientUserIds(intent, {
      employeeUserId: "user-emp",
      approverUserIds: ["user-mgr-1", "user-mgr-2"],
    }),
    ["user-mgr-1", "user-mgr-2"]
  );

  const approvedIntent = buildLamLeaveApplicationNotificationIntent({
    application: sampleApplication(),
    kind: "approved",
  });

  assert.deepEqual(
    resolveLamNotificationRecipientUserIds(approvedIntent, {
      employeeUserId: "user-emp",
      approverUserIds: ["user-mgr-1"],
    }),
    ["user-emp"]
  );

  assert.deepEqual(
    resolveLamNotificationRecipientUserIds(intent, {
      employeeUserId: "user-emp",
      approverUserIds: [],
    }),
    []
  );

  assert.deepEqual(
    resolveLamNotificationRecipientUserIds(approvedIntent, {
      approverUserIds: ["user-mgr-1"],
    }),
    []
  );
});

test("HRM-LAM-028 overdue query finds pending leave applications past SLA", async () => {
  const submitResult = await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-02"),
      totalDays: 2,
      reason: "Overdue test",
    },
    writeContext
  );
  assert.equal(submitResult.ok, true);
  if (!submitResult.ok) {
    throw new Error("Failed to submit leave application");
  }

  await mutateLamRepository((draft) => {
    const application = draft.leaveApplications.find(
      (entry) => entry.id === submitResult.targetId
    );
    if (!application) {
      throw new Error("Submitted application not found");
    }

    draft.leaveApplications = upsertLamEntity(draft.leaveApplications, {
      ...application,
      submittedAt: new Date("2020-01-01T00:00:00.000Z"),
    });
  }, writeContext);

  const overdueItems = await listLamOverdueApprovalNotifications(
    {
      companyId: "company-001",
      overdueAfterHours: 1,
    },
    { ...writeContext, canRead: true }
  );

  assert.equal(overdueItems.length, 1);
  assert.equal(overdueItems[0]?.intent.kind, "overdue");
});

test("HRM-LAM-028 overdue query finds pending attendance corrections past SLA", async () => {
  const recordResult = await upsertLamAttendanceRecord(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceDate: new Date("2026-06-10"),
      status: "missing_punch",
    },
    writeContext
  );
  assert.equal(recordResult.ok, true);
  if (!recordResult.ok) {
    throw new Error("Failed to seed attendance record");
  }

  const submitResult = await submitLamAttendanceCorrection(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      attendanceRecordId: recordResult.targetId,
      exceptionType: "missing_punch",
      requestedStatus: "present",
      requestedClockInAt: new Date("2026-06-10T09:00:00.000Z"),
      requestedClockOutAt: new Date("2026-06-10T18:00:00.000Z"),
      reason: "Correction overdue test",
    },
    correctionWriteContext
  );
  assert.equal(submitResult.ok, true);
  if (!submitResult.ok) {
    throw new Error("Failed to submit attendance correction");
  }

  await mutateLamRepository((draft) => {
    const correction = draft.attendanceCorrections.find(
      (entry) => entry.id === submitResult.targetId
    );
    if (!correction) {
      throw new Error("Submitted correction not found");
    }

    draft.attendanceCorrections = upsertLamEntity(draft.attendanceCorrections, {
      ...correction,
      submittedAt: new Date("2020-01-01T00:00:00.000Z"),
    });
  }, writeContext);

  const overdueItems = await listLamOverdueApprovalNotifications(
    {
      companyId: "company-001",
      overdueAfterHours: 1,
    },
    { ...writeContext, canRead: true }
  );

  const correctionOverdue = overdueItems.find(
    (entry) => entry.intent.subjectType === "attendance_correction"
  );
  assert.ok(correctionOverdue);
  assert.equal(correctionOverdue.intent.kind, "overdue");
});

test("HRM-LAM-028 processLamOverdueApprovalNotifications writes audit batch", async () => {
  const submitResult = await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-02"),
      totalDays: 2,
      reason: "Overdue process test",
    },
    writeContext
  );
  assert.equal(submitResult.ok, true);
  if (!submitResult.ok) {
    throw new Error("Failed to submit leave application");
  }

  await mutateLamRepository((draft) => {
    const application = draft.leaveApplications.find(
      (entry) => entry.id === submitResult.targetId
    );
    if (!application) {
      throw new Error("Submitted application not found");
    }

    draft.leaveApplications = upsertLamEntity(draft.leaveApplications, {
      ...application,
      submittedAt: new Date("2020-01-01T00:00:00.000Z"),
    });
  }, writeContext);

  const processed = await processLamOverdueApprovalNotifications(
    {
      companyId: "company-001",
      overdueAfterHours: 1,
    },
    writeContext
  );
  assert.equal(processed.ok, true);
  if (!processed.ok) {
    throw new Error("Failed to process overdue notifications");
  }

  assert.equal(processed.intents.length, 1);
  assert.equal(processed.intents[0]?.kind, "overdue");
});

const managerOverdueContext = {
  companyId: "company-001",
  tenantId: "tenant-001",
  actorEmployeeId: "mgr-001",
  resolvedStepApproverEmployeeIds: ["mgr-001"],
  teamEmployeeIds: ["emp-001"],
  grantedCapabilities: [
    leaveAttendanceManagementCapabilities.leaveApplicationsApprove,
  ],
  canRead: true,
} as const;

const backdateSubmittedAt = async (
  entityType: "leave_application" | "attendance_correction",
  targetId: string
): Promise<void> => {
  await mutateLamRepository((draft) => {
    if (entityType === "leave_application") {
      const application = draft.leaveApplications.find(
        (entry) => entry.id === targetId
      );
      if (!application) {
        throw new Error("Application not found");
      }
      draft.leaveApplications = upsertLamEntity(draft.leaveApplications, {
        ...application,
        submittedAt: new Date("2020-01-01T00:00:00.000Z"),
      });
      return;
    }

    const correction = draft.attendanceCorrections.find(
      (entry) => entry.id === targetId
    );
    if (!correction) {
      throw new Error("Correction not found");
    }
    draft.attendanceCorrections = upsertLamEntity(draft.attendanceCorrections, {
      ...correction,
      submittedAt: new Date("2020-01-01T00:00:00.000Z"),
    });
  }, writeContext);
};

test("HRM-LAM-028 overdue query scopes to manager team employee ids", async () => {
  const teamSubmit = await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-02"),
      totalDays: 2,
      reason: "Team overdue",
    },
    writeContext
  );
  assert.equal(teamSubmit.ok, true);
  if (!teamSubmit.ok) {
    throw new Error("Failed to submit team leave");
  }

  const outsideSubmit = await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-002",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-08-03"),
      endDate: new Date("2026-08-04"),
      totalDays: 2,
      reason: "Outside team overdue",
    },
    writeContext
  );
  assert.equal(outsideSubmit.ok, true);
  if (!outsideSubmit.ok) {
    throw new Error("Failed to submit outside-team leave");
  }

  await backdateSubmittedAt("leave_application", teamSubmit.targetId);
  await backdateSubmittedAt("leave_application", outsideSubmit.targetId);

  const overdueItems = await listLamOverdueApprovalNotifications(
    { companyId: "company-001", overdueAfterHours: 1 },
    managerOverdueContext
  );

  assert.equal(overdueItems.length, 1);
  assert.equal(overdueItems[0]?.intent.employeeId, "emp-001");
});

test("HRM-LAM-028 processLamOverdueApprovalNotifications scopes intents to manager team", async () => {
  const teamSubmit = await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-001",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-08-05"),
      endDate: new Date("2026-08-06"),
      totalDays: 2,
      reason: "Team process overdue",
    },
    writeContext
  );
  assert.equal(teamSubmit.ok, true);
  if (!teamSubmit.ok) {
    throw new Error("Failed to submit team leave");
  }

  const outsideSubmit = await submitLamLeaveApplication(
    {
      companyId: "company-001",
      employeeId: "emp-002",
      leaveTypeId: unpaidLeaveTypeId,
      startDate: new Date("2026-08-07"),
      endDate: new Date("2026-08-08"),
      totalDays: 2,
      reason: "Outside team process overdue",
    },
    writeContext
  );
  assert.equal(outsideSubmit.ok, true);
  if (!outsideSubmit.ok) {
    throw new Error("Failed to submit outside-team leave");
  }

  await backdateSubmittedAt("leave_application", teamSubmit.targetId);
  await backdateSubmittedAt("leave_application", outsideSubmit.targetId);

  const processed = await processLamOverdueApprovalNotifications(
    { companyId: "company-001", overdueAfterHours: 1 },
    managerOverdueContext
  );
  assert.equal(processed.ok, true);
  if (!processed.ok) {
    throw new Error("Failed to process overdue notifications");
  }

  assert.equal(processed.intents.length, 1);
  assert.equal(processed.intents[0]?.employeeId, "emp-001");
});

test("HRM-LAM-028 recordLamNotificationEnqueued writes notification audit event", async () => {
  const intent = buildLamLeaveApplicationNotificationIntent({
    application: sampleApplication(),
    kind: "approved",
    leaveTypeName: "Unpaid Leave",
  });

  const result = await recordLamNotificationEnqueued(
    {
      companyId: "company-001",
      intent,
      recipientUserIds: ["user-emp"],
      notificationId: "notif-001",
    },
    writeContext
  );

  assert.equal(result.ok, true);
});
