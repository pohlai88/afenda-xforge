import { z } from "zod";

export const offboardingIsoDateSchema = z.preprocess((value: unknown) => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  }

  return value;
}, z.date());

export const trimmedStringSchema = z.string().trim().min(1);
export const optionalTrimmedStringSchema = z.string().trim().min(1).nullish();

export const offboardingRepositoryEntityTypeValues = [
  "foundation",
  "case",
  "approval",
  "checklist_task",
  "exit_interview",
  "handover",
  "asset_recovery",
  "access_revocation",
  "settlement_blocker",
  "document_reference",
  "closure",
  "audit_event",
] as const;

export const offboardingRepositoryEntityTypeSchema = z.enum(
  offboardingRepositoryEntityTypeValues
);

export const offboardingExitTypeValues = [
  "resignation",
  "termination",
  "retirement",
  "contract_expiry",
  "redundancy",
  "death",
  "mutual_separation",
] as const;

export const offboardingCaseStatusValues = [
  "open",
  "cancelled",
  "completed",
] as const;

export const offboardingApprovalStatusValues = [
  "draft",
  "pending",
  "approved",
  "rejected",
] as const;

export const offboardingApprovalRouteTargetTypeValues = [
  "role",
  "employee",
  "group",
] as const;

export const offboardingApprovalBlockerStatusValues = [
  "clear",
  "pending",
  "blocked",
] as const;

export const offboardingRiskLevelValues = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const offboardingInitiationSourceValues = [
  "employee",
  "manager",
  "hr",
  "system",
] as const;

export const offboardingNoticeStatusValues = [
  "unknown",
  "not_applicable",
  "waived",
  "compliant",
  "short_notice",
] as const;

export const offboardingExitTypeSchema = z.enum(offboardingExitTypeValues);
export const offboardingCaseStatusSchema = z.enum(offboardingCaseStatusValues);
export const offboardingRiskLevelSchema = z.enum(offboardingRiskLevelValues);
export const offboardingInitiationSourceSchema = z.enum(
  offboardingInitiationSourceValues
);
export const offboardingNoticeStatusSchema = z.enum(
  offboardingNoticeStatusValues
);
export const offboardingApprovalStatusSchema = z.enum(
  offboardingApprovalStatusValues
);
export const offboardingApprovalRouteTargetTypeSchema = z.enum(
  offboardingApprovalRouteTargetTypeValues
);
export const offboardingApprovalBlockerStatusSchema = z.enum(
  offboardingApprovalBlockerStatusValues
);

export const offboardingReadContextSchema = z.object({
  canRead: z.boolean().optional(),
  canViewSensitive: z.boolean().optional(),
  companyId: z.string().trim().min(1).optional(),
  tenantId: z.string().trim().min(1).optional(),
  grantedCapabilities: z.array(trimmedStringSchema).optional(),
});

export const offboardingWriteContextSchema = z.object({
  actorId: z.string().trim().min(1).optional(),
  canRead: z.boolean().optional(),
  canViewSensitive: z.boolean().optional(),
  canWrite: z.boolean().optional(),
  companyId: z.string().trim().min(1).optional(),
  requestId: z.string().trim().min(1).optional(),
  tenantId: z.string().trim().min(1).optional(),
  grantedCapabilities: z.array(trimmedStringSchema).optional(),
});

export const offboardingAuditEventSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  tenantId: trimmedStringSchema,
  actorId: optionalTrimmedStringSchema,
  action: trimmedStringSchema,
  entityType: offboardingRepositoryEntityTypeSchema,
  entityId: trimmedStringSchema,
  summary: z.string().trim().nullable().optional(),
  reason: z.string().trim().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()),
  sensitive: z.boolean(),
  createdAt: offboardingIsoDateSchema,
});

