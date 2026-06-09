import { fonts } from "@repo/ui";
import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { Providers } from "./providers";
import { webLayoutMetadata } from "./seo";
import "./styles.css";

export const metadata: Metadata = webLayoutMetadata;

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
