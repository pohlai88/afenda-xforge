import { z } from "zod";

const employeeLifecycleOptionalScopeStringSchema = z
  .string()
  .trim()
  .min(1)
  .optional();

export const employeeLifecycleReadAccessContextSchema = z.object({
  actorId: employeeLifecycleOptionalScopeStringSchema,
  canRead: z.boolean().optional(),
  canViewSensitive: z.boolean().optional(),
  companyId: employeeLifecycleOptionalScopeStringSchema,
  requestId: employeeLifecycleOptionalScopeStringSchema,
  tenantId: employeeLifecycleOptionalScopeStringSchema,
});

export const employeeLifecycleWriteAccessContextSchema =
  employeeLifecycleReadAccessContextSchema.extend({
    canWrite: z.boolean().optional(),
  });

export const employeeLifecyclePolicyContextSchema =
  employeeLifecycleWriteAccessContextSchema;

export type EmployeeLifecycleManagementPolicyContext = z.infer<
  typeof employeeLifecyclePolicyContextSchema
>;
