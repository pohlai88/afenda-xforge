import { z } from "zod";

export const listSystemAdminSectionsQuerySchema = z.object({
  domain: z.string().trim().min(1).optional(),
});

export const systemAdminSectionSchema = z.object({
  id: z.string().trim().min(1),
  domain: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  requiredPermission: z.string().trim().min(1),
  status: z.enum(["ready", "deferred", "blocked"]),
});

export const systemAdminOverviewSchema = z.object({
  tenantId: z.string().trim().min(1),
  sections: z.array(systemAdminSectionSchema),
  warnings: z.array(z.string()),
});

export type SystemAdminSectionShape = z.infer<typeof systemAdminSectionSchema>;
export type SystemAdminOverviewShape = z.infer<
  typeof systemAdminOverviewSchema
>;
