"use client";

import { Kbd, KbdGroup } from "@repo/ui";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";
import { formatShortcutKeyTokens } from "../../../../lib/workspace-shortcuts/format-shortcut.ts";

/** Phrasing-safe key caps for use inside `<button>` (no block-level wrapper). */
export function ShortcutInlineKeyCaps({
  normalized,
  className,
}: {
  normalized: string;
  className?: string;
}): ReactElement {
  const tokens = formatShortcutKeyTokens(normalized);

  return (
    <span className={className ?? "inline-flex items-center gap-1"}>
      {tokens.map((token) => (
        <Kbd key={token}>{token}</Kbd>
      ))}
    </span>
  );
}

function ShortcutBindingKeys({
  normalized,
}: {
  normalized: string;
}): ReactElement {
  const tokens = formatShortcutKeyTokens(normalized);

  return (
    <KbdGroup>
      {tokens.map((token) => (
        <Kbd key={token}>{token}</Kbd>
      ))}
    </KbdGroup>
  );
}

export function ShortcutKeyDisplay({
  normalized,
  secondaryNormalized,
  className,
}: {
  normalized: string;
  secondaryNormalized?: string | null;
  className?: string;
}): ReactElement {
  const t = useTranslations("workspace.keyboardShortcuts");

  if (!secondaryNormalized) {
    return (
      <span className={className}>
        <ShortcutBindingKeys normalized={normalized} />
      </span>
    );
  }

  return (
    <div className={className ?? "flex flex-wrap items-center gap-2"}>
      <ShortcutBindingKeys normalized={normalized} />
      <span className="text-muted-foreground text-xs">{t("orSeparator")}</span>
      <ShortcutBindingKeys normalized={secondaryNormalized} />
    </div>
  );
}
