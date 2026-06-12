import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";

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
  return children as ReactElement;
}
