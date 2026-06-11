"use client";

import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui";
import { useTranslations } from "next-intl";
import type { ReactElement, ReactNode } from "react";
import { useEffect } from "react";
import type { ResolvedShortcut } from "../../../../lib/workspace-shortcuts/contract.ts";
import { isFnKeyBinding } from "../../../../lib/workspace-shortcuts/normalize-shortcut.ts";

function ShortcutMetaBadge({
  hint,
  label,
  variant,
}: {
  hint: string;
  label: string;
  variant: "default" | "destructive" | "outline" | "secondary";
}): ReactElement {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="cursor-help font-normal" variant={variant}>
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">{hint}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ShortcutBadgeGroup({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export function ShortcutFnKeyBadge({
  normalized,
}: {
  normalized: string;
}): ReactElement | null {
  const t = useTranslations("workspace.keyboardShortcuts.badges");

  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7885/ingest/c6c3b106-1ea8-4293-8967-df2c1ea049e3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "e959ad",
      },
      body: JSON.stringify({
        sessionId: "e959ad",
        runId: "pre-fix",
        hypothesisId: "D",
        location: "shortcut-source-badge.tsx:ShortcutFnKeyBadge",
        message: "fn key badge translation resolved",
        data: {
          normalized,
          isFnKey: isFnKeyBinding(normalized),
          fnKeyLabel: t("fnKey"),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => undefined);
  }, [normalized, t]);
  // #endregion

  if (!isFnKeyBinding(normalized)) {
    return null;
  }

  return (
    <ShortcutMetaBadge
      hint={t("fnKeyHint")}
      label={t("fnKey")}
      variant="outline"
    />
  );
}

export function ShortcutSourceBadge({
  shortcut,
}: {
  shortcut: ResolvedShortcut;
}): ReactElement {
  const t = useTranslations("workspace.keyboardShortcuts.badges");

  if (shortcut.locked && shortcut.source === "product") {
    return (
      <ShortcutMetaBadge
        hint={t("productLockedHint")}
        label={t("productLocked")}
        variant="secondary"
      />
    );
  }

  if (shortcut.locked) {
    return (
      <ShortcutMetaBadge
        hint={t("lockedHint")}
        label={t("locked")}
        variant="secondary"
      />
    );
  }

  return (
    <ShortcutMetaBadge
      hint={t(`sourceHints.${shortcut.source}`)}
      label={t(`sources.${shortcut.source}`)}
      variant="outline"
    />
  );
}

export function ShortcutReliabilityBadge({
  shortcut,
}: {
  shortcut: ResolvedShortcut;
}): ReactElement | null {
  const t = useTranslations("workspace.keyboardShortcuts.badges");

  if (shortcut.browserConflict) {
    return (
      <ShortcutMetaBadge
        hint={t("browserConflictHint")}
        label={t("browserConflict")}
        variant="destructive"
      />
    );
  }

  if (shortcut.reliability === "low") {
    return (
      <ShortcutMetaBadge
        hint={t("lowReliabilityHint")}
        label={t("lowReliability")}
        variant="outline"
      />
    );
  }

  return null;
}
