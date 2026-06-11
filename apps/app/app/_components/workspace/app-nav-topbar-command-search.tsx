"use client";

import { cn } from "@repo/ui/lib/utils";
import { Command, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";
import { useWorkspaceShortcuts } from "./keyboard-shortcuts/use-keyboard-shortcuts.tsx";

function CommandSearchShortcutHint(): ReactElement {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-0 rounded-sm bg-muted px-1 py-0.5 font-sans text-[10px] font-medium leading-none text-muted-foreground"
    >
      <Command aria-hidden className="size-2.5 shrink-0" strokeWidth={2.25} />
      <span>K</span>
    </span>
  );
}

export function AppNavTopbarCommandSearch(): ReactElement {
  const t = useTranslations("workspace.keyboardShortcuts.topbarSearch");
  const { openCommand, payload } = useWorkspaceShortcuts();
  const normalized =
    payload.bindings["workspace.commandSearch"]?.binding.normalized ?? "mod+k";

  return (
    <button
      aria-keyshortcuts={normalized.replace("mod", "Control")}
      aria-label={t("ariaLabel")}
      className={cn(
        "hidden h-8 w-[11rem] shrink-0 items-center justify-between gap-2 rounded-full border border-border/60 bg-muted/35 px-3 text-sm text-muted-foreground shadow-none transition-colors hover:bg-muted/55 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
      )}
      onClick={() => openCommand()}
      type="button"
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        <Search aria-hidden className="size-3.5 shrink-0 opacity-60" />
        <span className="truncate text-[13px]">{t("placeholder")}</span>
      </span>
      <CommandSearchShortcutHint />
    </button>
  );
}
