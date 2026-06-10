import "server-only";

import type {
  ApproveOffboardingApprovalStepInput,
  EscalateOffboardingApprovalStepInput,
  OffboardingApprovalStepRecord,
  OffboardingCaseRecord,
  OffboardingMutationResult,
  OpenOffboardingCaseInput,
  RecordOffboardingAuditEventInput,
  RejectOffboardingApprovalStepInput,
  ReopenOffboardingApprovalStepInput,
  SubmitOffboardingApprovalStepInput,
  UpdateOffboardingCaseInput,
  UpsertOffboardingApprovalStepInput,
} from "./contracts/index.ts";
import {
  approveOffboardingApprovalStepInputSchema,
  escalateOffboardingApprovalStepInputSchema,
  recordOffboardingAuditEventInputSchema,
  rejectOffboardingApprovalStepInputSchema,
  reopenOffboardingApprovalStepInputSchema,
  submitOffboardingApprovalStepInputSchema,
  upsertOffboardingApprovalStepInputSchema,
} from "./contracts/index.ts";
import {
  createOffboardingAuditEvent,
  normalizeOffboardingMutationActorId,
  requireOffboardingMutationAccess,
} from "./execution/index.ts";
import type { HrSuiteFeatureContext } from "./feature-scope.ts";
import { offboardingExitManagementAuditEvents } from "./registry/index.ts";
import {
  createOffboardingRepositoryId,
  mutateOffboardingRepository,
} from "./repository.ts";
import {
  offboardingApprovalStepSchema,
  offboardingCaseSchema,
  openOffboardingCaseInputSchema,
  updateOffboardingCaseInputSchema,
} from "./schema.ts";

const resolveCompanyId = (
  inputCompanyId: string | null | undefined,
  context?: HrSuiteFeatureContext
): string | null => context?.companyId ?? inputCompanyId ?? null;

const resolveActorId = (
  preferredActorId: string | null | undefined,
  context?: HrSuiteFeatureContext
): string =>
  preferredActorId?.trim() || normalizeOffboardingMutationActorId(context);

const requireTenantId = (context?: HrSuiteFeatureContext): string => {
  const tenantId = context?.tenantId?.trim();

  if (!tenantId) {
    throw new Error("tenantId is required for offboarding persistence");
  }

  return tenantId;
};

