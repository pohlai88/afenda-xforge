import { z } from "zod";

export const offboardingTrimmedStringSchema = z.string().trim().min(1);

export const offboardingOptionalTrimmedStringSchema =
  offboardingTrimmedStringSchema.optional();

export const offboardingOptionalNullableTrimmedStringSchema =
  offboardingTrimmedStringSchema.nullish();

export const offboardingDateSchema = z.coerce.date();

export const offboardingOptionalDateSchema = offboardingDateSchema.nullish();

export const offboardingPositiveIntSchema = z.number().int().positive();

export const offboardingOptionalPositiveIntSchema =
  offboardingPositiveIntSchema.optional();

export const offboardingCaseStatusValues = [
  "draft",
  "pending_approval",
  "active",
  "on_hold",
  "completed",
  "cancelled",
] as const;

export const offboardingCaseStatusSchema = z.enum(offboardingCaseStatusValues);

export const offboardingExitTypeValues = [
  "resignation",
  "termination",
  "retirement",
  "contract_end",
  "redundancy",
  "death",
  "mutual_separation",
] as const;

export const offboardingExitTypeSchema = z.enum(offboardingExitTypeValues);

export const offboardingTaskOwnerRoleValues = [
  "hr",
  "manager",
  "employee",
  "it",
  "finance",
  "payroll",
  "admin",
  "asset_owner",
] as const;

export const offboardingTaskOwnerRoleSchema = z.enum(
  offboardingTaskOwnerRoleValues
);

export const offboardingTaskStatusValues = [
  "pending",
  "in_progress",
  "completed",
  "blocked",
  "waived",
] as const;

export const offboardingTaskStatusSchema = z.enum(offboardingTaskStatusValues);

export const offboardingApprovalRoleValues = [
  "manager",
  "hr",
  "legal",
  "management",
] as const;

export const offboardingApprovalRoleSchema = z.enum(
  offboardingApprovalRoleValues
);

export const offboardingApprovalStatusValues = [
  "pending",
  "approved",
  "rejected",
  "waived",
] as const;

export const offboardingApprovalStatusSchema = z.enum(
  offboardingApprovalStatusValues
);

export const offboardingInterviewStatusValues = [
  "not_scheduled",
  "scheduled",
  "completed",
  "waived",
] as const;

export const offboardingInterviewStatusSchema = z.enum(
  offboardingInterviewStatusValues
);

export const offboardingClearanceKindValues = [
  "leave",
  "attendance",
  "claims",
  "advance",
  "loan",
  "deduction",
  "asset",
  "access",
  "document",
  "settlement",
  "other",
] as const;

export const offboardingClearanceKindSchema = z.enum(
  offboardingClearanceKindValues
);

export const offboardingClearanceStatusValues = [
  "pending",
  "blocked",
  "cleared",
  "waived",
] as const;

export const offboardingClearanceStatusSchema = z.enum(
  offboardingClearanceStatusValues
);

export const offboardingAssetRecoveryStatusValues = [
  "outstanding",
  "returned",
  "damaged",
  "missing",
  "waived",
  "deducted",
] as const;

export const offboardingAssetRecoveryStatusSchema = z.enum(
  offboardingAssetRecoveryStatusValues
);

export const offboardingAccessRevocationStatusValues = [
  "pending",
  "scheduled",
  "revoked",
  "waived",
] as const;

export const offboardingAccessRevocationStatusSchema = z.enum(
  offboardingAccessRevocationStatusValues
);

export const offboardingRehireEligibilityValues = [
  "eligible",
  "ineligible",
  "conditional",
] as const;

export const offboardingRehireEligibilitySchema = z.enum(
  offboardingRehireEligibilityValues
);

export const offboardingAuditActionValues = [
  "hr.offboarding.case.start",
  "hr.offboarding.case.update",
  "hr.offboarding.case.complete",
  "hr.offboarding.case.cancel",
  "hr.offboarding.clearance.complete",
  "hr.offboarding.clearance.waive",
  "hr.offboarding.approval.approve",
  "hr.offboarding.approval.reject",
  "hr.offboarding.asset.update",
  "hr.offboarding.exit_interview.schedule",
  "hr.offboarding.exit_interview.feedback",
  "hr.offboarding.rehire.record",
  "hr.offboarding.vacancy.trigger",
  "hr.offboarding.document.link",
  "hr.offboarding.settlement.blocker_add",
  "hr.offboarding.settlement.blocker_resolve",
  "hr.offboarding.settlement.ready",
] as const;

export const offboardingAuditActionSchema = z.enum(
  offboardingAuditActionValues
);

export const offboardingLifecycleTriggerSnapshotSchema = z.object({
  sourceFeatureId: z.literal(
    "hr-suite.employee-management.employee-lifecycle-management"
  ),
  sourceLifecycleEventId: offboardingTrimmedStringSchema,
  exitType: offboardingExitTypeSchema,
  effectiveSeparationDate: offboardingOptionalDateSchema,
  lastWorkingDate: offboardingOptionalDateSchema,
  noticeStartDate: offboardingOptionalDateSchema,
  noticeEndDate: offboardingOptionalDateSchema,
  triggeredAt: offboardingDateSchema,
});

