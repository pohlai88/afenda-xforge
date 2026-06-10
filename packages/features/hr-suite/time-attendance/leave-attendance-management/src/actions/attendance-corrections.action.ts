import "server-only";

import type {
  ApproveLamAttendanceCorrectionInput,
  LamMutationResult,
  RejectLamAttendanceCorrectionInput,
  SubmitLamAttendanceCorrectionInput,
} from "../contracts/index.ts";
import {
  approveLamAttendanceCorrectionInputSchema,
  leaveAttendanceManagementAuditEvents,
  rejectLamAttendanceCorrectionInputSchema,
  submitLamAttendanceCorrectionInputSchema,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamAttendanceCorrectionsWriteAccess,
  requireLamEmployeeMutationScope,
  requireLamAttendanceCorrectionsEnabledForCompany,
  requireStrictLamCorrectionApprovalAccess,
} from "../execution.ts";
import {
  resolveCurrentApprovalStep,
  selectLeaveApprovalRoute,
} from "../projector/approval-routing.ts";
import { detectAttendanceExceptionsFromRecord } from "../projector/attendance-exceptions.ts";
import type { LamRepositoryState } from "../repository.ts";
import {
  createLamRecordId,
  mutateLamRepository,
  upsertLamEntity,
} from "../repository.ts";
import type {
  LamAttendanceCorrection,
  LamAttendanceExceptionDetectionPolicy,
  LamAttendanceRecord,
} from "../schema.ts";
import {
  lamAttendanceCorrectionSchema,
  lamAttendanceExceptionDetectionPolicySchema,
  lamAttendanceRecordSchema,
  lamWriteContextSchema,
} from "../schema.ts";
import type { ApprovalStepAuthorizationOutcome } from "../shared/leave-approval-step-enforcement.ts";
import { requireActorAuthorizedForApprovalStep } from "../shared/leave-approval-step-enforcement.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected attendance correction mutation failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error(
      "Company context is required for attendance correction mutations"
    );
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

const PENDING_CORRECTION_STATUSES = ["submitted", "pending_approval"] as const;
const DECISION_STATUSES = ["submitted", "pending_approval"] as const;

const buildCorrectionRoutingScope = (
  validInput: SubmitLamAttendanceCorrectionInput
) => ({
  countryCode: validInput.countryCode,
  legalEntityCode: validInput.legalEntityCode,
  workLocationCode: validInput.workLocationCode,
  employmentType: validInput.employmentType,
  grade: validInput.grade,
  policyGroupId: validInput.policyGroupId,
  departmentId: validInput.departmentId,
});

const assertPendingCorrectionAllowed = (
  draft: LamRepositoryState,
  args: {
    attendanceRecordId: string;
    exceptionType: LamAttendanceCorrection["exceptionType"];
    correctionId: string;
  }
): void => {
  const duplicate = draft.attendanceCorrections.some(
    (entry) =>
      entry.id !== args.correctionId &&
      entry.attendanceRecordId === args.attendanceRecordId &&
      entry.exceptionType === args.exceptionType &&
      PENDING_CORRECTION_STATUSES.includes(
        entry.status as (typeof PENDING_CORRECTION_STATUSES)[number]
      )
  );

  if (duplicate) {
    throw new Error(
      `A pending attendance correction already exists for record "${args.attendanceRecordId}" and exception "${args.exceptionType}"`
    );
  }
};

const buildCorrectionDetectionPolicy = (
  input: SubmitLamAttendanceCorrectionInput
): LamAttendanceExceptionDetectionPolicy | undefined => {
  if (
    !(input.scheduledClockInAt || input.scheduledClockOutAt) &&
    input.gracePeriodMinutes === undefined
  ) {
    return;
  }

  return lamAttendanceExceptionDetectionPolicySchema.parse({
    scheduledClockInAt: input.scheduledClockInAt,
    scheduledClockOutAt: input.scheduledClockOutAt,
    gracePeriodMinutes: input.gracePeriodMinutes,
  });
};

