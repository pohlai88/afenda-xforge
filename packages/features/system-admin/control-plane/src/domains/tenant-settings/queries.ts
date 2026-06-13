import "server-only";

import type { AfendaTenantBrandingSettings as TenantBrandingSettings } from "@repo/design-system/contracts/afenda/customization";
import type { TenantAdminSettingsSnapshot } from "./contract.ts";
import {
  readTenantAdminSettings,
  readTenantBrandingSettings,
} from "./repository.server.ts";

export const readTenantBrandingForTenant = (
  tenantId: string
): Promise<TenantBrandingSettings> => readTenantBrandingSettings(tenantId);

export const readTenantAdminSettingsForTenant = (
  tenantId: string
): Promise<TenantAdminSettingsSnapshot> => readTenantAdminSettings(tenantId);
