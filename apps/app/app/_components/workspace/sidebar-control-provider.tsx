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
      // #region agent log
      fetch("http://127.0.0.1:7885/ingest/c6c3b106-1ea8-4293-8967-df2c1ea049e3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "b5a053",
        },
        body: JSON.stringify({
          sessionId: "b5a053",
          hypothesisId: "H-mode",
          location: "sidebar-control-provider.tsx:setMode",
          message: "sidebar mode changed",
          data: { storageKey, nextMode },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
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
  const { isMobile, open, setOpen } = useSidebar();

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7885/ingest/c6c3b106-1ea8-4293-8967-df2c1ea049e3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "b5a053",
      },
      body: JSON.stringify({
        sessionId: "b5a053",
        hypothesisId: "H-sync",
        location: "sidebar-control-provider.tsx:syncEffect",
        message: "sync open from mode",
        data: { containerSelector, mode, isMobile, openBefore: open },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (isMobile) {
      return;
    }

    if (mode === "expanded") {
      setOpen(true);
      return;
    }

    setOpen(false);
  }, [isMobile, mode, setOpen]);

  useEffect(() => {
    if (isMobile || mode !== "hover") {
      return;
    }

    const sidebarContainer = document.querySelector(containerSelector);
    const matchCount = document.querySelectorAll(containerSelector).length;

    // #region agent log
    fetch("http://127.0.0.1:7885/ingest/c6c3b106-1ea8-4293-8967-df2c1ea049e3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "b5a053",
      },
      body: JSON.stringify({
        sessionId: "b5a053",
        hypothesisId: "H-selector",
        location: "sidebar-control-provider.tsx:hoverEffect",
        message: "hover listener attach attempt",
        data: {
          containerSelector,
          matchCount,
          found: sidebarContainer instanceof HTMLElement,
          tagName:
            sidebarContainer instanceof HTMLElement
              ? sidebarContainer.tagName
              : null,
          slot:
            sidebarContainer instanceof HTMLElement
              ? sidebarContainer.getAttribute("data-slot")
              : null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (!(sidebarContainer instanceof HTMLElement)) {
      return;
    }

    const expand = (): void => {
      // #region agent log
      fetch("http://127.0.0.1:7885/ingest/c6c3b106-1ea8-4293-8967-df2c1ea049e3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "b5a053",
        },
        body: JSON.stringify({
          sessionId: "b5a053",
          hypothesisId: "H-hover",
          location: "sidebar-control-provider.tsx:mouseenter",
          message: "hover expand fired",
          data: { containerSelector },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      setOpen(true);
    };

    const collapse = (): void => {
      // #region agent log
      fetch("http://127.0.0.1:7885/ingest/c6c3b106-1ea8-4293-8967-df2c1ea049e3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "b5a053",
        },
        body: JSON.stringify({
          sessionId: "b5a053",
          hypothesisId: "H-hover",
          location: "sidebar-control-provider.tsx:mouseleave",
          message: "hover collapse fired",
          data: { containerSelector },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
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