const assertAttendanceExceptionExists = (
  record: LamAttendanceRecord,
  exceptionType: LamAttendanceCorrection["exceptionType"],
  policy?: LamAttendanceExceptionDetectionPolicy
): void => {
  const exceptions = detectAttendanceExceptionsFromRecord(record, policy);
  if (!exceptions.some((entry) => entry.exceptionType === exceptionType)) {
    throw new Error(
      `Attendance record "${record.id}" does not have a detectable "${exceptionType}" exception`
    );
  }
};

const applyApprovalRouteToCorrection = (args: {
  correction: LamAttendanceCorrection;
  routes: LamRepositoryState["leaveApprovalRoutes"];
  companyId: string;
  routingScope: ReturnType<typeof buildCorrectionRoutingScope>;
}): LamAttendanceCorrection => {
  const route = selectLeaveApprovalRoute(args.routes, {
    companyId: args.companyId,
    leaveTypeId: "",
    totalDays: 1,
    scope: args.routingScope,
  });

  if (!route) {
    return args.correction;
  }

  const firstStep = resolveCurrentApprovalStep(route, 1);
  if (!firstStep) {
    throw new Error(
      `Approval route "${route.code}" does not define step order 1`
    );
  }

  return lamAttendanceCorrectionSchema.parse({
    ...args.correction,
    status: "pending_approval",
    approvalRouteId: route.id,
    currentStepOrder: 1,
    updatedAt: new Date(),
  });
};

const applyApprovedCorrectionToRecord = (
  record: LamAttendanceRecord,
  correction: LamAttendanceCorrection
): LamAttendanceRecord => {
  const requestedClockInAt =
    correction.requestedClockInAt === undefined
      ? record.clockInAt
      : correction.requestedClockInAt;
  const requestedClockOutAt =
    correction.requestedClockOutAt === undefined
      ? record.clockOutAt
      : correction.requestedClockOutAt;

  if (
    requestedClockInAt &&
    requestedClockOutAt &&
    requestedClockOutAt.getTime() < requestedClockInAt.getTime()
  ) {
    throw new Error(
      "requestedClockOutAt must be on or after requestedClockInAt"
    );
  }

  return lamAttendanceRecordSchema.parse({
    ...record,
    status: correction.requestedStatus,
    clockInAt: requestedClockInAt,
    clockOutAt: requestedClockOutAt,
    updatedAt: new Date(),
  });
};

const assertDecisionStatus = (correction: LamAttendanceCorrection): void => {
  if (
    !DECISION_STATUSES.includes(
      correction.status as (typeof DECISION_STATUSES)[number]
    )
  ) {
    throw new Error(
      `Attendance correction must be submitted or pending approval; current status is "${correction.status}"`
    );
  }
};

const assertDecisionActorForWorkflowStep = (args: {
  draft: LamRepositoryState;
  existing: LamAttendanceCorrection;
  context?: LamMutationContext;
  approvedBy?: string | null;
}): ApprovalStepAuthorizationOutcome => {
  const route = args.existing.approvalRouteId
    ? args.draft.leaveApprovalRoutes.find(
        (entry) => entry.id === args.existing.approvalRouteId
      )
    : null;

  return requireActorAuthorizedForApprovalStep({
    application: {
      approvalRouteId: args.existing.approvalRouteId,
      currentStepOrder: args.existing.currentStepOrder,
      status: args.existing.status,
    },
    route,
    context: args.context,
    approvedBy: args.approvedBy,
  });
};

const buildApprovalAuthorizationAuditMetadata = (
  authorization: ApprovalStepAuthorizationOutcome
) => ({
  viaPrimaryApprover: authorization.viaPrimaryApprover,
  viaHrFallbackDelegation: authorization.viaHrFallbackDelegation,
  viaHrOfficerStep: authorization.viaHrOfficerStep,
  viaHrAdminBypass: authorization.viaHrAdminBypass,
});

