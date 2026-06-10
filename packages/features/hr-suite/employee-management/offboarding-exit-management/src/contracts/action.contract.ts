import { z } from "zod";
import { offboardingAuditActionSchema } from "../schema.ts";

export const offboardingExitManagementActionRiskSchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);

export const offboardingExitManagementActionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
  permission: z.string().trim().min(1),
  risk: offboardingExitManagementActionRiskSchema,
  auditEvent: offboardingAuditActionSchema,
});

export const offboardingExitManagementActionCatalog = [
  {
    id: "open_offboarding_case",
    label: "Open offboarding case",
    description:
      "Creates the governed offboarding case after lifecycle handoff.",
    permission: "hr.offboarding.case.write",
    risk: "high",
    auditEvent: "hr.offboarding.case.start",
  },
  {
    id: "update_offboarding_case",
    label: "Update offboarding case",
    description: "Updates case-level coordination fields and progress state.",
    permission: "hr.offboarding.case.write",
    risk: "medium",
    auditEvent: "hr.offboarding.case.update",
  },
  {
    id: "record_offboarding_approval",
    label: "Record offboarding approval",
    description: "Captures approval or rejection decisions for the case.",
    permission: "hr.offboarding.approval.write",
    risk: "high",
    auditEvent: "hr.offboarding.approval.approve",
  },
] as const satisfies readonly z.input<
  typeof offboardingExitManagementActionSchema
>[];

export type OffboardingExitManagementAction = z.infer<
  typeof offboardingExitManagementActionSchema
>;
export type OffboardingExitManagementActionRisk = z.infer<
  typeof offboardingExitManagementActionRiskSchema
>;
