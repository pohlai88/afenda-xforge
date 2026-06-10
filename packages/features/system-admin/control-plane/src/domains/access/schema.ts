import { z } from "zod";

export const roleAssignmentCommandSchema = z.object({
  targetUserId: z.string().trim().min(1),
  roleKey: z.string().trim().min(1).max(80),
  reason: z.string().trim().min(1).max(240),
});

export type RoleAssignmentCommandShape = z.infer<
  typeof roleAssignmentCommandSchema
>;