export const offboardingCaseSchema = z
  .object({
    id: trimmedStringSchema,
    companyId: optionalTrimmedStringSchema,
    tenantId: trimmedStringSchema,
    employeeId: trimmedStringSchema,
    lifecycleExitReference: optionalTrimmedStringSchema,
    exitType: offboardingExitTypeSchema,
    status: offboardingCaseStatusSchema,
    reason: trimmedStringSchema,
    reasonDetails: z.string().trim().nullable().optional(),
    effectiveSeparationDate: offboardingIsoDateSchema,
    noticeStartDate: offboardingIsoDateSchema.nullish(),
    noticeEndDate: offboardingIsoDateSchema.nullish(),
    requiredNoticeDays: z.number().int().positive().nullable().optional(),
    waivedNotice: z.boolean(),
    waivedNoticeReason: z.string().trim().nullable().optional(),
    lastWorkingDate: offboardingIsoDateSchema.nullish(),
    initiatedBy: optionalTrimmedStringSchema,
    initiationSource: offboardingInitiationSourceSchema,
    legalEntityCode: optionalTrimmedStringSchema,
    departmentId: optionalTrimmedStringSchema,
    managerEmployeeId: optionalTrimmedStringSchema,
    workLocationCode: optionalTrimmedStringSchema,
    policyReference: optionalTrimmedStringSchema,
    riskLevel: offboardingRiskLevelSchema,
    legalReviewRequired: z.boolean(),
    createdAt: offboardingIsoDateSchema,
    updatedAt: offboardingIsoDateSchema,
  })
  .superRefine((value, ctx) => {
    if (
      value.noticeStartDate &&
      value.noticeEndDate &&
      value.noticeEndDate.getTime() < value.noticeStartDate.getTime()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["noticeEndDate"],
        message: "noticeEndDate must be on or after noticeStartDate",
      });
    }

    if (
      value.lastWorkingDate &&
      value.lastWorkingDate.getTime() > value.effectiveSeparationDate.getTime()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lastWorkingDate"],
        message: "lastWorkingDate must be on or before effectiveSeparationDate",
      });
    }

    if (value.waivedNotice && !value.waivedNoticeReason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["waivedNoticeReason"],
        message: "waivedNoticeReason is required when notice is waived",
      });
    }
  });

export const offboardingApprovalStepSchema = z
  .object({
    id: trimmedStringSchema,
    companyId: optionalTrimmedStringSchema,
    tenantId: trimmedStringSchema,
    caseId: trimmedStringSchema,
    employeeId: trimmedStringSchema,
    exitType: offboardingExitTypeSchema,
    legalEntityCode: optionalTrimmedStringSchema,
    departmentId: optionalTrimmedStringSchema,
    riskLevel: offboardingRiskLevelSchema,
    legalReviewRequired: z.boolean(),
    stepCode: trimmedStringSchema,
    stepLabel: trimmedStringSchema,
    sequence: z.number().int().positive(),
    required: z.boolean(),
    status: offboardingApprovalStatusSchema,
    routeToType: offboardingApprovalRouteTargetTypeSchema,
    routeToId: trimmedStringSchema,
    routeToLabel: z.string().trim().nullable().optional(),
    escalationTargetType: offboardingApprovalRouteTargetTypeSchema
      .nullable()
      .optional(),
    escalationTargetId: z.string().trim().min(1).nullable().optional(),
    escalationTargetLabel: z.string().trim().nullable().optional(),
    submittedAt: offboardingIsoDateSchema.nullish(),
    submittedBy: z.string().trim().min(1).nullable().optional(),
    approvedAt: offboardingIsoDateSchema.nullish(),
    approvedBy: z.string().trim().min(1).nullable().optional(),
    rejectedAt: offboardingIsoDateSchema.nullish(),
    rejectedBy: z.string().trim().min(1).nullable().optional(),
    rejectionReason: z.string().trim().nullable().optional(),
    decisionNotes: z.string().trim().nullable().optional(),
    reopenedAt: offboardingIsoDateSchema.nullish(),
    reopenedBy: z.string().trim().min(1).nullable().optional(),
    reopenedReason: z.string().trim().nullable().optional(),
    escalatedAt: offboardingIsoDateSchema.nullish(),
    escalatedBy: z.string().trim().min(1).nullable().optional(),
    escalationReason: z.string().trim().nullable().optional(),
    createdAt: offboardingIsoDateSchema,
    updatedAt: offboardingIsoDateSchema,
  })
  .superRefine((value, ctx) => {
    if (
      (value.status === "pending" ||
        value.status === "approved" ||
        value.status === "rejected") &&
      !(value.submittedAt && value.submittedBy?.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["submittedAt"],
        message:
          "submittedAt and submittedBy are required once an approval is submitted",
      });
    }

    if (value.status === "approved") {
      if (!(value.approvedAt && value.approvedBy?.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["approvedAt"],
          message:
            "approvedAt and approvedBy are required when an approval is approved",
        });
      }

      if (value.rejectedAt || value.rejectedBy || value.rejectionReason) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rejectedAt"],
          message:
            "Rejected metadata must be cleared when an approval is approved",
        });
      }
    }

    if (
      value.status === "rejected" &&
      !(
        value.rejectedAt &&
        value.rejectedBy?.trim() &&
        value.rejectionReason?.trim()
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rejectionReason"],
        message:
          "rejectedAt, rejectedBy, and rejectionReason are required when an approval is rejected",
      });
    }

    if (value.status === "draft" && (value.approvedAt || value.approvedBy)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["approvedAt"],
        message: "Approved metadata is not allowed while status is draft",
      });
    }
  });

