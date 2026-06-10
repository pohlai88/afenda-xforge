import type { z } from "zod";
import type {
  offboardingAccessReferenceRecordSchema,
  offboardingAccessRevocationStatusSchema,
  offboardingApprovalRecordSchema,
  offboardingApprovalRoleSchema,
  offboardingApprovalStatusSchema,
  offboardingAssetRecoveryStatusSchema,
  offboardingAssetReferenceRecordSchema,
  offboardingAuditActionSchema,
  offboardingAuditEventRecordSchema,
  offboardingCaseRecordSchema,
  offboardingCaseStatusSchema,
  offboardingChecklistRecordSchema,
  offboardingClearanceItemRecordSchema,
  offboardingClearanceKindSchema,
  offboardingClearanceStatusSchema,
  offboardingExitInterviewRecordSchema,
  offboardingExitTypeSchema,
  offboardingInterviewStatusSchema,
  offboardingLifecycleTriggerSnapshotSchema,
  offboardingReadContextSchema,
  offboardingRehireEligibilitySchema,
  offboardingTaskOwnerRoleSchema,
  offboardingTaskRecordSchema,
  offboardingTaskStatusSchema,
  offboardingWriteContextSchema,
} from "../schema.ts";

export type OffboardingCaseStatus = z.infer<typeof offboardingCaseStatusSchema>;
export type OffboardingExitType = z.infer<typeof offboardingExitTypeSchema>;
export type OffboardingTaskOwnerRole = z.infer<
  typeof offboardingTaskOwnerRoleSchema
>;
export type OffboardingTaskStatus = z.infer<typeof offboardingTaskStatusSchema>;
export type OffboardingApprovalRole = z.infer<
  typeof offboardingApprovalRoleSchema
>;
export type OffboardingApprovalStatus = z.infer<
  typeof offboardingApprovalStatusSchema
>;
export type OffboardingInterviewStatus = z.infer<
  typeof offboardingInterviewStatusSchema
>;
export type OffboardingClearanceKind = z.infer<
  typeof offboardingClearanceKindSchema
>;
export type OffboardingClearanceStatus = z.infer<
  typeof offboardingClearanceStatusSchema
>;
export type OffboardingAssetRecoveryStatus = z.infer<
  typeof offboardingAssetRecoveryStatusSchema
>;
export type OffboardingAccessRevocationStatus = z.infer<
  typeof offboardingAccessRevocationStatusSchema
>;
export type OffboardingRehireEligibility = z.infer<
  typeof offboardingRehireEligibilitySchema
>;
export type HrWorkforceOffboardingAuditAction = z.infer<
  typeof offboardingAuditActionSchema
>;
export type OffboardingLifecycleTriggerSnapshot = z.infer<
  typeof offboardingLifecycleTriggerSnapshotSchema
>;
export type OffboardingCaseRecord = z.infer<typeof offboardingCaseRecordSchema>;
export type OffboardingTaskRecord = z.infer<typeof offboardingTaskRecordSchema>;
export type OffboardingApprovalRecord = z.infer<
  typeof offboardingApprovalRecordSchema
>;
export type OffboardingChecklistRecord = z.infer<
  typeof offboardingChecklistRecordSchema
>;
export type OffboardingExitInterviewRecord = z.infer<
  typeof offboardingExitInterviewRecordSchema
>;
export type OffboardingClearanceItemRecord = z.infer<
  typeof offboardingClearanceItemRecordSchema
>;
export type OffboardingAssetReferenceRecord = z.infer<
  typeof offboardingAssetReferenceRecordSchema
>;
export type OffboardingAccessReferenceRecord = z.infer<
  typeof offboardingAccessReferenceRecordSchema
>;
export type OffboardingAuditEventRecord = z.infer<
  typeof offboardingAuditEventRecordSchema
>;
export type OffboardingReadContext = z.infer<
  typeof offboardingReadContextSchema
>;
export type OffboardingWriteContext = z.infer<
  typeof offboardingWriteContextSchema
>;
