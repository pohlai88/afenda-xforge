import type { ReactElement, ReactNode } from "react";

import { ThemeStudioPreviewRoot } from "./_components/theme-studio-preview-root.tsx";
import { ThemeStudioWorkspace } from "./_components/theme-studio-workspace.tsx";

type ThemeStudioLayoutProps = {
  children: ReactNode;
};

export default function ThemeStudioLayout({
  children,
}: ThemeStudioLayoutProps): ReactElement {
  return (
    <ThemeStudioPreviewRoot>
      <ThemeStudioWorkspace>{children}</ThemeStudioWorkspace>
    </ThemeStudioPreviewRoot>
  );
}
