import { z } from "zod";

const classificationStringSchema = z.string().trim().min(1);

export const complianceRegulatoryTrackingOwnershipSchema = z.object({
  businessOwner: classificationStringSchema,
  technicalOwner: classificationStringSchema,
  dataSteward: classificationStringSchema,
});

export const complianceRegulatoryTrackingStatusSchema = z.enum([
  "compliant",
  "pending",
  "at_risk",
  "overdue",
  "expired",
  "waived",
  "non_compliant",
]);

export const complianceRegulatoryTrackingStatusesSchema = z
  .array(complianceRegulatoryTrackingStatusSchema)
  .min(1);

export const complianceRegulatoryTrackingGovernanceSchema = z.object({
  auditTrail: z.boolean(),
  deterministicProjections: z.boolean(),
  effectiveDating: z.boolean(),
  exceptionManagement: z.boolean(),
  jurisdictionalApplicability: z.boolean(),
  sensitiveAccessControl: z.boolean(),
});

export const complianceRegulatoryTrackingDataClassificationSchema = z.object({
  confidentiality: z.enum(["internal", "confidential", "restricted"]),
  containsPii: z.boolean(),
  retentionRequired: z.boolean(),
});

export const complianceRegulatoryTrackingRiskClassificationSchema = z.object({
  dataSensitivity: z.enum(["low", "medium", "high", "critical"]),
  auditRequired: z.boolean(),
  approvalRequiredFor: z.array(classificationStringSchema).min(1),
});

export type ComplianceRegulatoryTrackingOwnership = z.infer<
  typeof complianceRegulatoryTrackingOwnershipSchema
>;
export type ComplianceRegulatoryTrackingStatus = z.infer<
  typeof complianceRegulatoryTrackingStatusSchema
>;
export type ComplianceRegulatoryTrackingGovernance = z.infer<
  typeof complianceRegulatoryTrackingGovernanceSchema
>;
export type ComplianceRegulatoryTrackingDataClassification = z.infer<
  typeof complianceRegulatoryTrackingDataClassificationSchema
>;
export type ComplianceRegulatoryTrackingRiskClassification = z.infer<
  typeof complianceRegulatoryTrackingRiskClassificationSchema
>;
