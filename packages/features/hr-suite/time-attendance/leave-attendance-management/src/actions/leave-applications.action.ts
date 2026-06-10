import "server-only";

import type {
  LamMutationResult,
  SubmitLamLeaveApplicationInput,
} from "../contracts/index.ts";
import {
  leaveAttendanceManagementAuditEvents,
  submitLamLeaveApplicationInputSchema,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamEmployeeMutationScope,
  requireLamLeaveApplicationsWriteAccess,
} from "../execution.ts";
import {
  resolveCurrentApprovalStep,
  selectLeaveApprovalRoute,
} from "../projector/approval-routing.ts";
import { tracksMedicalLeaveReference } from "../projector/medical-leave-references.ts";
import { shouldReserveLeaveBalance } from "../projector/unpaid-leave-payroll-references.ts";
import type { LamRepositoryState } from "../repository.ts";
import {
  createLamRecordId,
  mutateLamRepository,
  upsertLamEntity,
} from "../repository.ts";
import type {
  LamLeaveApplication,
  LamLeaveBalance,
  LamLeaveDocument,
  LamLeaveType,
} from "../schema.ts";
import {
  lamLeaveApplicationSchema,
  lamLeaveBalanceSchema,
  lamLeaveDocumentSchema,
  lamWriteContextSchema,
} from "../schema.ts";
import { computeRemainingBalance } from "../shared/balance.ts";
import {
  assertLeaveApplicationAvailableBalance,
  findLeaveApplicationBalance,
} from "../shared/leave-application-balance.ts";
import { resolveSupportingDocument } from "../shared/leave-application-document.ts";
import { assertLeaveApplicationPolicyGates } from "../shared/leave-application-policy-validation.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave application submission failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error(
      "Company context is required for leave application mutations"
    );
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

const buildApprovalRoutingScope = (
  validInput: SubmitLamLeaveApplicationInput
): {
  countryCode?: string | null;
  legalEntityCode?: string | null;
  workLocationCode?: string | null;
  employmentType?: string | null;
  grade?: string | null;
  policyGroupId?: string | null;
  departmentId?: string | null;
} => ({
  countryCode: validInput.countryCode,
  legalEntityCode: validInput.legalEntityCode,
  workLocationCode: validInput.workLocationCode,
  employmentType: validInput.employmentType,
  grade: validInput.grade,
  policyGroupId: validInput.policyGroupId,
  departmentId: validInput.departmentId,
});

const applyApprovalRouteToApplication = (args: {
  application: LamLeaveApplication;
  routes: LamRepositoryState["leaveApprovalRoutes"];
  companyId: string;
  routingScope: ReturnType<typeof buildApprovalRoutingScope>;
}): LamLeaveApplication => {
  const route = selectLeaveApprovalRoute(args.routes, {
    companyId: args.companyId,
    leaveTypeId: args.application.leaveTypeId,
    totalDays: args.application.totalDays,
    scope: args.routingScope,
  });

  if (!route) {
    return args.application;
  }

  const firstStep = resolveCurrentApprovalStep(route, 1);
  if (!firstStep) {
    throw new Error(
      `Approval route "${route.code}" does not define step order 1`
    );
  }

  return lamLeaveApplicationSchema.parse({
    ...args.application,
    status: "pending_approval",
    approvalRouteId: route.id,
    currentStepOrder: 1,
    updatedAt: new Date(),
  });
};

const persistSupportingDocumentOnSubmit = (args: {
  draft: LamRepositoryState;
  companyId: string;
  context?: LamMutationContext;
  leaveType: LamLeaveType;
  supportingDocument: LamLeaveDocument;
  routedApplication: LamLeaveApplication;
  validInput: SubmitLamLeaveApplicationInput;
  submittedAt: Date;
}): void => {
  args.draft.leaveDocuments = upsertLamEntity(
    args.draft.leaveDocuments,
    lamLeaveDocumentSchema.parse({
      ...args.supportingDocument,
      leaveApplicationId: args.routedApplication.id,
      updatedAt: args.submittedAt,
    })
  );

  if (!tracksMedicalLeaveReference(args.leaveType)) {
    return;
  }

  args.draft.auditEvents.push(
    createLamMutationAuditEvent({
      companyId: args.companyId,
      actorId: normalizeLamMutationActorId(args.context),
      action:
        leaveAttendanceManagementAuditEvents.leaveMedicalCertificateLinked,
      entityType: "leave_document",
      entityId: args.supportingDocument.id,
      summary: `Medical leave reference linked for employee ${args.validInput.employeeId}`,
      metadata: buildLamAuditMetadata({
        employeeId: args.validInput.employeeId,
        leaveApplicationId: args.routedApplication.id,
        leaveTypeId: args.validInput.leaveTypeId,
        leaveTypeKind: args.leaveType.kind,
        documentKind: args.supportingDocument.documentKind,
        referenceNumber: args.supportingDocument.referenceNumber,
        panelClinicId: args.supportingDocument.panelClinicId,
        panelClinicName: args.supportingDocument.panelClinicName,
        hospitalizationAdmissionDate:
          args.supportingDocument.hospitalizationAdmissionDate?.toISOString(),
        hospitalizationDischargeDate:
          args.supportingDocument.hospitalizationDischargeDate?.toISOString(),
        sourceDocumentId: args.supportingDocument.sourceDocumentId,
      }),
      before: args.supportingDocument,
      after: {
        ...args.supportingDocument,
        leaveApplicationId: args.routedApplication.id,
      },
    })
  );
};