export const openOffboardingCaseInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  lifecycleExitReference: optionalTrimmedStringSchema,
  exitType: offboardingExitTypeSchema,
  reason: trimmedStringSchema,
  reasonDetails: z.string().trim().nullable().optional(),
  effectiveSeparationDate: offboardingIsoDateSchema,
  noticeStartDate: offboardingIsoDateSchema.nullish(),
  noticeEndDate: offboardingIsoDateSchema.nullish(),
  requiredNoticeDays: z.number().int().positive().nullable().optional(),
  waivedNotice: z.boolean().optional(),
  waivedNoticeReason: z.string().trim().nullable().optional(),
  lastWorkingDate: offboardingIsoDateSchema.nullish(),
  initiatedBy: optionalTrimmedStringSchema,
  initiationSource: offboardingInitiationSourceSchema.optional(),
  legalEntityCode: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
  managerEmployeeId: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  policyReference: optionalTrimmedStringSchema,
  riskLevel: offboardingRiskLevelSchema.optional(),
  legalReviewRequired: z.boolean().optional(),
});

export const updateOffboardingCaseInputSchema = z.object({
  caseId: trimmedStringSchema,
  lifecycleExitReference: optionalTrimmedStringSchema,
  status: offboardingCaseStatusSchema.optional(),
  reason: trimmedStringSchema.optional(),
  reasonDetails: z.string().trim().nullable().optional(),
  effectiveSeparationDate: offboardingIsoDateSchema.optional(),
  noticeStartDate: offboardingIsoDateSchema.nullish(),
  noticeEndDate: offboardingIsoDateSchema.nullish(),
  requiredNoticeDays: z.number().int().positive().nullable().optional(),
  waivedNotice: z.boolean().optional(),
  waivedNoticeReason: z.string().trim().nullable().optional(),
  lastWorkingDate: offboardingIsoDateSchema.nullish(),
  legalEntityCode: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
  managerEmployeeId: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  policyReference: optionalTrimmedStringSchema,
  riskLevel: offboardingRiskLevelSchema.optional(),
  legalReviewRequired: z.boolean().optional(),
});

export const listOffboardingCasesQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  search: z.string().trim().optional(),
  companyId: trimmedStringSchema.optional(),
  employeeId: trimmedStringSchema.optional(),
  exitType: offboardingExitTypeSchema.optional(),
  status: offboardingCaseStatusSchema.optional(),
  legalEntityCode: trimmedStringSchema.optional(),
  departmentId: trimmedStringSchema.optional(),
});

