import { getActiveTenantMembership } from "@repo/auth/server";
import type { TenantBrandingSettings } from "@repo/design-system";
import { DEFAULT_TENANT_BRANDING_SETTINGS } from "@repo/design-system";
import { readTenantBrandingForTenant } from "@repo/features-system-admin-control-plane/server";
import { redirect } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { localizedPath } from "@/i18n/locale-prefix";
import { readUserAppearancePreferences } from "../../../lib/user-appearance/repository.server";
import { AuthenticatedShell } from "../../_components/authenticated-shell.tsx";
import { TenantBrandingProvider } from "../../_components/tenant-branding-context.tsx";

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
    redirect(localizedPath("/sign-in", locale));
  }

  let tenantBranding: TenantBrandingSettings = DEFAULT_TENANT_BRANDING_SETTINGS;

  try {
    tenantBranding = await readTenantBrandingForTenant(membership.tenantId);
  } catch {
    tenantBranding = DEFAULT_TENANT_BRANDING_SETTINGS;
  }

  const userPreferences = await readUserAppearancePreferences(
    membership.tenantId,
    membership.userId
  );

  return (
    <TenantBrandingProvider
      tenantBranding={tenantBranding}
      tenantId={membership.tenantId}
      userId={membership.userId}
      userPreferences={userPreferences}
    >
      <main className="min-h-screen bg-background">
        <AuthenticatedShell>{children}</AuthenticatedShell>
      </main>
    </TenantBrandingProvider>
  );
}
