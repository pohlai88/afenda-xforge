import { ForbiddenError } from "@repo/errors";
import { MetadataStateBoundary } from "@repo/metadata-ui/components";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { Link } from "@/i18n/navigation";
import { queryTenantKeyboardShortcutPolicy } from "../../../../../lib/workspace-shortcuts/queries.server.ts";
import { AuthenticatedFeatureScope } from "../../../../_components/authenticated-feature-scope.tsx";
import {
  createRuntimePermissionContext,
  resolveRuntimeTenantAccess,
} from "../../../../_runtime-access.ts";
import { KeyboardShortcutsAdminView } from "./keyboard-shortcuts-admin-view.tsx";

const KEYBOARD_SHORTCUTS_FEATURE_ID = "system-admin.tenant-settings";

function canWriteTenantKeyboardShortcuts(
  access: Awaited<ReturnType<typeof resolveRuntimeTenantAccess>>
): boolean {
  try {
    requirePermission(
      createRuntimePermissionContext(
        access,
        permissionCatalog.systemAdmin.tenantSettingsWrite,
        KEYBOARD_SHORTCUTS_FEATURE_ID
      ),
      { allOf: [permissionCatalog.systemAdmin.tenantSettingsWrite] }
    );
    return true;
  } catch {
    return false;
  }
}

export default async function KeyboardShortcutsAdminPage(): Promise<ReactElement> {
  const t = await getTranslations("admin.keyboardShortcuts");

  try {
    const access = await resolveRuntimeTenantAccess();
    requirePermission(
      createRuntimePermissionContext(
        access,
        permissionCatalog.systemAdmin.tenantSettingsRead,
        KEYBOARD_SHORTCUTS_FEATURE_ID
      ),
      { allOf: [permissionCatalog.systemAdmin.tenantSettingsRead] }
    );

    const initialPayload = await queryTenantKeyboardShortcutPolicy();

    return (
      <AuthenticatedFeatureScope featureId={KEYBOARD_SHORTCUTS_FEATURE_ID}>
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
              <li className="text-foreground">{t("breadcrumb")}</li>
            </ol>
          </nav>
          <KeyboardShortcutsAdminView
            canWrite={canWriteTenantKeyboardShortcuts(access)}
            initialPayload={initialPayload}
          />
        </section>
      </AuthenticatedFeatureScope>
    );
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <MetadataStateBoundary
          forbiddenDescription={t("forbiddenDescription")}
          forbiddenTitle={t("forbiddenTitle")}
          state="forbidden"
        />
      );
    }

    return (
      <MetadataStateBoundary
        error={error instanceof Error ? error.message : t("loadError")}
        state="error"
      />
    );
  }
}