export const upsertOffboardingApprovalStepInputSchema = z.object({
  approvalId: trimmedStringSchema.optional(),
  companyId: optionalTrimmedStringSchema,
  caseId: trimmedStringSchema,
  stepCode: trimmedStringSchema,
  stepLabel: trimmedStringSchema,
  sequence: z.number().int().positive(),
  required: z.boolean().optional(),
  routeToType: offboardingApprovalRouteTargetTypeSchema.optional(),
  routeToId: trimmedStringSchema,
  routeToLabel: z.string().trim().nullable().optional(),
  escalationTargetType: offboardingApprovalRouteTargetTypeSchema
    .nullable()
    .optional(),
  escalationTargetId: z.string().trim().min(1).nullable().optional(),
  escalationTargetLabel: z.string().trim().nullable().optional(),
});

export const submitOffboardingApprovalStepInputSchema = z.object({
  approvalId: trimmedStringSchema,
  decisionNotes: z.string().trim().nullable().optional(),
});

export const approveOffboardingApprovalStepInputSchema = z.object({
  approvalId: trimmedStringSchema,
  approvedBy: trimmedStringSchema.optional(),
  decisionNotes: z.string().trim().nullable().optional(),
});

export const rejectOffboardingApprovalStepInputSchema = z.object({
  approvalId: trimmedStringSchema,
  rejectedBy: trimmedStringSchema.optional(),
  rejectionReason: trimmedStringSchema,
  decisionNotes: z.string().trim().nullable().optional(),
});

export const reopenOffboardingApprovalStepInputSchema = z.object({
  approvalId: trimmedStringSchema,
  reopenedBy: trimmedStringSchema.optional(),
  reopenedReason: trimmedStringSchema,
});

export const escalateOffboardingApprovalStepInputSchema = z.object({
  approvalId: trimmedStringSchema,
  escalatedBy: trimmedStringSchema.optional(),
  escalationReason: trimmedStringSchema,
  escalationTargetType: offboardingApprovalRouteTargetTypeSchema
    .nullable()
    .optional(),
  escalationTargetId: z.string().trim().min(1).nullable().optional(),
  escalationTargetLabel: z.string().trim().nullable().optional(),
});

export const listOffboardingApprovalStepsQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  search: z.string().trim().optional(),
  companyId: trimmedStringSchema.optional(),
  caseId: trimmedStringSchema.optional(),
  employeeId: trimmedStringSchema.optional(),
  exitType: offboardingExitTypeSchema.optional(),
  status: offboardingApprovalStatusSchema.optional(),
  required: z.boolean().optional(),
  routeToId: trimmedStringSchema.optional(),
});

export const listOffboardingApprovalBlockersQuerySchema = z.object({
  companyId: trimmedStringSchema.optional(),
  caseId: trimmedStringSchema.optional(),
  employeeId: trimmedStringSchema.optional(),
});

export const offboardingRepositoryStateSchema = z.object({
  cases: offboardingCaseSchema.array().default([]),
  approvals: offboardingApprovalStepSchema.array().default([]),
  auditEvents: offboardingAuditEventSchema.array().default([]),
});

export const offboardingCaseSensitiveFields = [
  "reason",
  "reasonDetails",
  "waivedNoticeReason",
] as const;

export const offboardingApprovalSensitiveFields = [
  "decisionNotes",
  "rejectionReason",
  "reopenedReason",
  "escalationReason",
] as const;

export type OffboardingRepositoryEntityType = z.infer<
  typeof offboardingRepositoryEntityTypeSchema
>;
export type OffboardingExitType = z.infer<typeof offboardingExitTypeSchema>;
export type OffboardingCaseStatus = z.infer<typeof offboardingCaseStatusSchema>;
export type OffboardingApprovalStatus = z.infer<
  typeof offboardingApprovalStatusSchema
>;
export type OffboardingApprovalRouteTargetType = z.infer<
  typeof offboardingApprovalRouteTargetTypeSchema
>;
export type OffboardingApprovalBlockerStatus = z.infer<
  typeof offboardingApprovalBlockerStatusSchema
>;
export type OffboardingRiskLevel = z.infer<typeof offboardingRiskLevelSchema>;
export type OffboardingInitiationSource = z.infer<
  typeof offboardingInitiationSourceSchema
>;
export type OffboardingNoticeStatus = z.infer<
  typeof offboardingNoticeStatusSchema
