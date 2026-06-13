"use client";

import type { ReactElement, ReactNode } from "react";

import { GeistStudioScope } from "./geist-studio-scope.tsx";

type GeistStudioPreviewRootProps = {
  children: ReactNode;
  className?: string;
};

export function GeistStudioPreviewRoot({
  children,
  className,
}: GeistStudioPreviewRootProps): ReactElement {
  return <GeistStudioScope className={className}>{children}</GeistStudioScope>;
}
