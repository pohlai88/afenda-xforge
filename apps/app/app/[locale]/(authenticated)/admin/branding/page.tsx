import { ForbiddenError } from "@repo/errors";
import { readTenantAdminSettingsForTenant } from "@repo/features-system-admin-control-plane/server";
import { MetadataStateBoundary } from "@repo/metadata-ui/components";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import Link from "next/link";
import type { ReactElement } from "react";
import { AuthenticatedFeatureScope } from "../../../../_components/authenticated-feature-scope.tsx";
import {
  createRuntimePermissionContext,
  resolveRuntimeTenantAccess,
} from "../../../../_runtime-access.ts";
import { BrandingSettingsView } from "./branding-settings-view.tsx";

const BRANDING_FEATURE_ID = "system-admin.tenant-settings";

function canWriteTenantBranding(
  access: Awaited<ReturnType<typeof resolveRuntimeTenantAccess>>
): boolean {
  try {
    requirePermission(
      createRuntimePermissionContext(
        access,
        permissionCatalog.systemAdmin.tenantSettingsWrite,
        BRANDING_FEATURE_ID
      ),
      { allOf: [permissionCatalog.systemAdmin.tenantSettingsWrite] }
    );
    return true;
  } catch {
    return false;
  }
}

export default async function BrandingSettingsPage(): Promise<ReactElement> {
  try {
    const access = await resolveRuntimeTenantAccess();
    requirePermission(
      createRuntimePermissionContext(
        access,
        permissionCatalog.systemAdmin.tenantSettingsRead,
        BRANDING_FEATURE_ID
      ),
      { allOf: [permissionCatalog.systemAdmin.tenantSettingsRead] }
    );
    const settings = await readTenantAdminSettingsForTenant(access.tenantId);

    return (
      <AuthenticatedFeatureScope featureId={BRANDING_FEATURE_ID}>
        <section className="space-y-6">
          <nav aria-label="Breadcrumb" className="text-sm">
            <ol className="flex flex-wrap items-center gap-2 text-muted-foreground">
              <li>
                <Link
                  className="transition hover:text-foreground"
                  href="/dashboard"
                >
                  Dashboard
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-foreground">Tenant branding</li>
            </ol>
          </nav>
          <BrandingSettingsView
            canWrite={canWriteTenantBranding(access)}
            initialSettings={settings}
          />
        </section>
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
