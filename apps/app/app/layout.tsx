import {
  getTextDirection,
  resolveXforgeLocaleFromHeaders,
} from "@repo/internationalization";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactElement, ReactNode } from "react";
import { ensureAppBootstrap } from "./bootstrap";
import { Providers } from "./providers";
import "./styles.css";

export const metadata: Metadata = createMetadata({
  title: "App",
  description: "XForge ERP application shell.",
});

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({
  children,
}: RootLayoutProps): Promise<ReactElement> {
  await ensureAppBootstrap();
  const requestHeaders = await headers();
  const locale = resolveXforgeLocaleFromHeaders(requestHeaders);

  return (
    <html dir={getTextDirection(locale)} lang={locale} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
