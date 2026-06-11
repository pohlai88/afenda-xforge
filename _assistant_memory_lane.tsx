"use client";

import { ChevronDown, Plus } from "lucide-react";
import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "../../../lib/utils";
import { Button } from "../../ui-shadcn/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui-shadcn/collapsible";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui-shadcn/dialog";
import { Textarea } from "../../ui-shadcn/textarea";
import {
  parseWorkspaceMemoryLaneCapture,
  WORKSPACE_MEMORY_LANE_CAPTURE_PLACEHOLDER,
} from "./workspace-memory-lane.capture.ts";
import type {
  WorkspaceMemoryLaneAddLabelInput,
  WorkspaceMemoryLaneAddTaskInput,
  WorkspaceMemoryLaneTag,
  WorkspaceMemoryLaneTagColorId,
} from "./workspace-memory-lane.types.ts";
import { formatWorkspaceOrbitCapturePreview } from "./workspace-orbit-capture.ts";
import {
  WORKSPACE_ORBIT_CREATE_SECTION,
  WORKSPACE_ORBIT_ICON,
  WORKSPACE_ORBIT_LABEL_DOT,
  WORKSPACE_ORBIT_LABEL_SWATCHES,
  WORKSPACE_ORBIT_LABELS_SECTION,
  WORKSPACE_ORBIT_TITLE,
} from "./workspace-orbit.constants.ts";
import {
  computeWorkspaceOrbitLoad,
  workspaceOrbitLoadBarClass,
  type WorkspaceOrbitLoad,
  type WorkspaceOrbitLoadInput,
} from "./workspace-orbit.load.ts";
import {
  WORKSPACE_SHELL_SPACE,
  WORKSPACE_SHELL_SURFACE,
  WORKSPACE_SHELL_TYPE,
} from "./workspace-shell.typography.ts";

export {
  parseWorkspaceMemoryLaneCapture,
  WORKSPACE_MEMORY_LANE_CAPTURE_PLACEHOLDER,
} from "./workspace-memory-lane.capture.ts";
export {
  WORKSPACE_ORBIT_CREATE_SECTION,
  WORKSPACE_ORBIT_DEFAULT_CAPACITY,
  WORKSPACE_ORBIT_ICON,
  WORKSPACE_ORBIT_LABEL_DOT,
  WORKSPACE_ORBIT_LABEL_SWATCHES,
  WORKSPACE_ORBIT_LABELS_SECTION,
  WORKSPACE_ORBIT_TITLE,
} from "./workspace-orbit.constants.ts";
export { formatWorkspaceOrbitCapturePreview } from "./workspace-orbit-capture.ts";
export {
  computeWorkspaceOrbitLoad,
  workspaceOrbitLoadBarClass,
  type WorkspaceOrbitLoad,
  type WorkspaceOrbitLoadInput,
  type WorkspaceOrbitLoadLevel,
} from "./workspace-orbit.load.ts";

/** @deprecated Use WORKSPACE_ORBIT_LABEL_SWATCHES */
export const WORKSPACE_MEMORY_LANE_TAG_SWATCHES = WORKSPACE_ORBIT_LABEL_SWATCHES;

export type WorkspaceMemoryLaneProps = {
  capturePlaceholder?: string;
  className?: string;
  defaultOpen?: boolean;
  labels?: readonly WorkspaceMemoryLaneTag[];
  labelsLabel?: string;
  orbitLoad?: WorkspaceOrbitLoad;
  orbitLoadInput?: WorkspaceOrbitLoadInput;
  onAddLabel?: (input: WorkspaceMemoryLaneAddLabelInput) => void;
  onAddTask?: (input: WorkspaceMemoryLaneAddTaskInput) => void;
  orbitTitle?: string;
  /** @deprecated Use `labels` */
  tags?: readonly WorkspaceMemoryLaneTag[];
  /** @deprecated Use `labelsLabel` */
  tagsLabel?: string;
};

