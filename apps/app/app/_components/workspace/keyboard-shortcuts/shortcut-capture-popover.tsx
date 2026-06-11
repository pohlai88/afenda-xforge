"use client";

import {
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui";
import { Keyboard } from "lucide-react";
import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import type {
  ShortcutActionId,
  ShortcutOverridePatch,
  WorkspaceShortcutsPayload,
} from "../../../../lib/workspace-shortcuts/contract.ts";
import { formatShortcutLabel } from "../../../../lib/workspace-shortcuts/format-shortcut.ts";
import {
  isMediaKeyBinding,
  normalizeKeyboardEvent,
  normalizeShortcutString,
} from "../../../../lib/workspace-shortcuts/normalize-shortcut.ts";
import { validateCapturedShortcut } from "../../../../lib/workspace-shortcuts/validate-capture.ts";
import { validateCaptureCollision } from "../../../../lib/workspace-shortcuts/validate-capture-collision.ts";
import { useWorkspaceShortcuts } from "./use-keyboard-shortcuts.tsx";

export function ShortcutCapturePopover({
  actionId,
  allowFnKeyBindings,
  collisionContext,
  disabled,
  onCapture,
  pendingOverrides,
  value,
}: {
  actionId: ShortcutActionId;
  allowFnKeyBindings: boolean;
  collisionContext?: {
    payload: WorkspaceShortcutsPayload;
    pendingOverrides?: ShortcutOverridePatch;
  };
  disabled?: boolean;
  onCapture: (normalized: string) => void;
  pendingOverrides?: ShortcutOverridePatch;
  value: string;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const onCaptureRef = useRef(onCapture);
  const { setCaptureSuspended } = useWorkspaceShortcuts();

  useEffect(() => {
    onCaptureRef.current = onCapture;
  }, [onCapture]);

  useEffect(() => {
    const suspended = open && recording;
    setCaptureSuspended(suspended);

    return () => {
      setCaptureSuspended(false);
    };
  }, [open, recording, setCaptureSuspended]);

  useEffect(() => {
    if (!(open && recording)) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const normalized = normalizeKeyboardEvent(event);
      const canonical = normalizeShortcutString(normalized) ?? normalized;

      if (isMediaKeyBinding(canonical)) {
        setHint("Turn Fn lock off to bind function keys.");
        return;
      }

      const validation = validateCapturedShortcut(canonical, actionId, {
        allowFnKeyBindings,
      });

      if (!validation.ok) {
        if (validation.cancel) {
          setRecording(false);
          setOpen(false);
          setHint(null);
          return;
        }

        setHint(validation.reason);
        return;
      }

      if (collisionContext) {
        const collision = validateCaptureCollision(
          actionId,
          validation.normalized,
          collisionContext.payload,
          {
            ...collisionContext.pendingOverrides,
            ...pendingOverrides,
          }
        );

        if (collision) {
          setHint(collision);
          return;
        }
      }

      onCaptureRef.current(validation.normalized);
      setRecording(false);
      setOpen(false);
      setHint(null);
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [
    actionId,
    allowFnKeyBindings,
    collisionContext,
    open,
    pendingOverrides,
    recording,
  ]);

  return (
    <Popover
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        setRecording(nextOpen);
        if (!nextOpen) {
          setHint(null);
        }
      }}
      open={open}
    >
      <PopoverTrigger asChild>
        <Button disabled={disabled} size="sm" type="button" variant="outline">
          <Keyboard className="mr-1.5 size-3.5" />
          {value ? formatShortcutLabel(value) : "Assign"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3">
        <div className="space-y-1">
          <p className="font-medium text-sm">Record shortcut</p>
          <p className="text-muted-foreground text-xs">{actionId}</p>
        </div>
        <p className="text-muted-foreground text-xs">
          {recording
            ? "Listening… Press Esc to cancel."
            : "Press a key combination."}
        </p>
        {hint ? <p className="text-destructive text-xs">{hint}</p> : null}
        <Badge className="font-normal" variant="outline">
          Fn lock off for F-keys
        </Badge>
      </PopoverContent>
    </Popover>
  );
}
