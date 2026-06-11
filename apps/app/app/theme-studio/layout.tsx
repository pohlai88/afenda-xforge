import type { ReactElement, ReactNode } from "react";

import { ThemeStudioPreviewRoot } from "./_components/theme-studio-preview-root.tsx";
import { ThemeStudioShell } from "./_components/theme-studio-shell.tsx";

type ThemeStudioLayoutProps = {
  children: ReactNode;
};

export default function ThemeStudioLayout({
  children,
}: ThemeStudioLayoutProps): ReactElement {
  return (
    <ThemeStudioPreviewRoot>
      <ThemeStudioShell>{children}</ThemeStudioShell>
    </ThemeStudioPreviewRoot>
  );
}
