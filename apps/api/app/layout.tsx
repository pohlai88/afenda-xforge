import { fonts } from "@repo/design-system";
import type { ReactElement, ReactNode } from "react";
import "./styles.css";

type RootLayoutProps = {
  children: ReactNode;
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
