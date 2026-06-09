import { Toolbar } from "@repo/feature-flags/components/toolbar";
import {
  getTextDirection,
  resolveXforgeLocaleFromHeaders,
} from "@repo/internationalization";
import { createAppSitePreset } from "@repo/seo/presets";
import { fonts } from "@repo/ui";
import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactElement, ReactNode } from "react";
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

  return (
    <html
      className={fonts}
      dir={getTextDirection(locale)}
      lang={locale}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
        <Toolbar />
      </body>
    </html>
  );
}
