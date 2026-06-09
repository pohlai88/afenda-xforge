import { fonts } from "@repo/ui";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { Providers } from "./providers";
import "./styles.css";

export const metadata: Metadata = createMetadata({
  title: "XForge Web",
  description: "Public XForge web surface.",
  site: {
    url: process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3001",
  },
});

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({
  children,
}: RootLayoutProps): ReactElement {
  return (
    <html className={fonts} lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
