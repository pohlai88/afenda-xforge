"use client";

import { Button } from "@repo/ui";
import Link from "next/link";
import type { ReactElement } from "react";
import { useWorkspaceAuditEvidence } from "./workspace-audit-evidence-context.tsx";
import { WorkspaceAuditEvidencePanelChrome } from "./workspace-audit-evidence-panel-chrome.tsx";
import { WorkspaceAuditEvidenceStreamTable } from "./workspace-audit-evidence-stream-table.tsx";

export function WorkspaceAuditEvidenceBottomPanel(): ReactElement {
  const {
    closeSheet,
    error,
    events,
    loading,
    refresh,
    selectEvent,
    selectedEventId,
    setScope,
    scope,
    total,
  } = useWorkspaceAuditEvidence();

  const scopeLabel = [scope.module, scope.targetId].filter(Boolean).join(" · ");

  return (
    <section
      className="flex h-full min-h-0 flex-col bg-background"
      data-slot="workspace-audit-bottom-panel"
    >
      <WorkspaceAuditEvidencePanelChrome
        actions={
          <>
            <Button
              onClick={() => setScope({})}
              size="sm"
              type="button"
              variant="ghost"
            >
              Clear scope
            </Button>
            <Button asChild size="sm" type="button" variant="outline">
              <Link href="/audit">Open full audit</Link>
            </Button>
          </>
        }
        description={
          scopeLabel
            ? `Scoped · ${scopeLabel} · ${events.length} of ${total}`
            : `Showing ${events.length} of ${total} governed events`
        }
        onCollapse={() => closeSheet("bottom")}
        panel="bottom"
        title="Audit activity"
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 py-3">
        {loading ? (
          <p className="text-muted-foreground text-xs">Loading audit evidence…</p>
        ) : null}
        {error ? (
          <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-destructive text-xs">{error}</p>
            <Button onClick={refresh} size="sm" type="button" variant="outline">
              Retry
            </Button>
          </div>
        ) : null}
        {!loading && !error && events.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            No governed audit events match this screen scope yet.
          </p>
        ) : null}
        {!error && events.length > 0 ? (
          <WorkspaceAuditEvidenceStreamTable
            events={events}
            onSelect={selectEvent}
            selectedEventId={selectedEventId}
          />
        ) : null}
      </div>
    </section>
  );
}