const applyApproveDecision = (args: {
  draft: LamRepositoryState;
  companyId: string;
  context?: LamMutationContext;
  existing: LamAttendanceCorrection;
  validInput: ApproveLamAttendanceCorrectionInput;
  approverId: string;
  decidedAt: Date;
  authorization: ApprovalStepAuthorizationOutcome;
}): LamAttendanceCorrection => {
  const route = args.existing.approvalRouteId
    ? args.draft.leaveApprovalRoutes.find(
        (entry) => entry.id === args.existing.approvalRouteId
      )
    : null;
  const currentStepOrder = args.existing.currentStepOrder ?? 1;
  const nextStep = route
    ? resolveCurrentApprovalStep(route, currentStepOrder + 1)
    : null;
  const isFinalApproval = !nextStep;

  const approved = lamAttendanceCorrectionSchema.parse({
    ...args.existing,
    status: isFinalApproval ? "approved" : "pending_approval",
    currentStepOrder: isFinalApproval
      ? args.existing.currentStepOrder
      : currentStepOrder + 1,
    approvedBy: isFinalApproval ? args.approverId : args.existing.approvedBy,
    approvedAt: isFinalApproval ? args.decidedAt : args.existing.approvedAt,
    updatedAt: args.decidedAt,
  });

  if (isFinalApproval) {
    const attendanceRecord = args.draft.attendanceRecords.find(
      (entry) => entry.id === args.existing.attendanceRecordId
    );
    if (!attendanceRecord) {
      throw new Error(
        `Attendance record "${args.existing.attendanceRecordId}" was not found`
      );
    }

    const beforeRecord = attendanceRecord;
    const nextRecord = applyApprovedCorrectionToRecord(
      attendanceRecord,
      approved
    );
    args.draft.attendanceRecords = upsertLamEntity(
      args.draft.attendanceRecords,
      nextRecord
    );

    args.draft.auditEvents.push(
      createLamMutationAuditEvent({
        companyId: args.companyId,
        actorId: normalizeLamMutationActorId(args.context),
        action: leaveAttendanceManagementAuditEvents.attendanceRecordUpserted,
        entityType: "attendance_record",
        entityId: nextRecord.id,
        summary: `Attendance corrected to ${nextRecord.status} for employee ${nextRecord.employeeId}`,
        metadata: buildLamAuditMetadata({
          employeeId: nextRecord.employeeId,
          attendanceDate: nextRecord.attendanceDate.toISOString(),
          status: nextRecord.status,
          correctionId: approved.id,
          approvedBy: args.approverId,
        }),
        before: beforeRecord,
        after: nextRecord,
      })
    );
  }

  args.draft.attendanceCorrections = upsertLamEntity(
    args.draft.attendanceCorrections,
    approved
  );

  const currentStep = route
    ? resolveCurrentApprovalStep(route, currentStepOrder)
    : null;
  const nextResolvedStep = route
    ? resolveCurrentApprovalStep(route, approved.currentStepOrder ?? 1)
    : null;

  args.draft.auditEvents.push(
    createLamMutationAuditEvent({
      companyId: args.companyId,
      actorId: normalizeLamMutationActorId(args.context),
      action: leaveAttendanceManagementAuditEvents.attendanceCorrectionApproved,
      entityType: "attendance_correction",
      entityId: approved.id,
      summary: isFinalApproval
        ? `Attendance correction approved for employee ${args.existing.employeeId}`
        : `Attendance correction advanced to approval step ${approved.currentStepOrder}`,
      metadata: buildLamAuditMetadata({
        employeeId: args.existing.employeeId,
        attendanceRecordId: args.existing.attendanceRecordId,
        exceptionType: args.existing.exceptionType,
        approvalRouteId: args.existing.approvalRouteId,
        approvalRouteCode: route?.code,
        approvedBy: args.approverId,
        isFinalApproval,
        stepOrderBefore: currentStepOrder,
        stepOrderAfter: approved.currentStepOrder,
        stepKindBefore: currentStep?.kind,
        stepKindAfter: nextResolvedStep?.kind,
        notes: args.validInput.notes,
        ...buildApprovalAuthorizationAuditMetadata(args.authorization),
      }),
      before: args.existing,
      after: approved,
    })
  );

  return approved;
};

