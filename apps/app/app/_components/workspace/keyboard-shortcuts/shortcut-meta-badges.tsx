"use client";

import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui";
import { useTranslations } from "next-intl";
import type { ReactElement, ReactNode } from "react";
import type { ResolvedShortcut } from "../../../../lib/workspace-shortcuts/contract.ts";
import { isFnKeyBinding } from "../../../../lib/workspace-shortcuts/normalize-shortcut.ts";

function MetaBadge({
  hint,
  label,
  variant,
}: {
  hint: string;
  label: string;
  variant: "default" | "destructive" | "outline" | "secondary";
}): ReactElement {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge className="cursor-help font-normal" variant={variant}>
          {label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top">{hint}</TooltipContent>
    </Tooltip>
  );
}

export function ShortcutMetaBadgeGroup({
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

  if (!isFnKeyBinding(normalized)) {
    return null;
  }

  return (
    <MetaBadge
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
      <MetaBadge
        hint={t("productLockedHint")}
        label={t("productLocked")}
        variant="secondary"
      />
    );
  }

  if (shortcut.locked) {
    return (
      <MetaBadge
        hint={t("lockedHint")}
        label={t("locked")}
        variant="secondary"
      />
    );
  }

  return (
    <MetaBadge
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
      <MetaBadge
        hint={t("browserConflictHint")}
        label={t("browserConflict")}
        variant="destructive"
      />
    );
  }

  if (shortcut.reliability === "low") {
    return (
      <MetaBadge
        hint={t("lowReliabilityHint")}
        label={t("lowReliability")}
        variant="outline"
      />
    );
  }

  return null;
}
