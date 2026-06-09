import { fonts } from "@repo/ui";
import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import "./styles.css";

type RootLayoutProps = {
  children: ReactNode;
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: RootLayoutProps): ReactElement {
  return (
    <html className={fonts} lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
