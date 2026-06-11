"use client";

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui";
import { Keyboard } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import type {
  ShortcutActionId,
  ShortcutOverridePatch,
  WorkspaceShortcutsPayload,
} from "../../../../lib/workspace-shortcuts/contract.ts";
import {
  isMediaKeyBinding,
  normalizeKeyboardEvent,
  normalizeShortcutString,
} from "../../../../lib/workspace-shortcuts/normalize-shortcut.ts";
import { validateCapturedShortcut } from "../../../../lib/workspace-shortcuts/validate-capture.ts";
import { validateCaptureCollision } from "../../../../lib/workspace-shortcuts/validate-capture-collision.ts";
import { ShortcutInlineKeyCaps, ShortcutKeyDisplay } from "./shortcut-key-display.tsx";
import { useWorkspaceShortcuts } from "./use-keyboard-shortcuts.tsx";

export function ShortcutCapturePopover({
  actionId,
  actionLabel,
  allowFnKeyBindings,
  collisionContext,
  disabled,
  onCapture,
  pendingOverrides,
  value,
}: {
  actionId: ShortcutActionId;
  actionLabel?: string;
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
  const t = useTranslations("workspace.keyboardShortcuts.capture");
  const tBadges = useTranslations("workspace.keyboardShortcuts.badges");
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
        setHint(tBadges("fnKeyHint"));
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

        const errorCode = validation.code;
        setHint(t(`errors.${errorCode}`));
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
          setHint(
            t("errors.collision", {
              actionId: collision.actionId,
              label: collision.label,
            })
          );
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
    t,
    tBadges,
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
          {value ? <ShortcutInlineKeyCaps normalized={value} /> : t("assign")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-3">
        <div className="space-y-1">
          <p className="font-medium text-sm">{t("recordTitle")}</p>
          <p className="text-muted-foreground text-xs">
            {actionLabel ?? actionId}
          </p>
        </div>
        <div className="flex min-h-10 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 px-3">
          {recording ? (
            <span className="animate-pulse font-medium text-muted-foreground text-xs">
              {t("listening")}
            </span>
          ) : value ? (
            <ShortcutKeyDisplay normalized={value} />
          ) : (
            <span className="text-muted-foreground text-xs">{t("pressKeys")}</span>
          )}
        </div>
        <p className="text-muted-foreground text-xs">
          {recording ? t("pressEsc") : t("pressToAssign")}
        </p>
        {hint ? (
          <Alert variant="destructive">
            <AlertDescription>{hint}</AlertDescription>
          </Alert>
        ) : null}
        {allowFnKeyBindings ? (
          <Badge className="font-normal" variant="outline">
            {t("fnLockHint")}
          </Badge>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
