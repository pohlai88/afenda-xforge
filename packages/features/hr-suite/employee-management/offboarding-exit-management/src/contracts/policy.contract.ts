import { z } from "zod";
import {
  offboardingReadContextSchema,
  offboardingTrimmedStringSchema,
  offboardingWriteContextSchema,
} from "../schema.ts";

export const offboardingPolicyCapabilityValues = [
  "hr.offboarding.case.read",
  "hr.offboarding.case.write",
  "hr.offboarding.case.sensitive.read",
  "hr.offboarding.checklist.write",
  "hr.offboarding.approval.write",
] as const;

export const offboardingPolicyCapabilitySchema = z.enum(
  offboardingPolicyCapabilityValues
);

export const offboardingPolicyContextSchema =
  offboardingWriteContextSchema.extend({
    grantedCapabilities: z.array(offboardingPolicyCapabilitySchema).optional(),
  });

export const offboardingReadAccessContextSchema = offboardingReadContextSchema;

export const offboardingWriteAccessContextSchema =
  offboardingWriteContextSchema;

export const offboardingAccessDecisionReasonSchema = z.enum([
  "granted",
  "missing_capability",
  "invalid_context",
]);

export const offboardingSensitiveAccessDecisionReasonSchema = z.enum([
  "granted",
  "masked",
  "invalid_context",
]);

export const offboardingSensitiveFieldRedactionSchema = z.enum(["null"]);

export const offboardingAccessDecisionSchema = z.object({
  allowed: z.boolean(),
  reason: offboardingAccessDecisionReasonSchema,
  requiredCapabilities: z.array(offboardingPolicyCapabilitySchema),
});

export const offboardingSensitiveAccessDecisionSchema =
  offboardingAccessDecisionSchema.extend({
    maskFields: z.array(offboardingTrimmedStringSchema),
    redaction: offboardingSensitiveFieldRedactionSchema,
    reason: offboardingSensitiveAccessDecisionReasonSchema,
  });

export const offboardingSensitiveFieldPolicySchema = z.object({
  entityType: z.enum(["case", "exit_interview"]),
  fields: z.array(offboardingTrimmedStringSchema).min(1),
  reason: offboardingTrimmedStringSchema,
  redaction: offboardingSensitiveFieldRedactionSchema,
  requiredCapability: offboardingPolicyCapabilitySchema,
});

export const offboardingCaseSensitiveFieldPolicy =
  offboardingSensitiveFieldPolicySchema.parse({
    entityType: "case",
    fields: ["reasonSummary"],
    reason: "Offboarding reason summaries may contain sensitive exit details.",
    redaction: "null",
    requiredCapability: "hr.offboarding.case.sensitive.read",
  });

export const offboardingExitInterviewSensitiveFieldPolicy =
  offboardingSensitiveFieldPolicySchema.parse({
    entityType: "exit_interview",
    fields: ["feedbackSummary", "sensitiveNotes"],
    reason: "Exit interview feedback is sensitive by default.",
    redaction: "null",
    requiredCapability: "hr.offboarding.case.sensitive.read",
  });

export const offboardingSensitiveFieldPolicies = [
  offboardingCaseSensitiveFieldPolicy,
  offboardingExitInterviewSensitiveFieldPolicy,
] as const;

export type OffboardingPolicyCapability = z.infer<
  typeof offboardingPolicyCapabilitySchema
>;
export type OffboardingPolicyContext = z.infer<
  typeof offboardingPolicyContextSchema
>;
export type OffboardingAccessDecision = z.infer<
  typeof offboardingAccessDecisionSchema
>;
export type OffboardingSensitiveAccessDecision = z.infer<
  typeof offboardingSensitiveAccessDecisionSchema
>;
export type OffboardingSensitiveFieldPolicy = z.infer<
  typeof offboardingSensitiveFieldPolicySchema
>;
