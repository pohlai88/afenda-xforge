import { Toolbar } from "@repo/feature-flags/components/toolbar";
import {
  getTextDirection,
  resolveXforgeLocaleFromHeaders,
} from "@repo/internationalization";
import { createMetadata } from "@repo/seo/metadata";
import { fonts } from "@repo/ui";
import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactElement, ReactNode } from "react";
import { ensureAppBootstrap } from "./bootstrap";
import { Providers } from "./providers";
import "./styles.css";

export const metadata: Metadata = createMetadata({
  title: "App",
  description: "XForge ERP application shell.",
  site: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  },
});

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
