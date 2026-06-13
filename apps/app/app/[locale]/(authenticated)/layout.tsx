import { getActiveTenantMembership } from "@repo/auth/server";
import type { AfendaTenantBrandingSettings as TenantBrandingSettings } from "@repo/design-system/contracts/afenda/customization";
import { AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS as DEFAULT_TENANT_BRANDING_SETTINGS } from "@repo/design-system/contracts/afenda/customization";
import { readTenantBrandingForTenant } from "@repo/features-system-admin-control-plane/server";
import type { ReactElement, ReactNode } from "react";
import { redirect } from "@/i18n/navigation";
import { readUserAppearancePreferences } from "../../../lib/user-appearance/repository.server";
import { queryWorkspaceShortcuts } from "../../../lib/workspace-shortcuts/queries.server.ts";
import { resolveProductDefaults } from "../../../lib/workspace-shortcuts/resolve-shortcuts.ts";
import { AuthenticatedWorkspace } from "../../_components/authenticated-workspace.tsx";
import { TenantBrandingProvider } from "../../_components/tenant-branding-context.tsx";
import { WorkspaceShortcutsRoot } from "../../_components/workspace-shortcuts-root.tsx";

type AuthenticatedLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AuthenticatedLayout({
  children,
  params,
}: AuthenticatedLayoutProps): Promise<ReactElement> {
  const { locale } = await params;
  const membership = await getActiveTenantMembership();

  if (!membership) {
    redirect({ href: "/sign-in", locale });
    throw new Error("Redirect to sign-in did not complete.");
  }

  const activeMembership = membership;
  let tenantBranding: TenantBrandingSettings = DEFAULT_TENANT_BRANDING_SETTINGS;

  try {
    tenantBranding = await readTenantBrandingForTenant(
      activeMembership.tenantId
    );
  } catch {
    tenantBranding = DEFAULT_TENANT_BRANDING_SETTINGS;
  }

  const userPreferences = await readUserAppearancePreferences(
    activeMembership.tenantId,
    activeMembership.userId
  );

  let workspaceShortcuts = resolveProductDefaults();

  try {
    workspaceShortcuts = await queryWorkspaceShortcuts();
  } catch {
    workspaceShortcuts = resolveProductDefaults();
  }

  return (
    <TenantBrandingProvider
      tenantBranding={tenantBranding}
      tenantId={activeMembership.tenantId}
      userId={activeMembership.userId}
      userPreferences={userPreferences}
    >
      <WorkspaceShortcutsRoot payload={workspaceShortcuts}>
        <main className="min-h-screen bg-background">
          <AuthenticatedWorkspace>{children}</AuthenticatedWorkspace>
        </main>
      </WorkspaceShortcutsRoot>
    </TenantBrandingProvider>
  );
}
