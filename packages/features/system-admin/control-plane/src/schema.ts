import { z } from "zod";

export const systemAdminDomainSchema = z.enum([
  "overview",
  "tenant-settings",
  "users-access",
  "customization-governance",
  "audit",
  "health-metrics",
]);

export const systemAdminCapabilitySchema = z.enum([
  "system-admin.overview.read",
  "system-admin.tenant-settings.read",
  "system-admin.tenant-settings.write",
  "system-admin.users-access.read",
  "system-admin.users-access.write",
  "system-admin.customization.read",
  "system-admin.customization.publish",
  "system-admin.audit.read",
  "system-admin.health.read",
]);

export const systemAdminScopeSchema = z.object({
  tenantId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  companyId: z.string().trim().min(1).optional(),
  grantedPermissions: z.array(z.string().trim().min(1)).default([]),
  requestId: z.string().trim().min(1).optional(),
  operationId: z.string().trim().min(1).optional(),
});

export const listSystemAdminSectionsQuerySchema = z.object({
  domain: systemAdminDomainSchema.optional(),
});

export const systemAdminSectionSchema = z.object({
  id: z.string().trim().min(1),
  domain: systemAdminDomainSchema,
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  requiredPermission: systemAdminCapabilitySchema,
  status: z.enum(["ready", "deferred", "blocked"]),
});

export const systemAdminOverviewSchema = z.object({
  tenantId: z.string().trim().min(1),
  sections: z.array(systemAdminSectionSchema),
  warnings: z.array(z.string()),
});

export const tenantAdminSettingUpdateSchema = z.object({
  key: z.enum([
    "display-name",
    "default-locale",
    "default-timezone",
    "customization-mode",
  ]),
  value: z.string().trim().min(1).max(160),
  reason: z.string().trim().min(1).max(240),
});

export const roleAssignmentCommandSchema = z.object({
  targetUserId: z.string().trim().min(1),
  roleKey: z.string().trim().min(1).max(80),
  reason: z.string().trim().min(1).max(240),
});

export const customizationGovernanceCommandSchema = z.object({
  customizationId: z.string().trim().min(1),
  reason: z.string().trim().min(1).max(240),
});

export const systemAdminMutationResultSchema = z.object({
  id: z.string().trim().min(1),
  action: z.string().trim().min(1),
  status: z.enum(["accepted"]),
  tenantId: z.string().trim().min(1),
  summary: z.string().trim().min(1),
});

export type SystemAdminCapability = z.infer<typeof systemAdminCapabilitySchema>;
export type SystemAdminDomain = z.infer<typeof systemAdminDomainSchema>;
export type SystemAdminMutationResult = z.infer<
  typeof systemAdminMutationResultSchema
>;
export type SystemAdminOverview = z.infer<typeof systemAdminOverviewSchema>;
export type SystemAdminScope = z.infer<typeof systemAdminScopeSchema>;
export type SystemAdminSection = z.infer<typeof systemAdminSectionSchema>;
export type ListSystemAdminSectionsQuery = z.infer<
  typeof listSystemAdminSectionsQuerySchema
>;
export type TenantAdminSettingUpdate = z.infer<
  typeof tenantAdminSettingUpdateSchema
>;
export type RoleAssignmentCommand = z.infer<typeof roleAssignmentCommandSchema>;
export type CustomizationGovernanceCommand = z.infer<
  typeof customizationGovernanceCommandSchema
>;
