import { ForbiddenError } from "@repo/errors";
import { MetadataStateBoundary } from "@repo/metadata-ui/components";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import Link from "next/link";
import type { ReactElement } from "react";
import { readTenantKeyboardShortcutPolicy } from "../../../../../lib/workspace-shortcuts/repository.server.ts";
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

    const initialPayload = await readTenantKeyboardShortcutPolicy(
      access.tenantId
    );

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
              <li className="text-foreground">Keyboard shortcuts</li>
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
          forbiddenDescription="Tenant keyboard shortcut policy requires tenant admin permissions."
          forbiddenTitle="Keyboard shortcuts unavailable"
          state="forbidden"
        />
      );
    }

    return (
      <MetadataStateBoundary
        error={
          error instanceof Error
            ? error.message
            : "Keyboard shortcut policy could not be loaded."
        }
        state="error"
      />
    );
  }
}
