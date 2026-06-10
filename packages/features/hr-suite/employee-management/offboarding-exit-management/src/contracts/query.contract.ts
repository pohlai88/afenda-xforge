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
  offboardingOptionalPositiveIntSchema,
  offboardingOptionalTrimmedStringSchema,
  offboardingTaskOwnerRoleSchema,
  offboardingTaskStatusSchema,
} from "../schema.ts";

export const listOffboardingCasesQuerySchema = z.object({
  page: offboardingOptionalPositiveIntSchema,
  pageSize: offboardingOptionalPositiveIntSchema,
  search: offboardingOptionalTrimmedStringSchema,
  employeeId: offboardingOptionalTrimmedStringSchema,
  status: offboardingCaseStatusSchema.optional(),
  exitType: offboardingExitTypeSchema.optional(),
});

export const listOffboardingTasksQuerySchema = z.object({
  caseId: offboardingOptionalTrimmedStringSchema,
  search: offboardingOptionalTrimmedStringSchema,
  ownerRole: offboardingTaskOwnerRoleSchema.optional(),
  status: offboardingTaskStatusSchema.optional(),
});

export const listOffboardingApprovalsQuerySchema = z.object({
  caseId: offboardingOptionalTrimmedStringSchema,
  role: offboardingApprovalRoleSchema.optional(),
  status: offboardingApprovalStatusSchema.optional(),
});

export const listOffboardingExitInterviewsQuerySchema = z.object({
  caseId: offboardingOptionalTrimmedStringSchema,
  status: offboardingInterviewStatusSchema.optional(),
});

export const listOffboardingClearanceItemsQuerySchema = z.object({
  caseId: offboardingOptionalTrimmedStringSchema,
  kind: offboardingClearanceKindSchema.optional(),
  status: offboardingClearanceStatusSchema.optional(),
});

export const listOffboardingAssetReferencesQuerySchema = z.object({
  caseId: offboardingOptionalTrimmedStringSchema,
  status: offboardingAssetRecoveryStatusSchema.optional(),
});

export const listOffboardingAccessReferencesQuerySchema = z.object({
  caseId: offboardingOptionalTrimmedStringSchema,
  status: offboardingAccessRevocationStatusSchema.optional(),
});

export const listOffboardingAuditQuerySchema = z.object({
  caseId: offboardingOptionalTrimmedStringSchema,
  action: offboardingAuditActionSchema.optional(),
  actorId: offboardingOptionalTrimmedStringSchema,
  search: offboardingOptionalTrimmedStringSchema,
  page: offboardingOptionalPositiveIntSchema,
  pageSize: offboardingOptionalPositiveIntSchema,
});

export type ListOffboardingCasesQuery = z.infer<
  typeof listOffboardingCasesQuerySchema
>;
export type ListOffboardingTasksQuery = z.infer<
  typeof listOffboardingTasksQuerySchema
>;
export type ListOffboardingApprovalsQuery = z.infer<
  typeof listOffboardingApprovalsQuerySchema
>;
export type ListOffboardingExitInterviewsQuery = z.infer<
  typeof listOffboardingExitInterviewsQuerySchema
>;
export type ListOffboardingClearanceItemsQuery = z.infer<
  typeof listOffboardingClearanceItemsQuerySchema
>;
export type ListOffboardingAssetReferencesQuery = z.infer<
  typeof listOffboardingAssetReferencesQuerySchema
>;
export type ListOffboardingAccessReferencesQuery = z.infer<
  typeof listOffboardingAccessReferencesQuerySchema
>;
export type ListOffboardingAuditQuery = z.infer<
  typeof listOffboardingAuditQuerySchema
>;