export const offboardingCaseRecordSchema = z.object({
  id: offboardingTrimmedStringSchema,
  caseNumber: offboardingTrimmedStringSchema,
  caseTitle: offboardingTrimmedStringSchema,
  employeeId: offboardingTrimmedStringSchema,
  tenantId: offboardingTrimmedStringSchema,
  companyId: offboardingTrimmedStringSchema,
  status: offboardingCaseStatusSchema,
  exitType: offboardingExitTypeSchema,
  lifecycleTrigger: offboardingLifecycleTriggerSnapshotSchema,
  effectiveSeparationDate: offboardingOptionalDateSchema,
  lastWorkingDate: offboardingOptionalDateSchema,
  noticeStartDate: offboardingOptionalDateSchema,
  noticeEndDate: offboardingOptionalDateSchema,
  coordinatorActorId: offboardingOptionalTrimmedStringSchema,
  requestedByActorId: offboardingOptionalTrimmedStringSchema,
  reasonSummary: offboardingOptionalTrimmedStringSchema,
  rehireEligibility: offboardingRehireEligibilitySchema.optional(),
  createdAt: offboardingDateSchema,
  updatedAt: offboardingDateSchema,
});

export const offboardingTaskRecordSchema = z.object({
  id: offboardingTrimmedStringSchema,
  caseId: offboardingTrimmedStringSchema,
  title: offboardingTrimmedStringSchema,
  ownerRole: offboardingTaskOwnerRoleSchema,
  assigneeActorId: offboardingOptionalTrimmedStringSchema,
  status: offboardingTaskStatusSchema,
  dueAt: offboardingOptionalDateSchema,
  blockedReason: offboardingOptionalTrimmedStringSchema,
  evidenceDocumentId: offboardingOptionalTrimmedStringSchema,
  completedAt: offboardingOptionalDateSchema,
});

export const offboardingApprovalRecordSchema = z.object({
  id: offboardingTrimmedStringSchema,
  caseId: offboardingTrimmedStringSchema,
  role: offboardingApprovalRoleSchema,
  status: offboardingApprovalStatusSchema,
  requestedAt: offboardingDateSchema,
  decidedAt: offboardingOptionalDateSchema,
  decidedByActorId: offboardingOptionalTrimmedStringSchema,
  decisionNotes: offboardingOptionalTrimmedStringSchema,
});

export const offboardingChecklistRecordSchema = z.object({
  caseId: offboardingTrimmedStringSchema,
  tasks: z.array(offboardingTaskRecordSchema),
  approvals: z.array(offboardingApprovalRecordSchema),
});

export const offboardingExitInterviewRecordSchema = z.object({
  id: offboardingTrimmedStringSchema,
  caseId: offboardingTrimmedStringSchema,
  status: offboardingInterviewStatusSchema,
  scheduledAt: offboardingOptionalDateSchema,
  completedAt: offboardingOptionalDateSchema,
  interviewerActorId: offboardingOptionalTrimmedStringSchema,
  questionnaireTemplateId: offboardingOptionalTrimmedStringSchema,
  feedbackSummary: offboardingOptionalTrimmedStringSchema,
  sensitiveNotes: offboardingOptionalTrimmedStringSchema,
});

export const offboardingClearanceItemRecordSchema = z.object({
  id: offboardingTrimmedStringSchema,
  caseId: offboardingTrimmedStringSchema,
  kind: offboardingClearanceKindSchema,
  status: offboardingClearanceStatusSchema,
  sourceReferenceId: offboardingOptionalTrimmedStringSchema,
  blockerReason: offboardingOptionalTrimmedStringSchema,
  resolvedAt: offboardingOptionalDateSchema,
});

export const offboardingAssetReferenceRecordSchema = z.object({
  id: offboardingTrimmedStringSchema,
  caseId: offboardingTrimmedStringSchema,
  sourceAssetId: offboardingTrimmedStringSchema,
  assetLabel: offboardingTrimmedStringSchema,
  status: offboardingAssetRecoveryStatusSchema,
  notes: offboardingOptionalTrimmedStringSchema,
});

export const offboardingAccessReferenceRecordSchema = z.object({
  id: offboardingTrimmedStringSchema,
  caseId: offboardingTrimmedStringSchema,
  sourceAccessId: offboardingTrimmedStringSchema,
  accessLabel: offboardingTrimmedStringSchema,
  status: offboardingAccessRevocationStatusSchema,
  notes: offboardingOptionalTrimmedStringSchema,
});

export const offboardingAuditEventRecordSchema = z.object({
  id: offboardingTrimmedStringSchema,
  caseId: offboardingTrimmedStringSchema,
  action: offboardingAuditActionSchema,
  actorId: offboardingOptionalTrimmedStringSchema,
  summary: offboardingOptionalTrimmedStringSchema,
  recordedAt: offboardingDateSchema,
});

export const offboardingReadContextSchema = z.object({
  tenantId: offboardingOptionalTrimmedStringSchema,
  companyId: offboardingOptionalTrimmedStringSchema,
  actorId: offboardingOptionalTrimmedStringSchema,
  requestId: offboardingOptionalTrimmedStringSchema,
  canRead: z.boolean().optional(),
  grantedPermissions: z.array(offboardingTrimmedStringSchema).optional(),
  grantedCapabilities: z.array(offboardingTrimmedStringSchema).optional(),
  sensitiveReadGranted: z.boolean().optional(),
});

export const offboardingWriteContextSchema =
  offboardingReadContextSchema.extend({
    canWrite: z.boolean().optional(),
  });
