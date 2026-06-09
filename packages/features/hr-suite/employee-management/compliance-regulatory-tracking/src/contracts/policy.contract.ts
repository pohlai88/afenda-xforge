import { z } from "zod";
import {
  compliancePolicyDecisionSchema,
  complianceReadContextSchema,
  complianceWriteContextSchema,
  trimmedStringSchema,
} from "../schema.ts";
import { complianceRegulatoryTrackingCapabilitySchema } from "./capability.contract.ts";

export const compliancePolicyCapabilitySchema: typeof complianceRegulatoryTrackingCapabilitySchema =
  complianceRegulatoryTrackingCapabilitySchema;

export const compliancePolicyContextSchema =
  complianceWriteContextSchema.extend({
    grantedCapabilities: z.array(compliancePolicyCapabilitySchema).optional(),
  });

export const complianceReadAccessContextSchema: typeof complianceReadContextSchema =
  complianceReadContextSchema;

export const complianceWriteAccessContextSchema: typeof complianceWriteContextSchema =
  complianceWriteContextSchema;

export const compliancePolicyDecisionInputSchema: typeof compliancePolicyDecisionSchema =
  compliancePolicyDecisionSchema;

export const complianceAccessDecisionReasonSchema = z.enum([
  "granted",
  "missing_capability",
  "invalid_context",
]);

export const complianceSensitiveAccessDecisionReasonSchema = z.enum([
  "granted",
  "masked",
  "invalid_context",
]);

export const complianceSensitiveFieldRedactionSchema = z.enum(["null"]);

export const complianceAccessDecisionSchema = z.object({
  allowed: z.boolean(),
  reason: complianceAccessDecisionReasonSchema,
  requiredCapabilities: z.array(compliancePolicyCapabilitySchema),
});

export const complianceSensitiveAccessDecisionSchema =
  complianceAccessDecisionSchema.extend({
    maskFields: z.array(trimmedStringSchema),
    redaction: complianceSensitiveFieldRedactionSchema,
    reason: complianceSensitiveAccessDecisionReasonSchema,
  });

export const complianceEvidenceSensitiveFields = [
  "sourceDocumentNumber",
  "sourceNotes",
] as const;

export const complianceSensitiveFieldPolicySchema = z.object({
  entityType: z.enum(["evidence"]),
  fields: z.array(trimmedStringSchema).min(1),
  reason: trimmedStringSchema,
  redaction: complianceSensitiveFieldRedactionSchema,
  requiredCapability: compliancePolicyCapabilitySchema,
});

export const complianceEvidenceSensitiveFieldPolicy =
  complianceSensitiveFieldPolicySchema.parse({
    entityType: "evidence",
    fields: [...complianceEvidenceSensitiveFields],
    reason: "Evidence document references and notes are restricted.",
    redaction: "null",
    requiredCapability: "hr.compliance.evidence.sensitive.read",
  });

export const complianceSensitiveFieldPolicies = [
  complianceEvidenceSensitiveFieldPolicy,
] as const;

export type CompliancePolicyCapability = z.infer<
  typeof compliancePolicyCapabilitySchema
>;
export type CompliancePolicyContext = z.infer<
  typeof compliancePolicyContextSchema
>;
export type CompliancePolicyDecisionInput = z.infer<
  typeof compliancePolicyDecisionInputSchema
>;
export type ComplianceAccessDecision = z.infer<
  typeof complianceAccessDecisionSchema
>;
export type ComplianceSensitiveAccessDecision = z.infer<
  typeof complianceSensitiveAccessDecisionSchema
>;
export type ComplianceSensitiveFieldPolicy = z.infer<
  typeof complianceSensitiveFieldPolicySchema
>;
