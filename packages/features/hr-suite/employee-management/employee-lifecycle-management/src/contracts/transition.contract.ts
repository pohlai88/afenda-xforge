import { z } from "zod";
import { employeeLifecycleTransitionInputSchema } from "../schema.ts";

const employeeLifecycleTrimmedStringSchema = z.string().trim().min(1);
const employeeLifecycleOptionalTrimmedStringSchema = z
  .string()
  .trim()
  .min(1)
  .optional();

export const employeeLifecycleTransitionRequestSchema =
  employeeLifecycleTransitionInputSchema.extend({
    employeeId: employeeLifecycleTrimmedStringSchema,
    companyId: employeeLifecycleOptionalTrimmedStringSchema,
    tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  });

export type EmployeeLifecycleTransitionRequest = z.infer<
  typeof employeeLifecycleTransitionRequestSchema
>;