>;
export type OffboardingReadContext = z.infer<
  typeof offboardingReadContextSchema
>;
export type OffboardingWriteContext = z.infer<
  typeof offboardingWriteContextSchema
>;
export type OffboardingAuditEvent = z.infer<typeof offboardingAuditEventSchema>;
export type OffboardingCaseRecord = z.infer<typeof offboardingCaseSchema>;
export type OffboardingApprovalStepRecord = z.infer<
  typeof offboardingApprovalStepSchema
>;
export type OpenOffboardingCaseInput = z.infer<
  typeof openOffboardingCaseInputSchema
>;
export type UpdateOffboardingCaseInput = z.infer<
  typeof updateOffboardingCaseInputSchema
>;
export type UpsertOffboardingApprovalStepInput = z.infer<
  typeof upsertOffboardingApprovalStepInputSchema
>;
export type SubmitOffboardingApprovalStepInput = z.infer<
  typeof submitOffboardingApprovalStepInputSchema
>;
export type ApproveOffboardingApprovalStepInput = z.infer<
  typeof approveOffboardingApprovalStepInputSchema
>;
export type RejectOffboardingApprovalStepInput = z.infer<
  typeof rejectOffboardingApprovalStepInputSchema
>;
export type ReopenOffboardingApprovalStepInput = z.infer<
  typeof reopenOffboardingApprovalStepInputSchema
>;
export type EscalateOffboardingApprovalStepInput = z.infer<
  typeof escalateOffboardingApprovalStepInputSchema
>;
export type ListOffboardingCasesQuery = z.infer<
  typeof listOffboardingCasesQuerySchema
>;
export type ListOffboardingApprovalStepsQuery = z.infer<
  typeof listOffboardingApprovalStepsQuerySchema
>;
export type ListOffboardingApprovalBlockersQuery = z.infer<
  typeof listOffboardingApprovalBlockersQuerySchema
>;
export type OffboardingRepositoryState = z.infer<
  typeof offboardingRepositoryStateSchema
>;

const startOfUtcDay = (value: Date): number =>
  Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());

export const calculateOffboardingNoticeDays = (
  noticeStartDate?: Date | null,
  noticeEndDate?: Date | null
): number | null => {
  if (!(noticeStartDate && noticeEndDate)) {
    return null;
  }

  const diff =
    (startOfUtcDay(noticeEndDate) - startOfUtcDay(noticeStartDate)) /
    (24 * 60 * 60 * 1000);

  if (diff < 0) {
    return null;
  }

  return diff + 1;
};

export const resolveOffboardingNoticeStatus = (input: {
  exitType: OffboardingExitType;
  waivedNotice: boolean;
  requiredNoticeDays?: number | null;
  noticeStartDate?: Date | null;
  noticeEndDate?: Date | null;
}): {
  actualNoticeDays: number | null;
  noticeShortfallDays: number | null;
  noticeStatus: OffboardingNoticeStatus;
} => {
  if (input.exitType === "death") {
    return {
      actualNoticeDays: null,
      noticeShortfallDays: null,
      noticeStatus: "not_applicable",
    };
  }

  if (input.waivedNotice) {
    return {
      actualNoticeDays: calculateOffboardingNoticeDays(
        input.noticeStartDate,
        input.noticeEndDate
      ),
      noticeShortfallDays: null,
      noticeStatus: "waived",
    };
  }

  const actualNoticeDays = calculateOffboardingNoticeDays(
    input.noticeStartDate,
    input.noticeEndDate
  );

  if (
    input.requiredNoticeDays === undefined ||
    input.requiredNoticeDays === null ||
    actualNoticeDays === null
  ) {
    return {
      actualNoticeDays,
      noticeShortfallDays: null,
      noticeStatus: "unknown",
    };
  }

  if (actualNoticeDays >= input.requiredNoticeDays) {
    return {
      actualNoticeDays,
      noticeShortfallDays: 0,
      noticeStatus: "compliant",
    };
  }

  return {
    actualNoticeDays,
    noticeShortfallDays: input.requiredNoticeDays - actualNoticeDays,
    noticeStatus: "short_notice",
  };
};
