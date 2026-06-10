import { z } from "zod";
import type {
  listOffboardingApprovalBlockersQuerySchema,
  listOffboardingApprovalStepsQuerySchema,
  listOffboardingCasesQuerySchema,
} from "../schema.ts";
import {
  offboardingRepositoryEntityTypeSchema,
  trimmedStringSchema,
} from "../schema.ts";

export {
  listOffboardingApprovalBlockersQuerySchema,
  listOffboardingApprovalStepsQuerySchema,
  listOffboardingCasesQuerySchema,
} from "../schema.ts";

export const listOffboardingAuditTrailQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  search: z.string().trim().optional(),
  action: trimmedStringSchema.optional(),
  entityType: offboardingRepositoryEntityTypeSchema.optional(),
  companyId: trimmedStringSchema.optional(),
});

export type ListOffboardingCasesQuery = z.infer<
  typeof listOffboardingCasesQuerySchema
>;
export type ListOffboardingApprovalStepsQuery = z.infer<
  typeof listOffboardingApprovalStepsQuerySchema
>;
export type ListOffboardingApprovalBlockersQuery = z.infer<
  typeof listOffboardingApprovalBlockersQuerySchema
>;
export type ListOffboardingAuditTrailQuery = z.infer<
  typeof listOffboardingAuditTrailQuerySchema
>;
