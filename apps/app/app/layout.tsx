import type { ReactElement, ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({
  children,
}: RootLayoutProps): ReactElement {
  return children as ReactElement;
}
