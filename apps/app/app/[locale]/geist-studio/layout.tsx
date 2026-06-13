import type { ReactElement } from "react";

import { cn } from "@repo/ui/lib/utils";

import {
  geistStudioMono,
  geistStudioSans,
} from "./_components/geist-studio-fonts.ts";
import { GeistStudioPreviewRoot } from "./_components/geist-studio-preview-root.tsx";

type GeistStudioLayoutProps = {
  children: React.ReactNode;
};

export default function GeistStudioLayout({
  children,
}: GeistStudioLayoutProps): ReactElement {
  return (
    <GeistStudioPreviewRoot
      className={cn(
        geistStudioSans.className,
        geistStudioMono.variable,
        "min-h-dvh [&_.font-mono]:font-[family-name:var(--font-geist-mono)]"
      )}
    >
      {children}
    </GeistStudioPreviewRoot>
  );
}
