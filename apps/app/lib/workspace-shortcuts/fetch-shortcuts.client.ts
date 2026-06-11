import type { WorkspaceShortcutsPayload } from "./contract.ts";

export const fetchWorkspaceShortcutsPayload =
  async (): Promise<WorkspaceShortcutsPayload | null> => {
    const response = await fetch("/api/me/keyboard-shortcuts", {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as WorkspaceShortcutsPayload;
  };
