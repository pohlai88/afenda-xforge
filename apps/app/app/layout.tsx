import { getActiveTenantMembership } from "@repo/auth/server";
import type { TenantBrandingSettings } from "@repo/design-system";
import { DEFAULT_TENANT_BRANDING_SETTINGS } from "@repo/design-system";
import { Toolbar } from "@repo/feature-flags/components/toolbar";
import { readTenantBrandingForTenant } from "@repo/features-system-admin-control-plane/server";
import {
  getTextDirection,
  resolveXforgeLocaleFromHeaders,
} from "@repo/internationalization";
import { createAppSitePreset } from "@repo/seo/presets";
import { fonts } from "@repo/ui";
import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactElement, ReactNode } from "react";

import { TenantBrandingStyles } from "./_components/tenant-branding-styles";
import { ensureAppBootstrap } from "./bootstrap";
import { Providers } from "./providers";
import "./styles.css";

const appSitePreset = createAppSitePreset(
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
);

export const metadata: Metadata = appSitePreset.metadata;

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({
  children,
}: RootLayoutProps): Promise<ReactElement> {
  ensureAppBootstrap();
  const requestHeaders = await headers();
  const locale = resolveXforgeLocaleFromHeaders(requestHeaders);
  const membership = await getActiveTenantMembership();
  const tenantId = membership?.tenantId ?? "tenant_default";
  let branding: TenantBrandingSettings = DEFAULT_TENANT_BRANDING_SETTINGS;

  if (membership) {
    try {
      branding = await readTenantBrandingForTenant(tenantId);
    } catch {
      branding = DEFAULT_TENANT_BRANDING_SETTINGS;
    }
  }

  return (
    <html
      className={fonts}
      dir={getTextDirection(locale)}
      lang={locale}
      suppressHydrationWarning
    >
      <body>
        <TenantBrandingStyles branding={branding} />
        <Providers>{children}</Providers>
        <Toolbar />
      </body>
    </html>
  );
}
