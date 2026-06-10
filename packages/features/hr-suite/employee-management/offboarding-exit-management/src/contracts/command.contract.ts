import { z } from "zod";
import {
  offboardingAccessRevocationStatusSchema,
  offboardingApprovalRoleSchema,
  offboardingApprovalStatusSchema,
  offboardingAssetRecoveryStatusSchema,
  offboardingAuditActionSchema,
  offboardingCaseStatusSchema,
  offboardingClearanceKindSchema,
  offboardingClearanceStatusSchema,
  offboardingExitTypeSchema,
  offboardingInterviewStatusSchema,
  offboardingLifecycleTriggerSnapshotSchema,
  offboardingOptionalDateSchema,
  offboardingOptionalTrimmedStringSchema,
  offboardingRehireEligibilitySchema,
  offboardingTaskOwnerRoleSchema,
  offboardingTaskStatusSchema,
  offboardingTrimmedStringSchema,
} from "../schema.ts";

export const openOffboardingCaseInputSchema = z.object({
  caseTitle: offboardingTrimmedStringSchema,
  employeeId: offboardingTrimmedStringSchema,
  lifecycleTrigger: offboardingLifecycleTriggerSnapshotSchema,
  exitType: offboardingExitTypeSchema.optional(),
  coordinatorActorId: offboardingOptionalTrimmedStringSchema,
  requestedByActorId: offboardingOptionalTrimmedStringSchema,
  reasonSummary: offboardingOptionalTrimmedStringSchema,
});

export const updateOffboardingCaseInputSchema = z.object({
  id: offboardingTrimmedStringSchema,
  caseTitle: offboardingOptionalTrimmedStringSchema,
  status: offboardingCaseStatusSchema.optional(),
  coordinatorActorId: offboardingOptionalTrimmedStringSchema,
  reasonSummary: offboardingOptionalTrimmedStringSchema,
  rehireEligibility: offboardingRehireEligibilitySchema.optional(),
});

export const recordOffboardingTaskInputSchema = z.object({
  caseId: offboardingTrimmedStringSchema,
  title: offboardingTrimmedStringSchema,
  ownerRole: offboardingTaskOwnerRoleSchema,
  assigneeActorId: offboardingOptionalTrimmedStringSchema,
  status: offboardingTaskStatusSchema.optional(),
  dueAt: offboardingOptionalDateSchema,
});

export const recordOffboardingApprovalInputSchema = z.object({
  caseId: offboardingTrimmedStringSchema,
  role: offboardingApprovalRoleSchema,
  status: offboardingApprovalStatusSchema,
  decisionNotes: offboardingOptionalTrimmedStringSchema,
});

export const recordOffboardingExitInterviewInputSchema = z.object({
  caseId: offboardingTrimmedStringSchema,
  status: offboardingInterviewStatusSchema,
  interviewerActorId: offboardingOptionalTrimmedStringSchema,
  scheduledAt: offboardingOptionalDateSchema,
  completedAt: offboardingOptionalDateSchema,
  feedbackSummary: offboardingOptionalTrimmedStringSchema,
  sensitiveNotes: offboardingOptionalTrimmedStringSchema,
});

export const recordOffboardingClearanceItemInputSchema = z.object({
  caseId: offboardingTrimmedStringSchema,
  kind: offboardingClearanceKindSchema,
  status: offboardingClearanceStatusSchema,
  sourceReferenceId: offboardingOptionalTrimmedStringSchema,
  blockerReason: offboardingOptionalTrimmedStringSchema,
});

export const recordOffboardingAssetReferenceInputSchema = z.object({
  caseId: offboardingTrimmedStringSchema,
  sourceAssetId: offboardingTrimmedStringSchema,
  assetLabel: offboardingTrimmedStringSchema,
  status: offboardingAssetRecoveryStatusSchema,
  notes: offboardingOptionalTrimmedStringSchema,
});

export const recordOffboardingAccessReferenceInputSchema = z.object({
  caseId: offboardingTrimmedStringSchema,
  sourceAccessId: offboardingTrimmedStringSchema,
  accessLabel: offboardingTrimmedStringSchema,
  status: offboardingAccessRevocationStatusSchema,
  notes: offboardingOptionalTrimmedStringSchema,
});

export const recordOffboardingAuditEventInputSchema = z.object({
  caseId: offboardingTrimmedStringSchema,
  action: offboardingAuditActionSchema,
  actorId: offboardingOptionalTrimmedStringSchema,
  summary: offboardingOptionalTrimmedStringSchema,
});

export type OpenOffboardingCaseInput = z.infer<
  typeof openOffboardingCaseInputSchema
>;
export type UpdateOffboardingCaseInput = z.infer<
  typeof updateOffboardingCaseInputSchema
>;
export type RecordOffboardingTaskInput = z.infer<
  typeof recordOffboardingTaskInputSchema
>;
export type RecordOffboardingApprovalInput = z.infer<
  typeof recordOffboardingApprovalInputSchema
>;
export type RecordOffboardingExitInterviewInput = z.infer<
  typeof recordOffboardingExitInterviewInputSchema
>;
export type RecordOffboardingClearanceItemInput = z.infer<
  typeof recordOffboardingClearanceItemInputSchema
>;
export type RecordOffboardingAssetReferenceInput = z.infer<
  typeof recordOffboardingAssetReferenceInputSchema
>;
export type RecordOffboardingAccessReferenceInput = z.infer<
  typeof recordOffboardingAccessReferenceInputSchema
>;
export type RecordOffboardingAuditEventInput = z.infer<
  typeof recordOffboardingAuditEventInputSchema
>;
