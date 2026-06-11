"use client";

import { toast } from "@repo/ui";
import { useSidebar } from "@repo/ui/components/ui/sidebar";
import type { ReactElement } from "react";
import { useEffect } from "react";
import type { ShortcutActionId } from "../../../../lib/workspace-shortcuts/contract.ts";
import { GLOBAL_ALLOWED_IN_TEXT_ENTRY } from "../../../../lib/workspace-shortcuts/contract.ts";
import {
  isEditableTarget,
  normalizeKeyboardEvent,
  resolveActionForNormalizedKey,
  resolveActiveShortcutScopes,
} from "../../../../lib/workspace-shortcuts/normalize-shortcut.ts";
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog.tsx";
import { useWorkspaceShortcuts } from "./use-keyboard-shortcuts.tsx";
import { WorkspaceCommandPalette } from "./workspace-command-palette.tsx";

const CRUD_FALLBACK_MESSAGE = "No focused record available";

const dispatchCrudAction = (
  actionId: ShortcutActionId,
  handler: (() => void) | undefined
): void => {
  if (handler) {
    handler();
    return;
  }

  if (actionId === "crud.delete") {
    toast.error(CRUD_FALLBACK_MESSAGE);
    return;
  }

  toast.message(CRUD_FALLBACK_MESSAGE);
};

export function WorkspaceShortcutsHost(): ReactElement {
  const {
    payload,
    helpOpen,
    commandOpen,
    captureSuspended,
    setHelpOpen,
    setCommandOpen,
    openHelp,
    getFocusedTarget,
  } = useWorkspaceShortcuts();
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (helpOpen || commandOpen || captureSuspended) {
        return;
      }

      const normalized = normalizeKeyboardEvent(event);
      const focusedTarget = getFocusedTarget();
      const activeScopes = resolveActiveShortcutScopes(focusedTarget);
      const actionId = resolveActionForNormalizedKey(
        normalized,
        payload.bindings,
        activeScopes
      );

      if (!actionId) {
        return;
      }

      const editable = isEditableTarget(event.target);
      const allowedInTextEntry = GLOBAL_ALLOWED_IN_TEXT_ENTRY.has(actionId);

      if (editable && !allowedInTextEntry) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      switch (actionId) {
        case "workspace.commandSearch":
          setCommandOpen(true);
          return;
        case "workspace.openShortcutHelp":
          openHelp();
          return;
        case "workspace.toggleSidebar":
          toggleSidebar();
          return;
        case "crud.create":
        case "crud.edit":
        case "crud.save":
        case "crud.delete":
        case "crud.cancel": {
          const handler = focusedTarget?.handlers[actionId];

          if (actionId === "crud.delete" && handler) {
            const confirmed = window.confirm(
              "Delete the focused record? This action cannot be undone."
            );

            if (!confirmed) {
              return;
            }
          }

          dispatchCrudAction(actionId, handler);
          return;
        }
        default:
          return;
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [
    captureSuspended,
    commandOpen,
    getFocusedTarget,
    helpOpen,
    openHelp,
    payload.bindings,
    setCommandOpen,
    toggleSidebar,
  ]);

  return (
    <>
      <KeyboardShortcutsDialog onOpenChange={setHelpOpen} open={helpOpen} />
      <WorkspaceCommandPalette
        onOpenChange={setCommandOpen}
        onOpenHelp={openHelp}
        open={commandOpen}
        payload={payload}
      />
    </>
  );
}

export function WorkspaceShortcutsDispatcher(): ReactElement {
  return <WorkspaceShortcutsHost />;
}