export async function submitLamAttendanceCorrection(
  input: SubmitLamAttendanceCorrectionInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamAttendanceCorrectionsWriteAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = submitLamAttendanceCorrectionInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    const scopeDenied = requireLamEmployeeMutationScope(
      context,
      validInput.employeeId
    );
    if (scopeDenied && !scopeDenied.ok) {
      return scopeDenied;
    }

    const enabledDenied = await requireLamAttendanceCorrectionsEnabledForCompany(
      context,
      companyId
    );
    if (enabledDenied && !enabledDenied.ok) {
      return enabledDenied;
    }

    const submittedAt = new Date();
    const correctionId = validInput.id ?? createLamRecordId();

    if (
      validInput.requestedClockInAt &&
      validInput.requestedClockOutAt &&
      validInput.requestedClockOutAt.getTime() <
        validInput.requestedClockInAt.getTime()
    ) {
      throw new Error(
        "requestedClockOutAt must be on or after requestedClockInAt"
      );
    }

    let targetId = "";

    await mutateLamRepository((draft) => {
      const attendanceRecord = draft.attendanceRecords.find(
        (entry) =>
          entry.id === validInput.attendanceRecordId &&
          entry.companyId === companyId
      );
      if (!attendanceRecord) {
        throw new Error(
          `Attendance record "${validInput.attendanceRecordId}" was not found`
        );
      }

      if (attendanceRecord.employeeId !== validInput.employeeId) {
        throw new Error(
          `Attendance record "${attendanceRecord.id}" does not belong to employee ${validInput.employeeId}`
        );
      }

      assertAttendanceExceptionExists(
        attendanceRecord,
        validInput.exceptionType,
        buildCorrectionDetectionPolicy(validInput)
      );
      assertPendingCorrectionAllowed(draft, {
        attendanceRecordId: validInput.attendanceRecordId,
        exceptionType: validInput.exceptionType,
        correctionId,
      });

      let correction = lamAttendanceCorrectionSchema.parse({
        id: correctionId,
        companyId,
        employeeId: validInput.employeeId,
        attendanceRecordId: validInput.attendanceRecordId,
        exceptionType: validInput.exceptionType,
        requestedStatus: validInput.requestedStatus,
        requestedClockInAt: validInput.requestedClockInAt ?? null,
        requestedClockOutAt: validInput.requestedClockOutAt ?? null,
        reason: validInput.reason.trim(),
        status: "submitted",
        approvalRouteId: null,
        currentStepOrder: null,
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null,
        submittedAt,
        createdAt: submittedAt,
        updatedAt: submittedAt,
      });

      correction = applyApprovalRouteToCorrection({
        correction,
        routes: draft.leaveApprovalRoutes,
        companyId,
        routingScope: buildCorrectionRoutingScope(validInput),
      });

      draft.attendanceCorrections = upsertLamEntity(
        draft.attendanceCorrections,
        correction
      );
      targetId = correction.id;

      const detectionPolicy = buildCorrectionDetectionPolicy(validInput);
      const detectedException = detectAttendanceExceptionsFromRecord(
        attendanceRecord,
        detectionPolicy
      ).find((entry) => entry.exceptionType === validInput.exceptionType);

      if (detectedException) {
        draft.auditEvents.push(
          createLamMutationAuditEvent({
            companyId,
            actorId: normalizeLamMutationActorId(context),
            action:
              leaveAttendanceManagementAuditEvents.attendanceExceptionDetected,
            entityType: "attendance_record",
            entityId: attendanceRecord.id,
            summary: `Attendance exception ${validInput.exceptionType} linked to correction request`,
            metadata: buildLamAuditMetadata({
              employeeId: attendanceRecord.employeeId,
              exceptionType: validInput.exceptionType,
              correctionId: correction.id,
              exceptionId: detectedException.id,
            }),
            before: attendanceRecord,
            after: attendanceRecord,
          })
        );
      }

      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action:
            leaveAttendanceManagementAuditEvents.attendanceCorrectionSubmitted,
          entityType: "attendance_correction",
          entityId: correction.id,
          summary: `Attendance correction submitted for employee ${correction.employeeId}`,
          metadata: buildLamAuditMetadata({
            employeeId: correction.employeeId,
            attendanceRecordId: correction.attendanceRecordId,
            exceptionType: correction.exceptionType,
            requestedStatus: correction.requestedStatus,
            approvalRouteId: correction.approvalRouteId,
            status: correction.status,
          }),
          before: null,
          after: correction,
        })
      );
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}

