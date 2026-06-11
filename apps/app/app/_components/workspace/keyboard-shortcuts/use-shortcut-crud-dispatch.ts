"use client";

import { toast } from "@repo/ui";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import type { ShortcutActionId } from "../../../../lib/workspace-shortcuts/contract.ts";
import { useWorkspaceShortcuts } from "./use-keyboard-shortcuts.tsx";

export function useShortcutCrudDispatch(): {
  cancelPendingDelete: () => void;
  confirmPendingDelete: () => void;
  deleteConfirmOpen: boolean;
  dispatchCrudAction: (actionId: ShortcutActionId) => void;
  setDeleteConfirmOpen: (open: boolean) => void;
} {
  const t = useTranslations("workspace.keyboardShortcuts");
  const { getFocusedTarget } = useWorkspaceShortcuts();
  const [pendingDeleteHandler, setPendingDeleteHandler] = useState<
    (() => void) | null
  >(null);

  const dispatchCrudAction = useCallback(
    (actionId: ShortcutActionId): void => {
      const handler = getFocusedTarget()?.handlers[actionId];

      if (handler) {
        if (actionId === "crud.delete") {
          setPendingDeleteHandler(() => handler);
          return;
        }

        handler();
        return;
      }

      if (actionId === "crud.delete") {
        toast.error(t("crud.noFocusedRecord"));
        return;
      }

      toast.message(t("crud.noFocusedRecord"));
    },
    [getFocusedTarget, t]
  );

  const confirmPendingDelete = useCallback((): void => {
    pendingDeleteHandler?.();
    setPendingDeleteHandler(null);
  }, [pendingDeleteHandler]);

  const cancelPendingDelete = useCallback((): void => {
    setPendingDeleteHandler(null);
  }, []);

  const setDeleteConfirmOpen = useCallback(
    (open: boolean): void => {
      if (!open) {
        cancelPendingDelete();
      }
    },
    [cancelPendingDelete]
  );

  return {
    cancelPendingDelete,
    confirmPendingDelete,
    deleteConfirmOpen: pendingDeleteHandler !== null,
    dispatchCrudAction,
    setDeleteConfirmOpen,
  };
}
