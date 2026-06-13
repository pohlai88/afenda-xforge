"use client";

import type { ReactElement } from "react";
import { WorkspaceAuditEvidence7W1HDetail } from "./workspace-audit-evidence-7w1h.tsx";
import { useWorkspaceAuditEvidence } from "./workspace-audit-evidence-context.tsx";
import { WorkspaceAuditEvidencePanelChrome } from "./workspace-audit-evidence-panel-chrome.tsx";

export function WorkspaceAuditEvidenceRightPanel(): ReactElement {
  const { closeSheet, selectedEvent } = useWorkspaceAuditEvidence();

  return (
    <section
      className="flex h-full min-h-0 flex-col border-border border-s bg-background"
      data-slot="workspace-audit-right-panel"
    >
      <WorkspaceAuditEvidencePanelChrome
        description={
          selectedEvent
            ? `${selectedEvent.action} · ${selectedEvent.outcome}`
            : "Select an event from the activity stream"
        }
        onCollapse={() => closeSheet("right")}
        panel="right"
        title="7W1H evidence detail"
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {selectedEvent ? (
          <WorkspaceAuditEvidence7W1HDetail event={selectedEvent} />
        ) : (
          <p className="text-muted-foreground text-xs">
            Select an event from the activity stream to inspect governed evidence
            while keeping the main surface and other panels open.
          </p>
        )}
      </div>
    </section>
  );
}