function WorkspaceOrbitLoadBar({
  load,
}: {
  load: WorkspaceOrbitLoad;
}): ReactElement {
  return (
    <div className="space-y-1.5" data-slot="workspace-orbit-load">
      <div className="flex items-center justify-between gap-2">
        <span className={WORKSPACE_SHELL_TYPE.navMeta}>{load.statusLabel}</span>
        <span className={WORKSPACE_SHELL_TYPE.navMeta}>
          {load.openCount} open
          {load.urgentCount > 0 ? ` · ${load.urgentCount} urgent` : ""}
        </span>
      </div>
      <div
        aria-label={`Orbit load ${load.score} percent`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={load.score}
        className={cn(
          "h-1 overflow-hidden rounded-full",
          WORKSPACE_SHELL_SURFACE.orbitTrack
        )}
        role="progressbar"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300 ease-out",
            workspaceOrbitLoadBarClass(load.level)
          )}
          style={{ width: `${load.score}%` }}
        />
      </div>
    </div>
  );
}

export function WorkspaceMemoryLane({
  capturePlaceholder = WORKSPACE_MEMORY_LANE_CAPTURE_PLACEHOLDER,
  className,
  defaultOpen = true,
  labels: labelsProp,
  labelsLabel = WORKSPACE_ORBIT_LABELS_SECTION,
  orbitLoad,
  orbitLoadInput,
  onAddLabel,
  onAddTask,
  orbitTitle = WORKSPACE_ORBIT_TITLE,
  tags,
  tagsLabel,
}: WorkspaceMemoryLaneProps): ReactElement {
  const labels = labelsProp ?? tags ?? [];
  const resolvedLabelsLabel = tagsLabel ?? labelsLabel;
  const OrbitIcon = WORKSPACE_ORBIT_ICON;

  const resolvedLoad = useMemo(
    () =>
      orbitLoad ??
      (orbitLoadInput
        ? computeWorkspaceOrbitLoad(orbitLoadInput)
        : computeWorkspaceOrbitLoad({ openCount: 0, urgentCount: 0 })),
    [orbitLoad, orbitLoadInput]
  );

  const captureRef = useRef<HTMLTextAreaElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(defaultOpen);
  const [draft, setDraft] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDraft, setDialogDraft] = useState("");
  const [addingLabel, setAddingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState("");
  const [labelColor, setLabelColor] =
    useState<WorkspaceMemoryLaneTagColorId>("sky");

  const capturePreview = useMemo(
    () => formatWorkspaceOrbitCapturePreview(draft),
    [draft]
  );

  const submitCapture = useCallback(
    (raw: string) => {
      const parsed = parseWorkspaceMemoryLaneCapture(raw);
      if (!parsed.title) {
        return;
      }
      onAddTask?.(parsed);
    },
    [onAddTask]
  );

  const submitQuickCapture = () => {
    submitCapture(draft);
    setDraft("");
    captureRef.current?.focus();
  };

  const submitDialog = () => {
    submitCapture(dialogDraft);
    setDialogDraft("");
    setDialogOpen(false);
    captureRef.current?.focus();
  };

  const submitLabel = () => {
    const trimmed = labelDraft.trim();
    if (!trimmed) {
      setAddingLabel(false);
      setLabelDraft("");
      return;
    }
    onAddLabel?.({ color: labelColor, name: trimmed });
    setLabelDraft("");
    setLabelColor("sky");
    setAddingLabel(false);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "t" || !(event.ctrlKey || event.metaKey)) {
        return;
      }
      event.preventDefault();
      setDialogDraft(draft.trim());
      setDialogOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft]);

  useEffect(() => {
    if (addingLabel) {
      labelInputRef.current?.focus();
    }
  }, [addingLabel]);

  return (
    <Collapsible
      className={cn(WORKSPACE_SHELL_SURFACE.orbitPanel, className)}
      data-slot="workspace-my-orbit"
      onOpenChange={setOpen}
      open={open}
    >
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2 px-2 py-2 text-left transition-colors",
            WORKSPACE_SHELL_SURFACE.sidebarHover,
            WORKSPACE_SHELL_TYPE.navItem
          )}
          type="button"
        >
          <OrbitIcon
            aria-hidden
            className="size-3.5 shrink-0 text-muted-foreground"
          />
          <span className="min-w-0 flex-1 truncate font-medium">
            {orbitTitle}
          </span>
          <span className={cn(WORKSPACE_SHELL_TYPE.navMeta, "shrink-0")}>
            {resolvedLoad.score}%
          </span>
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 border-border border-t px-2 py-2.5">
        <WorkspaceOrbitLoadBar load={resolvedLoad} />

        <div className="space-y-1.5">
          <p className={WORKSPACE_SHELL_TYPE.sectionLabel}>
            {WORKSPACE_ORBIT_CREATE_SECTION}
          </p>
          <div
            className={cn(
              "flex items-start gap-1.5 rounded-md px-2 py-1.5",
              WORKSPACE_SHELL_SURFACE.capture,
              WORKSPACE_SHELL_SURFACE.captureFocus
            )}
          >
            <Plus
              aria-hidden
              className="mt-1 size-3 shrink-0 text-muted-foreground"
            />
            <Textarea
              aria-label="Capture context"
              className={cn(
                "field-sizing-content max-h-14 min-h-5 w-full resize-none border-0 bg-transparent p-0 shadow-none",
                WORKSPACE_SHELL_TYPE.navItem,
                "placeholder:text-muted-foreground focus-visible:ring-0"
              )}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitQuickCapture();
                }
              }}
              placeholder={capturePlaceholder}
              ref={captureRef}
              rows={1}
              value={draft}
            />
          </div>
          {capturePreview ? (
            <p
              className={cn("truncate px-0.5", WORKSPACE_SHELL_TYPE.navMeta)}
              title={capturePreview}
            >
              {capturePreview}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <p className={WORKSPACE_SHELL_TYPE.sectionLabel}>
            {resolvedLabelsLabel}
          </p>
          <div className="flex flex-wrap gap-1">
            {labels.map((label) => (
              <span
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-md px-2",
                  WORKSPACE_SHELL_TYPE.navItem
                )}
                key={label.id}
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 rounded-full",
                    WORKSPACE_ORBIT_LABEL_DOT[label.color]
                  )}
                />
                {label.name}
              </span>
            ))}
            {addingLabel ? (
              <span className="inline-flex h-7 min-w-[7rem] items-center gap-1 rounded-md bg-muted px-2">
                <button
                  aria-label="Cycle label color"
                  className="shrink-0"
                  onClick={() => {
                    const index = WORKSPACE_ORBIT_LABEL_SWATCHES.findIndex(
                      (swatch) => swatch.id === labelColor
                    );
                    const next =
                      WORKSPACE_ORBIT_LABEL_SWATCHES[
                        (index + 1) % WORKSPACE_ORBIT_LABEL_SWATCHES.length
                      ];
                    if (next) {
                      setLabelColor(next.id);
                    }
                  }}
                  type="button"
                >
                  <span
                    className={cn(
                      "block size-1.5 rounded-full",
                      WORKSPACE_ORBIT_LABEL_DOT[labelColor]
                    )}
                  />
                </button>
                <input
                  className={cn(
                    "min-w-0 flex-1 bg-transparent outline-none",
                    WORKSPACE_SHELL_TYPE.navItem
                  )}
                  onBlur={submitLabel}
                  onChange={(event) => setLabelDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      submitLabel();
                    }
                    if (event.key === "Escape") {
                      setAddingLabel(false);
                      setLabelDraft("");
                    }
                  }}
                  placeholder="Label name"
                  ref={labelInputRef}
                  value={labelDraft}
                />
              </span>
            ) : (
              <button
                className={cn(
                  "inline-flex h-7 items-center gap-1 rounded-md px-2 text-muted-foreground",
                  WORKSPACE_SHELL_SURFACE.sidebarHover,
                  WORKSPACE_SHELL_TYPE.navItem
                )}
                onClick={() => setAddingLabel(true)}
                type="button"
              >
                <Plus className="size-3.5" />
                Add label
              </button>
            )}
          </div>
        </div>
      </CollapsibleContent>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className={WORKSPACE_SHELL_TYPE.siteTopbarTitle}>
              Capture
            </DialogTitle>
          </DialogHeader>
          <Textarea
            autoFocus
            className="min-h-8 text-[13px]"
            onChange={(event) => setDialogDraft(event.target.value)}
            placeholder={WORKSPACE_MEMORY_LANE_CAPTURE_PLACEHOLDER}
            rows={2}
            value={dialogDraft}
          />
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button onClick={submitDialog} type="button">
              Capture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
}
