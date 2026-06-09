import { z } from "zod";
import { compliancePolicyDecisionSchema } from "../schema.ts";
import { complianceRegulatoryTrackingAuditEventSchema } from "./audit.contract.ts";
import { complianceRegulatoryTrackingCapabilitySchema } from "./capability.contract.ts";

const actionStringSchema = z.string().trim().min(1);

export const complianceRegulatoryTrackingActionRiskSchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);

export const complianceRegulatoryTrackingActionSchema = z.object({
  id: actionStringSchema,
  label: actionStringSchema,
  description: actionStringSchema,
  capability: complianceRegulatoryTrackingCapabilitySchema,
  risk: complianceRegulatoryTrackingActionRiskSchema,
  approvalRequired: z.boolean().optional(),
  auditEvent: complianceRegulatoryTrackingAuditEventSchema,
});

export const complianceRegulatoryTrackingActionCatalogSchema = z
  .array(complianceRegulatoryTrackingActionSchema)
  .min(1);

export const complianceRegulatoryTrackingActionDecisionReasonSchema = z.enum([
  "granted",
  "approval_required",
  "invalid_context",
  "missing_capability",
  "sensitive_access_required",
]);

export const complianceRegulatoryTrackingActionApprovalStateSchema = z.object({
  approvedBy: z.string().trim().min(1).optional(),
  decision: compliancePolicyDecisionSchema.optional(),
});

export const complianceRegulatoryTrackingActionDecisionSchema = z.object({
  actionId: actionStringSchema,
  allowed: z.boolean(),
  requiresApproval: z.boolean(),
  approvalSatisfied: z.boolean(),
  sensitiveAccessRequired: z.boolean(),
  sensitiveAccessGranted: z.boolean(),
  missingCapabilities: z.array(complianceRegulatoryTrackingCapabilitySchema),
  reasons: z.array(complianceRegulatoryTrackingActionDecisionReasonSchema),
});

export type ComplianceRegulatoryTrackingActionRisk = z.infer<
  typeof complianceRegulatoryTrackingActionRiskSchema
>;
export type ComplianceRegulatoryTrackingAction = z.infer<
  typeof complianceRegulatoryTrackingActionSchema
>;
export type ComplianceRegulatoryTrackingActionId =
  ComplianceRegulatoryTrackingAction["id"];
export type ComplianceRegulatoryTrackingActionDecisionReason = z.infer<
  typeof complianceRegulatoryTrackingActionDecisionReasonSchema
>;
export type ComplianceRegulatoryTrackingActionApprovalState = z.infer<
  typeof complianceRegulatoryTrackingActionApprovalStateSchema
>;
export type ComplianceRegulatoryTrackingActionDecision = z.infer<
  typeof complianceRegulatoryTrackingActionDecisionSchema
>;
