"use client";

import { useSidebar } from "@repo/ui/components/ui/sidebar";
import type { ReactElement, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_SIDEBAR_BEHAVIOR_MODE,
  persistSidebarBehaviorMode,
  readSidebarBehaviorMode,
  type SidebarBehaviorMode,
} from "./sidebar-behavior.constants.ts";

type SidebarControlContextValue = {
  mode: SidebarBehaviorMode;
  setMode: (mode: SidebarBehaviorMode) => void;
};

const SidebarControlContext = createContext<SidebarControlContextValue | null>(
  null
);

export function useSidebarControl(): SidebarControlContextValue {
  const context = useContext(SidebarControlContext);

  if (!context) {
    throw new Error(
      "useSidebarControl must be used within SidebarControlProvider."
    );
  }

  return context;
}

export function SidebarControlProvider({
  children,
  storageKey,
}: {
  children: ReactNode;
  storageKey: string;
}): ReactElement {
  const [mode, setModeState] = useState<SidebarBehaviorMode>(
    DEFAULT_SIDEBAR_BEHAVIOR_MODE
  );

  useEffect(() => {
    setModeState(readSidebarBehaviorMode(storageKey));
  }, [storageKey]);

  const setMode = useCallback(
    (nextMode: SidebarBehaviorMode) => {
      setModeState(nextMode);
      persistSidebarBehaviorMode(storageKey, nextMode);
    },
    [storageKey]
  );

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <SidebarControlContext.Provider value={value}>
      {children}
    </SidebarControlContext.Provider>
  );
}

type SidebarHoverControllerProps = {
  /** CSS selector for the sidebar container to attach hover listeners. */
  containerSelector: string;
};

export function SidebarHoverController({
  containerSelector,
}: SidebarHoverControllerProps): null {
  const { mode } = useSidebarControl();
  const { isMobile, setOpen } = useSidebar();

  useEffect(() => {
    if (isMobile) {
      return;
    }

    if (mode === "expanded") {
      setOpen(true);
      return;
    }

    if (mode === "collapsed" || mode === "hover") {
      setOpen(false);
    }
  }, [isMobile, mode]);

  useEffect(() => {
    if (isMobile || mode !== "hover") {
      return;
    }

    const sidebarContainer = document.querySelector(containerSelector);

    if (!(sidebarContainer instanceof HTMLElement)) {
      return;
    }

    const expand = (): void => {
      setOpen(true);
    };

    const collapse = (): void => {
      setOpen(false);
    };

    sidebarContainer.addEventListener("mouseenter", expand);
    sidebarContainer.addEventListener("mouseleave", collapse);

    return () => {
      sidebarContainer.removeEventListener("mouseenter", expand);
      sidebarContainer.removeEventListener("mouseleave", collapse);
    };
  }, [containerSelector, isMobile, mode, setOpen]);

  return null;
}
