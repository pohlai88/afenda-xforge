import { z } from "zod";

const tenantSettingReasonSchema = z.string().trim().min(1).max(240);

const scalarTenantSettingUpdateSchema = z.object({
  key: z.enum([
    "display-name",
    "default-locale",
    "default-timezone",
    "customization-mode",
    "theme-preset",
  ]),
  value: z.string().trim().min(1).max(160),
  reason: tenantSettingReasonSchema,
});

const tenantBrandingSettingUpdateSchema = z.object({
  key: z.literal("tenant-branding"),
  value: z.string().trim().min(1).max(8192),
  reason: tenantSettingReasonSchema,
});

export const tenantAdminSettingUpdateSchema = z.union([
  tenantBrandingSettingUpdateSchema,
  scalarTenantSettingUpdateSchema,
]);

export type TenantAdminSettingUpdateShape = z.infer<
  typeof tenantAdminSettingUpdateSchema
>;
