import { getActiveTenantMembership } from "@repo/auth/server";
import type { TenantBrandingSettings } from "@repo/design-system";
import {
  DEFAULT_TENANT_BRANDING_SETTINGS,
  mergeEffectiveBranding,
} from "@repo/design-system";
import type { ColorModePreference } from "@repo/design-system/contracts/user-branding.contract";
import { Toolbar } from "@repo/feature-flags/components/toolbar";
import { readTenantBrandingForTenant } from "@repo/features-system-admin-control-plane/server";
import { getTextDirection } from "@repo/internationalization";
import { createAppSitePreset } from "@repo/seo/presets";
import { fonts } from "@repo/ui";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { routing } from "@/i18n/routing";
import { readUserAppearancePreferences } from "../../lib/user-appearance/repository.server";
import { TenantBrandingStyles } from "../_components/tenant-branding-styles";
import { ensureAppBootstrap } from "../bootstrap";
import { Providers } from "../providers";
import "../styles.css";

const appSitePreset = createAppSitePreset(
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
);

export const metadata: Metadata = appSitePreset.metadata;

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps): Promise<ReactElement> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  ensureAppBootstrap();

  const messages = await getMessages();
  const membership = await getActiveTenantMembership();
  const tenantId = membership?.tenantId ?? "tenant_default";
  let tenantBranding: TenantBrandingSettings = DEFAULT_TENANT_BRANDING_SETTINGS;
  let branding: TenantBrandingSettings = DEFAULT_TENANT_BRANDING_SETTINGS;
  let initialColorMode: ColorModePreference = "system";

  if (membership) {
    try {
      tenantBranding = await readTenantBrandingForTenant(tenantId);
    } catch {
      tenantBranding = DEFAULT_TENANT_BRANDING_SETTINGS;
    }

    try {
      const userPreferences = await readUserAppearancePreferences(
        membership.tenantId,
        membership.userId
      );
      branding = mergeEffectiveBranding(tenantBranding, userPreferences);
      initialColorMode = userPreferences.colorMode ?? "system";
    } catch {
      branding = tenantBranding;
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
        <NextIntlClientProvider messages={messages}>
          <Providers defaultTheme={initialColorMode}>{children}</Providers>
        </NextIntlClientProvider>
        <Toolbar />
      </body>
    </html>
  );
}
