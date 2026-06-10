import { z } from "zod";
import type {
  approveOffboardingApprovalStepInputSchema,
  escalateOffboardingApprovalStepInputSchema,
  openOffboardingCaseInputSchema,
  rejectOffboardingApprovalStepInputSchema,
  reopenOffboardingApprovalStepInputSchema,
  submitOffboardingApprovalStepInputSchema,
  updateOffboardingCaseInputSchema,
  upsertOffboardingApprovalStepInputSchema,
} from "../schema.ts";
import {
  offboardingRepositoryEntityTypeSchema,
  trimmedStringSchema,
} from "../schema.ts";

export const recordOffboardingAuditEventInputSchema = z.object({
  action: trimmedStringSchema,
  entityType: offboardingRepositoryEntityTypeSchema,
  entityId: trimmedStringSchema,
  summary: z.string().trim().nullable().optional(),
  reason: z.string().trim().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  sensitive: z.boolean().optional(),
});

export {
  approveOffboardingApprovalStepInputSchema,
  escalateOffboardingApprovalStepInputSchema,
  openOffboardingCaseInputSchema,
  rejectOffboardingApprovalStepInputSchema,
  reopenOffboardingApprovalStepInputSchema,
  submitOffboardingApprovalStepInputSchema,
  updateOffboardingCaseInputSchema,
  upsertOffboardingApprovalStepInputSchema,
} from "../schema.ts";

export type ApproveOffboardingApprovalStepInput = z.infer<
  typeof approveOffboardingApprovalStepInputSchema
>;
export type EscalateOffboardingApprovalStepInput = z.infer<
  typeof escalateOffboardingApprovalStepInputSchema
>;
export type OpenOffboardingCaseInput = z.infer<
  typeof openOffboardingCaseInputSchema
>;
export type RecordOffboardingAuditEventInput = z.infer<
  typeof recordOffboardingAuditEventInputSchema
>;
export type ReopenOffboardingApprovalStepInput = z.infer<
  typeof reopenOffboardingApprovalStepInputSchema
>;
export type RejectOffboardingApprovalStepInput = z.infer<
  typeof rejectOffboardingApprovalStepInputSchema
>;
export type SubmitOffboardingApprovalStepInput = z.infer<
  typeof submitOffboardingApprovalStepInputSchema
>;
export type UpdateOffboardingCaseInput = z.infer<
  typeof updateOffboardingCaseInputSchema
>;
export type UpsertOffboardingApprovalStepInput = z.infer<
  typeof upsertOffboardingApprovalStepInputSchema
>;

export type OffboardingMutationResult = {
  code?:
    | "conflict"
    | "forbidden"
    | "not_found"
    | "untrusted_scope"
    | "validation_error";
  ok: boolean;
  error?: string;
  targetId: string;
};
