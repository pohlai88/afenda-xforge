import { z } from "zod";

export const employeeUserAccountLinkSchema = z.object({
  active: z.boolean(),
  companyId: z.string().trim().min(1),
  createdAt: z.string().trim().min(1),
  employeeId: z.string().trim().min(1),
  id: z.string().trim().min(1),
  tenantId: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
  userId: z.string().trim().min(1),
});

export const upsertEmployeeUserAccountLinkInputSchema = z.object({
  active: z.boolean().optional(),
  employeeId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
});

export const listEmployeeUserAccountLinksQuerySchema = z.object({
  employeeId: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
});

export type EmployeeUserAccountLinkRecord = z.infer<
  typeof employeeUserAccountLinkSchema
>;

export type UpsertEmployeeUserAccountLinkInput = z.infer<
  typeof upsertEmployeeUserAccountLinkInputSchema
>;

export type ListEmployeeUserAccountLinksQuery = z.infer<
  typeof listEmployeeUserAccountLinksQuerySchema
>;
