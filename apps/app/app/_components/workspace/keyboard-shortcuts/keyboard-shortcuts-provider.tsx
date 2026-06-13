"use client";

import { useSidebar } from "@repo/ui/components/ui/sidebar";
import type { ReactElement } from "react";
import { useCallback, useEffect } from "react";
import type { ShortcutActionId } from "../../../../lib/workspace-shortcuts/contract.ts";
import { GLOBAL_ALLOWED_IN_TEXT_ENTRY } from "../../../../lib/workspace-shortcuts/contract.ts";
import {
  isEditableTarget,
  normalizeKeyboardEvent,
  resolveActionForNormalizedKey,
  resolveActiveShortcutScopes,
} from "../../../../lib/workspace-shortcuts/normalize-shortcut.ts";
import { ORBIT_TRAIL_FOCUS_EVENT } from "../orbit-trail.ts";
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog.tsx";
import { ShortcutDeleteConfirmDialog } from "./shortcut-delete-confirm-dialog.tsx";
import { useWorkspaceShortcuts } from "./use-keyboard-shortcuts.tsx";
import { useShortcutCrudDispatch } from "./use-shortcut-crud-dispatch.ts";
import { WorkspaceCommandPalette } from "./workspace-command-palette.tsx";

const CRUD_ACTION_IDS = new Set<ShortcutActionId>([
  "crud.create",
  "crud.edit",
  "crud.save",
  "crud.delete",
  "crud.cancel",
]);

const handleWorkspaceShortcutAction = (
  actionId: ShortcutActionId,
  actions: {
    openHelp: () => void;
    setCommandOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    openLynx: () => void;
  }
): boolean => {
  switch (actionId) {
    case "workspace.commandSearch":
      actions.setCommandOpen(true);
      return true;
    case "workspace.newTodo":
      window.dispatchEvent(
        new CustomEvent(ORBIT_TRAIL_FOCUS_EVENT, {
          detail: { forceAdd: true },
        })
      );
      return true;
    case "workspace.newProject":
      window.dispatchEvent(
        new CustomEvent(ORBIT_TRAIL_FOCUS_EVENT, {
          detail: { focusProject: true },
        })
      );
      return true;
    case "workspace.openLynx":
      actions.openLynx();
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
  const openLynx = useCallback(() => {
    setCommandOpen(true);
  }, [setCommandOpen]);
  const { toggleSidebar } = useSidebar();
  const {
    confirmPendingDelete,
    deleteConfirmOpen,
    dispatchCrudAction,
    setDeleteConfirmOpen,
  } = useShortcutCrudDispatch();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (helpOpen || commandOpen || captureSuspended || deleteConfirmOpen) {
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
          openLynx,
          setCommandOpen,
          toggleSidebar,
        })
      ) {
        return;
      }

      if (CRUD_ACTION_IDS.has(actionId)) {
        dispatchCrudAction(actionId);
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [
    captureSuspended,
    commandOpen,
    deleteConfirmOpen,
    dispatchCrudAction,
    getFocusedTarget,
    helpOpen,
    openHelp,
    openLynx,
    payload.bindings,
    setCommandOpen,
    toggleSidebar,
  ]);

  return (
    <>
      <KeyboardShortcutsDialog onOpenChange={setHelpOpen} open={helpOpen} />
      <WorkspaceCommandPalette
        dispatchCrudAction={dispatchCrudAction}
        onOpenChange={setCommandOpen}
        onOpenHelp={openHelp}
        onToggleSidebar={toggleSidebar}
        open={commandOpen}
        payload={payload}
      />
      <ShortcutDeleteConfirmDialog
        onConfirm={confirmPendingDelete}
        onOpenChange={setDeleteConfirmOpen}
        open={deleteConfirmOpen}
      />
    </>
  );
}

export function WorkspaceShortcutsDispatcher(): ReactElement {
  return <WorkspaceShortcutsHost />;
}
