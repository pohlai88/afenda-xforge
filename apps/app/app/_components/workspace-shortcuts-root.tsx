"use client";

import type { ReactElement, ReactNode } from "react";
import type { WorkspaceShortcutsPayload } from "../../lib/workspace-shortcuts/contract.ts";
import { WorkspaceShortcutsProvider } from "./workspace/keyboard-shortcuts/use-keyboard-shortcuts.tsx";

export function WorkspaceShortcutsRoot({
  children,
  payload,
}: {
  children: ReactNode;
  payload: WorkspaceShortcutsPayload;
}): ReactElement {
  return (
    <WorkspaceShortcutsProvider payload={payload}>
      {children}
    </WorkspaceShortcutsProvider>
  );
}