export async function approveLamAttendanceCorrection(
  input: ApproveLamAttendanceCorrectionInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireStrictLamCorrectionApprovalAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = approveLamAttendanceCorrectionInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    const enabledDenied = await requireLamAttendanceCorrectionsEnabledForCompany(
      context,
      companyId
    );
    if (enabledDenied && !enabledDenied.ok) {
      return enabledDenied;
    }
    const decidedAt = new Date();
    const approverId =
      validInput.approvedBy?.trim() || normalizeLamMutationActorId(context);

    let targetId = "";

    await mutateLamRepository((draft) => {
      const existing = draft.attendanceCorrections.find(
        (entry) =>
          entry.id === validInput.correctionId && entry.companyId === companyId
      );
      if (!existing) {
        throw new Error(
          `Attendance correction "${validInput.correctionId}" was not found`
        );
      }

      const scopeDenied = requireLamEmployeeMutationScope(
        context,
        existing.employeeId
      );
      if (scopeDenied && !scopeDenied.ok) {
        throw new Error(scopeDenied.error);
      }

      assertDecisionStatus(existing);
      const authorization = assertDecisionActorForWorkflowStep({
        draft,
        existing,
        context,
        approvedBy: validInput.approvedBy,
      });

      const approved = applyApproveDecision({
        draft,
        companyId,
        context,
        existing,
        validInput,
        approverId,
        decidedAt,
        authorization,
      });
      targetId = approved.id;
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}

export async function rejectLamAttendanceCorrection(
  input: RejectLamAttendanceCorrectionInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireStrictLamCorrectionApprovalAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = rejectLamAttendanceCorrectionInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    const enabledDenied = await requireLamAttendanceCorrectionsEnabledForCompany(
      context,
      companyId
    );
    if (enabledDenied && !enabledDenied.ok) {
      return enabledDenied;
    }
    const decidedAt = new Date();

    let targetId = "";

    await mutateLamRepository((draft) => {
      const existing = draft.attendanceCorrections.find(
        (entry) =>
          entry.id === validInput.correctionId && entry.companyId === companyId
      );
      if (!existing) {
        throw new Error(
          `Attendance correction "${validInput.correctionId}" was not found`
        );
      }

      const scopeDenied = requireLamEmployeeMutationScope(
        context,
        existing.employeeId
      );
      if (scopeDenied && !scopeDenied.ok) {
        throw new Error(scopeDenied.error);
      }

      assertDecisionStatus(existing);
      const authorization = assertDecisionActorForWorkflowStep({
        draft,
        existing,
        context,
        approvedBy: validInput.approvedBy,
      });

      const rejected = lamAttendanceCorrectionSchema.parse({
        ...existing,
        status: "rejected",
        rejectionReason: validInput.rejectionReason.trim(),
        updatedAt: decidedAt,
      });

      draft.attendanceCorrections = upsertLamEntity(
        draft.attendanceCorrections,
        rejected
      );
      targetId = rejected.id;

      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action:
            leaveAttendanceManagementAuditEvents.attendanceCorrectionRejected,
          entityType: "attendance_correction",
          entityId: rejected.id,
          summary: `Attendance correction rejected for employee ${existing.employeeId}`,
          metadata: buildLamAuditMetadata({
            employeeId: existing.employeeId,
            attendanceRecordId: existing.attendanceRecordId,
            exceptionType: existing.exceptionType,
            rejectionReason: rejected.rejectionReason,
            ...buildApprovalAuthorizationAuditMetadata(authorization),
          }),
          before: existing,
          after: rejected,
        })
      );
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}
