import { z } from "zod";
import {
  hrOrgPolicyDecisionSchema,
  hrOrgReadContextSchema,
  hrOrgWriteContextSchema,
  trimmedStringSchema,
} from "../schema.ts";

export const hrOrgPolicyCapabilitySchema: typeof trimmedStringSchema =
  trimmedStringSchema;

export const hrOrgPolicyContextSchema = hrOrgWriteContextSchema.extend({
  grantedCapabilities: z.array(hrOrgPolicyCapabilitySchema).optional(),
});

export const hrOrgReadAccessContextSchema: typeof hrOrgReadContextSchema =
  hrOrgReadContextSchema;
export const hrOrgWriteAccessContextSchema: typeof hrOrgWriteContextSchema =
  hrOrgWriteContextSchema;
export const hrOrgPolicyDecisionInputSchema: typeof hrOrgPolicyDecisionSchema =
  hrOrgPolicyDecisionSchema;

export const hrOrgAccessDecisionReasonSchema = z.enum([
  "read_allowed",
  "write_allowed",
  "read_access_denied",
  "write_access_denied",
]);

export const hrOrgAccessDecisionSchema = z.object({
  allowed: z.boolean(),
  reason: hrOrgAccessDecisionReasonSchema,
  requiredCapabilities: z.array(hrOrgPolicyCapabilitySchema),
});

export type HrOrgPolicyCapability = z.infer<typeof hrOrgPolicyCapabilitySchema>;
export type HrOrgPolicyContext = z.infer<typeof hrOrgPolicyContextSchema>;
export type HrOrgPolicyDecisionInput = z.infer<
  typeof hrOrgPolicyDecisionInputSchema
>;
export type HrOrgAccessDecision = z.infer<typeof hrOrgAccessDecisionSchema>;
