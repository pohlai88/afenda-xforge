"use client";

import {
  Kbd,
  KbdGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui";
import {
  FolderClosed,
  ListTodo,
  PawPrint,
  Search,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ReactElement } from "react";
import { formatShortcutKeyTokens } from "../../../lib/workspace-shortcuts/format-shortcut.ts";
import { useOptionalWorkspaceShortcuts } from "./keyboard-shortcuts/use-keyboard-shortcuts.tsx";
import { ORBIT_TRAIL_FOCUS_EVENT } from "./orbit-trail.ts";

function UtilityShortcutHint({ normalized }: { normalized: string }): ReactElement {
  const tokens = formatShortcutKeyTokens(normalized).map((token) =>
    token === "Ctrl/Cmd" ? "Ctrl" : token
  );

  return (
    <span className="pointer-events-none absolute top-0.5 right-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover/menu-item:opacity-100 group-focus-within/menu-item:opacity-100 group-data-[collapsible=icon]:hidden">
      <KbdGroup>
        {tokens.map((token) => (
          <Kbd
            className="h-4 min-h-4 px-1 font-mono text-[9px] leading-none text-sidebar-foreground/65 shadow-none bg-sidebar-border/40 dark:bg-sidebar-border/25"
            key={token}
          >
            {token}
          </Kbd>
        ))}
      </KbdGroup>
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

  const rowClass =
    "h-7 gap-1.5 px-2 text-[10px] leading-4 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <SidebarMenu className="gap-0">
      <SidebarMenuItem>
        <SidebarMenuButton
          className={rowClass}
          onClick={() => focusTrailInput({ forceAdd: true })}
          size="sm"
        >
          <ListTodo className="size-3.5" />
          <span className="font-medium text-[10px] leading-4">New To-Do</span>
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
        <SidebarMenuButton asChild className={rowClass} size="sm">
          <Link href="/infrastructure/lynx">
            <PawPrint className="size-3.5" />
            <span className="text-[10px] leading-4">Lynx</span>
          </Link>
        </SidebarMenuButton>
        <UtilityShortcutHint normalized="mod+l" />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
