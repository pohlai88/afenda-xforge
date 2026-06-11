import { z } from "zod";
import type { RoleAssignmentCommandShape } from "./domains/access/schema.ts";
import type {
  CustomizationGovernanceCommandShape,
  SystemAdminCustomizationReviewCategoryShape,
  SystemAdminCustomizationReviewItemShape,
  SystemAdminCustomizationReviewReasonShape,
  SystemAdminCustomizationReviewRequestShape,
  SystemAdminCustomizationReviewShape,
  SystemAdminCustomizationReviewStatusShape,
} from "./domains/customization/schema.ts";
import type {
  SystemAdminOverviewShape,
  SystemAdminSectionShape,
} from "./domains/overview/schema.ts";
import type { TenantAdminSettingUpdateShape } from "./domains/tenant-settings/schema.ts";

export { tenantAdminSettingUpdateSchema } from "./domains/tenant-settings/schema.ts";

export const systemAdminDomainSchema = z.enum([
  "overview",
  "tenant-settings",
  "users-access",
  "customization-governance",
  "audit",
  "health-metrics",
  "integrations",
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
  "system-admin.integrations.read",
  "system-admin.integrations.write",
] as [string, ...string[]]);

export const systemAdminScopeSchema = z.object({
  tenantId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  companyId: z.string().trim().min(1).optional(),
  grantedPermissions: z.array(z.string().trim().min(1)).default([]),
  requestId: z.string().trim().min(1).optional(),
  operationId: z.string().trim().min(1).optional(),
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
export type SystemAdminCustomizationReview =
  SystemAdminCustomizationReviewShape;
export type SystemAdminCustomizationReviewRequest =
  SystemAdminCustomizationReviewRequestShape;
export type SystemAdminCustomizationReviewCategory =
  SystemAdminCustomizationReviewCategoryShape;
export type SystemAdminCustomizationReviewItem =
  SystemAdminCustomizationReviewItemShape;
export type SystemAdminCustomizationReviewReason =
  SystemAdminCustomizationReviewReasonShape;
export type SystemAdminCustomizationReviewStatus =
  SystemAdminCustomizationReviewStatusShape;
export type SystemAdminOverview = SystemAdminOverviewShape;
export type SystemAdminScope = z.infer<typeof systemAdminScopeSchema>;
export type SystemAdminSection = Omit<
  SystemAdminSectionShape,
  "domain" | "requiredPermission"
> & {
  domain: SystemAdminDomain;
  requiredPermission: SystemAdminCapability;
};
export type ListSystemAdminSectionsQuery = {
  domain?: SystemAdminDomain;
};
export type TenantAdminSettingUpdate = TenantAdminSettingUpdateShape;
export type RoleAssignmentCommand = RoleAssignmentCommandShape;
export type CustomizationGovernanceCommand =
  CustomizationGovernanceCommandShape;
