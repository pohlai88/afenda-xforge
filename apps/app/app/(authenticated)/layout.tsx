import { getActiveTenantMembership } from "@repo/auth/server";
import type { TenantBrandingSettings } from "@repo/design-system";
import { DEFAULT_TENANT_BRANDING_SETTINGS } from "@repo/design-system";
import { readTenantBrandingForTenant } from "@repo/features-system-admin-control-plane/server";
import { redirect } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { TenantBrandingProvider } from "../_components/tenant-branding-context.tsx";

type AuthenticatedLayoutProps = {
  children: ReactNode;
};

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps): Promise<ReactElement> {
  const membership = await getActiveTenantMembership();

  if (!membership) {
    redirect("/sign-in");
  }

  let branding: TenantBrandingSettings = DEFAULT_TENANT_BRANDING_SETTINGS;

  try {
    branding = await readTenantBrandingForTenant(membership.tenantId);
  } catch {
    branding = DEFAULT_TENANT_BRANDING_SETTINGS;
  }

  return (
    <TenantBrandingProvider branding={branding} tenantId={membership.tenantId}>
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-8">
          {children}
        </div>
      </main>
    </TenantBrandingProvider>
  );
}
