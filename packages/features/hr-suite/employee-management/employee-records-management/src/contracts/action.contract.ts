import { z } from "zod";

export const hrRecordsActionRiskSchema = z.enum([
  "standard",
  "elevated",
  "sensitive",
  "high",
]);

export const hrRecordsActionCapabilitySchema = z.enum([
  "hr.employees.write",
  "hr.employees.read",
  "hr.employees.sensitive.read",
]);

export const hrRecordsActionApprovalSchema = z.object({
  required: z.boolean(),
  reason: z.string().trim().nullable().optional(),
});

export const hrRecordsActionContractSchema = z.object({
  id: z.string().trim().min(1),
  capabilities: hrRecordsActionCapabilitySchema.array(),
  auditEvent: z.string().trim().min(1),
  approval: hrRecordsActionApprovalSchema,
  risk: hrRecordsActionRiskSchema,
  integrationEvent: z.string().trim().min(1),
  requiresReason: z.boolean().optional(),
});

export type HrRecordsActionRisk = z.infer<typeof hrRecordsActionRiskSchema>;
export type HrRecordsActionCapability = z.infer<
  typeof hrRecordsActionCapabilitySchema
>;
export type HrRecordsActionApproval = z.infer<
  typeof hrRecordsActionApprovalSchema
>;
export type HrRecordsActionContract = z.infer<
  typeof hrRecordsActionContractSchema
>;
