"use client";

import { Kbd, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { FolderClosed, ListTodo, PawPrint, Search } from "lucide-react";
import type { ReactElement } from "react";
import { formatShortcutKeyTokens } from "../../../lib/workspace-shortcuts/format-shortcut.ts";
import { useOptionalWorkspaceShortcuts } from "./keyboard-shortcuts/use-keyboard-shortcuts.tsx";
import { ORBIT_TRAIL_FOCUS_EVENT } from "./orbit-trail.ts";
import {
  WORKSPACE_SHELL_INTERACTIVE_CLASS,
  WORKSPACE_SIDEBAR_DENSE_ITEM_TO_ITEM_GAP_CLASS,
} from "./workspace-shell.classes.ts";

function formatUtilityShortcutHint(normalized: string): string {
  return formatShortcutKeyTokens(normalized)
    .map((token) => (token === "Ctrl/Cmd" ? "Ctrl" : token))
    .join("+");
}

function UtilityShortcutHint({
  normalized,
}: {
  normalized: string;
}): ReactElement {
  return (
    <span className="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 opacity-0 transition-opacity group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 group-data-[collapsible=icon]:hidden">
      <Kbd className="h-4 min-h-4 bg-sidebar-border/40 px-1 font-mono text-[9px] text-sidebar-foreground/65 leading-none shadow-none dark:bg-sidebar-border/25">
        {formatUtilityShortcutHint(normalized)}
      </Kbd>
    </span>
  );
}

export function AuthenticatedSidebarUtilityActions(): ReactElement {
  const shortcuts = useOptionalWorkspaceShortcuts();

  const focusTrailInput = (detail?: {
    forceAdd?: boolean;
    focusProject?: boolean;
  }): void => {
    window.dispatchEvent(
      new CustomEvent(ORBIT_TRAIL_FOCUS_EVENT, {
        detail,
      })
    );
  };

  const commandBinding =
    shortcuts?.payload.bindings["workspace.commandSearch"].binding.normalized ??
    "mod+k";

  const rowClass = cn(
    "h-7 gap-1.5 px-2 text-[10px] leading-4",
    WORKSPACE_SHELL_INTERACTIVE_CLASS
  );

  return (
    <SidebarMenu className={WORKSPACE_SIDEBAR_DENSE_ITEM_TO_ITEM_GAP_CLASS}>
      <SidebarMenuItem>
        <SidebarMenuButton
          className={rowClass}
          onClick={() => focusTrailInput({ forceAdd: true })}
          size="sm"
        >
          <ListTodo className="size-3.5" />
          <span className="text-[10px] leading-4">New To-Do</span>
        </SidebarMenuButton>
        <UtilityShortcutHint normalized="mod+n" />
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          className={rowClass}
          onClick={() => focusTrailInput({ focusProject: true })}
          size="sm"
        >
          <FolderClosed className="size-3.5" />
          <span className="text-[10px] leading-4">New Project</span>
        </SidebarMenuButton>
        <UtilityShortcutHint normalized="mod+p" />
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          className={rowClass}
          onClick={() => shortcuts?.openCommand()}
          size="sm"
        >
          <Search className="size-3.5" />
          <span className="text-[10px] leading-4">Search</span>
        </SidebarMenuButton>
        <UtilityShortcutHint normalized={commandBinding} />
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          className={rowClass}
          disabled
          size="sm"
          tooltip="Lynx is not wired yet"
        >
          <PawPrint className="size-3.5" />
          <span className="text-[10px] leading-4">Lynx</span>
        </SidebarMenuButton>
        <UtilityShortcutHint normalized="mod+l" />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
