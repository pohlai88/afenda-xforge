import type { ReactElement, ReactNode } from "react";

import { ThemeStudioLayoutShell } from "./_components/theme-studio-layout-shell.tsx";
import { ThemeStudioPreviewRoot } from "./_components/theme-studio-preview-root.tsx";

type ThemeStudioLayoutProps = {
  children: ReactNode;
};

export default function ThemeStudioLayout({
  children,
}: ThemeStudioLayoutProps): ReactElement {
  return (
    <ThemeStudioPreviewRoot>
      <ThemeStudioLayoutShell>{children}</ThemeStudioLayoutShell>
    </ThemeStudioPreviewRoot>
  );
}
