import { ForbiddenError } from "@repo/errors";
import { readTenantAdminSettingsForTenant } from "@repo/features-system-admin-control-plane/server";
import { MetadataStateBoundary } from "@repo/metadata-ui/components";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import Link from "next/link";
import type { ReactElement } from "react";
import { AuthenticatedFeatureScope } from "../../../_components/authenticated-feature-scope.tsx";
import {
  createRuntimePermissionContext,
  resolveRuntimeTenantAccess,
} from "../../../_runtime-access.ts";
import { BrandingSettingsView } from "./branding-settings-view.tsx";

const BRANDING_FEATURE_ID = "system-admin.tenant-settings";

export default async function BrandingSettingsPage(): Promise<ReactElement> {
  try {
    const access = await resolveRuntimeTenantAccess();
    requirePermission(
      createRuntimePermissionContext(
        access,
        permissionCatalog.systemAdmin.tenantSettingsRead,
        "system-admin.tenant-settings"
      ),
      { allOf: [permissionCatalog.systemAdmin.tenantSettingsRead] }
    );
    const settings = await readTenantAdminSettingsForTenant(access.tenantId);

    return (
      <AuthenticatedFeatureScope featureId={BRANDING_FEATURE_ID}>
        <div className="space-y-6">
          <Link
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 font-medium text-sm transition hover:bg-muted"
            href="/dashboard"
          >
            Back to dashboard
          </Link>
          <BrandingSettingsView initialSettings={settings} />
        </div>
      </AuthenticatedFeatureScope>
    );
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <MetadataStateBoundary
          forbiddenDescription="Tenant branding settings require tenant admin permissions."
          forbiddenTitle="Branding unavailable"
          state="forbidden"
        />
      );
    }

    return (
      <MetadataStateBoundary
        error={
          error instanceof Error
            ? error.message
            : "Branding settings could not be loaded."
        }
        state="error"
      />
    );
  }
}