const buildOpenedCaseRecord = (
  input: OpenOffboardingCaseInput,
  context?: HrSuiteFeatureContext
): OffboardingCaseRecord =>
  offboardingCaseSchema.parse({
    id: createOffboardingRepositoryId(),
    companyId: resolveCompanyId(input.companyId, context),
    tenantId: requireTenantId(context),
    employeeId: input.employeeId,
    lifecycleExitReference: input.lifecycleExitReference ?? null,
    exitType: input.exitType,
    status: "open",
    reason: input.reason,
    reasonDetails: input.reasonDetails ?? null,
    effectiveSeparationDate: input.effectiveSeparationDate,
    noticeStartDate: input.noticeStartDate ?? null,
    noticeEndDate: input.noticeEndDate ?? null,
    requiredNoticeDays: input.requiredNoticeDays ?? null,
    waivedNotice: input.waivedNotice ?? false,
    waivedNoticeReason: input.waivedNoticeReason ?? null,
    lastWorkingDate: input.lastWorkingDate ?? null,
    initiatedBy:
      input.initiatedBy ?? normalizeOffboardingMutationActorId(context),
    initiationSource: input.initiationSource ?? "hr",
    legalEntityCode: input.legalEntityCode ?? null,
    departmentId: input.departmentId ?? null,
    managerEmployeeId: input.managerEmployeeId ?? null,
    workLocationCode: input.workLocationCode ?? null,
    policyReference: input.policyReference ?? null,
    riskLevel: input.riskLevel ?? "medium",
    legalReviewRequired: input.legalReviewRequired ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const buildUpdatedCaseRecord = (
  currentRecord: OffboardingCaseRecord,
  input: UpdateOffboardingCaseInput
): OffboardingCaseRecord =>
  offboardingCaseSchema.parse({
    ...currentRecord,
    lifecycleExitReference:
      input.lifecycleExitReference ?? currentRecord.lifecycleExitReference,
    status: input.status ?? currentRecord.status,
    reason: input.reason ?? currentRecord.reason,
    reasonDetails:
      input.reasonDetails === undefined
        ? currentRecord.reasonDetails
        : input.reasonDetails,
    effectiveSeparationDate:
      input.effectiveSeparationDate ?? currentRecord.effectiveSeparationDate,
    noticeStartDate:
      input.noticeStartDate === undefined
        ? currentRecord.noticeStartDate
        : input.noticeStartDate,
    noticeEndDate:
      input.noticeEndDate === undefined
        ? currentRecord.noticeEndDate
        : input.noticeEndDate,
    requiredNoticeDays:
      input.requiredNoticeDays === undefined
        ? currentRecord.requiredNoticeDays
        : input.requiredNoticeDays,
    waivedNotice: input.waivedNotice ?? currentRecord.waivedNotice,
    waivedNoticeReason:
      input.waivedNoticeReason === undefined
        ? currentRecord.waivedNoticeReason
        : input.waivedNoticeReason,
    lastWorkingDate:
      input.lastWorkingDate === undefined
        ? currentRecord.lastWorkingDate
        : input.lastWorkingDate,
    legalEntityCode:
      input.legalEntityCode === undefined
        ? currentRecord.legalEntityCode
        : input.legalEntityCode,
    departmentId:
      input.departmentId === undefined
        ? currentRecord.departmentId
        : input.departmentId,
    managerEmployeeId:
      input.managerEmployeeId === undefined
        ? currentRecord.managerEmployeeId
        : input.managerEmployeeId,
    workLocationCode:
      input.workLocationCode === undefined
        ? currentRecord.workLocationCode
        : input.workLocationCode,
    policyReference:
      input.policyReference === undefined
        ? currentRecord.policyReference
        : input.policyReference,
    riskLevel: input.riskLevel ?? currentRecord.riskLevel,
    legalReviewRequired:
      input.legalReviewRequired ?? currentRecord.legalReviewRequired,
    updatedAt: new Date(),
  });

const keepCurrentOr = <T>(nextValue: T | undefined, currentValue: T): T =>
  nextValue === undefined ? currentValue : nextValue;

const buildPersistedApprovalState = (
  currentRecord?: OffboardingApprovalStepRecord
) => ({
  approvedAt: currentRecord?.approvedAt ?? null,
  approvedBy: currentRecord?.approvedBy ?? null,
  createdAt: currentRecord?.createdAt ?? new Date(),
  decisionNotes: currentRecord?.decisionNotes ?? null,
  escalatedAt: currentRecord?.escalatedAt ?? null,
  escalatedBy: currentRecord?.escalatedBy ?? null,
  escalationReason: currentRecord?.escalationReason ?? null,
  rejectedAt: currentRecord?.rejectedAt ?? null,
  rejectedBy: currentRecord?.rejectedBy ?? null,
  rejectionReason: currentRecord?.rejectionReason ?? null,
  reopenedAt: currentRecord?.reopenedAt ?? null,
  reopenedBy: currentRecord?.reopenedBy ?? null,
  reopenedReason: currentRecord?.reopenedReason ?? null,
  submittedAt: currentRecord?.submittedAt ?? null,
  submittedBy: currentRecord?.submittedBy ?? null,
});

const buildApprovalStepRecord = (args: {
  currentRecord?: OffboardingApprovalStepRecord;
  caseRecord: OffboardingCaseRecord;
  input: UpsertOffboardingApprovalStepInput;
  context?: HrSuiteFeatureContext;
}): OffboardingApprovalStepRecord => {
  const now = new Date();
  const currentRecord = args.currentRecord;
  const persistedState = buildPersistedApprovalState(currentRecord);

  return offboardingApprovalStepSchema.parse({
    ...persistedState,
    id:
      currentRecord?.id ??
      args.input.approvalId ??
      createOffboardingRepositoryId(),
    companyId: resolveCompanyId(args.input.companyId, args.context),
    tenantId: requireTenantId(args.context),
    caseId: args.caseRecord.id,
    employeeId: args.caseRecord.employeeId,
    exitType: args.caseRecord.exitType,
    legalEntityCode:
      currentRecord?.legalEntityCode ?? args.caseRecord.legalEntityCode ?? null,
    departmentId:
      currentRecord?.departmentId ?? args.caseRecord.departmentId ?? null,
    riskLevel: currentRecord?.riskLevel ?? args.caseRecord.riskLevel,
    legalReviewRequired:
      currentRecord?.legalReviewRequired ?? args.caseRecord.legalReviewRequired,
    stepCode: args.input.stepCode,
    stepLabel: args.input.stepLabel,
    sequence: args.input.sequence,
    required: args.input.required ?? currentRecord?.required ?? true,
    status: currentRecord?.status ?? "draft",
    routeToType: args.input.routeToType ?? currentRecord?.routeToType ?? "role",
    routeToId: args.input.routeToId,
    routeToLabel: keepCurrentOr(
      args.input.routeToLabel,
      currentRecord?.routeToLabel ?? null
    ),
    escalationTargetType: keepCurrentOr(
      args.input.escalationTargetType,
      currentRecord?.escalationTargetType ?? null
    ),
    escalationTargetId: keepCurrentOr(
      args.input.escalationTargetId,
      currentRecord?.escalationTargetId ?? null
    ),
    escalationTargetLabel: keepCurrentOr(
      args.input.escalationTargetLabel,
      currentRecord?.escalationTargetLabel ?? null
    ),
    updatedAt: now,
  });
};

const buildApprovalSubmittedRecord = (args: {
  currentRecord: OffboardingApprovalStepRecord;
  input: SubmitOffboardingApprovalStepInput;
  context?: HrSuiteFeatureContext;
}): OffboardingApprovalStepRecord =>
  offboardingApprovalStepSchema.parse({
    ...args.currentRecord,
    status: "pending",
    submittedAt: args.currentRecord.submittedAt ?? new Date(),
    submittedBy:
      args.currentRecord.submittedBy ??
      normalizeOffboardingMutationActorId(args.context),
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    decisionNotes: args.input.decisionNotes ?? null,
    updatedAt: new Date(),
  });

const buildApprovalApprovedRecord = (args: {
  currentRecord: OffboardingApprovalStepRecord;
  input: ApproveOffboardingApprovalStepInput;
  context?: HrSuiteFeatureContext;
}): OffboardingApprovalStepRecord =>
  offboardingApprovalStepSchema.parse({
    ...args.currentRecord,
    status: "approved",
    submittedAt: args.currentRecord.submittedAt ?? new Date(),
    submittedBy:
      args.currentRecord.submittedBy ??
      normalizeOffboardingMutationActorId(args.context),
    approvedAt: new Date(),
    approvedBy: resolveActorId(args.input.approvedBy, args.context),
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    decisionNotes: args.input.decisionNotes ?? null,
    updatedAt: new Date(),
  });

const buildApprovalRejectedRecord = (args: {
  currentRecord: OffboardingApprovalStepRecord;
  input: RejectOffboardingApprovalStepInput;
  context?: HrSuiteFeatureContext;
}): OffboardingApprovalStepRecord =>
  offboardingApprovalStepSchema.parse({
    ...args.currentRecord,
    status: "rejected",
    submittedAt: args.currentRecord.submittedAt ?? new Date(),
    submittedBy:
      args.currentRecord.submittedBy ??
      normalizeOffboardingMutationActorId(args.context),
    approvedAt: null,
    approvedBy: null,
    rejectedAt: new Date(),
    rejectedBy: resolveActorId(args.input.rejectedBy, args.context),
    rejectionReason: args.input.rejectionReason,
    decisionNotes: args.input.decisionNotes ?? null,
    updatedAt: new Date(),
  });

const buildApprovalReopenedRecord = (args: {
  currentRecord: OffboardingApprovalStepRecord;
  input: ReopenOffboardingApprovalStepInput;
  context?: HrSuiteFeatureContext;
}): OffboardingApprovalStepRecord =>
  offboardingApprovalStepSchema.parse({
    ...args.currentRecord,
    status: "draft",
    submittedAt: null,
    submittedBy: null,
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    decisionNotes: null,
    reopenedAt: new Date(),
    reopenedBy: resolveActorId(args.input.reopenedBy, args.context),
    reopenedReason: args.input.reopenedReason,
    updatedAt: new Date(),
  });

const buildApprovalEscalatedRecord = (args: {
  currentRecord: OffboardingApprovalStepRecord;
  input: EscalateOffboardingApprovalStepInput;
  context?: HrSuiteFeatureContext;
}): OffboardingApprovalStepRecord =>
  offboardingApprovalStepSchema.parse({
    ...args.currentRecord,
    escalationTargetType:
      args.input.escalationTargetType === undefined
        ? (args.currentRecord.escalationTargetType ??
          args.currentRecord.routeToType)
        : args.input.escalationTargetType,
    escalationTargetId:
      args.input.escalationTargetId === undefined
        ? (args.currentRecord.escalationTargetId ??
          args.currentRecord.routeToId)
        : args.input.escalationTargetId,
    escalationTargetLabel:
      args.input.escalationTargetLabel === undefined
        ? (args.currentRecord.escalationTargetLabel ??
          args.currentRecord.routeToLabel ??
          null)
        : args.input.escalationTargetLabel,
    escalatedAt: new Date(),
    escalatedBy: resolveActorId(args.input.escalatedBy, args.context),
    escalationReason: args.input.escalationReason,
    updatedAt: new Date(),
  });

const scopeFromContext = (
  context?: HrSuiteFeatureContext,
  companyId?: string | null
): { companyId?: string; tenantId?: string } => ({
  companyId: context?.companyId ?? companyId ?? undefined,
  tenantId: context?.tenantId,
});

const buildCaseAuditMetadata = (record: OffboardingCaseRecord) => ({
  employeeId: record.employeeId,
  exitType: record.exitType,
  effectiveSeparationDate: record.effectiveSeparationDate.toISOString(),
  lifecycleExitReference: record.lifecycleExitReference,
});

const buildApprovalAuditMetadata = (record: OffboardingApprovalStepRecord) => ({
  caseId: record.caseId,
  employeeId: record.employeeId,
  stepCode: record.stepCode,
  stepLabel: record.stepLabel,
  sequence: record.sequence,
  status: record.status,
  routeToType: record.routeToType,
  routeToId: record.routeToId,
  escalationTargetType: record.escalationTargetType,
  escalationTargetId: record.escalationTargetId,
});

const withApprovalRecordMutation = async (
  approvalId: string,
  context: HrSuiteFeatureContext | undefined,
  onFound: (
    draft: {
      cases: OffboardingCaseRecord[];
      approvals: OffboardingApprovalStepRecord[];
      auditEvents: ReturnType<typeof createOffboardingAuditEvent>[];
    },
    currentRecord: OffboardingApprovalStepRecord,
    index: number
  ) => void
): Promise<OffboardingMutationResult> => {
  let mutationResult: OffboardingMutationResult = {
    code: "not_found",
    ok: false,
    error: `Offboarding approval ${approvalId} was not found.`,
    targetId: approvalId,
  };
  let mutationError: string | null = null;

  await mutateOffboardingRepository((draft) => {
    const index = draft.approvals.findIndex(
      (record) => record.id === approvalId
    );
    if (index < 0) {
      return;
    }

    const currentRecord = draft.approvals[index];
    try {
      onFound(draft, currentRecord, index);
    } catch (error) {
      mutationError =
        error instanceof Error ? error.message : "Approval mutation failed.";
      return;
    }

    mutationResult = {
      ok: true,
      targetId: approvalId,
    };
  }, scopeFromContext(context));

  return mutationError
    ? {
        ok: false,
        error: mutationError,
        targetId: approvalId,
      }
    : mutationResult;
};

export async function recordOffboardingAuditEvent(
  input: RecordOffboardingAuditEventInput,
  context?: HrSuiteFeatureContext
): Promise<OffboardingMutationResult> {
  const denied = requireOffboardingMutationAccess(context);
  if (denied) {
    return denied;
  }

  const parsed = recordOffboardingAuditEventInputSchema.parse(input);
  const auditEvent = createOffboardingAuditEvent(parsed, context);

  await mutateOffboardingRepository((draft) => {
    draft.auditEvents.push(auditEvent);
  }, scopeFromContext(context));

  return {
    ok: true,
    targetId: auditEvent.id,
  };
}

export async function openOffboardingCase(
  input: OpenOffboardingCaseInput,
  context?: HrSuiteFeatureContext
): Promise<OffboardingMutationResult> {
  const denied = requireOffboardingMutationAccess(context);
  if (denied) {
    return denied;
  }

  const parsed = openOffboardingCaseInputSchema.parse(input);
  const nextRecord = buildOpenedCaseRecord(parsed, context);
  let mutationResult: OffboardingMutationResult = {
    ok: true,
    targetId: nextRecord.id,
  };

  await mutateOffboardingRepository(
    (draft) => {
      const duplicateCase = draft.cases.find(
        (record) =>
          record.employeeId === nextRecord.employeeId &&
          record.status === "open"
      );

      if (duplicateCase) {
        mutationResult = {
          code: "conflict",
          ok: false,
          error: `Employee ${nextRecord.employeeId} already has an open offboarding case.`,
          targetId: duplicateCase.id,
        };
        return;
      }

      draft.cases.push(nextRecord);
      draft.auditEvents.push(
        createOffboardingAuditEvent(
          {
            action: offboardingExitManagementAuditEvents.caseStarted,
            entityType: "case",
            entityId: nextRecord.id,
            summary: `Opened ${nextRecord.exitType} offboarding case for ${nextRecord.employeeId}`,
            reason: nextRecord.reason,
            metadata: buildCaseAuditMetadata(nextRecord),
            sensitive: true,
          },
          context
        )
      );
    },
    scopeFromContext(context, parsed.companyId)
  );

  return mutationResult;
}

export async function updateOffboardingCase(
  input: UpdateOffboardingCaseInput,
  context?: HrSuiteFeatureContext
): Promise<OffboardingMutationResult> {
  const denied = requireOffboardingMutationAccess(context);
  if (denied) {
    return denied;
  }

  const parsed = updateOffboardingCaseInputSchema.parse(input);
  let mutationResult: OffboardingMutationResult = {
    code: "not_found",
    ok: false,
    error: `Offboarding case ${parsed.caseId} was not found.`,
    targetId: parsed.caseId,
  };

  await mutateOffboardingRepository((draft) => {
    const index = draft.cases.findIndex(
      (record) => record.id === parsed.caseId
    );
    if (index < 0) {
      return;
    }

    const currentRecord = draft.cases[index];
    const nextRecord = buildUpdatedCaseRecord(currentRecord, parsed);
    draft.cases[index] = nextRecord;

    draft.approvals = draft.approvals.map((approval) =>
      approval.caseId === nextRecord.id
        ? offboardingApprovalStepSchema.parse({
            ...approval,
            exitType: nextRecord.exitType,
            employeeId: nextRecord.employeeId,
            legalEntityCode: nextRecord.legalEntityCode,
            departmentId: nextRecord.departmentId,
            riskLevel: nextRecord.riskLevel,
            legalReviewRequired: nextRecord.legalReviewRequired,
            updatedAt: new Date(),
          })
        : approval
    );

    draft.auditEvents.push(
      createOffboardingAuditEvent(
        {
          action: offboardingExitManagementAuditEvents.caseUpdated,
          entityType: "case",
          entityId: nextRecord.id,
          summary: `Updated offboarding case ${nextRecord.id}`,
          reason: parsed.reason ?? null,
          metadata: buildCaseAuditMetadata(nextRecord),
          sensitive: true,
        },
        context
      )
    );

    mutationResult = {
      ok: true,
      targetId: nextRecord.id,
    };
  }, scopeFromContext(context));

  return mutationResult;
}

export async function upsertOffboardingApprovalStep(
  input: UpsertOffboardingApprovalStepInput,
  context?: HrSuiteFeatureContext
): Promise<OffboardingMutationResult> {
  const denied = requireOffboardingMutationAccess(context);
  if (denied) {
    return denied;
  }

  const parsed = upsertOffboardingApprovalStepInputSchema.parse(input);
  let mutationResult: OffboardingMutationResult = {
    code: "not_found",
    ok: false,
    error: `Offboarding case ${parsed.caseId} was not found.`,
    targetId: parsed.approvalId ?? parsed.caseId,
  };

  await mutateOffboardingRepository(
    (draft) => {
      const caseRecord = draft.cases.find(
        (record) => record.id === parsed.caseId
      );
      if (!caseRecord) {
        return;
      }

      const existingIndex = parsed.approvalId
        ? draft.approvals.findIndex((record) => record.id === parsed.approvalId)
        : draft.approvals.findIndex(
            (record) =>
              record.caseId === parsed.caseId &&
              record.stepCode === parsed.stepCode &&
              record.sequence === parsed.sequence
          );
      const currentRecord =
        existingIndex >= 0 ? draft.approvals[existingIndex] : undefined;

      const nextRecord = buildApprovalStepRecord({
        currentRecord,
        caseRecord,
        input: parsed,
        context,
      });

      if (
        draft.approvals.some(
          (record) =>
            record.id !== nextRecord.id &&
            record.caseId === nextRecord.caseId &&
            record.stepCode === nextRecord.stepCode &&
            record.sequence === nextRecord.sequence
        )
      ) {
        mutationResult = {
          code: "conflict",
          ok: false,
          error: `Approval step ${nextRecord.stepCode} sequence ${nextRecord.sequence} already exists for case ${nextRecord.caseId}.`,
          targetId: nextRecord.id,
        };
        return;
      }

      if (existingIndex >= 0) {
        draft.approvals[existingIndex] = nextRecord;
      } else {
        draft.approvals.push(nextRecord);
      }

      draft.auditEvents.push(
        createOffboardingAuditEvent(
          {
            action: offboardingExitManagementAuditEvents.approvalConfigured,
            entityType: "approval",
            entityId: nextRecord.id,
            summary: `Configured offboarding approval ${nextRecord.stepCode} for case ${nextRecord.caseId}`,
            metadata: buildApprovalAuditMetadata(nextRecord),
            sensitive: false,
          },
          context
        )
      );

      mutationResult = {
        ok: true,
        targetId: nextRecord.id,
      };
    },
    scopeFromContext(context, parsed.companyId)
  );

  return mutationResult;
}

export async function submitOffboardingApprovalStep(
  input: SubmitOffboardingApprovalStepInput,
  context?: HrSuiteFeatureContext
): Promise<OffboardingMutationResult> {
  const denied = requireOffboardingMutationAccess(context);
  if (denied) {
    return denied;
  }

  const parsed = submitOffboardingApprovalStepInputSchema.parse(input);
  return await withApprovalRecordMutation(
    parsed.approvalId,
    context,
    (draft, currentRecord, index) => {
      if (currentRecord.status === "pending") {
        throw new Error(
          `Approval ${currentRecord.id} has already been submitted.`
        );
      }

      const nextRecord = buildApprovalSubmittedRecord({
        currentRecord,
        input: parsed,
        context,
      });
      draft.approvals[index] = nextRecord;
      draft.auditEvents.push(
        createOffboardingAuditEvent(
          {
            action:
              currentRecord.status === "rejected" || currentRecord.reopenedAt
                ? offboardingExitManagementAuditEvents.approvalResubmitted
                : offboardingExitManagementAuditEvents.approvalSubmitted,
            entityType: "approval",
            entityId: nextRecord.id,
            summary: `Submitted offboarding approval ${nextRecord.stepCode}`,
            metadata: buildApprovalAuditMetadata(nextRecord),
            sensitive: false,
          },
          context
        )
      );
    }
  );
}

export async function approveOffboardingApprovalStep(
  input: ApproveOffboardingApprovalStepInput,
  context?: HrSuiteFeatureContext
): Promise<OffboardingMutationResult> {
  const denied = requireOffboardingMutationAccess(context);
  if (denied) {
    return denied;
  }

  const parsed = approveOffboardingApprovalStepInputSchema.parse(input);
  return await withApprovalRecordMutation(
    parsed.approvalId,
    context,
    (draft, currentRecord, index) => {
      if (currentRecord.status !== "pending") {
        throw new Error(
          `Approval ${currentRecord.id} must be pending before approval.`
        );
      }

      const nextRecord = buildApprovalApprovedRecord({
        currentRecord,
        input: parsed,
        context,
      });
      draft.approvals[index] = nextRecord;
      draft.auditEvents.push(
        createOffboardingAuditEvent(
          {
            action: offboardingExitManagementAuditEvents.approvalApproved,
            entityType: "approval",
            entityId: nextRecord.id,
            summary: `Approved offboarding approval ${nextRecord.stepCode}`,
            metadata: buildApprovalAuditMetadata(nextRecord),
            sensitive: true,
          },
          context
        )
      );
    }
  );
}

export async function rejectOffboardingApprovalStep(
  input: RejectOffboardingApprovalStepInput,
  context?: HrSuiteFeatureContext
): Promise<OffboardingMutationResult> {
  const denied = requireOffboardingMutationAccess(context);
  if (denied) {
    return denied;
  }

  const parsed = rejectOffboardingApprovalStepInputSchema.parse(input);
  return await withApprovalRecordMutation(
    parsed.approvalId,
    context,
    (draft, currentRecord, index) => {
      if (currentRecord.status !== "pending") {
        throw new Error(
          `Approval ${currentRecord.id} must be pending before rejection.`
        );
      }

      const nextRecord = buildApprovalRejectedRecord({
        currentRecord,
        input: parsed,
        context,
      });
      draft.approvals[index] = nextRecord;
      draft.auditEvents.push(
        createOffboardingAuditEvent(
          {
            action: offboardingExitManagementAuditEvents.approvalRejected,
            entityType: "approval",
            entityId: nextRecord.id,
            summary: `Rejected offboarding approval ${nextRecord.stepCode}`,
            reason: parsed.rejectionReason,
            metadata: buildApprovalAuditMetadata(nextRecord),
            sensitive: true,
          },
          context
        )
      );
    }
  );
}

export async function reopenOffboardingApprovalStep(
  input: ReopenOffboardingApprovalStepInput,
  context?: HrSuiteFeatureContext
): Promise<OffboardingMutationResult> {
  const denied = requireOffboardingMutationAccess(context);
  if (denied) {
    return denied;
  }

  const parsed = reopenOffboardingApprovalStepInputSchema.parse(input);
  return await withApprovalRecordMutation(
    parsed.approvalId,
    context,
    (draft, currentRecord, index) => {
      if (currentRecord.status === "draft") {
        throw new Error(
          `Approval ${currentRecord.id} is already in draft status.`
        );
      }

      const nextRecord = buildApprovalReopenedRecord({
        currentRecord,
        input: parsed,
        context,
      });
      draft.approvals[index] = nextRecord;
      draft.auditEvents.push(
        createOffboardingAuditEvent(
          {
            action: offboardingExitManagementAuditEvents.approvalReopened,
            entityType: "approval",
            entityId: nextRecord.id,
            summary: `Reopened offboarding approval ${nextRecord.stepCode}`,
            reason: parsed.reopenedReason,
            metadata: buildApprovalAuditMetadata(nextRecord),
            sensitive: true,
          },
          context
        )
      );
    }
  );
}

export async function escalateOffboardingApprovalStep(
  input: EscalateOffboardingApprovalStepInput,
  context?: HrSuiteFeatureContext
): Promise<OffboardingMutationResult> {
  const denied = requireOffboardingMutationAccess(context);
  if (denied) {
    return denied;
  }

  const parsed = escalateOffboardingApprovalStepInputSchema.parse(input);
  return await withApprovalRecordMutation(
    parsed.approvalId,
    context,
    (draft, currentRecord, index) => {
      if (currentRecord.status === "approved") {
        throw new Error(
          `Approved approval ${currentRecord.id} cannot be escalated.`
        );
      }

      const nextRecord = buildApprovalEscalatedRecord({
        currentRecord,
        input: parsed,
        context,
      });
      draft.approvals[index] = nextRecord;
      draft.auditEvents.push(
        createOffboardingAuditEvent(
          {
            action: offboardingExitManagementAuditEvents.approvalEscalated,
            entityType: "approval",
            entityId: nextRecord.id,
            summary: `Escalated offboarding approval ${nextRecord.stepCode}`,
            reason: parsed.escalationReason,
            metadata: buildApprovalAuditMetadata(nextRecord),
            sensitive: true,
          },
          context
        )
      );
    }
  );
}
