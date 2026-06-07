import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { Providers } from "./providers";
import "./styles.css";

export const metadata: Metadata = createMetadata({
  title: "App",
  description: "XForge ERP application shell.",
});

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({
  children,
}: RootLayoutProps): ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
