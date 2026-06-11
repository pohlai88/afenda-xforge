"use client";

import type { ReactElement, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  FocusedShortcutTarget,
  WorkspaceShortcutsPayload,
} from "../../../../lib/workspace-shortcuts/contract.ts";
import { WORKSPACE_KEYBOARD_SHORTCUTS_BROADCAST_CHANNEL } from "../../../../lib/workspace-shortcuts/contract.ts";
import { fetchWorkspaceShortcutsPayload } from "../../../../lib/workspace-shortcuts/fetch-shortcuts.client.ts";
import { resolveProductDefaults } from "../../../../lib/workspace-shortcuts/resolve-shortcuts.ts";

type WorkspaceShortcutsContextValue = {
  payload: WorkspaceShortcutsPayload;
  helpOpen: boolean;
  commandOpen: boolean;
  captureSuspended: boolean;
  openHelp: () => void;
  closeHelp: () => void;
  setHelpOpen: (open: boolean) => void;
  openCommand: () => void;
  closeCommand: () => void;
  setCommandOpen: (open: boolean) => void;
  setCaptureSuspended: (suspended: boolean) => void;
  setPayload: (payload: WorkspaceShortcutsPayload) => void;
  refreshPayload: () => Promise<void>;
  registerFocusedTarget: (target: FocusedShortcutTarget | null) => void;
  getFocusedTarget: () => FocusedShortcutTarget | null;
};

const WorkspaceShortcutsContext =
  createContext<WorkspaceShortcutsContextValue | null>(null);

export function WorkspaceShortcutsProvider({
  children,
  payload: initialPayload = resolveProductDefaults(),
}: {
  children: ReactNode;
  payload?: WorkspaceShortcutsPayload;
}): ReactElement {
  const [payload, setPayload] = useState(initialPayload);
  const [helpOpen, setHelpOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [captureSuspended, setCaptureSuspended] = useState(false);
  const focusedTargetRef = useRef<FocusedShortcutTarget | null>(null);

  useEffect(() => {
    setPayload(initialPayload);
  }, [initialPayload]);

  const refreshPayload = useCallback(async (): Promise<void> => {
    const nextPayload = await fetchWorkspaceShortcutsPayload();

    if (nextPayload) {
      setPayload(nextPayload);
    }
  }, []);

  useEffect(() => {
    const onFocus = (): void => {
      refreshPayload().catch(() => undefined);
    };

    window.addEventListener("focus", onFocus);

    if (typeof BroadcastChannel === "undefined") {
      return () => {
        window.removeEventListener("focus", onFocus);
      };
    }

    const channel = new BroadcastChannel(
      WORKSPACE_KEYBOARD_SHORTCUTS_BROADCAST_CHANNEL
    );

    channel.onmessage = (): void => {
      refreshPayload().catch(() => undefined);
    };

    return () => {
      window.removeEventListener("focus", onFocus);
      channel.close();
    };
  }, [refreshPayload]);

  const registerFocusedTarget = useCallback(
    (target: FocusedShortcutTarget | null) => {
      focusedTargetRef.current = target;
    },
    []
  );

  const getFocusedTarget = useCallback(() => focusedTargetRef.current, []);

  const openHelp = useCallback(() => setHelpOpen(true), []);
  const closeHelp = useCallback(() => setHelpOpen(false), []);
  const openCommand = useCallback(() => setCommandOpen(true), []);
  const closeCommand = useCallback(() => setCommandOpen(false), []);

  const value = useMemo<WorkspaceShortcutsContextValue>(
    () => ({
      payload,
      helpOpen,
      commandOpen,
      captureSuspended,
      openHelp,
      closeHelp,
      setHelpOpen,
      openCommand,
      closeCommand,
      setCommandOpen,
      setCaptureSuspended,
      setPayload,
      refreshPayload,
      registerFocusedTarget,
      getFocusedTarget,
    }),
    [
      captureSuspended,
      closeCommand,
      closeHelp,
      commandOpen,
      getFocusedTarget,
      helpOpen,
      openCommand,
      openHelp,
      payload,
      refreshPayload,
      registerFocusedTarget,
    ]
  );

  return (
    <WorkspaceShortcutsContext.Provider value={value}>
      {children}
    </WorkspaceShortcutsContext.Provider>
  );
}

export function useWorkspaceShortcuts(): WorkspaceShortcutsContextValue {
  const context = useContext(WorkspaceShortcutsContext);

  if (!context) {
    throw new Error(
      "useWorkspaceShortcuts must be used within WorkspaceShortcutsProvider."
    );
  }

  return context;
}

export function useOptionalWorkspaceShortcuts(): WorkspaceShortcutsContextValue | null {
  return useContext(WorkspaceShortcutsContext);
}

export function useRegisterFocusedShortcutTarget(
  target: FocusedShortcutTarget | null
): void {
  const { registerFocusedTarget } = useWorkspaceShortcuts();

  useEffect(() => {
    registerFocusedTarget(target);

    return () => {
      registerFocusedTarget(null);
    };
  }, [registerFocusedTarget, target]);
}

export type { ShortcutActionId } from "../../../../lib/workspace-shortcuts/contract.ts";
