"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  usePanelRef,
} from "@repo/ui/components/ui/resizable";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { WorkspaceAuditEvidenceSheet } from "./workspace-audit-evidence.contract.ts";
import { WorkspaceAuditEvidenceBottomPanel } from "./workspace-audit-evidence-bottom-panel.tsx";
import { useWorkspaceAuditEvidence } from "./workspace-audit-evidence-context.tsx";
import {
  AUDIT_EVIDENCE_BOTTOM_DEFAULT_SIZE,
  AUDIT_EVIDENCE_BOTTOM_PANEL_ID,
  AUDIT_EVIDENCE_RIGHT_DEFAULT_SIZE,
  AUDIT_EVIDENCE_RIGHT_PANEL_ID,
} from "./workspace-audit-evidence-panel.constants.ts";
import { WorkspaceAuditEvidenceRightPanel } from "./workspace-audit-evidence-right-panel.tsx";

const MOBILE_AUDIT_EVIDENCE_MEDIA_QUERY = "(max-width: 767px)";

function useIsMobileAuditEvidenceViewport(): boolean {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(MOBILE_AUDIT_EVIDENCE_MEDIA_QUERY).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_AUDIT_EVIDENCE_MEDIA_QUERY);
    const update = (): void => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function useSyncPanelVisibility(
  open: boolean,
  panelRef: ReturnType<typeof usePanelRef>
): void {
  const wasOpenRef = useRef(open);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    if (open) {
      panel.expand();
    } else if (wasOpenRef.current) {
      panel.collapse();
    }

    wasOpenRef.current = open;
  }, [open, panelRef]);
}

function resolveVisibleMobileSheet({
  bottomOpen,
  rightOpen,
}: {
  bottomOpen: boolean;
  rightOpen: boolean;
}): WorkspaceAuditEvidenceSheet | null {
  if (rightOpen) {
    return "right";
  }

  if (bottomOpen) {
    return "bottom";
  }

  return null;
}

function WorkspaceAuditEvidenceMobileSheetLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const { bottomOpen, closeSheet, rightOpen } = useWorkspaceAuditEvidence();
  const visibleSheet = resolveVisibleMobileSheet({ bottomOpen, rightOpen });
  const isRightSheet = visibleSheet === "right";

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 overflow-hidden"
      data-slot="workspace-audit-sheet-layout"
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
      <Sheet
        onOpenChange={(open) => {
          if (!(open || visibleSheet === null)) {
            closeSheet(visibleSheet);
          }
        }}
        open={visibleSheet !== null}
      >
        {visibleSheet ? (
          <SheetContent
            className={
              isRightSheet
                ? "w-[min(100vw,28rem)] gap-0 p-0"
                : "max-h-[80svh] min-h-[40svh] gap-0 p-0"
            }
            showCloseButton={false}
            side={isRightSheet ? "right" : "bottom"}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>
                {isRightSheet ? "Audit evidence detail" : "Audit activity"}
              </SheetTitle>
              <SheetDescription>
                {isRightSheet
                  ? "Inspect selected governed audit evidence."
                  : "Review governed audit activity for the active scope."}
              </SheetDescription>
            </SheetHeader>
            {isRightSheet ? (
              <WorkspaceAuditEvidenceRightPanel />
            ) : (
              <WorkspaceAuditEvidenceBottomPanel />
            )}
          </SheetContent>
        ) : null}
      </Sheet>
    </div>
  );
}

export function WorkspaceAuditEvidenceDockedLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const { bottomOpen, closeSheet, rightOpen } = useWorkspaceAuditEvidence();
  const isMobile = useIsMobileAuditEvidenceViewport();
  const bottomPanelRef = usePanelRef();
  const rightPanelRef = usePanelRef();

  useSyncPanelVisibility(bottomOpen, bottomPanelRef);
  useSyncPanelVisibility(rightOpen, rightPanelRef);

  if (isMobile) {
    return (
      <WorkspaceAuditEvidenceMobileSheetLayout>
        {children}
      </WorkspaceAuditEvidenceMobileSheetLayout>
    );
  }

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 overflow-hidden"
      data-slot="workspace-audit-docked-layout"
    >
      <ResizablePanelGroup
        className="min-h-0 min-w-0 flex-1"
        orientation="vertical"
      >
        <ResizablePanel
          className="min-h-0"
          defaultSize={100 - AUDIT_EVIDENCE_BOTTOM_DEFAULT_SIZE}
          id="workspace-audit-main-stack"
          minSize={35}
        >
          <ResizablePanelGroup
            className="min-h-0 min-w-0 flex-1"
            orientation="horizontal"
          >
            <ResizablePanel
              className="min-w-0"
              defaultSize={100 - AUDIT_EVIDENCE_RIGHT_DEFAULT_SIZE}
              id="workspace-audit-main"
              minSize={40}
            >
              <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
                {children}
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel
              className="min-w-0"
              collapsedSize={0}
              collapsible
              defaultSize={0}
              id={AUDIT_EVIDENCE_RIGHT_PANEL_ID}
              maxSize={45}
              minSize={18}
              onResize={(size) => {
                if (size.asPercentage <= 0.5 && rightOpen) {
                  closeSheet("right");
                }
              }}
              panelRef={rightPanelRef}
            >
              <WorkspaceAuditEvidenceRightPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          className="min-h-0"
          collapsedSize={0}
          collapsible
          defaultSize={0}
          id={AUDIT_EVIDENCE_BOTTOM_PANEL_ID}
          maxSize={55}
          minSize={16}
          onResize={(size) => {
            if (size.asPercentage <= 0.5 && bottomOpen) {
              closeSheet("bottom");
            }
          }}
          panelRef={bottomPanelRef}
        >
          <WorkspaceAuditEvidenceBottomPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
