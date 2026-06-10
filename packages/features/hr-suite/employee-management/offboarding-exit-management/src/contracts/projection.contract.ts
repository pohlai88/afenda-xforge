import { z } from "zod";
import {
  offboardingAccessReferenceRecordSchema,
  offboardingApprovalRecordSchema,
  offboardingAssetReferenceRecordSchema,
  offboardingAuditEventRecordSchema,
  offboardingCaseRecordSchema,
  offboardingChecklistRecordSchema,
  offboardingClearanceItemRecordSchema,
  offboardingExitInterviewRecordSchema,
  offboardingTaskRecordSchema,
} from "../schema.ts";

export const offboardingCaseProjectionSchema = offboardingCaseRecordSchema;

export const offboardingTaskProjectionSchema = offboardingTaskRecordSchema;

export const offboardingApprovalProjectionSchema =
  offboardingApprovalRecordSchema;

export const offboardingChecklistProjectionSchema =
  offboardingChecklistRecordSchema;

export const offboardingExitInterviewProjectionSchema =
  offboardingExitInterviewRecordSchema;

export const offboardingClearanceItemProjectionSchema =
  offboardingClearanceItemRecordSchema;

export const offboardingAssetReferenceProjectionSchema =
  offboardingAssetReferenceRecordSchema;

export const offboardingAccessReferenceProjectionSchema =
  offboardingAccessReferenceRecordSchema;

export const offboardingAuditEventProjectionSchema =
  offboardingAuditEventRecordSchema;

export const offboardingOverviewProjectionSchema = z.object({
  totalCases: z.number().int().nonnegative(),
  activeCases: z.number().int().nonnegative(),
  blockedCases: z.number().int().nonnegative(),
  completedCases: z.number().int().nonnegative(),
});

export type OffboardingCaseProjection = z.infer<
  typeof offboardingCaseProjectionSchema
>;
export type OffboardingTaskProjection = z.infer<
  typeof offboardingTaskProjectionSchema
>;
export type OffboardingApprovalProjection = z.infer<
  typeof offboardingApprovalProjectionSchema
>;
export type OffboardingChecklistProjection = z.infer<
  typeof offboardingChecklistProjectionSchema
>;
export type OffboardingExitInterviewProjection = z.infer<
  typeof offboardingExitInterviewProjectionSchema
>;
export type OffboardingClearanceItemProjection = z.infer<
  typeof offboardingClearanceItemProjectionSchema
>;
export type OffboardingAssetReferenceProjection = z.infer<
  typeof offboardingAssetReferenceProjectionSchema
>;
export type OffboardingAccessReferenceProjection = z.infer<
  typeof offboardingAccessReferenceProjectionSchema
>;
export type OffboardingAuditEventProjection = z.infer<
  typeof offboardingAuditEventProjectionSchema
>;
export type OffboardingOverviewProjection = z.infer<
  typeof offboardingOverviewProjectionSchema
>;
