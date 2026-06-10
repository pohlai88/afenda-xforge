import { z } from "zod";

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

export type TenantAdminSettingUpdateShape = z.infer<
  typeof tenantAdminSettingUpdateSchema
>;
