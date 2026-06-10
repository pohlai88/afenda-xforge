import { z } from "zod";
import {
  lamPolicyDecisionSchema,
  lamReadContextSchema,
  lamWriteContextSchema,
  trimmedStringSchema,
} from "../schema.ts";
import { leaveAttendanceManagementCapabilitySchema } from "./capability.contract.ts";

export const lamPolicyCapabilitySchema: typeof leaveAttendanceManagementCapabilitySchema =
  leaveAttendanceManagementCapabilitySchema;

export const lamPolicyContextSchema = lamWriteContextSchema.extend({
  grantedCapabilities: z.array(lamPolicyCapabilitySchema).optional(),
});

export const lamReadAccessContextSchema: typeof lamReadContextSchema =
  lamReadContextSchema;

export const lamWriteAccessContextSchema: typeof lamWriteContextSchema =
  lamWriteContextSchema;

export const lamPolicyDecisionInputSchema: typeof lamPolicyDecisionSchema =
  lamPolicyDecisionSchema;

export const lamAccessDecisionReasonSchema = z.enum([
  "granted",
  "missing_capability",
  "invalid_context",
]);

export const lamSensitiveAccessDecisionReasonSchema = z.enum([
  "granted",
  "masked",
  "invalid_context",
]);

export const lamSensitiveFieldRedactionSchema = z.enum(["null"]);

export const lamAccessDecisionSchema = z.object({
  allowed: z.boolean(),
  reason: lamAccessDecisionReasonSchema,
  requiredCapabilities: z.array(lamPolicyCapabilitySchema),
});

export const lamSensitiveAccessDecisionSchema = lamAccessDecisionSchema.extend({
  maskFields: z.array(trimmedStringSchema),
  redaction: lamSensitiveFieldRedactionSchema,
  reason: lamSensitiveAccessDecisionReasonSchema,
});

export const lamLeaveApplicationSensitiveFields = [
  "rejectionReason",
  "supportingDocumentId",
] as const;

export const lamSensitiveFieldPolicySchema = z.object({
  entityType: z.enum(["leave_application"]),
  fields: z.array(trimmedStringSchema).min(1),
  reason: trimmedStringSchema,
  redaction: lamSensitiveFieldRedactionSchema,
  requiredCapability: lamPolicyCapabilitySchema,
});

export const lamLeaveApplicationSensitiveFieldPolicy =
  lamSensitiveFieldPolicySchema.parse({
    entityType: "leave_application",
    fields: [...lamLeaveApplicationSensitiveFields],
    reason:
      "Leave application rejection reasons and supporting document references are restricted.",
    redaction: "null",
    requiredCapability: "hr.lam.leave-applications.approve",
  });

export const lamSensitiveFieldPolicies = [
  lamLeaveApplicationSensitiveFieldPolicy,
] as const;

export type LamPolicyCapability = z.infer<typeof lamPolicyCapabilitySchema>;
export type LamPolicyContext = z.infer<typeof lamPolicyContextSchema>;
export type LamPolicyDecisionInput = z.infer<
  typeof lamPolicyDecisionInputSchema
>;
export type LamAccessDecision = z.infer<typeof lamAccessDecisionSchema>;
export type LamSensitiveAccessDecision = z.infer<
  typeof lamSensitiveAccessDecisionSchema
>;
export type LamSensitiveFieldPolicy = z.infer<
  typeof lamSensitiveFieldPolicySchema
>;
