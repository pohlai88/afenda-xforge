"use client";

import { Button } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { PanelBottomClose, PanelRightClose } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { WORKSPACE_METADATA_LABEL_CLASS } from "../workspace-shell.classes.ts";
import type { WorkspaceAuditEvidenceSheet } from "./workspace-audit-evidence.contract.ts";

export function WorkspaceAuditEvidencePanelChrome({
  actions,
  description,
  onCollapse,
  panel,
  title,
}: {
  actions?: ReactNode;
  description?: string;
  onCollapse: () => void;
  panel: WorkspaceAuditEvidenceSheet;
  title: string;
}): ReactElement {
  const CollapseIcon = panel === "bottom" ? PanelBottomClose : PanelRightClose;

  return (
    <div
      className="flex shrink-0 items-center justify-between gap-3 border-border border-b bg-muted/20 px-3 py-2"
      data-slot={`workspace-audit-${panel}-panel-header`}
    >
      <div className="min-w-0">
        <p className={WORKSPACE_METADATA_LABEL_CLASS}>{title}</p>
        {description ? (
          <p className="truncate text-[10px] text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {actions}
        <Button
          aria-label={`Collapse ${title}`}
          className={cn("size-7 shrink-0")}
          onClick={onCollapse}
          size="icon"
          type="button"
          variant="ghost"
        >
          <CollapseIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
