import "server-only";

import type { TenantBrandingSettings } from "@repo/design-system/contracts/tenant-branding.contract";
import type { TenantAdminSettingsSnapshot } from "./repository.server.ts";
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
