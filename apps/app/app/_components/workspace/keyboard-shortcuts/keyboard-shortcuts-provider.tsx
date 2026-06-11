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
const CRUD_ACTION_IDS = new Set<ShortcutActionId>([
  "crud.create",
  "crud.edit",
  "crud.save",
  "crud.delete",
  "crud.cancel",
]);

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

const handleWorkspaceShortcutAction = (
  actionId: ShortcutActionId,
  actions: {
    openHelp: () => void;
    setCommandOpen: (open: boolean) => void;
    toggleSidebar: () => void;
  }
): boolean => {
  switch (actionId) {
    case "workspace.commandSearch":
      actions.setCommandOpen(true);
      return true;
    case "workspace.openShortcutHelp":
      actions.openHelp();
      return true;
    case "workspace.toggleSidebar":
      actions.toggleSidebar();
      return true;
    default:
      return false;
  }
};

const handleCrudShortcutAction = (
  actionId: ShortcutActionId,
  handler: (() => void) | undefined
): void => {
  if (actionId === "crud.delete" && handler) {
    // biome-ignore lint/suspicious/noAlert: native confirm until governed delete dialog exists
    const confirmed = window.confirm(
      "Delete the focused record? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }
  }

  dispatchCrudAction(actionId, handler);
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

      if (
        handleWorkspaceShortcutAction(actionId, {
          openHelp,
          setCommandOpen,
          toggleSidebar,
        })
      ) {
        return;
      }

      if (CRUD_ACTION_IDS.has(actionId)) {
        const handler = focusedTarget?.handlers[actionId];
        handleCrudShortcutAction(actionId, handler);
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
