import { z } from "zod";
import {
  offboardingApprovalBlockerStatusSchema,
  offboardingApprovalRouteTargetTypeSchema,
  offboardingApprovalStatusSchema,
  offboardingAuditEventSchema,
  offboardingCaseStatusSchema,
  offboardingExitTypeSchema,
  offboardingInitiationSourceSchema,
  offboardingIsoDateSchema,
  offboardingNoticeStatusSchema,
  offboardingRiskLevelSchema,
  optionalTrimmedStringSchema,
  trimmedStringSchema,
} from "../schema.ts";
import type { OffboardingExitManagementBoundedContext } from "./bounded-context.contract.ts";
import type { OffboardingExitManagementPermissionSet } from "./permission.contract.ts";
import type { OffboardingExitManagementRouteContractSet } from "./route.contract.ts";

export const offboardingCaseProjectionSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  tenantId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  lifecycleExitReference: optionalTrimmedStringSchema,
  exitType: offboardingExitTypeSchema,
  status: offboardingCaseStatusSchema,
  reason: z.string().trim().min(1).nullable(),
  reasonDetails: z.string().trim().nullable().optional(),
  effectiveSeparationDate: offboardingIsoDateSchema,
  noticeStartDate: offboardingIsoDateSchema.nullish(),
  noticeEndDate: offboardingIsoDateSchema.nullish(),
  actualNoticeDays: z.number().int().positive().nullable(),
  requiredNoticeDays: z.number().int().positive().nullable(),
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
  noticeStatus: offboardingNoticeStatusSchema,
  noticeShortfallDays: z.number().int().nonnegative().nullable(),
  createdAt: offboardingIsoDateSchema,
  updatedAt: offboardingIsoDateSchema,
});

export const offboardingApprovalProjectionSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  tenantId: optionalTrimmedStringSchema,
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
  blocking: z.boolean(),
  actionable: z.boolean(),
  createdAt: offboardingIsoDateSchema,
  updatedAt: offboardingIsoDateSchema,
});

export const offboardingApprovalBlockerProjectionSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  tenantId: optionalTrimmedStringSchema,
  caseId: trimmedStringSchema,
  employeeId: trimmedStringSchema,
  blockingStatus: offboardingApprovalBlockerStatusSchema,
  requiredApprovalCount: z.number().int().nonnegative(),
  approvedRequiredCount: z.number().int().nonnegative(),
  pendingRequiredCount: z.number().int().nonnegative(),
  rejectedRequiredCount: z.number().int().nonnegative(),
  blockingApprovalCount: z.number().int().nonnegative(),
  blockers: z.array(
    z.object({
      approvalId: trimmedStringSchema,
      stepCode: trimmedStringSchema,
      stepLabel: trimmedStringSchema,
      sequence: z.number().int().positive(),
      status: offboardingApprovalStatusSchema,
      routeToId: trimmedStringSchema,
      routeToLabel: z.string().trim().nullable().optional(),
      required: z.boolean(),
    })
  ),
  lastActionAt: offboardingIsoDateSchema.nullable(),
});

export const offboardingFoundationSnapshotSchema = z.object({
  generatedAt: offboardingIsoDateSchema,
  featureId: z.string().trim().min(1),
  title: z.string().trim().min(1),
  packageName: z.string().trim().min(1),
  caseCount: z.number().int().nonnegative(),
  approvalCount: z.number().int().nonnegative(),
  auditEventCount: z.number().int().nonnegative(),
  lastAuditAt: offboardingIsoDateSchema.nullable(),
  boundedContext: z.custom<OffboardingExitManagementBoundedContext>(),
  capabilities: z.array(z.string().trim().min(1)),
  capabilityGroups: z.array(
    z.object({
      id: z.string().trim().min(1),
      label: z.string().trim().min(1),
      capabilities: z.array(z.string().trim().min(1)).min(1),
    })
  ),
  permissions: z.custom<OffboardingExitManagementPermissionSet>(),
  routeContracts: z.custom<OffboardingExitManagementRouteContractSet>(),
  requirementCoverage: z.array(z.string().trim().min(1)),
  acceptanceCoverage: z.array(z.string().trim().min(1)),
});

export const offboardingAuditTrailProjectionSchema =
  offboardingAuditEventSchema;

export type OffboardingCaseProjection = z.infer<
  typeof offboardingCaseProjectionSchema
>;
export type OffboardingApprovalProjection = z.infer<
  typeof offboardingApprovalProjectionSchema
>;
export type OffboardingApprovalBlockerProjection = z.infer<
  typeof offboardingApprovalBlockerProjectionSchema
>;
export type OffboardingFoundationSnapshot = z.infer<
  typeof offboardingFoundationSnapshotSchema
>;
export type OffboardingAuditTrailProjection = z.infer<
  typeof offboardingAuditTrailProjectionSchema
>;