const persistPendingBalanceOnSubmit = (args: {
  draft: LamRepositoryState;
  companyId: string;
  context?: LamMutationContext;
  balance: LamLeaveBalance;
  validInput: SubmitLamLeaveApplicationInput;
  routedApplication: LamLeaveApplication;
  periodYear: number;
}): void => {
  const nextPending = args.balance.pending + args.validInput.totalDays;
  const nextBalance = lamLeaveBalanceSchema.parse({
    ...args.balance,
    pending: nextPending,
    remaining: computeRemainingBalance({
      openingBalance: args.balance.openingBalance,
      earned: args.balance.earned,
      used: args.balance.used,
      pending: nextPending,
      adjusted: args.balance.adjusted,
      forfeited: args.balance.forfeited,
      carriedForward: args.balance.carriedForward,
    }),
    updatedAt: new Date(),
  });
  args.draft.leaveBalances = upsertLamEntity(
    args.draft.leaveBalances,
    nextBalance
  );

  args.draft.auditEvents.push(
    createLamMutationAuditEvent({
      companyId: args.companyId,
      actorId: normalizeLamMutationActorId(args.context),
      action: leaveAttendanceManagementAuditEvents.leaveBalanceUpdated,
      entityType: "leave_balance",
      entityId: nextBalance.id,
      summary: `Leave balance pending updated for employee ${args.validInput.employeeId}`,
      metadata: buildLamAuditMetadata({
        employeeId: args.validInput.employeeId,
        leaveTypeId: args.validInput.leaveTypeId,
        periodYear: args.periodYear,
        pendingBefore: args.balance.pending,
        pendingAfter: nextPending,
        remainingAfter: nextBalance.remaining,
        leaveApplicationId: args.routedApplication.id,
      }),
      before: args.balance,
      after: nextBalance,
    })
  );
};

const persistLeaveApplicationRoutingAudit = (args: {
  draft: LamRepositoryState;
  companyId: string;
  context?: LamMutationContext;
  application: LamLeaveApplication;
  routedApplication: LamLeaveApplication;
  validInput: SubmitLamLeaveApplicationInput;
}): void => {
  if (
    args.routedApplication.status !== "pending_approval" ||
    !args.routedApplication.approvalRouteId
  ) {
    return;
  }

  const route = args.draft.leaveApprovalRoutes.find(
    (entry) => entry.id === args.routedApplication.approvalRouteId
  );
  const step = route
    ? resolveCurrentApprovalStep(
        route,
        args.routedApplication.currentStepOrder ?? 1
      )
    : null;

  args.draft.auditEvents.push(
    createLamMutationAuditEvent({
      companyId: args.companyId,
      actorId: normalizeLamMutationActorId(args.context),
      action: leaveAttendanceManagementAuditEvents.leaveApplicationRouted,
      entityType: "leave_application",
      entityId: args.routedApplication.id,
      summary: `Leave application routed to approval workflow "${route?.code ?? args.routedApplication.approvalRouteId}"`,
      metadata: buildLamAuditMetadata({
        employeeId: args.validInput.employeeId,
        leaveTypeId: args.validInput.leaveTypeId,
        approvalRouteId: args.routedApplication.approvalRouteId,
        approvalRouteCode: route?.code,
        currentStepOrder: args.routedApplication.currentStepOrder,
        stepKind: step?.kind,
        stepLabel: step?.label,
        grade: args.validInput.grade,
        departmentId: args.validInput.departmentId,
      }),
      before: args.application,
      after: args.routedApplication,
    })
  );
};

