"use client";

import { Badge } from "@repo/ui";
import type { ReactElement } from "react";
import type {
  ResolvedShortcut,
  ShortcutSource,
} from "../../../../lib/workspace-shortcuts/contract.ts";
import { isFnKeyBinding } from "../../../../lib/workspace-shortcuts/normalize-shortcut.ts";

const SOURCE_LABELS: Record<ShortcutSource, string> = {
  product: "Product",
  tenant: "Organization",
  user: "Personal",
};

export function ShortcutFnKeyBadge({
  normalized,
}: {
  normalized: string;
}): ReactElement | null {
  if (!isFnKeyBinding(normalized)) {
    return null;
  }

  return (
    <Badge className="font-normal" variant="outline">
      Fn key
    </Badge>
  );
}

export function ShortcutSourceBadge({
  shortcut,
}: {
  shortcut: ResolvedShortcut;
}): ReactElement {
  if (shortcut.locked && shortcut.source === "product") {
    return (
      <Badge className="font-normal" variant="secondary">
        Product locked
      </Badge>
    );
  }

  if (shortcut.locked) {
    return (
      <Badge className="font-normal" variant="secondary">
        Locked
      </Badge>
    );
  }

  return (
    <Badge className="font-normal" variant="outline">
      {SOURCE_LABELS[shortcut.source]}
    </Badge>
  );
}

export function ShortcutReliabilityBadge({
  shortcut,
}: {
  shortcut: ResolvedShortcut;
}): ReactElement | null {
  if (shortcut.browserConflict) {
    return (
      <Badge className="font-normal" variant="destructive">
        Browser conflict
      </Badge>
    );
  }

  if (shortcut.reliability === "low") {
    return (
      <Badge className="font-normal" variant="outline">
        Low reliability
      </Badge>
    );
  }

  return null;
}