const validateLeaveApplicationSubmission = (
  draft: LamRepositoryState,
  args: {
    validInput: SubmitLamLeaveApplicationInput;
    companyId: string;
    submittedAt: Date;
  }
): {
  leaveType: LamLeaveType;
  supportingDocument?: LamLeaveDocument;
  balance?: LamLeaveBalance;
  existing?: LamLeaveApplication;
  periodYear: number;
  reservesBalance: boolean;
} => {
  const { validInput, companyId, submittedAt } = args;
  const periodYear = validInput.startDate.getFullYear();

  const leaveType = assertLeaveApplicationPolicyGates(draft, {
    companyId,
    employeeId: validInput.employeeId,
    leaveTypeId: validInput.leaveTypeId,
    startDate: validInput.startDate,
    endDate: validInput.endDate,
    totalDays: validInput.totalDays,
    hireDate: validInput.hireDate,
    gender: validInput.gender ?? null,
    countryCode: validInput.countryCode,
    legalEntityCode: validInput.legalEntityCode,
    workLocationCode: validInput.workLocationCode,
    employmentType: validInput.employmentType,
    grade: validInput.grade,
    policyGroupId: validInput.policyGroupId,
    departmentId: validInput.departmentId,
    excludeApplicationId: validInput.id,
    evaluatedAt: submittedAt,
  });

  const supportingDocument = resolveSupportingDocument(draft, {
    companyId,
    employeeId: validInput.employeeId,
    supportingDocumentId: validInput.supportingDocumentId,
    requiresDocument: leaveType.requiresDocument,
    leaveType,
  });

  const reservesBalance = shouldReserveLeaveBalance(leaveType);
  let balance: LamLeaveBalance | undefined;

  if (reservesBalance) {
    balance = findLeaveApplicationBalance({
      balances: draft.leaveBalances,
      companyId,
      application: {
        employeeId: validInput.employeeId,
        leaveTypeId: validInput.leaveTypeId,
        startDate: validInput.startDate,
      } as LamLeaveApplication,
    });

    assertLeaveApplicationAvailableBalance({
      balance,
      totalDays: validInput.totalDays,
      phase: "submit",
    });
  }

  const existing = validInput.id
    ? draft.leaveApplications.find(
        (entry) => entry.id === validInput.id && entry.companyId === companyId
      )
    : undefined;

  if (
    existing &&
    existing.status !== "draft" &&
    existing.status !== "returned"
  ) {
    throw new Error(
      `Leave application "${existing.id}" cannot be submitted from status "${existing.status}"`
    );
  }

  return {
    leaveType,
    supportingDocument,
    balance,
    existing,
    periodYear,
    reservesBalance,
  };
};

export async function submitLamLeaveApplication(
  input: SubmitLamLeaveApplicationInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamLeaveApplicationsWriteAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = submitLamLeaveApplicationInputSchema.parse(input);
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

    let targetId = "";

    await mutateLamRepository((draft) => {
      const submittedAt = new Date();
      const {
        leaveType,
        supportingDocument,
        balance,
        existing,
        periodYear: validatedPeriodYear,
        reservesBalance,
      } = validateLeaveApplicationSubmission(draft, {
        validInput,
        companyId,
        submittedAt,
      });

      const application = lamLeaveApplicationSchema.parse({
        id: validInput.id ?? createLamRecordId(),
        companyId,
        employeeId: validInput.employeeId,
        leaveTypeId: validInput.leaveTypeId,
        status: "submitted",
        startDate: validInput.startDate,
        endDate: validInput.endDate,
        totalDays: validInput.totalDays,
        reason: validInput.reason ?? null,
        supportingDocumentId: validInput.supportingDocumentId ?? null,
        approvalRouteId: null,
        currentStepOrder: null,
        approvedBy: null,
        rejectionReason: null,
        returnedAt: null,
        returnedReason: null,
        cancellationReason: null,
        submittedAt,
        approvedAt: null,
        cancelledAt: null,
        createdAt: existing?.createdAt ?? submittedAt,
        updatedAt: submittedAt,
      });

      const routedApplication = applyApprovalRouteToApplication({
        application,
        routes: draft.leaveApprovalRoutes,
        companyId,
        routingScope: buildApprovalRoutingScope(validInput),
      });

      draft.leaveApplications = upsertLamEntity(
        draft.leaveApplications,
        routedApplication
      );
      targetId = routedApplication.id;

      if (supportingDocument) {
        persistSupportingDocumentOnSubmit({
          draft,
          companyId,
          context,
          leaveType,
          supportingDocument,
          routedApplication,
          validInput,
          submittedAt,
        });
      }

      if (balance) {
        persistPendingBalanceOnSubmit({
          draft,
          companyId,
          context,
          balance,
          validInput,
          routedApplication,
          periodYear: validatedPeriodYear,
        });
      }

      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action:
            leaveAttendanceManagementAuditEvents.leaveApplicationSubmitted,
          entityType: "leave_application",
          entityId: routedApplication.id,
          summary: `Leave application submitted for employee ${validInput.employeeId}`,
          metadata: buildLamAuditMetadata({
            employeeId: validInput.employeeId,
            leaveTypeId: validInput.leaveTypeId,
            leaveTypeCode: leaveType.code,
            leaveTypeKind: leaveType.kind,
            isUnpaidLeave: !reservesBalance,
            periodYear: validatedPeriodYear,
            startDate: validInput.startDate.toISOString(),
            endDate: validInput.endDate.toISOString(),
            totalDays: validInput.totalDays,
            balanceId: balance?.id,
            remainingBefore: balance?.remaining,
            pendingAfter: balance
              ? balance.pending + validInput.totalDays
              : undefined,
            supportingDocumentId: validInput.supportingDocumentId,
            status: routedApplication.status,
            approvalRouteId: routedApplication.approvalRouteId,
            currentStepOrder: routedApplication.currentStepOrder,
          }),
          before: existing,
          after: routedApplication,
        })
      );

      persistLeaveApplicationRoutingAudit({
        draft,
        companyId,
        context,
        application,
        routedApplication,
        validInput,
      });
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}
